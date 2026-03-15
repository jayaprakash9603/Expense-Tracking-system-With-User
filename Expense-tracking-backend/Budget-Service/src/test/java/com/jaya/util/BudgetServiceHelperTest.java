package com.jaya.util;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Budget;
import com.jaya.service.ExpenseClient;
import com.jaya.testutil.BudgetTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceHelperTest {

    @Mock
    private IUserServiceClient userService;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private ExpenseClient expenseClient;

    @InjectMocks
    private BudgetServiceHelper helper;

    private UserDTO testUser;
    private Budget testBudget;

    @BeforeEach
    void setUp() {
        testUser = BudgetTestDataFactory.buildUser();
        testBudget = BudgetTestDataFactory.buildBudget();
    }

    @Nested
    @DisplayName("validateUser")
    class ValidateUser {

        @Test
        @DisplayName("should return user for valid user ID")
        void shouldReturnUserForValidId() throws Exception {
            when(userService.getUserById(BudgetTestDataFactory.TEST_USER_ID)).thenReturn(testUser);

            UserDTO result = helper.validateUser(BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(BudgetTestDataFactory.TEST_USER_ID);
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userService.getUserById(9999)).thenReturn(null);

            assertThatThrownBy(() -> helper.validateUser(9999))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("User ID cannot be null");
        }
    }

    @Nested
    @DisplayName("validateBudget")
    class ValidateBudget {

        @Test
        @DisplayName("should return valid budget")
        void shouldReturnValidBudget() throws Exception {
            Budget budget = BudgetTestDataFactory.buildBudgetWithoutId();

            Budget result = helper.validateBudget(budget, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getUserId()).isEqualTo(BudgetTestDataFactory.TEST_USER_ID);
        }

        @Test
        @DisplayName("should throw when start date is null")
        void shouldThrowWhenStartDateNull() {
            Budget budget = BudgetTestDataFactory.buildBudgetWithoutId();
            budget.setStartDate(null);

            assertThatThrownBy(() -> helper.validateBudget(budget, BudgetTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Start date and end date must not be null");
        }

        @Test
        @DisplayName("should throw when end date is null")
        void shouldThrowWhenEndDateNull() {
            Budget budget = BudgetTestDataFactory.buildBudgetWithoutId();
            budget.setEndDate(null);

            assertThatThrownBy(() -> helper.validateBudget(budget, BudgetTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Start date and end date must not be null");
        }

        @Test
        @DisplayName("should throw when start date is after end date")
        void shouldThrowWhenStartAfterEnd() {
            Budget budget = BudgetTestDataFactory.buildBudgetWithoutId();
            budget.setStartDate(LocalDate.now().plusDays(10));
            budget.setEndDate(LocalDate.now());

            assertThatThrownBy(() -> helper.validateBudget(budget, BudgetTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Start date cannot be after end date");
        }

        @Test
        @DisplayName("should throw when amount is negative")
        void shouldThrowWhenAmountNegative() {
            Budget budget = BudgetTestDataFactory.buildBudgetWithoutId();
            budget.setAmount(-100.0);

            assertThatThrownBy(() -> helper.validateBudget(budget, BudgetTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Budget amount cannot be negative");
        }

        @Test
        @DisplayName("should throw when name is empty")
        void shouldThrowWhenNameEmpty() {
            Budget budget = BudgetTestDataFactory.buildBudgetWithoutId();
            budget.setName("");

            assertThatThrownBy(() -> helper.validateBudget(budget, BudgetTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Budget name cannot be empty");
        }

        @Test
        @DisplayName("should set remaining amount when zero")
        void shouldSetRemainingAmountWhenZero() throws Exception {
            Budget budget = BudgetTestDataFactory.buildBudgetWithoutId();
            budget.setRemainingAmount(0);

            Budget result = helper.validateBudget(budget, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result.getRemainingAmount()).isEqualTo(budget.getAmount());
        }
    }

    @Nested
    @DisplayName("getValidBudgetIds")
    class GetValidBudgetIds {

        @Test
        @DisplayName("should return valid expense IDs within date range")
        void shouldReturnValidIds() {
            ExpenseDTO expense = BudgetTestDataFactory.buildExpenseDTO();
            testBudget.setExpenseIds(new HashSet<>(Set.of(expense.getId())));
            when(expenseClient.getExpensesByIds(eq(BudgetTestDataFactory.TEST_USER_ID), anySet()))
                    .thenReturn(List.of(expense));

            Set<Integer> result = helper.getValidBudgetIds(testBudget, BudgetTestDataFactory.TEST_USER_ID, expenseClient);

            assertThat(result).contains(expense.getId());
        }

        @Test
        @DisplayName("should return empty for null expense IDs")
        void shouldReturnEmptyForNullIds() {
            testBudget.setExpenseIds(null);

            Set<Integer> result = helper.getValidBudgetIds(testBudget, BudgetTestDataFactory.TEST_USER_ID, expenseClient);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should return empty for empty expense IDs")
        void shouldReturnEmptyForEmptyIds() {
            testBudget.setExpenseIds(new HashSet<>());

            Set<Integer> result = helper.getValidBudgetIds(testBudget, BudgetTestDataFactory.TEST_USER_ID, expenseClient);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should exclude expenses outside date range")
        void shouldExcludeExpensesOutsideRange() {
            ExpenseDTO expense = BudgetTestDataFactory.buildExpenseDTO();
            expense.setDate(LocalDate.now().plusYears(1).toString());
            testBudget.setExpenseIds(new HashSet<>(Set.of(expense.getId())));
            when(expenseClient.getExpensesByIds(eq(BudgetTestDataFactory.TEST_USER_ID), anySet()))
                    .thenReturn(List.of(expense));

            Set<Integer> result = helper.getValidBudgetIds(testBudget, BudgetTestDataFactory.TEST_USER_ID, expenseClient);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("addBudgetIdInExpenses")
    class AddBudgetIdInExpenses {

        @Test
        @DisplayName("should publish Kafka events for expense linking")
        void shouldPublishKafkaEvents() {
            helper.addBudgetIdInExpenses(testBudget, expenseClient, BudgetTestDataFactory.TEST_USER_ID);

            verify(kafkaTemplate, times(2)).send(anyString(), any());
        }

        @Test
        @DisplayName("should not publish when expense IDs are empty")
        void shouldNotPublishWhenEmpty() {
            testBudget.setExpenseIds(new HashSet<>());

            helper.addBudgetIdInExpenses(testBudget, expenseClient, BudgetTestDataFactory.TEST_USER_ID);

            verifyNoInteractions(kafkaTemplate);
        }

        @Test
        @DisplayName("should not publish when expense IDs are null")
        void shouldNotPublishWhenNull() {
            testBudget.setExpenseIds(null);

            helper.addBudgetIdInExpenses(testBudget, expenseClient, BudgetTestDataFactory.TEST_USER_ID);

            verifyNoInteractions(kafkaTemplate);
        }
    }

    @Nested
    @DisplayName("deleteBudgetIdInExpenses")
    class DeleteBudgetIdInExpenses {

        @Test
        @DisplayName("should publish removal Kafka events")
        void shouldPublishRemovalEvents() {
            helper.deleteBudgetIdInExpenses(testBudget, expenseClient,
                    BudgetTestDataFactory.TEST_USER_ID, testBudget.getId());

            verify(kafkaTemplate, times(2)).send(anyString(), any());
        }

        @Test
        @DisplayName("should not publish when expense IDs are empty")
        void shouldNotPublishWhenEmpty() {
            testBudget.setExpenseIds(new HashSet<>());

            helper.deleteBudgetIdInExpenses(testBudget, expenseClient,
                    BudgetTestDataFactory.TEST_USER_ID, testBudget.getId());

            verifyNoInteractions(kafkaTemplate);
        }
    }

    @Nested
    @DisplayName("removeBudgetsIdsInAllExpenses")
    class RemoveBudgetsIdsInAllExpenses {

        @Test
        @DisplayName("should process all budgets")
        void shouldProcessAllBudgets() {
            Budget budget2 = BudgetTestDataFactory.buildBudget();
            budget2.setId(101);

            helper.removeBudgetsIdsInAllExpenses(
                    List.of(testBudget, budget2), expenseClient, BudgetTestDataFactory.TEST_USER_ID);

            verify(kafkaTemplate, times(4)).send(anyString(), any());
        }
    }
}
