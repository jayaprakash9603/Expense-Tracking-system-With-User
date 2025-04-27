package com.jaya.service;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

import com.jaya.models.*;
import org.springframework.http.ResponseEntity;

import com.jaya.dto.ExpenseDTO;

import jakarta.mail.MessagingException;

public interface ExpenseService {
    
    Expense addExpense(Expense expense, User user);

    Expense getExpenseById(Integer id,User user);
    List<Expense> getTopNExpenses(int n,User user);

    List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to,User user);

    List<Expense> getAllExpenses(User user);
    
    List<Expense> searchExpensesByName(String expenseName,User user);
    
    List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate, String type, String paymentMethod, Double minAmount, Double maxAmount,User user);

    void updateExpense(Integer id, Expense expense);
    void updateMultipleExpenses(List<Expense> expenses);
    MonthlySummary getMonthlySummary(Integer year, Integer month,User user);
    Map<String, MonthlySummary> getYearlySummary(Integer year,User user);
    List<MonthlySummary> getSummaryBetweenDates(Integer startYear, Integer startMonth, Integer endYear, Integer endMonth,User user);
    public List<Expense> saveMultipleExpenses(List<Expense> expenses, User user);
    void deleteAllExpenses(List<Expense>expenses);
    void deleteExpensesByIds(List<Integer> ids) throws Exception;
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
    
    List<Expense> getExpensesByCurrentWeek();
    List<Expense> getExpensesByLastWeek();
    String getCommentsForExpense(Integer expenseId,User user);
    
    
    String removeCommentFromExpense(Integer expenseId,User user);
    
    ExpenseReport generateExpenseReport(Integer expenseId,User user);
    
    Expense copyExpense(Integer expenseId,User user);
    
    List<ExpenseDetails> getExpenseDetailsByAmount(double amount,User user);
    
    
    List<Expense> getExpenseDetailsByAmountRange(double minAmount, double maxAmount,User user);
    
    Double getTotalExpenseByName(String expenseName);
    
    List<ExpenseDetails> getExpensesByName(String expenseName,User user);
    
    
    List<Map<String, Object>> getTotalByCategory(User user);
    
    Map<String, Double> getTotalByDate();
    
    Double getTotalForToday();
    
    Double getTotalForCurrentMonth();
    
    Double getTotalForMonthAndYear(int month, int year);
    
    Double getTotalByDateRange(LocalDate startDate, LocalDate endDate);
    
    Map<String, Double> getPaymentWiseTotalForCurrentMonth();
    
    Map<String, Double> getPaymentWiseTotalForLastMonth();
    
    Map<String, Double> getPaymentWiseTotalForDateRange(LocalDate startDate, LocalDate endDate);
    
    
    Map<String, Double> getPaymentWiseTotalForMonth(int month, int year);
    
    
    Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethod(int month, int year);
    
    Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForDateRange(LocalDate startDate, LocalDate endDate);
    
    
    Map<String, Map<String, Double>> getTotalExpensesGroupedByPaymentMethod();
    
    
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
}
