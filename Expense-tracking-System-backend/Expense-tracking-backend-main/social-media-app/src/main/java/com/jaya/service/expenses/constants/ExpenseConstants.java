package com.jaya.service.expenses.constants;

/**
 * Centralized constants for expense-related operations
 * Following DRY principle - Single source of truth for all constants
 */
public final class ExpenseConstants {

    private ExpenseConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // Expense Types
    public static final String TYPE_GAIN = "gain";
    public static final String TYPE_LOSS = "loss";
    public static final String TYPE_INCOME = "income";
    public static final String TYPE_EXPENSE = "expense";

    // Payment Methods
    public static final String PAYMENT_CASH = "cash";
    public static final String PAYMENT_CREDIT = "credit";
    public static final String PAYMENT_DEBIT = "debit";
    public static final String PAYMENT_UPI = "upi";
    public static final String PAYMENT_OTHER = "other";

    // Credit-related
    public static final String CREDIT_NEED_TO_PAID = "creditNeedToPaid";
    public static final String CREDIT_PAID = "creditPaid";
    public static final String CREDIT_DUE = "creditDue";

    // Time Periods
    public static final String PERIOD_DAY = "day";
    public static final String PERIOD_WEEK = "week";
    public static final String PERIOD_MONTH = "month";
    public static final String PERIOD_YEAR = "year";

    // Categories
    public static final String CATEGORY_OTHERS = "Others";
    public static final String CATEGORY_UNCATEGORIZED = "Uncategorized";

    // Flow Types
    public static final String FLOW_TYPE_INFLOW = "inflow";
    public static final String FLOW_TYPE_OUTFLOW = "outflow";
    public static final String FLOW_TYPE_ALL = "all";

    // Chart/Report Data Keys
    public static final String KEY_LABELS = "labels";
    public static final String KEY_LABEL = "label";
    public static final String KEY_DATA = "data";
    public static final String KEY_DATASETS = "datasets";
    public static final String KEY_TOTAL = "total";
    public static final String KEY_BALANCE = "balance";
    public static final String KEY_PERCENTAGE = "percentage";

    // Calculation Settings
    public static final int DECIMAL_SCALE = 2;
    public static final String DATE_FORMAT_PATTERN = "dd-MM-yyyy";
    public static final String MONTH_YEAR_FORMAT = "MMMM yyyy";

    // Month Names
    public static final String[] MONTH_NAMES = {
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
    };

    // Month Labels (Short form)
    public static final String[] MONTH_LABELS = {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    // Default Values
    public static final int DEFAULT_TOP_N = 10;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final String DEFAULT_SORT_ORDER = "desc";
    public static final String DEFAULT_SORT_BY = "date";

    // Validation Messages
    public static final String MSG_INVALID_DATE_RANGE = "Invalid date range";
    public static final String MSG_INVALID_AMOUNT = "Invalid amount";
    public static final String MSG_EXPENSE_NOT_FOUND = "Expense not found";
    public static final String MSG_UNAUTHORIZED_ACCESS = "Unauthorized access to expense";

    // Status Values
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    public static final String STATUS_DELETED = "deleted";
}
