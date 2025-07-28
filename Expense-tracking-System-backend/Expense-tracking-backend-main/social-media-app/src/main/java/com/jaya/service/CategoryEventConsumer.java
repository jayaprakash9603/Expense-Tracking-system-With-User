package com.jaya.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.User;
import com.jaya.events.CategoryDeletionEvent;
import com.jaya.models.Category;
import com.jaya.models.Expense;
import com.jaya.repository.CategoryRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.util.ServiceHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class CategoryEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(CategoryEventConsumer.class);

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;



    @Autowired
    private ServiceHelper helper;


    @Autowired
    private ObjectMapper objectMapper;

    @KafkaListener(topics = "category-deletion-events", groupId = "expense-update-group")
    @Transactional
    public void handleCategoryDeletionEvent(String eventJson) {
        try {
            CategoryDeletionEvent event = objectMapper.readValue(eventJson, CategoryDeletionEvent.class);
            logger.info("Processing category deletion event for category: {} by user: {}",
                    event.getDeletedCategoryId(), event.getUserId());

            // Process expense updates asynchronously
            updateExpensesAsync(event);

        } catch (Exception e) {
            logger.error("Error processing category deletion event: {}", eventJson, e);
        }
    }

    private void updateExpensesAsync(CategoryDeletionEvent event) {
        try {
            User user = helper.validateUser(event.getUserId());

            // Get or create target category (Others)
            Category targetCategory = getOrCreateTargetCategory(event, user);

            // Batch update expenses
            List<Expense> expensesToUpdate = new ArrayList<>();

            for (Integer expenseId : event.getAffectedExpenseIds()) {
                Expense expense = expenseRepository.findByUserIdAndId(event.getUserId(), expenseId);
                if (expense != null) {
                    expense.setCategoryId(targetCategory.getId());
                    expensesToUpdate.add(expense);
                }
            }

            // Batch save expenses
            if (!expensesToUpdate.isEmpty()) {
                expenseRepository.saveAll(expensesToUpdate);
                logger.info("Updated {} expenses to category: {}",
                        expensesToUpdate.size(), targetCategory.getName());
            }

            // Update target category's expense IDs
            updateTargetCategoryExpenseIds(targetCategory, event, user);

            // Log audit for batch update
            // auditExpenseService.logAudit(
//                    user,
//                    null,
//                    "CATEGORY_DELETION_BATCH_UPDATE",
//                    String.format("Updated %d expenses from deleted category '%s' to '%s'",
//                            event.getAffectedExpenseIds().size(),
//                            event.getDeletedCategoryName(),
//                            targetCategory.getName())
//            );

        } catch (Exception e) {
            logger.error("Error updating expenses for category deletion event", e);
        }
    }

    private Category getOrCreateTargetCategory(CategoryDeletionEvent event, User user) {
        // If target category ID is provided, use it
        if (event.getTargetCategoryId() != null) {
            return categoryRepository.findById(event.getTargetCategoryId())
                    .orElseThrow(() -> new RuntimeException("Target category not found"));
        }

        // Otherwise, find or create "Others" category
        List<Category> othersCategories = categoryRepository.findByNameAndUserId("Others", user.getId());

        if (!othersCategories.isEmpty()) {
            return othersCategories.get(0);
        }

        // Create new "Others" category
        Category othersCategory = new Category();
        othersCategory.setName("Others");
        othersCategory.setDescription("Default category for uncategorized expenses");
        othersCategory.setUserId(user.getId());
        othersCategory.setGlobal(false);
        othersCategory.setExpenseIds(new HashMap<>());
        othersCategory.setUserIds(new HashSet<>());
        othersCategory.setEditUserIds(new HashSet<>());

        return categoryRepository.save(othersCategory);
    }

    private void updateTargetCategoryExpenseIds(Category targetCategory, CategoryDeletionEvent event, User user) {
        if (targetCategory.getExpenseIds() == null) {
            targetCategory.setExpenseIds(new HashMap<>());
        }

        Set<Integer> existingExpenseIds = targetCategory.getExpenseIds()
                .getOrDefault(user.getId(), new HashSet<>());

        existingExpenseIds.addAll(event.getAffectedExpenseIds());
        targetCategory.getExpenseIds().put(user.getId(), existingExpenseIds);

        categoryRepository.save(targetCategory);
    }
}