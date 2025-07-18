package com.jaya.service;

import com.jaya.models.UserDto;
import java.time.LocalDate;
import java.util.Map;
import java.util.List;

public interface AnalyticsService {

    Map<String, Object> getSpendingPatternAnalysis(UserDto UserDto, int months);

    Map<String, Object> getPredictiveSpendingForecast(UserDto UserDto, int futureDays);

    Map<String, Object> getExpenseAnomalyDetection(UserDto UserDto, LocalDate startDate, LocalDate endDate);

    Map<String, Object> getCategoryWiseSpendingTrends(UserDto UserDto, int year);

    Map<String, Object> getSeasonalSpendingAnalysis(UserDto UserDto, int years);

    Map<String, Object> getPaymentMethodEfficiencyAnalysis(UserDto UserDto);

    Map<String, Object> getBudgetPerformanceAnalytics(UserDto UserDto, int months);

    Map<String, Object> getExpenseFrequencyAnalysis(UserDto UserDto);

    Map<String, Object> getSpendingVelocityAnalysis(UserDto UserDto, LocalDate startDate, LocalDate endDate);

    Map<String, Object> getCashFlowAnalysis(UserDto UserDto, int months);

    List<Map<String, Object>> getTopSpendingInsights(UserDto UserDto, int topN);

    Map<String, Object> getMonthOverMonthComparison(UserDto UserDto, int months);

    Map<String, Object> getExpenseDistributionAnalysis(UserDto UserDto);

    Map<String, Object> getSavingsOpportunityAnalysis(UserDto UserDto);

    Map<String, Object> getFinancialHealthScore(UserDto UserDto);
}