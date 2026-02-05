package com.jaya.service.expenses.constants;





public final class ExpenseConstants {

    private ExpenseConstants() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    
    public static final String TYPE_GAIN = "gain";
    public static final String TYPE_LOSS = "loss";
    public static final String TYPE_INCOME = "income";
    public static final String TYPE_EXPENSE = "expense";

    
    public static final String PAYMENT_CASH = "cash";
    public static final String PAYMENT_CREDIT = "credit";
    public static final String PAYMENT_DEBIT = "debit";
    public static final String PAYMENT_UPI = "upi";
    public static final String PAYMENT_OTHER = "other";

    
    public static final String CREDIT_NEED_TO_PAID = "creditNeedToPaid";
    public static final String CREDIT_PAID = "creditPaid";
    public static final String CREDIT_DUE = "creditDue";

    
    public static final String PERIOD_DAY = "day";
    public static final String PERIOD_WEEK = "week";
    public static final String PERIOD_MONTH = "month";
    public static final String PERIOD_YEAR = "year";

    
    public static final String CATEGORY_OTHERS = "Others";
    public static final String CATEGORY_UNCATEGORIZED = "Uncategorized";

    
    public static final String FLOW_TYPE_INFLOW = "inflow";
    public static final String FLOW_TYPE_OUTFLOW = "outflow";
    public static final String FLOW_TYPE_ALL = "all";

    
    public static final String KEY_LABELS = "labels";
    public static final String KEY_LABEL = "label";
    public static final String KEY_DATA = "data";
    public static final String KEY_DATASETS = "datasets";
    public static final String KEY_TOTAL = "total";
    public static final String KEY_BALANCE = "balance";
    public static final String KEY_PERCENTAGE = "percentage";

    
    public static final int DECIMAL_SCALE = 2;
    public static final String DATE_FORMAT_PATTERN = "dd-MM-yyyy";
    public static final String MONTH_YEAR_FORMAT = "MMMM yyyy";

    
    public static final String[] MONTH_NAMES = {
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
    };

    
    public static final String[] MONTH_LABELS = {
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    };

    
    public static final int DEFAULT_TOP_N = 10;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final String DEFAULT_SORT_ORDER = "desc";
    public static final String DEFAULT_SORT_BY = "date";

    
    public static final String MSG_INVALID_DATE_RANGE = "Invalid date range";
    public static final String MSG_INVALID_AMOUNT = "Invalid amount";
    public static final String MSG_EXPENSE_NOT_FOUND = "Expense not found";
    public static final String MSG_UNAUTHORIZED_ACCESS = "Unauthorized access to expense";

    
    public static final String STATUS_ACTIVE = "active";
    public static final String STATUS_INACTIVE = "inactive";
    public static final String STATUS_DELETED = "deleted";
}
