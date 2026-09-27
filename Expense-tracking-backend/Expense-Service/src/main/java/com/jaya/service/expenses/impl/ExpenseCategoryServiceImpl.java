package com.jaya.service.expenses.impl;

import com.jaya.models.ExpenseCategory;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.CategoryServiceWrapper;
import com.jaya.service.expenses.ExpenseCategoryService;
import com.jaya.service.expenses.ExpenseCoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExpenseCategoryServiceImpl implements ExpenseCategoryService {

    private static final Logger log = LoggerFactory.getLogger(ExpenseCategoryServiceImpl.class);

    private final ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseCoreService expenseCoreService;

    @Autowired
    private CategoryServiceWrapper categoryService;

    public ExpenseCategoryServiceImpl(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @Override
    public List<Expense> getExpensesByCategoryId(Integer categoryId, Integer userId) {
        try {

            ExpenseCategory category = categoryService.getById(categoryId, userId);
            if (category == null) {
                throw new RuntimeException("ExpenseCategory not found with ID: " + categoryId);
            }

            Set<Integer> expenseIds = new HashSet<>();
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                expenseIds = category.getExpenseIds().get(userId);
            }

            List<Expense> expensesByCategory = expenseRepository.findByUserIdAndCategoryId(userId, categoryId);

            if (expenseIds.isEmpty() && expensesByCategory.isEmpty()) {
                return new ArrayList<>();
            }

            Set<Integer> allExpenseIds = new HashSet<>(expenseIds);
            for (Expense e : expensesByCategory) {
                allExpenseIds.add(e.getId());
            }

            List<Expense> expenses = expenseRepository.findAllByUserIdAndIdIn(userId, allExpenseIds);

            return expenses;
        } catch (Exception e) {
            log.debug("Error retrieving expenses by category ID: {}", e.getMessage());
            throw new RuntimeException("Failed to retrieve expenses for category ID: " + categoryId, e);
        }
    }

    @Override
    @Transactional
    public Map<ExpenseCategory, List<Expense>> getAllExpensesByCategories(Integer userId) throws Exception {

        List<ExpenseCategory> userCategories = categoryService.getAllForUser(userId);

        List<Expense> userExpenses = expenseCoreService.getAllExpenses(userId);

        Map<Integer, ExpenseCategory> categoryById = userCategories.stream()
                .collect(Collectors.toMap(ExpenseCategory::getId, c -> c, (a, b) -> a));

        Map<ExpenseCategory, List<Expense>> categoryExpensesMap = new HashMap<>();

        for (ExpenseCategory category : userCategories) {
            categoryExpensesMap.put(category, new ArrayList<>());
        }

        for (Expense expense : userExpenses) {
            boolean matched = false;

            if (expense.getCategoryId() != null && expense.getCategoryId() != 0) {
                ExpenseCategory matchedCategory = categoryById.get(expense.getCategoryId());
                if (matchedCategory != null) {
                    categoryExpensesMap.get(matchedCategory).add(expense);
                    matched = true;
                }
            }

            if (!matched) {
                for (ExpenseCategory category : userCategories) {
                    if (category.getExpenseIds() != null) {
                        Set<Integer> userExpenseIds = category.getExpenseIds().get(userId);
                        if (userExpenseIds != null && userExpenseIds.contains(expense.getId())) {
                            categoryExpensesMap.get(category).add(expense);
                            matched = true;
                            break;
                        }
                    }
                }
            }
        }

        categoryExpensesMap.entrySet().removeIf(entry -> entry.getValue().isEmpty());

        return categoryExpensesMap;
    }

    @Override
    public List<Map<String, Object>> getTotalByCategory(Integer userId) {
        List<Object[]> result = expenseRepository.findTotalExpensesGroupedByCategory(userId);
        log.debug("Grouped expenses result size: {}", result.size());
        List<Map<String, Object>> response = new ArrayList<>();

        for (Object[] row : result) {
            String expenseName = ((String) row[0]).trim();
            Double totalAmount = (Double) row[1];

            List<Integer> expenseIds = new ArrayList<>();
            List<ExpenseDetails> expenseDetailsList = expenseRepository.findExpensesByUserAndName(userId, expenseName);

            List<String> expenseDates = new ArrayList<>();
            for (ExpenseDetails expenseDetails : expenseDetailsList) {
                expenseIds.add(expenseDetails.getId());
                expenseDates.add(expenseDetails.getExpense().getDate().toString());
            }

            Map<String, Object> map = new HashMap<>();
            map.put("expenseName", expenseName);
            map.put("totalAmount", totalAmount);

            response.add(map);
        }

        return response;
    }

}
