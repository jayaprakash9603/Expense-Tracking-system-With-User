package com.jaya.dto;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class ExpenseDataGenerator {

    private static final String[] EXPENSE_NAMES = {
            "Groceries", "Rent", "Utilities", "Internet", "Transportation", "Dining Out", "Entertainment",
            "Healthcare", "Insurance", "Clothing", "Education", "Travel", "Savings", "Investments", "Gifts",
            "Donations", "Subscriptions", "Gym", "Pet Care", "Household Supplies", "Personal Care", "Electronics",
            "Furniture", "Books", "Music", "Movies", "Games", "Hobbies", "Sports", "Beauty", "Laundry", "Cleaning",
            "Repairs", "Maintenance", "Office Supplies", "Stationery", "Software", "Hardware", "Tools", "Gardening",
            "Baby Care", "Elderly Care", "Legal Fees", "Accounting Fees", "Consulting Fees", "Marketing", "Advertising",
            "Research", "Development"
    };

    private static final String[] PAYMENT_METHODS = {
            "cash", "credit", "debit", "bank transfer", "mobile payment"
    };

    private static final String[] TYPES = {
            "loss", "gain"
    };

    public static void main(String[] args) {
        List<ExpenseDTO> expenses = generateRandomExpenses(50);
        expenses.forEach(System.out::println);
    }

    public static List<ExpenseDTO> generateRandomExpenses(int count) {
        List<ExpenseDTO> expenses = new ArrayList<>();
        Random random = new Random();

        for (int i = 0; i < count; i++) {
            ExpenseDetailsDTO expenseDetails = new ExpenseDetailsDTO();
            expenseDetails.setId(1000 + i);
            expenseDetails.setExpenseName(EXPENSE_NAMES[random.nextInt(EXPENSE_NAMES.length)]);
            expenseDetails.setAmount(random.nextDouble() * 1000);
            expenseDetails.setType(TYPES[random.nextInt(TYPES.length)]);
            expenseDetails.setPaymentMethod(PAYMENT_METHODS[random.nextInt(PAYMENT_METHODS.length)]);
            expenseDetails.setNetAmount(expenseDetails.getAmountAsDouble() * (expenseDetails.getType().equals("loss") ? -1 : 1));
            expenseDetails.setComments("Sample comment " + (i + 1));
            expenseDetails.setCreditDue(random.nextDouble() * 100);

            ExpenseDTO expense = new ExpenseDTO();
            expense.setId(1000 + i);
            expense.setDate("2024-10-" + (random.nextInt(30) + 1));
            expense.setExpense(expenseDetails);

            expenses.add(expense);
        }

        return expenses;
    }
}

