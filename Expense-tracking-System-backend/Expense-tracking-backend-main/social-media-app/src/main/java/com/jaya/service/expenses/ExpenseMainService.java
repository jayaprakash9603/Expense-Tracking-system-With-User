//package com.jaya.service.expenses;
//
//
//import lombok.AllArgsConstructor;
//import org.springframework.stereotype.Service;
//
///**
// * Facade service that provides a unified interface to all expense-related operations
// */
//@Service
//@AllArgsConstructor
//public class ExpenseMainService {
//
//    public final ExpenseCoreService expenseCoreService;
//
//
//    public final ExpenseQueryService expenseQueryService;
//
//
//    public  final ExpenseAnalyticsService expenseAnalyticsService;
//
//
//    public  final ExpenseCategoryService expenseCategoryService;
//
//
//    public final ExpenseUtilityService expenseUtilityService;
//
//
//    public final ExpenseReportService expenseReportService;
//
//
//    public final ExpenseBillService expenseBillService;
//
//    // Delegate methods to appropriate services
//    public ExpenseCoreService getExpenseService() {
//        return expenseCoreService;
//    }
//
//    public ExpenseQueryService getQueryService() {
//        return expenseQueryService;
//    }
//
//    public ExpenseAnalyticsService getAnalyticsService() {
//        return expenseAnalyticsService;
//    }
//
//    public ExpenseCategoryService getCategoryService() {
//        return expenseCategoryService;
//    }
//
//    public ExpenseUtilityService getUtilityService() {
//        return expenseUtilityService;
//    }
//
//    public ExpenseReportService getReportService() {
//        return expenseReportService;
//    }
//
//    public ExpenseBillService getBillService() {
//        return expenseBillService;
//    }
//}