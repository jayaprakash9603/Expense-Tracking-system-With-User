//package com.jaya.kafka;
//
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.jaya.events.CategoryExpenseEvent;
//import com.jaya.models.Category;
//import com.jaya.models.Expense;
//import com.jaya.repository.CategoryRepository;
//import com.jaya.repository.ExpenseRepository;
//import com.jaya.service.CategoryService;
//import org.slf4j.Logger;
//import org.slf4j.LoggerFactory;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.kafka.annotation.KafkaListener;
//import org.springframework.stereotype.Service;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.*;
//
//@Service
//public class CategoryExpenseEventConsumer {
//
//    private static final Logger logger = LoggerFactory.getLogger(CategoryExpenseEventConsumer.class);
//
//    @Autowired
//    private CategoryRepository categoryRepository;
//
//    @Autowired
//    private ExpenseRepository expenseRepository;
//
//    @Autowired
//    private CategoryService categoryService;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @KafkaListener(topics = "category-expense-events", groupId = "category-expense-group")
//    @Transactional
//    public void handleCategoryExpenseEvent(String eventJson) {
//        try {
//            CategoryExpenseEvent event = objectMapper.readValue(eventJson, CategoryExpenseEvent.class);
//            logger.info("Processing category expense event: {}", event);
//
//            switch (event.getAction().toUpperCase()) {
//                case "ADD":
//                    handleAddExpenseToCategory(event);
//                    break;
//                case "REMOVE":
//                    handleRemoveExpenseFromCategory(event);
//                    break;
//                case "UPDATE":
//                    handleUpdateExpenseCategory(event);
//                    break;
//                default:
//                    logger.warn("Unknown action in category expense event: {}", event.getAction());
//            }
//
//        } catch (Exception e) {
//            logger.error("Error processing category expense event: {}", eventJson, e);
//        }
//    }
//
//    private void handleAddExpenseToCategory(CategoryExpenseEvent event) {
//        try {
//            Category categoryOpt = categoryService.getById(event.getCategoryId(),event.getUserId());
//            if (categoryOpt!=null) {
//                Category category = categoryOpt;
//
//                if (category.getExpenseIds() == null) {
//                    category.setExpenseIds(new HashMap<>());
//                }
//
//                Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(event.getUserId(), new HashSet<>());
//                expenseSet.add(event.getExpenseId());
//                category.getExpenseIds().put(event.getUserId(), expenseSet);
//
//                categoryRepository.save(category);
//                logger.info("Added expense {} to category {} for user {}",
//                        event.getExpenseId(), event.getCategoryId(), event.getUserId());
//            } else {
//                logger.warn("Category not found with ID: {}", event.getCategoryId());
//            }
//        } catch (Exception e) {
//            logger.error("Error adding expense to category: {}", event, e);
//        }
//    }
//
//    private void handleRemoveExpenseFromCategory(CategoryExpenseEvent event) {
//        try {
//            Optional<Category> categoryOpt = categoryRepository.findById(event.getCategoryId());
//            if (categoryOpt.isPresent()) {
//                Category category = categoryOpt.get();
//
//                if (category.getExpenseIds() != null) {
//                    Set<Integer> expenseSet = category.getExpenseIds().getOrDefault(event.getUserId(), new HashSet<>());
//                    expenseSet.remove(event.getExpenseId());
//
//                    if (expenseSet.isEmpty()) {
//                        category.getExpenseIds().remove(event.getUserId());
//                    } else {
//                        category.getExpenseIds().put(event.getUserId(), expenseSet);
//                    }
//
//                    categoryRepository.save(category);
//                    logger.info("Removed expense {} from category {} for user {}",
//                            event.getExpenseId(), event.getCategoryId(), event.getUserId());
//                }
//            } else {
//                logger.warn("Category not found with ID: {}", event.getCategoryId());
//            }
//        } catch (Exception e) {
//            logger.error("Error removing expense from category: {}", event, e);
//        }
//    }
//
//    private void handleUpdateExpenseCategory(CategoryExpenseEvent event) {
//        try {
//            // This would handle more complex update scenarios if needed
//            handleAddExpenseToCategory(event);
//        } catch (Exception e) {
//            logger.error("Error updating expense category: {}", event, e);
//        }
//    }
//}