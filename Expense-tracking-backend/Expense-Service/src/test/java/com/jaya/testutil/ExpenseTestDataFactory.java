package com.jaya.testutil;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.UserSettingsDTO;
import com.jaya.models.CashSummary;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import com.jaya.models.MonthlySummary;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.Set;

public final class ExpenseTestDataFactory {

    public static final int TEST_USER_ID = 1;
    public static final int FRIEND_USER_ID = 2;
    public static final String TEST_JWT = "Bearer test-jwt";

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    private ExpenseTestDataFactory() {
    }

    public static UserDTO buildUser() {
        UserDTO user = new UserDTO();
        user.setId(TEST_USER_ID);
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setFirstName("Test");
        user.setLastName("User");
        return user;
    }

    public static UserDTO buildFriendUser() {
        UserDTO user = new UserDTO();
        user.setId(FRIEND_USER_ID);
        user.setUsername("frienduser");
        user.setEmail("friend@example.com");
        user.setFirstName("Friend");
        user.setLastName("User");
        return user;
    }

    public static ExpenseDetails buildExpenseDetails() {
        ExpenseDetails details = new ExpenseDetails();
        details.setExpenseName("Lunch");
        details.setAmount(250);
        details.setType("loss");
        details.setPaymentMethod("cash");
        details.setNetAmount(-250);
        details.setComments("test");
        details.setCreditDue(0);
        return details;
    }

    public static Expense buildExpense() {
        Expense expense = new Expense();
        expense.setId(100);
        expense.setDate(LocalDate.now());
        expense.setUserId(TEST_USER_ID);
        expense.setCategoryId(10);
        expense.setCategoryName("Food");
        expense.setIncludeInBudget(true);
        expense.setBudgetIds(Set.of(501));
        expense.setExpense(buildExpenseDetails());
        expense.getExpense().setExpense(expense);
        return expense;
    }

    public static Expense buildExpenseWithoutId() {
        Expense expense = buildExpense();
        expense.setId(null);
        if (expense.getExpense() != null) {
            expense.getExpense().setId(null);
        }
        return expense;
    }

    public static ExpenseDTO buildExpenseDTO() {
        ExpenseDTO dto = new ExpenseDTO();
        dto.setDate(LocalDate.now().format(DATE_FORMATTER));
        dto.setUserId(TEST_USER_ID);
        dto.setIncludeInBudget(true);
        dto.setCategoryId(10);
        dto.setCategoryName("Food");
        dto.setBudgetIds(new HashSet<>(Set.of(501)));
        ExpenseDetailsDTO detailsDTO = new ExpenseDetailsDTO();
        detailsDTO.setExpenseName("Lunch");
        detailsDTO.setAmount(250);
        detailsDTO.setType("loss");
        detailsDTO.setPaymentMethod("cash");
        detailsDTO.setNetAmount(-250);
        detailsDTO.setComments("test");
        detailsDTO.setCreditDue(0);
        dto.setExpense(detailsDTO);
        return dto;
    }

    public static UserSettingsDTO buildUserSettingsMasked(Boolean masked) {
        return UserSettingsDTO.builder()
                .userId(TEST_USER_ID)
                .maskSensitiveData(masked)
                .build();
    }

    public static MonthlySummary buildMonthlySummary() {
        MonthlySummary summary = new MonthlySummary();
        summary.setTotalAmount(BigDecimal.valueOf(1000));
        summary.setBalanceRemaining(BigDecimal.valueOf(750));
        CashSummary cash = new CashSummary();
        cash.setDifference(BigDecimal.valueOf(250));
        summary.setCash(cash);
        return summary;
    }
}
