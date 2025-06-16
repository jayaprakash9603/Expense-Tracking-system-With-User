package com.jaya.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.jaya.exceptions.UserException;
import com.jaya.models.*;
import org.springframework.http.ResponseEntity;

import com.jaya.dto.ExpenseDTO;

import jakarta.mail.MessagingException;

public interface ExpenseService {
    
    Expense addExpense(Expense expense, User user) throws Exception;

    List<Expense> addMultipleExpenses(List<Expense> expenses, User user) throws Exception;
//    List<Expense> addMultipleExpenses(User user, List<Expense> expenses) throws Exception;

    List<Expense> getExpensesByCategoryId(Integer categoryId, User user);
    // Add this method to the ExpenseService interface
    Map<String, Object> getFilteredExpensesByCategories(
            User user,
            String rangeType,
            int offset,
            String flowType
    );

    Map<String, Object> getFilteredExpensesByDateRange(User user, LocalDate fromDate, LocalDate toDate, String flowType);
    Map<Category, List<Expense>> getAllExpensesByCategories(User user);
    Expense getExpenseById(Integer id,User user);
    List<Expense> getTopNExpenses(int n,User user);

    List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to,User user);
    List<Expense>findByUserIdAndDateBetweenAndIncludeInBudgetTrue(LocalDate from, LocalDate to,Integer userId);

    List<Expense> getAllExpenses(User user,String sortOrder);
    List<Expense> getAllExpenses(User user);
    List<Expense> searchExpensesByName(String expenseName,User user);
    
    List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate, String type, String paymentMethod, Double minAmount, Double maxAmount,User user);


    Expense updateExpense(Integer id, Expense expense,User user)  throws  Exception;
    List<Expense> updateMultipleExpenses(User user,List<Expense> expenses) throws Exception;
    MonthlySummary getMonthlySummary(Integer year, Integer month,User user);
    Map<String, MonthlySummary> getYearlySummary(Integer year,User user);
    List<MonthlySummary> getSummaryBetweenDates(Integer startYear, Integer startMonth, Integer endYear, Integer endMonth,User user);
    public List<Expense> saveMultipleExpenses(List<Expense> expenses, User user);
    void deleteAllExpenses(User user, List<Expense> expenses);
    void deleteExpensesByIds(List<Integer> ids, User user) throws Exception;
    List<Expense> getExpensesByDate(LocalDate date,User user);
    void deleteExpense(Integer id,User user);
    List<String> getTopExpenseNames(int topN,User user);
    Map<String, Object> getMonthlySpendingInsights(int year, int month,User user);
    List<String> getPaymentMethods(User user);
    Map<String, Map<String, Double>> getPaymentMethodSummary(User user);
    
    List<Expense> getExpensesByType(String type,User user);
    List<Expense> getLossExpenses(User user);
    
    List<Expense> getExpensesByPaymentMethod(String paymentMethod,User user);
    List<Expense> getExpensesByTypeAndPaymentMethod(String type, String paymentMethod,User user);
    
    List<String> getTopPaymentMethods(User user);
    
    List<Expense> getTopGains(User user);
    
    List<Expense> getTopLosses(User user);
    
    
    
    List<Expense> getExpensesByMonthAndYear(int month, int year,User user);
    
    
    List<String> getUniqueTopExpensesByGain(User user,int limit);
    
    List<String> getUniqueTopExpensesByLoss(User user,int limit);
    
    
    List<Expense> getExpensesForToday(User user);
    
    List<Expense> getExpensesForLastMonth(User user);
    List<Expense> getExpensesForCurrentMonth(User user);
    
    List<String> getDropdownValues();
    List<String> getSummaryTypes();
    
    List<String> getExpensesTypes();
    
    List<Expense> getExpensesByMonth(int year, int month);
    
    List<Expense> getExpensesByCurrentWeek(User user);
    List<Expense> getExpensesByLastWeek(User user);
    String getCommentsForExpense(Integer expenseId,User user);
    
    
    String removeCommentFromExpense(Integer expenseId,User user);
    
    ExpenseReport generateExpenseReport(Integer expenseId,User user);
    
    Expense copyExpense(Integer expenseId,User user);
    
    List<ExpenseDetails> getExpenseDetailsByAmount(double amount,User user);
    
    
    List<Expense> getExpenseDetailsByAmountRange(double minAmount, double maxAmount,User user);
    
    Double getTotalExpenseByName(String expenseName);
    
    List<ExpenseDetails> getExpensesByName(String expenseName,User user);
    
    
    List<Map<String, Object>> getTotalByCategory(User user);
    
    Map<String, Double> getTotalByDate(User user);
    
    Double getTotalForToday(User user);
    
    Double getTotalForCurrentMonth(User user);
    
    Double getTotalForMonthAndYear(int month, int year,User user);
    
    Double getTotalByDateRange(LocalDate startDate, LocalDate endDate,User user);
    
    Map<String, Double> getPaymentWiseTotalForCurrentMonth(User user);
    
    Map<String, Double> getPaymentWiseTotalForLastMonth(User user);
    
    Map<String, Double> getPaymentWiseTotalForDateRange(LocalDate startDate, LocalDate endDate,User user);
    
    
    Map<String, Double> getPaymentWiseTotalForMonth(int month, int year,User user);
    
    
    Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethod(int month, int year,User user);
    
    Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForDateRange(LocalDate startDate, LocalDate endDate,User user);
    
    
    Map<String, Map<String, Double>> getTotalExpensesGroupedByPaymentMethod(User user);
    
    
    String generateExcelReport(User user) throws IOException;


    Expense getExpensesBeforeDate(Integer userId, String expenseName, LocalDate date);
    
    void sendEmailWithAttachment(String toEmail, String subject, String body, String attachmentPath) throws MessagingException;
    
    ResponseEntity<String> generateAndSendMonthlyReport(ReportRequest request);
    
    List<String> getDailySummaryTypes();
    double calculateTotalAmount(Map<String, Map<String, Double>> categorizedExpenses);
    Map<String, Map<String, Double>> categorizeExpenses(List<ExpenseDTO> processedExpenses);
    List<ExpenseDTO> validateAndProcessExpenses(List<ExpenseDTO> expenses);
    
    List<String> findTopExpenseNames(List<ExpenseDTO> expenses, int topN);
    
    double calculateTotalCreditDue(List<ExpenseDTO> processedExpenses);
    String findTopPaymentMethod(List<ExpenseDTO> expenses);
    
    Set<String> getPaymentMethodNames(List<ExpenseDTO> expenses);
    
    List<Expense> getExpensesByIds(List<Integer> ids);
    
    List<Expense> saveExpenses(List<Expense> expenses);


    Map<String, List<Map<String, Object>>> getExpensesGroupedByDate(User user, String sortOrder);

    Map<String, List<Map<String, Object>>> getExpensesGroupedByDateWithPagination(User user, String sortOrder, int page, int size, String sortBy);



    List<Expense> saveExpenses(List<ExpenseDTO> expenseDTOs, User user);

    Map<String, Object> getExpenseNameOverTime(User user,int year, int limit);
    Map<String, Object> getPaymentMethodDistribution(User user,int year);
    Map<String, Object> getMonthlyExpenses(User user,int year);
    Map<String, Object> getExpenseByName(User user,int year);
    Map<String, Object> getExpenseTrend(User user,int year);
    Map<String, Object> getCumulativeExpenses(User user,int year);



    List<Map<String, Object>> getExpenseDistributionCurrentMonth(Integer userId);
    List<Map<String, Object>> getMonthlySpendingAndIncomeCurrentMonth(Integer userId);
    List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId);


    List<Expense> getExpensesInBudgetRangeWithIncludeFlag(
            LocalDate startDate,
            LocalDate endDate,
            Integer budgetId,
            Integer userId);


    List<Expense> getExpensesWithinRange(
            Integer userId,
            LocalDate startDate,
            LocalDate endDate,
            String flowType
    );

}
