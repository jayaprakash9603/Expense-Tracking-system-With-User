package com.jaya.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.jaya.exceptions.UserException;
import com.jaya.models.*;
import com.jaya.service.expenses.*;
import org.springframework.http.ResponseEntity;

import com.jaya.dto.ExpenseDTO;

import jakarta.mail.MessagingException;

public interface ExpenseService {


    ExpenseCoreService getCoreService();
    ExpenseQueryService getQueryService();
    ExpenseAnalyticsService getAnalyticsService();
    ExpenseUtilityService getUtilityService();
    ExpenseReportService getReportService();
    ExpenseBillService getBillService();
    ExpenseCategoryService getCategoryService();
    Expense addExpense(Expense expense, Integer userId) throws Exception;

    Expense copyExpense(Integer userId,Integer expenseId) throws  Exception;


    Expense save(Expense expense);

    List<Expense> getExpensesByIds(Integer userId, Set<Integer> expenseIds) throws UserException;
    List<Expense>getExpensesByUserAndSort(Integer userId, String sortOrder) throws UserException;
    List<Expense> addMultipleExpenses(List<Expense> expenses, Integer userId) throws Exception;
        // New: same as addMultipleExpenses but reports progress to a tracker using jobId
        List<Expense> addMultipleExpensesWithProgress(List<Expense> expenses, Integer userId, String jobId) throws Exception;

    List<Expense> getExpensesByCategoryId(Integer categoryId,Integer userId);
    // Add this method to the ExpenseService interface
    Map<String, Object> getFilteredExpensesByCategories(
            Integer userId,
            String rangeType,
            int offset,
            String flowType
    ) throws Exception;

