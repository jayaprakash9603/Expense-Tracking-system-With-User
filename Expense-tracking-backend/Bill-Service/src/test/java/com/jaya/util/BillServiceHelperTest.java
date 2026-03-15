package com.jaya.util;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Bill;
import com.jaya.testutil.BillTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillServiceHelperTest {

    @Mock
    private IUserServiceClient userServiceClient;

    @InjectMocks
    private BillServiceHelper helper;

    @Nested
    @DisplayName("validateUser")
    class ValidateUserTests {

        @Test
        @DisplayName("should return user when present")
        void shouldReturnUser() throws Exception {
            UserDTO user = BillTestDataFactory.buildUser();
            when(userServiceClient.getUserById(1)).thenReturn(user);

            UserDTO result = helper.validateUser(1);

            assertThat(result.getId()).isEqualTo(1);
        }

        @Test
        @DisplayName("should throw when user is missing")
        void shouldThrowWhenUserMissing() {
            when(userServiceClient.getUserById(1)).thenReturn(null);

            assertThatThrownBy(() -> helper.validateUser(1))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("User ID cannot be null");
        }
    }

    @Nested
    @DisplayName("validateBillData")
    class ValidateBillDataTests {

        @Test
        @DisplayName("should pass for valid bill")
        void shouldPassForValidBill() {
            Bill bill = BillTestDataFactory.buildBill();
            helper.validateBillData(bill);
            assertThat(bill.getName()).isNotBlank();
        }

        @Test
        @DisplayName("should throw for invalid amount")
        void shouldThrowForInvalidAmount() {
            Bill bill = BillTestDataFactory.buildBill();
            bill.setAmount(0.0);

            assertThatThrownBy(() -> helper.validateBillData(bill))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("amount must be positive");
        }
    }

    @Nested
    @DisplayName("createExpenseFromBill")
    class CreateExpenseFromBillTests {

        @Test
        @DisplayName("should map bill fields into expense dto")
        void shouldMapBillToExpense() {
            Bill bill = BillTestDataFactory.buildBill();
            UserDTO user = BillTestDataFactory.buildUser();

            ExpenseDTO expense = helper.createExpenseFromBill(bill, user);

            assertThat(expense.getUserId()).isEqualTo(user.getId());
            assertThat(expense.getExpense().getExpenseName()).isEqualTo(bill.getName());
            assertThat(expense.getExpense().getPaymentMethod()).isEqualTo(bill.getPaymentMethod());
            assertThat(expense.getExpense().getType()).isEqualTo(bill.getType());
        }
    }

    @Nested
    @DisplayName("mapExpenseToBill")
    class MapExpenseToBillTests {

        @Test
        @DisplayName("should map saved expense back to bill")
        void shouldMapExpenseToBill() {
            Bill original = BillTestDataFactory.buildBill();
            ExpenseDTO savedExpense = BillTestDataFactory.buildExpenseDTO();

            Bill mapped = helper.mapExpenseToBill(original, savedExpense);

            assertThat(mapped.getUserId()).isEqualTo(savedExpense.getUserId());
            assertThat(mapped.getExpenseId()).isEqualTo(savedExpense.getId());
            assertThat(mapped.getCategory()).isEqualTo(savedExpense.getCategoryName());
            assertThat(mapped.getName()).isEqualTo(original.getName());
        }
    }
}
