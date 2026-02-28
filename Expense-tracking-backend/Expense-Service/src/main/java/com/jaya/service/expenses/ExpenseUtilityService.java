package com.jaya.service.expenses;

import com.jaya.dto.ExpenseDTO;
import java.util.List;
import java.util.Map;
import java.util.Set;




public interface ExpenseUtilityService {

    
    List<ExpenseDTO> validateAndProcessExpenses(List<ExpenseDTO> expenses);
    double calculateTotalAmount(Map<String, Map<String, Double>> categorizedExpenses);
    Map<String, Map<String, Double>> categorizeExpenses(List<ExpenseDTO> processedExpenses);
    double calculateTotalCreditDue(List<ExpenseDTO> processedExpenses);

    
    List<String> findTopExpenseNames(List<ExpenseDTO> expenses, int topN);
    String findTopPaymentMethod(List<ExpenseDTO> expenses);
    List<String> getTopExpenseNames(int topN, Integer userId);
    List<String> getTopPaymentMethods(Integer userId);
    List<String> getUniqueTopExpensesByGain(Integer userId, int limit);
    List<String> getUniqueTopExpensesByLoss(Integer userId, int limit);

    
    List<String> getPaymentMethods(Integer userId);
    Set<String> getPaymentMethodNames(List<ExpenseDTO> expenses);

    
    List<String> getDropdownValues();
    List<String> getSummaryTypes();
    List<String> getDailySummaryTypes();
    List<String> getExpensesTypes();

    
    Map<String, List<Map<String, Object>>> getExpensesGroupedByDate(Integer userId, String sortOrder);



    



    





    



}
