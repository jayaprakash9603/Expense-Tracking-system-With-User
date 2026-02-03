package com.jaya.service.helper;

import com.jaya.constant.CategoryConstants;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Category;
import com.jaya.repository.CategoryRepository;
import com.jaya.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryExpenseHelper {

    private final CategoryRepository categoryRepository;
    private final ExpenseService expenseService;

    public Set<Integer> getUserExpenseIds(Category category, Integer userId) {
        if (category.getExpenseIds() == null) {
            return new HashSet<>();
        }
        Set<Integer> ids = category.getExpenseIds().get(userId);
        return ids != null ? new HashSet<>(ids) : new HashSet<>();
    }

    public void setUserExpenseIds(Category category, Integer userId, Set<Integer> expenseIds) {
        if (category.getExpenseIds() == null) {
            category.setExpenseIds(new HashMap<>());
        }
        if (expenseIds == null || expenseIds.isEmpty()) {
            category.getExpenseIds().remove(userId);
        } else {
            category.getExpenseIds().put(userId, new HashSet<>(expenseIds));
        }
    }

    public boolean hasExpenseIdsInRequest(Map<Integer, Set<Integer>> requestExpenseIds, Integer userId) {
        return requestExpenseIds != null && requestExpenseIds.containsKey(userId);
    }

    public Set<Integer> getRequestedExpenseIds(Map<Integer, Set<Integer>> requestExpenseIds, Integer userId) {
        if (requestExpenseIds == null) {
            return new HashSet<>();
        }
        Set<Integer> ids = requestExpenseIds.get(userId);
        return ids != null ? new HashSet<>(ids) : new HashSet<>();
    }

    public void removeExpenseIdsFromOtherCategories(Integer userId, Set<Integer> expenseIds,
            Set<Integer> excludedCategoryIds) {
        if (expenseIds == null || expenseIds.isEmpty()) {
            return;
        }

        List<Category> allCategories = categoryRepository.findAll();
        for (Category category : allCategories) {
            // Skip excluded categories
            if (excludedCategoryIds != null && excludedCategoryIds.contains(category.getId())) {
                continue;
            }

            // Skip categories without expense IDs for this user
            if (category.getExpenseIds() == null || !category.getExpenseIds().containsKey(userId)) {
                continue;
            }

            Set<Integer> categoryExpenseIds = category.getExpenseIds().get(userId);
            if (categoryExpenseIds == null || categoryExpenseIds.isEmpty()) {
                continue;
            }

            boolean modified = categoryExpenseIds.removeAll(expenseIds);
            if (modified) {
                if (categoryExpenseIds.isEmpty()) {
                    category.getExpenseIds().remove(userId);
                } else {
                    category.getExpenseIds().put(userId, categoryExpenseIds);
                }
                categoryRepository.save(category);
                log.debug("Removed expense IDs {} from category {}", expenseIds, category.getId());
            }
        }
    }

    public void updateExpenseEntitiesCategory(Integer userId, Set<Integer> expenseIds,
            Integer targetCategoryId, String targetCategoryName) {
        if (expenseIds == null || expenseIds.isEmpty()) {
            return;
        }

        for (Integer expenseId : expenseIds) {
            try {
                ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                    expense.setCategoryId(targetCategoryId);
                    if (targetCategoryName != null) {
                        expense.setCategoryName(targetCategoryName);
                    }
                    expenseService.save(expense);
                    log.debug("Updated expense {} to category {}", expenseId, targetCategoryId);
                }
            } catch (Exception e) {
                log.warn("Failed to update expense {} to category {}: {}",
                        expenseId, targetCategoryId, e.getMessage());
            }
        }
    }

    public void assignExpensesToOthersCategory(Integer userId, Set<Integer> expenseIds) {
        if (expenseIds == null || expenseIds.isEmpty()) {
            return;
        }

        Category othersCategory = getOrCreateOthersCategory(userId);

        Set<Integer> othersExpenseIds = getUserExpenseIds(othersCategory, userId);

        for (Integer expenseId : expenseIds) {
            try {
                ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                    expense.setCategoryId(othersCategory.getId());
                    expense.setCategoryName(othersCategory.getName());
                    expenseService.save(expense);
                    othersExpenseIds.add(expenseId);
                    log.debug("Moved expense {} to Others category", expenseId);
                }
            } catch (Exception e) {
                log.warn("Failed to move expense {} to Others category: {}", expenseId, e.getMessage());
            }
        }

        setUserExpenseIds(othersCategory, userId, othersExpenseIds);
        categoryRepository.save(othersCategory);
    }

    public void assignExpensesToOthersCategory(Integer userId, List<ExpenseDTO> expenses) {
        if (expenses == null || expenses.isEmpty()) {
            return;
        }

        Category othersCategory = getOrCreateOthersCategory(userId);
        Set<Integer> validExpenseIds = new HashSet<>();

        for (ExpenseDTO expense : expenses) {
            expense.setCategoryId(othersCategory.getId());
            expense.setCategoryName(othersCategory.getName());
            expenseService.save(expense);
            validExpenseIds.add(expense.getId());
        }

        if (!validExpenseIds.isEmpty()) {
            Set<Integer> existingIds = getUserExpenseIds(othersCategory, userId);
            existingIds.addAll(validExpenseIds);
            setUserExpenseIds(othersCategory, userId, existingIds);
            categoryRepository.save(othersCategory);
        }
    }

    public Category getOrCreateOthersCategory(Integer userId) {
        List<Category> othersList = categoryRepository.findByNameAndUserId(
                CategoryConstants.DEFAULT_CATEGORY_NAME, userId);

        if (!othersList.isEmpty()) {
            return othersList.get(0);
        }

        // Create new Others category
        Category newOthers = new Category();
        newOthers.setName(CategoryConstants.DEFAULT_CATEGORY_NAME);
        newOthers.setDescription(CategoryConstants.DEFAULT_CATEGORY_DESCRIPTION);
        newOthers.setUserId(userId);
        newOthers.setGlobal(false);
        newOthers.setType(CategoryConstants.DEFAULT_CATEGORY_TYPE);
        newOthers.setExpenseIds(new HashMap<>());
        newOthers.setUserIds(new HashSet<>());
        newOthers.setEditUserIds(new HashSet<>());

        Category saved = categoryRepository.save(newOthers);
        log.info("Created Others category for user {}: categoryId={}", userId, saved.getId());
        return saved;
    }
}