    Map<String, Object> getFilteredExpensesByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate, String flowType) throws Exception;
    public Map<String, Object> getFilteredExpensesByPaymentMethod(
            Integer userId,
            LocalDate fromDate,
            LocalDate toDate,
            String flowType);

    Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, String rangeType, int offset, String flowType);
    Map<Category, List<Expense>> getAllExpensesByCategories(Integer userId) throws Exception;
    Expense getExpenseById(Integer id,Integer userId);
    List<Expense> getTopNExpenses(int n,Integer userId);

    List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to,Integer userId);
    List<Expense>findByUserIdAndDateBetweenAndIncludeInBudgetTrue(LocalDate from, LocalDate to,Integer userId);

    List<Expense> getAllExpenses(Integer userId,String sortOrder);
    List<Expense> getAllExpenses(Integer userId);
    List<Expense> searchExpensesByName(String expenseName,Integer userId);

    List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate, String type, String paymentMethod, Double minAmount, Double maxAmount,Integer userId);


    Expense updateExpense(Integer id, Expense expense,Integer userId)  throws  Exception;
    Expense updateExpenseWithBillService(Integer id, Expense updatedExpense,Integer userId) throws Exception;
    List<Expense> updateMultipleExpenses(Integer userId,List<Expense> expenses) throws Exception;
    MonthlySummary getMonthlySummary(Integer year, Integer month,Integer userId);



    Map<String, MonthlySummary> getYearlySummary(Integer year,Integer userId);
    List<MonthlySummary> getSummaryBetweenDates(Integer startYear, Integer startMonth, Integer endYear, Integer endMonth,Integer userId);
    void deleteAllExpenses(Integer userId, List<Expense> expenses);
    void deleteExpensesByIds(List<Integer> ids, Integer userId) throws Exception;
    void deleteExpensesByIdsWithBillService(List<Integer> ids, Integer userId) throws Exception;
    List<Expense> getExpensesByDate(LocalDate date,Integer userId);
    List<Expense> getExpensesByDateString(String dateString, Integer userId) throws Exception;
    void deleteExpense(Integer id,Integer userId) throws Exception;
    List<String> getTopExpenseNames(int topN,Integer userId);
    Map<String, Object> getMonthlySpendingInsights(int year, int month,Integer userId);
    List<String> getPaymentMethods(Integer userId);
    Map<String, Map<String, Double>> getPaymentMethodSummary(Integer userId);

    List<Expense> getExpensesByType(String type,Integer userId);
    List<Expense> getLossExpenses(Integer userId);

    List<Expense> getExpensesByPaymentMethod(String paymentMethod,Integer userId);
    List<Expense> getExpensesByTypeAndPaymentMethod(String type, String paymentMethod,Integer userId);

    List<String> getTopPaymentMethods(Integer userId);

    List<Expense> getTopGains(Integer userId);

    List<Expense> getTopLosses(Integer userId);



    List<Expense> getExpensesByMonthAndYear(int month, int year,Integer userId);


    List<String> getUniqueTopExpensesByGain(Integer userId,int limit);

    List<String> getUniqueTopExpensesByLoss(Integer userId,int limit);


    List<Expense> getExpensesForToday(Integer userId);

    List<Expense> getExpensesForLastMonth(Integer userId);
    List<Expense> getExpensesForCurrentMonth(Integer userId);

    List<String> getDropdownValues();
    List<String> getSummaryTypes();

    List<String> getExpensesTypes();

    List<Expense> getExpensesByMonth(int year, int month);

    List<Expense> getExpensesByCurrentWeek(Integer userId);
    List<Expense> getExpensesByLastWeek(Integer userId);
    String getCommentsForExpense(Integer expenseId,Integer userId);


    String removeCommentFromExpense(Integer expenseId,Integer userId);

    ExpenseReport generateExpenseReport(Integer expenseId,Integer userId);



    List<ExpenseDetails> getExpenseDetailsByAmount(double amount,Integer userId);


    List<Expense> getExpenseDetailsByAmountRange(double minAmount, double maxAmount,Integer userId);

    Double getTotalExpenseByName(String expenseName);

    List<ExpenseDetails> getExpensesByName(String expenseName,Integer userId);


    List<Map<String, Object>> getTotalByCategory(Integer userId);

    Map<String, Double> getTotalByDate(Integer userId);

    Double getTotalForToday(Integer userId);

    Double getTotalForCurrentMonth(Integer userId);

    Double getTotalForMonthAndYear(int month, int year,Integer userId);

    Double getTotalByDateRange(LocalDate startDate, LocalDate endDate,Integer userId);

    Map<String, Double> getPaymentWiseTotalForCurrentMonth(Integer userId);

    Map<String, Double> getPaymentWiseTotalForLastMonth(Integer userId);

    Map<String, Double> getPaymentWiseTotalForDateRange(LocalDate startDate, LocalDate endDate,Integer userId);


    Map<String, Double> getPaymentWiseTotalForMonth(int month, int year,Integer userId);


    Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethod(int month, int year,Integer userId);

    Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForDateRange(LocalDate startDate, LocalDate endDate,Integer userId);


    Map<String, Map<String, Double>> getTotalExpensesGroupedByPaymentMethod(Integer userId);


    String generateExcelReport(Integer userId) throws Exception;


    Expense getExpensesBeforeDate(Integer userId, String expenseName, LocalDate date);

        
        Expense getExpenseBeforeDateValidated(Integer userId, String expenseName, String dateString);

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


    Map<String, List<Map<String, Object>>> getExpensesGroupedByDate(Integer userId, String sortOrder);

    Map<String, List<Map<String, Object>>> getExpensesGroupedByDateWithPagination(Integer userId, String sortOrder, int page, int size, String sortBy) throws Exception;



    List<Expense> saveExpenses(List<ExpenseDTO> expenseDTOs, Integer userId) throws Exception;

    Map<String, Object> getExpenseNameOverTime(Integer userId,int year, int limit) throws Exception;
    Map<String, Object> getPaymentMethodDistribution(Integer userId,int year);
    Map<String, Object> getMonthlyExpenses(Integer userId,int year);
    Map<String, Object> getExpenseByName(Integer userId,int year);
    Map<String, Object> getExpenseTrend(Integer userId,int year);
    Map<String, Object> getCumulativeExpenses(Integer userId,int year) throws Exception;



    List<Map<String, Object>> getExpenseDistributionCurrentMonth(Integer userId);
    List<Map<String, Object>> getMonthlySpendingAndIncomeCurrentMonth(Integer userId);


    List<Expense> getExpensesInBudgetRangeWithIncludeFlag(
            LocalDate startDate,
            LocalDate endDate,
            Integer budgetId,
            Integer userId) throws Exception;


    List<Expense> getExpensesWithinRange(
            Integer userId,
            LocalDate startDate,
            LocalDate endDate,
            String flowType
    );


    Map<String, Object> generateExpenseSummary(Integer userId);

    Map<String, Object> getExpensesGroupedByDateWithValidation(Integer userId, int page, int size, String sortBy, String sortOrder) throws Exception;



    Map<String, Object> getPaymentMethodDistributionByDateRange(Integer userId, LocalDate startDate, LocalDate endDate,String flowType,String type);

    List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId);
    List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId, String type);

    List<Map<String, Object>> getDailySpendingByMonth(Integer userId, Integer month, Integer year);
    List<Map<String, Object>> getDailySpendingByMonth(Integer userId, Integer month, Integer year, String type);

    List<Map<String, Object>> getDailySpendingByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate);
    List<Map<String, Object>> getDailySpendingByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate, String type);
}
