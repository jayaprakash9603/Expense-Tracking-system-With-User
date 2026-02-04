package com.jaya.service;

import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseSearchDTO;
import com.jaya.exceptions.UserException;
import com.jaya.models.*;
import com.jaya.service.expenses.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Main facade implementation that delegates to specialized service modules
 */
@Service
@RequiredArgsConstructor
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseCoreService expenseCoreService;
    private final ExpenseQueryService expenseQueryService;
    private final ExpenseAnalyticsService expenseAnalyticsService;
    private final ExpenseUtilityService expenseUtilityService;
    private final ExpenseReportService expenseReportService;
    private final ExpenseBillService expenseBillService;
    private final ExpenseCategoryService expenseCategoryService;

    // Delegate services access
    @Override
    public ExpenseCoreService getCoreService() {
        return expenseCoreService;
    }

    @Override
    public ExpenseQueryService getQueryService() {
        return expenseQueryService;
    }

    @Override
    public ExpenseAnalyticsService getAnalyticsService() {
        return expenseAnalyticsService;
    }

    @Override
    public ExpenseUtilityService getUtilityService() {
        return expenseUtilityService;
    }

    @Override
    public ExpenseReportService getReportService() {
        return expenseReportService;
    }

    @Override
    public ExpenseBillService getBillService() {
        return expenseBillService;
    }

    @Override
    public ExpenseCategoryService getCategoryService() {
        return expenseCategoryService;
    }

    // Core CRUD operations - delegate to ExpenseCoreService
    @Override
    public ExpenseDTO addExpense(ExpenseDTO expenseDTO, Integer userId) throws Exception {
        return expenseCoreService.addExpense(expenseDTO, userId);
    }

    @Override
    public Expense copyExpense(Integer userId, Integer expenseId) throws Exception {
        return expenseCoreService.copyExpense(userId, expenseId);
    }

    @Override
    public Expense save(Expense expense) {
        return expenseCoreService.save(expense);
    }

    @Override
    public Expense updateExpense(Integer id, Expense expense, Integer userId) throws Exception {
        return expenseCoreService.updateExpense(id, expense, userId);
    }

    @Override
    public Expense updateExpenseWithBillService(Integer id, Expense updatedExpense, Integer userId) throws Exception {
        return expenseBillService.updateExpenseWithBillService(id, updatedExpense, userId);
    }

    @Override
    public void deleteExpense(Integer id, Integer userId) throws Exception {
        expenseCoreService.deleteExpense(id, userId);
    }

    @Override
    public void deleteExpensesByIds(List<Integer> ids, Integer userId) throws Exception {
        expenseCoreService.deleteExpensesByIds(ids, userId);
    }

    @Override
    public void deleteExpensesByIdsWithBillService(List<Integer> ids, Integer userId) throws Exception {
        expenseBillService.deleteExpensesByIdsWithBillService(ids, userId);
    }

    @Override
    public void deleteAllExpenses(Integer userId, List<Expense> expenses) {
        expenseBillService.deleteAllExpenses(userId, expenses);
    }

    // Batch operations
    @Override
    public List<Expense> addMultipleExpenses(List<Expense> expenses, Integer userId) throws Exception {
        return expenseCoreService.addMultipleExpenses(expenses, userId);
    }

    @Override
    public List<Expense> addMultipleExpensesWithProgress(List<Expense> expenses, Integer userId, String jobId)
            throws Exception {
        return expenseCoreService.addMultipleExpensesWithProgress(expenses, userId, jobId);
    }

    @Override
    public List<Expense> updateMultipleExpenses(Integer userId, List<Expense> expenses) throws Exception {
        return expenseCoreService.updateMultipleExpenses(userId, expenses);
    }

    @Override
    public List<Expense> saveExpenses(List<Expense> expenses) {
        return expenseCoreService.saveExpenses(expenses);
    }

    @Override
    public List<Expense> saveExpenses(List<ExpenseDTO> expenseDTOs, Integer userId) throws Exception {
        return expenseCoreService.saveExpenses(expenseDTOs, userId);
    }

    // Basic queries - delegate to ExpenseQueryService
    @Override
    public Expense getExpenseById(Integer id, Integer userId) {
        return expenseCoreService.getExpenseById(id, userId);
    }

    @Override
    public List<Expense> getAllExpenses(Integer userId) {
        return expenseCoreService.getAllExpenses(userId);
    }

    @Override
    public List<Expense> getAllExpenses(Integer userId, String sortOrder) {
        return expenseCoreService.getAllExpenses(userId, sortOrder);
    }

    @Override
    public List<Expense> getExpensesByIds(Integer userId, Set<Integer> expenseIds) throws UserException {
        return expenseCoreService.getExpensesByIds(userId, expenseIds);
    }

    @Override
    public List<Expense> getExpensesByIds(List<Integer> ids) {
        return expenseCoreService.getExpensesByIds(ids);
    }

    @Override
    public List<Expense> getExpensesByUserAndSort(Integer userId, String sortOrder) throws UserException {
        return expenseCoreService.getExpensesByUserAndSort(userId, sortOrder);
    }

    // Date-based queries
    @Override
    public List<Expense> getExpensesByDate(LocalDate date, Integer userId) {
        return expenseQueryService.getExpensesByDate(date, userId);
    }

    @Override
    public List<Expense> getExpensesByDateString(String dateString, Integer userId) throws Exception {
        return expenseQueryService.getExpensesByDateString(dateString, userId);
    }

    @Override
    public List<Expense> getExpensesByDateRange(LocalDate from, LocalDate to, Integer userId) {
        return expenseQueryService.getExpensesByDateRange(from, to, userId);
    }

    @Override
    public List<Expense> getExpensesForToday(Integer userId) {
        return expenseQueryService.getExpensesForToday(userId);
    }

    @Override
    public List<Expense> getExpensesForCurrentMonth(Integer userId) {
        return expenseQueryService.getExpensesForCurrentMonth(userId);
    }

    @Override
    public List<Expense> getExpensesForLastMonth(Integer userId) {
        return expenseQueryService.getExpensesForLastMonth(userId);
    }

    @Override
    public List<Expense> getExpensesByCurrentWeek(Integer userId) {
        return expenseQueryService.getExpensesByCurrentWeek(userId);
    }

    @Override
    public List<Expense> getExpensesByLastWeek(Integer userId) {
        return expenseQueryService.getExpensesByLastWeek(userId);
    }

    @Override
    public List<Expense> getExpensesByMonthAndYear(int month, int year, Integer userId) {
        return expenseQueryService.getExpensesByMonthAndYear(month, year, userId);
    }

    @Override
    public List<Expense> getExpensesByMonth(int year, int month) {
        return expenseQueryService.getExpensesByMonth(year, month);
    }

    // Search and filter
    @Override
    public List<Expense> searchExpensesByName(String expenseName, Integer userId) {
        return expenseQueryService.searchExpensesByName(expenseName, userId);
    }

    @Override
    public List<Expense> filterExpenses(String expenseName, LocalDate startDate, LocalDate endDate,
            String type, String paymentMethod, Double minAmount, Double maxAmount, Integer userId) {
        return expenseQueryService.filterExpenses(expenseName, startDate, endDate, type, paymentMethod, minAmount,
                maxAmount, userId);
    }

    // Type and payment method queries
    @Override
    public List<Expense> getExpensesByType(String type, Integer userId) {
        return expenseQueryService.getExpensesByType(type, userId);
    }

    @Override
    public List<Expense> getExpensesByPaymentMethod(String paymentMethod, Integer userId) {
        return expenseQueryService.getExpensesByPaymentMethod(paymentMethod, userId);
    }

    @Override
    public List<Expense> getExpensesByTypeAndPaymentMethod(String type, String paymentMethod, Integer userId) {
        return expenseQueryService.getExpensesByTypeAndPaymentMethod(type, paymentMethod, userId);
    }

    @Override
    public List<Expense> getLossExpenses(Integer userId) {
        return expenseQueryService.getLossExpenses(userId);
    }

    // Top/ranking queries
    @Override
    public List<Expense> getTopNExpenses(int n, Integer userId) {
        return expenseQueryService.getTopNExpenses(n, userId);
    }

    @Override
    public List<Expense> getTopGains(Integer userId) {
        return expenseQueryService.getTopGains(userId);
    }

    @Override
    public List<Expense> getTopLosses(Integer userId) {
        return expenseQueryService.getTopLosses(userId);
    }

    // Amount-based queries
    @Override
    public List<ExpenseDetails> getExpenseDetailsByAmount(double amount, Integer userId) {
        return expenseQueryService.getExpenseDetailsByAmount(amount, userId);
    }

    @Override
    public List<Expense> getExpenseDetailsByAmountRange(double minAmount, double maxAmount, Integer userId) {
        return expenseQueryService.getExpenseDetailsByAmountRange(minAmount, maxAmount, userId);
    }

    @Override
    public List<ExpenseDetails> getExpensesByName(String expenseName, Integer userId) {
        return expenseQueryService.getExpensesByName(expenseName, userId);
    }

    // Category-based queries
    @Override
    public List<Expense> getExpensesByCategoryId(Integer categoryId, Integer userId) {
        return expenseCategoryService.getExpensesByCategoryId(categoryId, userId);
    }

    @Override
    public Map<String, Object> getFilteredExpensesByCategories(Integer userId, String rangeType, int offset,
            String flowType) throws Exception {
        return expenseQueryService.getFilteredExpensesByCategories(userId, rangeType, offset, flowType);
    }

    @Override
    public Map<Category, List<Expense>> getAllExpensesByCategories(Integer userId) throws Exception {
        return expenseCategoryService.getAllExpensesByCategories(userId);
    }

    // Specialized queries
    @Override
    public Expense getExpensesBeforeDate(Integer userId, String expenseName, LocalDate date) {
        return expenseQueryService.getExpensesBeforeDate(userId, expenseName, date);
    }

    @Override
    public Expense getExpenseBeforeDateValidated(Integer userId, String expenseName, String dateString) {

        LocalDate parsedDate = LocalDate.parse(dateString);
        return expenseQueryService.getExpensesBeforeDate(userId, expenseName.trim(), parsedDate);

    }

    @Override
    public List<Expense> getExpensesWithinRange(Integer userId, LocalDate startDate, LocalDate endDate,
            String flowType) {
        return expenseQueryService.getExpensesWithinRange(userId, startDate, endDate, flowType);
    }

    @Override
    public List<Expense> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(LocalDate from, LocalDate to,
            Integer userId) {
        return expenseQueryService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue(from, to, userId);
    }

    @Override
    public List<Expense> getExpensesInBudgetRangeWithIncludeFlag(LocalDate startDate, LocalDate endDate,
            Integer budgetId, Integer userId) throws Exception {
        return expenseQueryService.getExpensesInBudgetRangeWithIncludeFlag(startDate, endDate, budgetId, userId);
    }

    @Override
    public Map<String, Object> getFilteredExpensesByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate,
            String flowType) throws Exception {
        return expenseQueryService.getFilteredExpensesByDateRange(userId, fromDate, toDate, flowType);
    }

    @Override
    public Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, LocalDate fromDate, LocalDate toDate,
            String flowType) {
        return expenseQueryService.getFilteredExpensesByPaymentMethod(userId, fromDate, toDate, flowType);
    }

    @Override
    public Map<String, Object> getFilteredExpensesByPaymentMethod(Integer userId, String rangeType, int offset,
            String flowType) {
        return expenseQueryService.getFilteredExpensesByPaymentMethod(userId, rangeType, offset, flowType);
    }

    // Analytics and summaries - delegate to ExpenseAnalyticsService
    @Override
    public MonthlySummary getMonthlySummary(Integer year, Integer month, Integer userId) {
        return expenseAnalyticsService.getMonthlySummary(year, month, userId);
    }

    @Override
    public Map<String, MonthlySummary> getYearlySummary(Integer year, Integer userId) {
        return expenseAnalyticsService.getYearlySummary(year, userId);
    }

    @Override
    public List<MonthlySummary> getSummaryBetweenDates(Integer startYear, Integer startMonth, Integer endYear,
            Integer endMonth, Integer userId) {
        return expenseAnalyticsService.getSummaryBetweenDates(startYear, startMonth, endYear, endMonth, userId);
    }

    @Override
    public Map<String, Object> getMonthlySpendingInsights(int year, int month, Integer userId) {
        return expenseAnalyticsService.getMonthlySpendingInsights(year, month, userId);
    }

    @Override
    public Map<String, Object> generateExpenseSummary(Integer userId) {
        return expenseAnalyticsService.generateExpenseSummary(userId);
    }

    // Totals and aggregations
    @Override
    public Map<String, Double> getTotalByDate(Integer userId) {
        return expenseAnalyticsService.getTotalByDate(userId);
    }

    @Override
    public Double getTotalForToday(Integer userId) {
        return expenseAnalyticsService.getTotalForToday(userId);
    }

    @Override
    public Double getTotalForCurrentMonth(Integer userId) {
        return expenseAnalyticsService.getTotalForCurrentMonth(userId);
    }

    @Override
    public Double getTotalForMonthAndYear(int month, int year, Integer userId) {
        return expenseAnalyticsService.getTotalForMonthAndYear(month, year, userId);
    }

    @Override
    public Double getTotalByDateRange(LocalDate startDate, LocalDate endDate, Integer userId) {
        return expenseAnalyticsService.getTotalByDateRange(startDate, endDate, userId);
    }

    @Override
    public Double getTotalExpenseByName(String expenseName) {
        return expenseAnalyticsService.getTotalExpenseByName(expenseName);
    }

    @Override
    public List<Map<String, Object>> getTotalByCategory(Integer userId) {
        return expenseCategoryService.getTotalByCategory(userId);
    }

    // Payment method analytics
    @Override
    public Map<String, Double> getPaymentWiseTotalForCurrentMonth(Integer userId) {
        return expenseAnalyticsService.getPaymentWiseTotalForCurrentMonth(userId);
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForLastMonth(Integer userId) {
        return expenseAnalyticsService.getPaymentWiseTotalForLastMonth(userId);
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForDateRange(LocalDate startDate, LocalDate endDate, Integer userId) {
        return expenseAnalyticsService.getPaymentWiseTotalForDateRange(startDate, endDate, userId);
    }

    @Override
    public Map<String, Double> getPaymentWiseTotalForMonth(int month, int year, Integer userId) {
        return expenseAnalyticsService.getPaymentWiseTotalForMonth(month, year, userId);
    }

    @Override
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethod(int month, int year, Integer userId) {
        return expenseAnalyticsService.getTotalByExpenseNameAndPaymentMethod(month, year, userId);
    }

    @Override
    public Map<String, Map<String, Double>> getTotalByExpenseNameAndPaymentMethodForDateRange(LocalDate startDate,
            LocalDate endDate, Integer userId) {
        return expenseAnalyticsService.getTotalByExpenseNameAndPaymentMethodForDateRange(startDate, endDate, userId);
    }

    @Override
    public Map<String, Map<String, Double>> getTotalExpensesGroupedByPaymentMethod(Integer userId) {
        return expenseAnalyticsService.getTotalExpensesGroupedByPaymentMethod(userId);
    }

    // Advanced analytics
    @Override
    public Map<String, Object> getExpenseNameOverTime(Integer userId, int year, int limit) throws Exception {
        return expenseAnalyticsService.getExpenseNameOverTime(userId, year, limit);
    }

    @Override
    public Map<String, Object> getPaymentMethodDistribution(Integer userId, int year) {
        return expenseAnalyticsService.getPaymentMethodDistribution(userId, year);
    }

    @Override
    public Map<String, Object> getMonthlyExpenses(Integer userId, int year) {
        return expenseAnalyticsService.getMonthlyExpenses(userId, year);
    }

    @Override
    public Map<String, Object> getExpenseByName(Integer userId, int year) {
        return expenseAnalyticsService.getExpenseByName(userId, year);
    }

    @Override
    public Map<String, Object> getExpenseTrend(Integer userId, int year) {
        return expenseAnalyticsService.getExpenseTrend(userId, year);
    }

    @Override
    public Map<String, Object> getCumulativeExpenses(Integer userId, int year) throws Exception {
        return expenseAnalyticsService.getCumulativeExpenses(userId, year);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId) {
        return expenseAnalyticsService.getDailySpendingCurrentMonth(userId);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingCurrentMonth(Integer userId, String type) {
        return expenseAnalyticsService.getDailySpendingCurrentMonth(userId, type);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingByMonth(Integer userId, Integer month, Integer year) {
        return expenseAnalyticsService.getDailySpendingByMonth(userId, month, year);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingByMonth(Integer userId, Integer month, Integer year, String type) {
        return expenseAnalyticsService.getDailySpendingByMonth(userId, month, year, type);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate) {
        return expenseAnalyticsService.getDailySpendingByDateRange(userId, fromDate, toDate);
    }

    @Override
    public List<Map<String, Object>> getDailySpendingByDateRange(Integer userId, LocalDate fromDate, LocalDate toDate,
            String type) {
        return expenseAnalyticsService.getDailySpendingByDateRange(userId, fromDate, toDate, type);
    }

    @Override
    public List<Map<String, Object>> getMonthlySpendingAndIncomeCurrentMonth(Integer userId) {
        return expenseAnalyticsService.getMonthlySpendingAndIncomeCurrentMonth(userId);
    }

    @Override
    public List<Map<String, Object>> getExpenseDistributionCurrentMonth(Integer userId) {
        return expenseAnalyticsService.getExpenseDistributionCurrentMonth(userId);
    }

    // Utility methods - delegate to ExpenseUtilityService
    @Override
    public List<String> getTopExpenseNames(int topN, Integer userId) {
        return expenseUtilityService.getTopExpenseNames(topN, userId);
    }

    @Override
    public List<String> getTopPaymentMethods(Integer userId) {
        return expenseUtilityService.getTopPaymentMethods(userId);
    }

    @Override
    public List<String> getUniqueTopExpensesByGain(Integer userId, int limit) {
        return expenseUtilityService.getUniqueTopExpensesByGain(userId, limit);
    }

    @Override
    public List<String> getUniqueTopExpensesByLoss(Integer userId, int limit) {
        return expenseUtilityService.getUniqueTopExpensesByLoss(userId, limit);
    }

    @Override
    public List<String> getPaymentMethods(Integer userId) {
        return expenseUtilityService.getPaymentMethods(userId);
    }

    @Override
    public Map<String, Map<String, Double>> getPaymentMethodSummary(Integer userId) {
        return expenseAnalyticsService.getPaymentMethodSummary(userId);
    }

    @Override
    public List<String> getDropdownValues() {
        return expenseUtilityService.getDropdownValues();
    }

    @Override
    public List<String> getSummaryTypes() {
        return expenseUtilityService.getSummaryTypes();
    }

    @Override
    public List<String> getDailySummaryTypes() {
        return expenseUtilityService.getDailySummaryTypes();
    }

    @Override
    public List<String> getExpensesTypes() {
        return expenseUtilityService.getExpensesTypes();
    }

    // Data grouping and pagination
    @Override
    public Map<String, List<Map<String, Object>>> getExpensesGroupedByDate(Integer userId, String sortOrder) {
        return expenseUtilityService.getExpensesGroupedByDate(userId, sortOrder);
    }

    @Override
    public Map<String, List<Map<String, Object>>> getExpensesGroupedByDateWithPagination(Integer userId,
            String sortOrder,
            int page, int size, String sortBy) throws Exception {
        return expenseQueryService.getExpensesGroupedByDateWithPagination(userId, sortOrder, page, size, sortBy);
    }

    @Override
    public Map<String, Object> getExpensesGroupedByDateWithValidation(Integer userId, int page, int size, String sortBy,
            String sortOrder) throws Exception {
        return expenseQueryService.getExpensesGroupedByDateWithValidation(userId, page, size, sortBy, sortOrder);
    }

    @Override
    public Map<String, Object> getPaymentMethodDistributionByDateRange(Integer userId, LocalDate startDate,
            LocalDate endDate, String flowType, String type) {
        return expenseAnalyticsService.getPaymentMethodDistributionByDateRange(userId, startDate, endDate, flowType,
                type);
    }

    // Comments management
    @Override
    public String getCommentsForExpense(Integer expenseId, Integer userId) {
        return expenseCoreService.getCommentsForExpense(expenseId, userId);
    }

    @Override
    public String removeCommentFromExpense(Integer expenseId, Integer userId) {
        return expenseCoreService.removeCommentFromExpense(expenseId, userId);
    }

    // Report generation - delegate to ExpenseReportService
    @Override
    public ExpenseReport generateExpenseReport(Integer expenseId, Integer userId) {
        return expenseReportService.generateExpenseReport(expenseId, userId);
    }

    @Override
    public String generateExcelReport(Integer userId) throws Exception {
        return expenseReportService.generateExcelReport(userId);
    }

    @Override
    public void sendEmailWithAttachment(String toEmail, String subject, String body, String attachmentPath)
            throws MessagingException {
        expenseReportService.sendEmailWithAttachment(toEmail, subject, body, attachmentPath);
    }

    @Override
    public ResponseEntity<String> generateAndSendMonthlyReport(ReportRequest request) {
        return expenseReportService.generateAndSendMonthlyReport(request);
    }

    // Data processing utilities
    @Override
    public List<ExpenseDTO> validateAndProcessExpenses(List<ExpenseDTO> expenses) {
        return expenseUtilityService.validateAndProcessExpenses(expenses);
    }

    @Override
    public double calculateTotalAmount(Map<String, Map<String, Double>> categorizedExpenses) {
        return expenseUtilityService.calculateTotalAmount(categorizedExpenses);
    }

    @Override
    public Map<String, Map<String, Double>> categorizeExpenses(List<ExpenseDTO> processedExpenses) {
        return expenseUtilityService.categorizeExpenses(processedExpenses);
    }

    @Override
    public List<String> findTopExpenseNames(List<ExpenseDTO> expenses, int topN) {
        return expenseUtilityService.findTopExpenseNames(expenses, topN);
    }

    @Override
    public double calculateTotalCreditDue(List<ExpenseDTO> processedExpenses) {
        return expenseUtilityService.calculateTotalCreditDue(processedExpenses);
    }

    @Override
    public String findTopPaymentMethod(List<ExpenseDTO> expenses) {
        return expenseUtilityService.findTopPaymentMethod(expenses);
    }

    @Override
    public Set<String> getPaymentMethodNames(List<ExpenseDTO> expenses) {
        return expenseUtilityService.getPaymentMethodNames(expenses);
    }

    @Override
    public List<ExpenseSearchDTO> searchExpensesFuzzy(Integer userId, String query, int limit) {
        return expenseQueryService.searchExpensesFuzzy(userId, query, limit);
    }
}