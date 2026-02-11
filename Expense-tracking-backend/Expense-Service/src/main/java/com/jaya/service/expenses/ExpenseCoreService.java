package com.jaya.service.expenses;

import com.jaya.dto.ExpenseDTO;
import com.jaya.exceptions.UserException;
import com.jaya.models.Expense;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;




public interface ExpenseCoreService {

    
    ExpenseDTO addExpense(ExpenseDTO expenseDTO, Integer userId) throws Exception;
    Expense copyExpense(Integer userId, Integer expenseId) throws Exception;
    Expense save(Expense expense);
    Expense updateExpense(Integer id, Expense expense, Integer userId) throws Exception;
    Expense updateExpenseWithBillService(Integer id, Expense updatedExpense, Integer userId) throws Exception;
    void deleteExpense(Integer id, Integer userId) throws Exception;
    void deleteExpensesByIds(List<Integer> ids, Integer userId) throws Exception;
    void deleteExpensesByIdsWithBillService(List<Integer> ids, Integer userId) throws Exception;
    void deleteAllExpenses(Integer userId, List<Expense> expenses);

    
    List<Expense> addMultipleExpenses(List<Expense> expenses, Integer userId) throws Exception;
    List<Expense> addMultipleExpensesWithProgress(List<Expense> expenses, Integer userId, String jobId) throws Exception;
    List<Expense> updateMultipleExpenses(Integer userId, List<Expense> expenses) throws Exception;
    List<Expense> saveExpenses(List<Expense> expenses);
    List<Expense> saveExpenses(List<ExpenseDTO> expenseDTOs, Integer userId) throws Exception;

    
    Expense getExpenseById(Integer id, Integer userId);
    List<Expense> getAllExpenses(Integer userId);
    List<Expense> getAllExpenses(Integer userId, String sortOrder);
    List<Expense> getExpensesByIds(Integer userId, Set<Integer> expenseIds) throws UserException;
    List<Expense> getExpensesByIds(List<Integer> ids);
    List<Expense> getExpensesByUserAndSort(Integer userId, String sortOrder) throws UserException;

    
    String getCommentsForExpense(Integer expenseId, Integer userId);
    String removeCommentFromExpense(Integer expenseId, Integer userId);




    


}
