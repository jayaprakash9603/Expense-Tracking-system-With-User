package com.jaya.constant;

public enum DefaultGlobalCategory {

    FOOD("Food", "Food, dining and restaurants", CategoryConstants.TYPE_EXPENSE, "food", "#FF7043"),
    GROCERIES("Groceries", "Grocery and household shopping", CategoryConstants.TYPE_EXPENSE, "cart", "#8BC34A"),
    BILLS("Bills", "Utility and recurring bill payments", CategoryConstants.TYPE_EXPENSE, "receipt", "#42A5F5"),
    RENT("Rent", "House rent and accommodation", CategoryConstants.TYPE_EXPENSE, "home", "#7E57C2"),
    TRAVEL("Travel", "Travel, commute and transportation", CategoryConstants.TYPE_EXPENSE, "plane", "#26C6DA"),
    SHOPPING("Shopping", "Retail and in-store shopping", CategoryConstants.TYPE_EXPENSE, "bag", "#EC407A"),
    ONLINE_SHOPPING("Online Shopping", "E-commerce and online purchases", CategoryConstants.TYPE_EXPENSE, "package",
            "#AB47BC"),
    GIFT_CARDS("Gift Cards", "Gift card and voucher purchases", CategoryConstants.TYPE_EXPENSE, "gift", "#FFA726"),
    INVESTMENT("Investment", "Investments, SIP, stocks and deposits", CategoryConstants.TYPE_EXPENSE, "trending-up",
            "#66BB6A"),
    DEDUCTIONS("Deductions", "Tax, EMI and salary deductions", CategoryConstants.TYPE_EXPENSE, "minus-circle",
            "#EF5350"),
    EXPENSES("Expenses", "General uncategorised expenses", CategoryConstants.TYPE_EXPENSE, "wallet", "#78909C"),
    TRANSFER("Transfer", "Self and account-to-account transfers", CategoryConstants.TYPE_EXPENSE, "swap", "#5C6BC0"),
    OTHERS(CategoryConstants.DEFAULT_CATEGORY_NAME, "Miscellaneous transactions", CategoryConstants.TYPE_EXPENSE,
            "dots", "#BDBDBD"),
    INCOME("Income", "Salary and other income", CategoryConstants.TYPE_INCOME, "arrow-down-circle", "#2E7D32"),
    CASHBACKS("Cashbacks", "Cashbacks, refunds and rewards", CategoryConstants.TYPE_INCOME, "coins", "#FDD835");

    private final String categoryName;
    private final String description;
    private final String type;
    private final String icon;
    private final String color;

    DefaultGlobalCategory(String categoryName, String description, String type, String icon, String color) {
        this.categoryName = categoryName;
        this.description = description;
        this.type = type;
        this.icon = icon;
        this.color = color;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public String getDescription() {
        return description;
    }

    public String getType() {
        return type;
    }

    public String getIcon() {
        return icon;
    }

    public String getColor() {
        return color;
    }
}
