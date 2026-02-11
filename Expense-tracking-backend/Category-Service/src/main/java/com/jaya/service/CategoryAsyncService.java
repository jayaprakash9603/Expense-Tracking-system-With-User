package com.jaya.service;

import com.jaya.models.Category;
import com.jaya.common.dto.UserDTO;
import com.jaya.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class CategoryAsyncService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryAsyncService.class);

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseClient expenseService;

    @Async("categoryTaskExecutor")
    public CompletableFuture<Void> finalizeCategoryCreateAsync(Category initialSavedCategory, Category inputCategory, UserDTO UserDTO) {
        try {
            final Integer categoryId = initialSavedCategory.getId();
            Set<Integer> requestedExpenseIds = new HashSet<>();
            if (inputCategory.getExpenseIds() != null && inputCategory.getExpenseIds().containsKey(UserDTO.getId())) {
                requestedExpenseIds.addAll(inputCategory.getExpenseIds().get(UserDTO.getId()));
            }
            Set<Integer> validExpenseIds = new HashSet<>();
            for (Integer expenseId : requestedExpenseIds) {
                try {
                    var expense = expenseService.getExpenseById(expenseId, UserDTO.getId());
                    if (expense != null && expense.getUserId() != null && expense.getUserId().equals(UserDTO.getId())) {
                        expense.setCategoryId(categoryId);
                        expense.setCategoryName(inputCategory.getName());
                        expenseService.save(expense);
                        validExpenseIds.add(expenseId);
                    }
                } catch (Exception ex) {
                    logger.warn("Skipping expense {} during async finalize: {}", expenseId, ex.getMessage());
                }
            }
            if (!validExpenseIds.isEmpty()) {
                List<Category> allCategories = categoryRepository.findAll().stream()
                        .filter(cat -> !cat.getId().equals(categoryId))
                        .collect(Collectors.toList());

                for (Category otherCategory : allCategories) {
                    if (otherCategory.getExpenseIds() != null && otherCategory.getExpenseIds().containsKey(UserDTO.getId())) {
                        Set<Integer> expenseIds = otherCategory.getExpenseIds().get(UserDTO.getId());
                        if (expenseIds != null && expenseIds.removeAll(validExpenseIds)) {
                            if (expenseIds.isEmpty()) {
                                otherCategory.getExpenseIds().remove(UserDTO.getId());
                            } else {
                                otherCategory.getExpenseIds().put(UserDTO.getId(), expenseIds);
                            }
                            categoryRepository.save(otherCategory);
                        }
                    }
                }
            }
            if (!validExpenseIds.isEmpty()) {
                Category finalCategory = categoryRepository.findById(categoryId).orElse(initialSavedCategory);
                if (finalCategory.getExpenseIds() == null) {
                    finalCategory.setExpenseIds(new HashMap<>());
                }
                finalCategory.getExpenseIds().put(UserDTO.getId(), validExpenseIds);
                categoryRepository.save(finalCategory);
            }
        } catch (Exception e) {
            logger.error("Error finalizing category creation asynchronously: ", e);
        }

    return CompletableFuture.completedFuture(null);
    }
}
