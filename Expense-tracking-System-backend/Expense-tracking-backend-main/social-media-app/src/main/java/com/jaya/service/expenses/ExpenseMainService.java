package com.jaya.service.expenses;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Facade service that provides a unified interface to all expense-related operations
 */
@Service
@AllArgsConstructor
public class ExpenseMainService {

    private final ExpenseCoreService expenseCoreService;
    private final ExpenseQueryService expenseQueryService;
    private final ExpenseAnalyticsService expenseAnalyticsService;
    private final ExpenseCategoryService expenseCategoryService;
    private final ExpenseUtilityService expenseUtilityService;
    private final ExpenseReportService expenseReportService;
    private final ExpenseBillService expenseBillService;

    // Delegate methods to appropriate services
    public ExpenseCoreService getCoreService() {
        return expenseCoreService;
    }

    public ExpenseQueryService getQueryService() {
        return expenseQueryService;
    }

    public ExpenseAnalyticsService getAnalyticsService() {
        return expenseAnalyticsService;
    }

    public ExpenseCategoryService getCategoryService() {
        return expenseCategoryService;
    }

    public ExpenseUtilityService getUtilityService() {
        return expenseUtilityService;
    }

    public ExpenseReportService getReportService() {
        return expenseReportService;
    }

    public ExpenseBillService getBillService() {
        return expenseBillService;
    }
}