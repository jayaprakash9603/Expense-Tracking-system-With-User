package com.jaya.service.interfaces;

import com.jaya.common.dto.ExpenseDTO;
import com.jaya.models.Category;

import java.util.List;
import java.util.Set;

public interface ICategoryExpenseService {
    Category associateExpenses(Integer categoryId, Integer userId, Set<Integer> expenseIds);

    Category disassociateExpenses(Integer categoryId, Integer userId, Set<Integer> expenseIds);

    List<ExpenseDTO> getExpensesInCategory(Integer categoryId, Integer userId);

    void moveExpenses(Integer fromCategoryId, Integer toCategoryId, Integer userId, Set<Integer> expenseIds);
}
