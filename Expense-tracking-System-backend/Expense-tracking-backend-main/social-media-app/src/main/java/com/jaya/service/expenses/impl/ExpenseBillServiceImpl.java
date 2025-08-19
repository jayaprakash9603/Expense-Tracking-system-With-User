package com.jaya.service.expenses.impl;

import com.jaya.models.Expense;
import com.jaya.service.expenses.ExpenseBillService;
import com.jaya.service.expenses.ExpenseCoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
@Service
public class ExpenseBillServiceImpl implements ExpenseBillService {

    @Autowired
    private ExpenseCoreService expenseCoreService;
    @Override
    public Expense updateExpenseWithBillService(Integer id, Expense updatedExpense, Integer userId) throws Exception {
        return expenseCoreService.updateExpenseWithBillService(id,updatedExpense,userId);
    }

    @Override
    public void deleteExpensesByIdsWithBillService(List<Integer> ids, Integer userId) throws Exception {
            expenseCoreService.deleteExpensesByIdsWithBillService(ids,userId);
    }

    @Override
    public void deleteAllExpenses(Integer userId, List<Expense> expenses) {
           expenseCoreService.deleteAllExpenses(userId,expenses);
    }
}
