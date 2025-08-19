package com.jaya.builder;


import java.time.LocalDate;

public class ExpenseQueryBuilder {
    private Integer userId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String expenseName;
    private String type;
    private String paymentMethod;
    private Double minAmount;
    private Double maxAmount;
    private String sortBy;
    private String sortOrder = "DESC"; // Default sort order
    private Integer limit;
    private Integer offset = 0; // Default offset

    private ExpenseQueryBuilder() {
        // Private constructor to enforce factory method usage
    }

    public static ExpenseQueryBuilder builder() {
        return new ExpenseQueryBuilder();
    }

    public ExpenseQueryBuilder forUser(Integer userId) {
        this.userId = userId;
        return this;
    }

    public ExpenseQueryBuilder dateRange(LocalDate startDate, LocalDate endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        return this;
    }

    public ExpenseQueryBuilder currentMonth() {
        LocalDate now = LocalDate.now();
        this.startDate = now.withDayOfMonth(1);
        this.endDate = now.withDayOfMonth(now.lengthOfMonth());
        return this;
    }

    public ExpenseQueryBuilder currentWeek() {
        LocalDate now = LocalDate.now();
        this.startDate = now.minusDays(now.getDayOfWeek().getValue() - 1);
        this.endDate = this.startDate.plusDays(6);
        return this;
    }

    public ExpenseQueryBuilder lastNDays(int days) {
        LocalDate now = LocalDate.now();
        this.startDate = now.minusDays(days);
        this.endDate = now;
        return this;
    }

    public ExpenseQueryBuilder withExpenseName(String expenseName) {
        this.expenseName = expenseName;
        return this;
    }

    public ExpenseQueryBuilder withType(String type) {
        this.type = type;
        return this;
    }

    public ExpenseQueryBuilder withPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
        return this;
    }

    public ExpenseQueryBuilder amountRange(Double minAmount, Double maxAmount) {
        this.minAmount = minAmount;
        this.maxAmount = maxAmount;
        return this;
    }

    public ExpenseQueryBuilder minAmount(Double minAmount) {
        this.minAmount = minAmount;
        return this;
    }

    public ExpenseQueryBuilder maxAmount(Double maxAmount) {
        this.maxAmount = maxAmount;
        return this;
    }

    public ExpenseQueryBuilder sortBy(String sortBy) {
        this.sortBy = sortBy;
        return this;
    }

    public ExpenseQueryBuilder sortBy(String sortBy, String sortOrder) {
        this.sortBy = sortBy;
        this.sortOrder = sortOrder;
        return this;
    }

    public ExpenseQueryBuilder orderByDateDesc() {
        this.sortBy = "date";
        this.sortOrder = "DESC";
        return this;
    }

    public ExpenseQueryBuilder orderByAmountDesc() {
        this.sortBy = "amount";
        this.sortOrder = "DESC";
        return this;
    }

    public ExpenseQueryBuilder limit(Integer limit) {
        this.limit = limit;
        return this;
    }

    public ExpenseQueryBuilder offset(Integer offset) {
        this.offset = offset;
        return this;
    }

    public ExpenseQueryBuilder page(int page, int size) {
        this.limit = size;
        this.offset = page * size;
        return this;
    }

    public ExpenseQuery build() {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        return new ExpenseQuery(userId, startDate, endDate, expenseName, type,
                paymentMethod, minAmount, maxAmount, sortBy,
                sortOrder, limit, offset);
    }
}