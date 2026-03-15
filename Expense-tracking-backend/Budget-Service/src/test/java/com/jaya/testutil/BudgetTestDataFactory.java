package com.jaya.testutil;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.BudgetReport;
import com.jaya.dto.BudgetSearchDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.events.BudgetExpenseEvent;
import com.jaya.models.Budget;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

public final class BudgetTestDataFactory {

    public static final String TEST_JWT = "Bearer test-jwt-token";
    public static final Integer TEST_USER_ID = 1;
    public static final Integer TARGET_USER_ID = 2;
    public static final String TEST_USERNAME = "testuser";
    public static final String TEST_EMAIL = "test@example.com";

    private BudgetTestDataFactory() {
    }

    public static Budget buildBudget() {
        Budget budget = new Budget();
        budget.setId(100);
        budget.setName("Monthly Groceries");
        budget.setDescription("Budget for monthly grocery shopping");
        budget.setAmount(5000.0);
        budget.setRemainingAmount(3000.0);
        budget.setStartDate(LocalDate.now().minusDays(15));
        budget.setEndDate(LocalDate.now().plusDays(15));
        budget.setUserId(TEST_USER_ID);
        budget.setExpenseIds(new HashSet<>(Set.of(501, 502)));
        budget.setBudgetHasExpenses(true);
        budget.setIncludeInBudget(true);
        return budget;
    }

    public static Budget buildBudgetWithoutId() {
        Budget budget = buildBudget();
        budget.setId(null);
        return budget;
    }

    public static Budget buildExpiredBudget() {
        Budget budget = buildBudget();
        budget.setId(101);
        budget.setName("Old Budget");
        budget.setStartDate(LocalDate.now().minusDays(60));
        budget.setEndDate(LocalDate.now().minusDays(30));
        return budget;
    }

    public static Budget buildFutureBudget() {
        Budget budget = buildBudget();
        budget.setId(102);
        budget.setName("Future Budget");
        budget.setStartDate(LocalDate.now().plusDays(10));
        budget.setEndDate(LocalDate.now().plusDays(40));
        budget.setExpenseIds(new HashSet<>());
        budget.setBudgetHasExpenses(false);
        return budget;
    }

    public static ExpenseDTO buildExpenseDTO() {
        ExpenseDetailsDTO details = ExpenseDetailsDTO.builder()
                .id(501)
                .expenseName("Vegetables")
                .amount(250.0)
                .type("loss")
                .paymentMethod("cash")
                .netAmount(250.0)
                .comments("Weekly vegetables")
                .creditDue(0.0)
                .build();

        return ExpenseDTO.builder()
                .id(501)
                .date(LocalDate.now().minusDays(5).toString())
                .includeInBudget(true)
                .budgetIds(new HashSet<>(Set.of(100)))
                .categoryId(1)
                .categoryName("Groceries")
                .expense(details)
                .userId(TEST_USER_ID)
                .build();
    }

    public static ExpenseDTO buildCreditExpenseDTO() {
        ExpenseDetailsDTO details = ExpenseDetailsDTO.builder()
                .id(502)
                .expenseName("Electronics")
                .amount(1500.0)
                .type("loss")
                .paymentMethod("creditNeedToPaid")
                .netAmount(1500.0)
                .comments("Headphones")
                .creditDue(1500.0)
                .build();

        return ExpenseDTO.builder()
                .id(502)
                .date(LocalDate.now().minusDays(3).toString())
                .includeInBudget(true)
                .budgetIds(new HashSet<>(Set.of(100)))
                .categoryId(2)
                .categoryName("Electronics")
                .expense(details)
                .userId(TEST_USER_ID)
                .build();
    }

    public static ExpenseDTO buildGainExpenseDTO() {
        ExpenseDetailsDTO details = ExpenseDetailsDTO.builder()
                .id(503)
                .expenseName("Refund")
                .amount(200.0)
                .type("gain")
                .paymentMethod("cash")
                .netAmount(200.0)
                .comments("Product return")
                .creditDue(0.0)
                .build();

        return ExpenseDTO.builder()
                .id(503)
                .date(LocalDate.now().minusDays(1).toString())
                .includeInBudget(true)
                .budgetIds(new HashSet<>(Set.of(100)))
                .categoryId(1)
                .categoryName("Groceries")
                .expense(details)
                .userId(TEST_USER_ID)
                .build();
    }

    public static BudgetReport buildBudgetReport() {
        BudgetReport report = new BudgetReport();
        report.setBudgetId(100);
        report.setBudgetName("Monthly Groceries");
        report.setDescription("Budget for monthly grocery shopping");
        report.setAllocatedAmount(5000.0);
        report.setStartDate(LocalDate.now().minusDays(15));
        report.setEndDate(LocalDate.now().plusDays(15));
        report.setRemainingAmount(3250.0);
        report.setValid(true);
        report.setTotalCashLosses(250.0);
        report.setTotalCreditLosses(1500.0);
        report.setExpenseCount(2);
        report.setDailyBudget(166.67);
        report.setProjectedOverspend(0.0);
        return report;
    }

    public static BudgetSearchDTO buildBudgetSearchDTO() {
        return new BudgetSearchDTO(
                100,
                "Monthly Groceries",
                "Budget for monthly grocery shopping",
                5000.0,
                3000.0,
                LocalDate.now().minusDays(15),
                LocalDate.now().plusDays(15),
                TEST_USER_ID);
    }

    public static BudgetExpenseEvent buildBudgetExpenseEvent(String action) {
        BudgetExpenseEvent event = new BudgetExpenseEvent();
        event.setUserId(TEST_USER_ID);
        event.setExpenseId(501);
        event.setBudgetIds(new HashSet<>(Set.of(100, 101)));
        event.setAction(action);
        return event;
    }

    public static UserDTO buildUser() {
        UserDTO user = new UserDTO();
        user.setId(TEST_USER_ID);
        user.setUsername(TEST_USERNAME);
        user.setEmail(TEST_EMAIL);
        return user;
    }

    public static UserDTO buildTargetUser() {
        UserDTO user = new UserDTO();
        user.setId(TARGET_USER_ID);
        user.setUsername("targetuser");
        user.setEmail("target@example.com");
        return user;
    }
}
