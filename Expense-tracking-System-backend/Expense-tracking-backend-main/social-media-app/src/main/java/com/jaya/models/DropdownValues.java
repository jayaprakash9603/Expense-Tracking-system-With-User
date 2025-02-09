package com.jaya.models;

import java.util.Arrays;
import java.util.List;

public class DropdownValues {
    public static List<String> getMonths() {
        return Arrays.asList("January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December");
    }
    public static List<String>getSummaryTypes(){
    return Arrays.asList(
            "Monthly Wise Daily Expense Summary",
            "Yearly Wise Daily Expense Summary",
            "Expense Summary for Specific Date",
            "Payment Method Summary",
            "Monthly Summary",
            "Yearly Summary",
            "Summary Between Dates"
        );
    }
    public static List<String>getDailySummaryTypes(){
        return Arrays.asList(
                "Monthly Wise Daily Expense Summary",
                "Yearly Wise Daily Expense Summary",
//                "Expense Summary for Specific Date",
                "Summary Between Dates"
            );
        }
    public static List<String>getExpensesTypes(){
        return Arrays.asList(
                "Current Month",
                "Last Month",
                "All Expenses",
                "Within Range Expenses",
                "Expenses By Name",
                "Expenses By Type",
                "Expenses By Payment Method",
                "Expenses By Type and Payment Method",
                "Expenses Within Amount Range",
                "Particular Month Expenses",
                "Today",
                "Yesterday",
                "Particular Date Expenses",
                "Current Week",
                "Last Week"
            );
        }
}