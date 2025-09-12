package com.jaya.service.expenses;

import com.jaya.models.MonthlySummary;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Service for expense analytics and insights 28 method
 */
public interface ExpenseAnalyticsService {

    // Summary analytics
    MonthlySummary getMonthlySummary(Integer year, Integer month, Integer userId);
    Map<String, MonthlySummary> getYearlySummary(Integer year, Integer userId);
    List<MonthlySummary> getSummaryBetweenDates(Integer startYear, Integer startMonth, Integer endYear, Integer endMonth, Integer userId);
    Map<String, Object> generateExpenseSummary(Integer userId);

    // Total calculations
    Map<String, Double> getTotalByDate(Integer userId);
    Double getTotalForToday(Integer userId);
    Double getTotalForCurrentMonth(Integer userId);
    Double getTotalForMonthAndYear(int month, int year, Integer userId);
    Double getTotalByDateRange(LocalDate startDate, LocalDate endDate, Integer userId);
    Double getTotalExpenseByName(String expenseName);

    // Payment method analytics
    Map<String, Double> getPaymentWiseTotalForCurrentMonth(Integer userId);
    Map<String, Double> getPaymentWiseTotalForLastMonth(Integer userId);
    Map<String, Double> getPaymentWiseTotalForDateRange(LocalDate startDate, LocalDate endDate, Integer userId);
    Map<String, Double> getPaymentWiseTotalForMonth(int month, int year, Integer userId);
    Map<String, Map<String, Double>> getPaymentMethodSummary(Integer userId);
    Map<String, Map<String, Double>> getTotalExpensesGroupedByPaymentMethod(Integer userId);

    // Expense name analytics
    Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethod(int month, int year, Integer userId);
    Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForDateRange(LocalDate startDate, LocalDate endDate, Integer userId);

    // Insights and trends
    Map<String, Object> getMonthlySpendingInsights(int year, int month, Integer userId);
    Map<String, Object> getExpenseNameOverTime(Integer userId, int year, int limit) throws Exception;
    Map<String, Object> getPaymentMethodDistribution(Integer userId, int year);
    Map<String, Object> getMonthlyExpenses(Integer userId, int year);
    Map<String, Object> getExpenseByName(Integer userId, int year);
    Map<String, Object> getExpenseTrend(Integer userId, int year);
    Map<String, Object> getCumulativeExpenses(Integer userId, int year) throws Exception;

    // Current month analytics
    List<Map<String, Object>> getExpenseDistributionCurrentMonth(Integer userId);
    List<Map<String, Object>> getMonthlySpendingAndIncomeCurrentMonth(Integer userId);
    List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId);
    List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId, String type);

    List<Map<String, Object>> getDailySpendingByMonth(Integer userId, Integer month, Integer year);
    List<Map<String, Object>> getDailySpendingByMonth(Integer userId, Integer month, Integer year, String type);

    List<Map<String, Object>> getDailySpendingByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate);
    List<Map<String, Object>> getDailySpendingByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate, String type);

    Map<String, Object> getPaymentMethodDistributionByDateRange(Integer userId, LocalDate startDate, LocalDate endDate,String flowType,String type);

}