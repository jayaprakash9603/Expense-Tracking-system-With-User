package com.jaya.util;

import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.models.Bill;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Slf4j
@Component
public class ServiceHelper {

    @Autowired
    private IUserServiceClient IUserServiceClient;

    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    public UserDTO validateUser(Integer userId) throws Exception {

        UserDTO reqUser = IUserServiceClient.getUserById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return reqUser;
    }

    public void validateBillData(Bill bill) {
        if (bill == null) {
            throw new IllegalArgumentException("Bill cannot be null");
        }
        if (bill.getName() == null || bill.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Bill name is required");
        }
        if (bill.getAmount() <= 0) {
            throw new IllegalArgumentException("Bill amount must be positive");
        }
        if (bill.getDate() == null) {
            throw new IllegalArgumentException("Bill date is required");
        }
    }

    public void validateBillId(Integer billId) {
        if (billId == null) {
            throw new IllegalArgumentException("Bill ID cannot be null");
        }
        if (billId <= 0) {
            throw new IllegalArgumentException("Bill ID must be positive");
        }
    }

    public void validateExpenseData(ExpenseDTO expense) {
        if (expense == null) {
            throw new IllegalArgumentException("Expense cannot be null");
        }
        if (expense.getDate() == null) {
            throw new IllegalArgumentException("Expense date is required");
        }
        if (expense.getExpense() == null) {
            throw new IllegalArgumentException("Expense details cannot be null");
        }
    }

    public void validateExpenseDetails(ExpenseDetailsDTO details) {
        if (details == null) {
            throw new IllegalArgumentException("Expense details cannot be null");
        }
        if (details.getExpenseName() == null || details.getExpenseName().trim().isEmpty()) {
            throw new IllegalArgumentException("Expense name is required");
        }
        if (details.getAmount() < 0) {
            throw new IllegalArgumentException("Expense amount cannot be negative");
        }
        if (details.getPaymentMethod() == null || details.getPaymentMethod().trim().isEmpty()) {
            throw new IllegalArgumentException("Payment method is required");
        }
        if (details.getType() == null || details.getType().trim().isEmpty()) {
            throw new IllegalArgumentException("Expense type is required");
        }
    }

    public void validateId(Integer id, String fieldName) {
        if (id == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
        if (id <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }

    public void validateIds(List<Integer> ids, String fieldName) {
        if (ids == null || ids.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " list cannot be null or empty");
        }
        for (Integer id : ids) {
            validateId(id, fieldName);
        }
    }

    public void validateString(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be null or empty");
        }
    }

    public void validateStringOptional(String value, String fieldName) {
        if (value != null && value.trim().isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be empty if provided");
        }
    }

    public void validateAmount(Double amount, String fieldName) {
        if (amount == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
        if (amount < 0) {
            throw new IllegalArgumentException(fieldName + " cannot be negative");
        }
    }

    public void validatePositiveAmount(Double amount, String fieldName) {
        validateAmount(amount, fieldName);
        if (amount <= 0) {
            throw new IllegalArgumentException(fieldName + " must be positive");
        }
    }

    public void validateDate(LocalDate date, String fieldName) {
        if (date == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
    }

    public void validateDateRange(LocalDate startDate, LocalDate endDate) {
        validateDate(startDate, "Start date");
        validateDate(endDate, "End date");
        if (startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }

    public void validateMonthAndYear(int month, int year) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }
        if (year < 1900 || year > 2100) {
            throw new IllegalArgumentException("Year must be between 1900 and 2100");
        }
    }

    public void validateList(List<?> list, String fieldName) {
        if (list == null) {
            throw new IllegalArgumentException(fieldName + " cannot be null");
        }
    }

    public void validateNonEmptyList(List<?> list, String fieldName) {
        validateList(list, fieldName);
        if (list.isEmpty()) {
            throw new IllegalArgumentException(fieldName + " cannot be empty");
        }
    }

    public void validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }

    public void validatePagination(int page, int size) {
        if (page < 0) {
            throw new IllegalArgumentException("Page number cannot be negative");
        }
        if (size <= 0) {
            throw new IllegalArgumentException("Page size must be positive");
        }
        if (size > 1000) {
            throw new IllegalArgumentException("Page size cannot exceed 1000");
        }
    }

    public void validateBudgetId(Integer budgetId) {
        validateId(budgetId, "Budget ID");
    }

    public void validateCategoryId(Integer categoryId) {
        validateId(categoryId, "Category ID");
    }

    public void validatePaymentMethod(String paymentMethod) {
        validateString(paymentMethod, "Payment method");
    }

    public void validateType(String type) {
        validateString(type, "Type");
        if (!type.equalsIgnoreCase("gain") && !type.equalsIgnoreCase("loss")) {
            throw new IllegalArgumentException("Type must be either 'gain' or 'loss'");
        }
    }

    public ExpenseDTO createExpenseFromBill(Bill bill, UserDTO user) {
        ExpenseDTO expense = new ExpenseDTO();
        expense.setDate(bill.getDate());
        expense.setUserId(user.getId());
        expense.setCategoryId(bill.getCategoryId() != null ? bill.getCategoryId() : 0);
        expense.setCategoryName(bill.getCategory());
        expense.setBudgetIds(bill.getBudgetIds() != null ? bill.getBudgetIds() : new HashSet<>());
        expense.setBill(true);

        ExpenseDetailsDTO expenseDetails = createExpenseDetailsFromBill(bill, expense);
        expense.setExpense(expenseDetails);

        return expense;
    }

    public ExpenseDetailsDTO createExpenseDetailsFromBill(Bill bill, ExpenseDTO expense) {
        ExpenseDetailsDTO expenseDetails = new ExpenseDetailsDTO();
        expenseDetails.setAmount(bill.getAmount());
        expenseDetails.setComments(bill.getDescription() != null ? bill.getDescription() : "");
        expenseDetails.setType(bill.getType() != null ? bill.getType() : "loss");
        expenseDetails.setPaymentMethod(bill.getPaymentMethod() != null ? bill.getPaymentMethod() : "cash");
        expenseDetails.setExpenseName(bill.getName());
        expenseDetails.setNetAmount(bill.getNetAmount());
        expenseDetails.setCreditDue(bill.getCreditDue());
        return expenseDetails;
    }

    public Bill mapExpenseToBill(Bill originalBill, ExpenseDTO savedExpense) {
        Bill newBill = new Bill();
        newBill.setUserId(savedExpense.getUserId());
        newBill.setDate(savedExpense.getDate());
        newBill.setExpenses(originalBill.getExpenses() != null ? originalBill.getExpenses() : new ArrayList<>());
        newBill.setCategoryId(savedExpense.getCategoryId());
        newBill.setDescription(savedExpense.getExpense().getComments());
        newBill.setPaymentMethod(savedExpense.getExpense().getPaymentMethod());
        newBill.setAmount(savedExpense.getExpense().getAmount());
        newBill.setNetAmount(savedExpense.getExpense().getNetAmount());
        newBill.setName(originalBill.getName());
        newBill.setType(savedExpense.getExpense().getType());
        newBill.setCreditDue(savedExpense.getExpense().getCreditDue());
        newBill.setBudgetIds(savedExpense.getBudgetIds());
        newBill.setExpenseId(savedExpense.getExpense().getId());
        newBill.setIncludeInBudget(originalBill.isIncludeInBudget());
        newBill.setCategory(savedExpense.getCategoryName());
        return newBill;
    }

}
