package com.jaya.service.expenses.strategy;

import com.jaya.models.Expense;
import com.jaya.service.expenses.vo.ExpenseCalculationResult;

import java.util.List;





public interface ExpenseCalculationStrategy {

    





    ExpenseCalculationResult calculate(List<Expense> expenses);

    


    String getStrategyName();
}
