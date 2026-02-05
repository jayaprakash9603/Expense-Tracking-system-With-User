package com.jaya.service.expenses;


import com.jaya.models.Expense;
import java.util.List;




public interface ExpenseBillService {

    
    Expense updateExpenseWithBillService(Integer id, Expense updatedExpense, Integer userId) throws Exception;
    void deleteExpensesByIdsWithBillService(List<Integer> ids, Integer userId) throws Exception;
    void deleteAllExpenses(Integer userId, List<Expense> expenses);
}
