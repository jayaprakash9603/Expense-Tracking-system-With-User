package com.jaya.testutil;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.BillRequestDTO;
import com.jaya.dto.BillResponseDTO;
import com.jaya.dto.DetailedExpensesDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ExpenseDetailsDTO;
import com.jaya.dto.ocr.OcrReceiptResponseDTO;
import com.jaya.models.Bill;
import com.jaya.models.DetailedExpenses;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public final class BillTestDataFactory {

    public static final String TEST_JWT = "Bearer test-jwt-token";
    public static final Integer TEST_USER_ID = 1;
    public static final Integer TARGET_USER_ID = 2;
    public static final String TEST_USERNAME = "testuser";
    public static final String TEST_EMAIL = "test@example.com";

    private BillTestDataFactory() {
    }

    public static Bill buildBill() {
        Bill bill = new Bill();
        bill.setId(1001);
        bill.setName("Electricity Bill");
        bill.setDescription("Monthly electricity usage");
        bill.setAmount(2500.0);
        bill.setPaymentMethod("UPI");
        bill.setType("loss");
        bill.setCreditDue(100.0);
        bill.setDate(LocalDate.now().minusDays(1));
        bill.setNetAmount(2600.0);
        bill.setUserId(TEST_USER_ID);
        bill.setCategory("Utilities");
        bill.setCategoryId(11);
        bill.setExpenseId(9001);
        bill.setIncludeInBudget(true);
        bill.setBudgetIds(new HashSet<>(Set.of(31, 32)));
        bill.setExpenses(new ArrayList<>(List.of(buildDetailedExpense())));
        return bill;
    }

    public static Bill buildGainBill() {
        Bill bill = buildBill();
        bill.setId(1002);
        bill.setType("gain");
        bill.setName("Refund Bill");
        bill.setAmount(400.0);
        return bill;
    }

    public static Bill buildBillWithoutId() {
        Bill bill = buildBill();
        bill.setId(null);
        return bill;
    }

    public static DetailedExpenses buildDetailedExpense() {
        DetailedExpenses detailed = new DetailedExpenses();
        detailed.setItemName("Bulb");
        detailed.setQuantity(2);
        detailed.setUnitPrice(100.0);
        detailed.setTotalPrice(200.0);
        detailed.setComments("LED bulbs");
        return detailed;
    }

    public static DetailedExpensesDTO buildDetailedExpenseDTO() {
        return new DetailedExpensesDTO("Bulb", 2, 100.0, 200.0, "LED bulbs");
    }

    public static BillRequestDTO buildBillRequestDTO() {
        BillRequestDTO dto = new BillRequestDTO();
        dto.setId(1001);
        dto.setName("Electricity Bill");
        dto.setDescription("Monthly electricity usage");
        dto.setAmount(2500.0);
        dto.setPaymentMethod("UPI");
        dto.setType("loss");
        dto.setCreditDue(100.0);
        dto.setDate(LocalDate.now().minusDays(1));
        dto.setNetAmount(2600.0);
        dto.setCategory("Utilities");
        dto.setUserId(TEST_USER_ID);
        dto.setIncludeInBudget(true);
        dto.setBudgetIds(new HashSet<>(Set.of(31, 32)));
        dto.setCategoryId(11);
        dto.setExpenseId(9001);
        dto.setExpenses(List.of(buildDetailedExpenseDTO()));
        return dto;
    }

    public static BillResponseDTO buildBillResponseDTO() {
        return new BillResponseDTO(
                1001,
                "Electricity Bill",
                "Monthly electricity usage",
                2500.0,
                "UPI",
                "loss",
                100.0,
                LocalDate.now().minusDays(1),
                2600.0,
                TEST_USER_ID,
                "Utilities",
                List.of(buildDetailedExpenseDTO()),
                true,
                new HashSet<>(Set.of(31, 32)),
                11,
                9001);
    }

    public static ExpenseDTO buildExpenseDTO() {
        ExpenseDetailsDTO details = new ExpenseDetailsDTO();
        details.setId(9001);
        details.setExpenseName("Electricity Bill");
        details.setAmount(2500.0);
        details.setType("loss");
        details.setPaymentMethod("UPI");
        details.setNetAmount(2600.0);
        details.setComments("Monthly electricity usage");
        details.setCreditDue(100.0);

        ExpenseDTO expense = new ExpenseDTO();
        expense.setId(9001);
        expense.setDate(LocalDate.now().minusDays(1).toString());
        expense.setIncludeInBudget(true);
        expense.setBudgetIds(new HashSet<>(Set.of(31, 32)));
        expense.setCategoryId(11);
        expense.setCategoryName("Utilities");
        expense.setExpense(details);
        expense.setBill(true);
        expense.setUserId(TEST_USER_ID);
        return expense;
    }

    public static UserDTO buildUser() {
        UserDTO user = new UserDTO();
        user.setId(TEST_USER_ID);
        user.setUsername(TEST_USERNAME);
        user.setEmail(TEST_EMAIL);
        return user;
    }

    public static OcrReceiptResponseDTO buildOcrReceiptResponse() {
        OcrReceiptResponseDTO response = new OcrReceiptResponseDTO();
        response.setMerchant("Sample Store");
        response.setAmount(123.45);
        response.setOverallConfidence(78.0);
        return response;
    }
}
