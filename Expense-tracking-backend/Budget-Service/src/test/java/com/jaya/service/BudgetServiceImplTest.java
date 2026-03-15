package com.jaya.service;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.BudgetReport;
import com.jaya.dto.BudgetSearchDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.exceptions.BudgetNotFoundException;
import com.jaya.models.Budget;
import com.jaya.repository.BudgetRepository;
import com.jaya.testutil.BudgetTestDataFactory;
import com.jaya.util.BudgetServiceHelper;
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
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetServiceImplTest {

    @Mock
    private BudgetRepository budgetRepository;

    @Mock
    private BudgetServiceHelper helper;

    @Mock
    private ExpenseClient expenseService;

    @Mock
    private BudgetNotificationService budgetNotificationService;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @InjectMocks
    private BudgetServiceImpl budgetService;

    private Budget testBudget;
    private UserDTO testUser;

    @BeforeEach
    void setUp() {
        testBudget = BudgetTestDataFactory.buildBudget();
        testUser = BudgetTestDataFactory.buildUser();
    }

    @Nested
    @DisplayName("createBudget")
    class CreateBudget {

        @Test
        @DisplayName("should create budget successfully")
        void shouldCreateBudget() throws Exception {
            Budget inputBudget = BudgetTestDataFactory.buildBudgetWithoutId();
            when(helper.validateUser(BudgetTestDataFactory.TEST_USER_ID)).thenReturn(testUser);
            when(helper.validateBudget(any(Budget.class), eq(testUser.getId()))).thenReturn(inputBudget);
            when(helper.getValidBudgetIds(any(Budget.class), eq(BudgetTestDataFactory.TEST_USER_ID), eq(expenseService)))
                    .thenReturn(new HashSet<>());
            when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

            Budget result = budgetService.createBudget(inputBudget, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(100);
            assertThat(result.getName()).isEqualTo("Monthly Groceries");
            verify(budgetRepository).save(any(Budget.class));
        }

        @Test
        @DisplayName("should throw when user validation fails")
        void shouldThrowWhenUserValidationFails() throws Exception {
            when(helper.validateUser(BudgetTestDataFactory.TEST_USER_ID))
                    .thenThrow(new IllegalArgumentException("User ID cannot be null"));

            assertThatThrownBy(() -> budgetService.createBudget(testBudget, BudgetTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("User ID cannot be null");
        }

        @Test
        @DisplayName("should create budget with valid expense IDs")
        void shouldCreateBudgetWithExpenseIds() throws Exception {
            Budget inputBudget = BudgetTestDataFactory.buildBudgetWithoutId();
            Set<Integer> validIds = new HashSet<>(Set.of(501, 502));
            when(helper.validateUser(BudgetTestDataFactory.TEST_USER_ID)).thenReturn(testUser);
            when(helper.validateBudget(any(Budget.class), eq(testUser.getId()))).thenReturn(inputBudget);
            when(helper.getValidBudgetIds(any(Budget.class), eq(BudgetTestDataFactory.TEST_USER_ID), eq(expenseService)))
                    .thenReturn(validIds);
            when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);
            when(expenseService.getExpensesByIds(eq(BudgetTestDataFactory.TEST_USER_ID), anySet()))
                    .thenReturn(Collections.emptyList());

            Budget result = budgetService.createBudget(inputBudget, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isNotNull();
            verify(kafkaTemplate, atLeastOnce()).send(anyString(), any());
        }
    }

    @Nested
    @DisplayName("createBudgetForFriend")
    class CreateBudgetForFriend {

        @Test
        @DisplayName("should create budget for friend and send notification")
        void shouldCreateBudgetForFriend() throws Exception {
            Budget inputBudget = BudgetTestDataFactory.buildBudgetWithoutId();
            when(helper.validateUser(BudgetTestDataFactory.TARGET_USER_ID)).thenReturn(BudgetTestDataFactory.buildTargetUser());
            when(helper.validateBudget(any(Budget.class), eq(BudgetTestDataFactory.TARGET_USER_ID))).thenReturn(inputBudget);
            when(helper.getValidBudgetIds(any(Budget.class), eq(BudgetTestDataFactory.TARGET_USER_ID), eq(expenseService)))
                    .thenReturn(new HashSet<>());
            when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);

            Budget result = budgetService.createBudgetForFriend(
                    inputBudget, BudgetTestDataFactory.TEST_USER_ID, BudgetTestDataFactory.TARGET_USER_ID);

            assertThat(result).isNotNull();
            verify(budgetNotificationService).sendBudgetCreatedNotification(
                    any(Budget.class), eq(BudgetTestDataFactory.TEST_USER_ID), eq(true));
        }
    }

    @Nested
    @DisplayName("getBudgetById")
    class GetBudgetById {

        @Test
        @DisplayName("should return budget when found")
        void shouldReturnBudget() {
            when(budgetRepository.findById(100)).thenReturn(Optional.of(testBudget));

            Budget result = budgetService.getBudgetById(100, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Monthly Groceries");
        }

        @Test
        @DisplayName("should throw BudgetNotFoundException when not found")
        void shouldThrowWhenNotFound() {
            when(budgetRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> budgetService.getBudgetById(999, BudgetTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(BudgetNotFoundException.class)
                    .hasMessageContaining("budget not Found");
        }
    }

    @Nested
    @DisplayName("deleteBudget")
    class DeleteBudget {

        @Test
        @DisplayName("should delete budget successfully")
        void shouldDeleteBudget() {
            when(budgetRepository.findById(100)).thenReturn(Optional.of(testBudget));

            budgetService.deleteBudget(100, BudgetTestDataFactory.TEST_USER_ID);

            verify(budgetRepository).delete(testBudget);
            verify(helper).deleteBudgetIdInExpenses(eq(testBudget), eq(expenseService),
                    eq(BudgetTestDataFactory.TEST_USER_ID), eq(100));
        }

        @Test
        @DisplayName("should throw when budget not found on delete")
        void shouldThrowWhenNotFoundOnDelete() {
            when(budgetRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> budgetService.deleteBudget(999, BudgetTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(BudgetNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("deleteAllBudget")
    class DeleteAllBudget {

        @Test
        @DisplayName("should delete all budgets for user")
        void shouldDeleteAllBudgets() {
            List<Budget> budgets = List.of(testBudget);
            when(budgetRepository.findByUserId(BudgetTestDataFactory.TEST_USER_ID)).thenReturn(budgets);

            budgetService.deleteAllBudget(BudgetTestDataFactory.TEST_USER_ID);

            verify(budgetRepository).deleteAll(budgets);
            verify(helper).removeBudgetsIdsInAllExpensesAsync(budgets, BudgetTestDataFactory.TEST_USER_ID);
        }

        @Test
        @DisplayName("should throw when no budgets found")
        void shouldThrowWhenNoBudgets() {
            when(budgetRepository.findByUserId(BudgetTestDataFactory.TEST_USER_ID))
                    .thenReturn(Collections.emptyList());

            assertThatThrownBy(() -> budgetService.deleteAllBudget(BudgetTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("No budgets found");
        }
    }

    @Nested
    @DisplayName("getAllBudgetForUser")
    class GetAllBudgetForUser {

        @Test
        @DisplayName("should return budgets for user")
        void shouldReturnBudgets() {
            when(budgetRepository.findByUserId(BudgetTestDataFactory.TEST_USER_ID))
                    .thenReturn(List.of(testBudget));
            when(expenseService.getExpensesByIds(eq(BudgetTestDataFactory.TEST_USER_ID), anySet()))
                    .thenReturn(List.of(BudgetTestDataFactory.buildExpenseDTO()));

            List<Budget> result = budgetService.getAllBudgetForUser(BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Monthly Groceries");
        }

        @Test
        @DisplayName("should return empty list when no budgets")
        void shouldReturnEmptyList() {
            when(budgetRepository.findByUserId(BudgetTestDataFactory.TEST_USER_ID))
                    .thenReturn(Collections.emptyList());

            List<Budget> result = budgetService.getAllBudgetForUser(BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("editBudgetWithExpenseId")
    class EditBudgetWithExpenseId {

        @Test
        @DisplayName("should add expense to budgets")
        void shouldAddExpenseToBudgets() throws Exception {
            Set<Integer> budgetIds = Set.of(100);
            when(budgetRepository.findById(100)).thenReturn(Optional.of(testBudget));
            when(budgetRepository.save(any(Budget.class))).thenReturn(testBudget);
            when(expenseService.getExpensesByIds(eq(BudgetTestDataFactory.TEST_USER_ID), anySet()))
                    .thenReturn(Collections.emptyList());

            Set<Budget> result = budgetService.editBudgetWithExpenseId(
                    budgetIds, 501, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isNotEmpty();
            verify(budgetRepository, atLeastOnce()).save(any(Budget.class));
        }

        @Test
        @DisplayName("should return empty set when no budgets found")
        void shouldReturnEmptyWhenNoBudgets() throws Exception {
            Set<Integer> budgetIds = Set.of(9999);
            when(budgetRepository.findById(9999)).thenReturn(Optional.empty());

            Set<Budget> result = budgetService.editBudgetWithExpenseId(
                    budgetIds, 501, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("save")
    class Save {

        @Test
        @DisplayName("should save budget directly")
        void shouldSaveBudget() {
            when(budgetRepository.save(testBudget)).thenReturn(testBudget);

            Budget result = budgetService.save(testBudget);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(100);
            verify(budgetRepository).save(testBudget);
        }
    }

    @Nested
    @DisplayName("getBudgetsByBudgetIds")
    class GetBudgetsByBudgetIds {

        @Test
        @DisplayName("should return budgets for valid IDs")
        void shouldReturnBudgets() throws Exception {
            when(budgetRepository.findById(100)).thenReturn(Optional.of(testBudget));

            Set<Budget> result = budgetService.getBudgetsByBudgetIds(
                    Set.of(100), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("should return empty for null input")
        void shouldReturnEmptyForNull() throws Exception {
            Set<Budget> result = budgetService.getBudgetsByBudgetIds(
                    null, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should skip missing budgets")
        void shouldSkipMissingBudgets() throws Exception {
            when(budgetRepository.findById(100)).thenReturn(Optional.of(testBudget));
            when(budgetRepository.findById(999)).thenReturn(Optional.empty());

            Set<Budget> result = budgetService.getBudgetsByBudgetIds(
                    Set.of(100, 999), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("isBudgetValid")
    class IsBudgetValid {

        @Test
        @DisplayName("should return true for active budget")
        void shouldReturnTrueForActiveBudget() {
            when(budgetRepository.findById(100)).thenReturn(Optional.of(testBudget));

            boolean result = budgetService.isBudgetValid(100);

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should throw when budget not found")
        void shouldThrowWhenNotFound() {
            when(budgetRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> budgetService.isBudgetValid(999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Budget not found");
        }
    }

    @Nested
    @DisplayName("searchBudgets")
    class SearchBudgets {

        @Test
        @DisplayName("should return matching budgets")
        void shouldReturnMatchingBudgets() {
            BudgetSearchDTO dto = BudgetTestDataFactory.buildBudgetSearchDTO();
            when(budgetRepository.searchBudgetsFuzzyWithLimit(
                    eq(BudgetTestDataFactory.TEST_USER_ID), anyString()))
                    .thenReturn(List.of(dto));

            List<BudgetSearchDTO> result = budgetService.searchBudgets(
                    BudgetTestDataFactory.TEST_USER_ID, "Groceries", 10);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Monthly Groceries");
        }

        @Test
        @DisplayName("should return empty list for null query")
        void shouldReturnEmptyForNullQuery() {
            List<BudgetSearchDTO> result = budgetService.searchBudgets(
                    BudgetTestDataFactory.TEST_USER_ID, null, 10);

            assertThat(result).isEmpty();
            verifyNoInteractions(budgetRepository);
        }

        @Test
        @DisplayName("should return empty list for blank query")
        void shouldReturnEmptyForBlankQuery() {
            List<BudgetSearchDTO> result = budgetService.searchBudgets(
                    BudgetTestDataFactory.TEST_USER_ID, "   ", 10);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should respect limit parameter")
        void shouldRespectLimit() {
            BudgetSearchDTO dto1 = BudgetTestDataFactory.buildBudgetSearchDTO();
            BudgetSearchDTO dto2 = new BudgetSearchDTO(101, "Grocery2", "desc", 3000, 2000,
                    LocalDate.now(), LocalDate.now().plusDays(30), BudgetTestDataFactory.TEST_USER_ID);
            when(budgetRepository.searchBudgetsFuzzyWithLimit(
                    eq(BudgetTestDataFactory.TEST_USER_ID), anyString()))
                    .thenReturn(List.of(dto1, dto2));

            List<BudgetSearchDTO> result = budgetService.searchBudgets(
                    BudgetTestDataFactory.TEST_USER_ID, "Grocery", 1);

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    @DisplayName("getExpensesForUserByBudgetId")
    class GetExpensesForUserByBudgetId {

        @Test
        @DisplayName("should return expenses for budget")
        void shouldReturnExpenses() throws Exception {
            when(budgetRepository.findByUserIdAndId(BudgetTestDataFactory.TEST_USER_ID, 100))
                    .thenReturn(Optional.of(testBudget));
            ExpenseDTO expenseDTO = BudgetTestDataFactory.buildExpenseDTO();
            when(expenseService.getExpensesByIds(eq(BudgetTestDataFactory.TEST_USER_ID), anySet()))
                    .thenReturn(List.of(expenseDTO));

            List<ExpenseDTO> result = budgetService.getExpensesForUserByBudgetId(
                    BudgetTestDataFactory.TEST_USER_ID, 100);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).isIncludeInBudget()).isTrue();
        }

        @Test
        @DisplayName("should return empty when no expense IDs")
        void shouldReturnEmptyWhenNoExpenses() throws Exception {
            Budget budgetNoExpenses = BudgetTestDataFactory.buildBudget();
            budgetNoExpenses.setExpenseIds(new HashSet<>());
            when(budgetRepository.findByUserIdAndId(BudgetTestDataFactory.TEST_USER_ID, 100))
                    .thenReturn(Optional.of(budgetNoExpenses));

            List<ExpenseDTO> result = budgetService.getExpensesForUserByBudgetId(
                    BudgetTestDataFactory.TEST_USER_ID, 100);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should throw when budget not found")
        void shouldThrowWhenBudgetNotFound() {
            when(budgetRepository.findByUserIdAndId(BudgetTestDataFactory.TEST_USER_ID, 999))
                    .thenReturn(Optional.empty());

            assertThatThrownBy(() -> budgetService.getExpensesForUserByBudgetId(
                    BudgetTestDataFactory.TEST_USER_ID, 999))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Budget not found");
        }
    }

    @Nested
    @DisplayName("getBudgetsByDate")
    class GetBudgetsByDate {

        @Test
        @DisplayName("should return budgets for date")
        void shouldReturnBudgetsForDate() {
            when(budgetRepository.findBudgetsByDate(any(LocalDate.class), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(List.of(testBudget));
            when(expenseService.getExpensesByIds(eq(BudgetTestDataFactory.TEST_USER_ID), anySet()))
                    .thenReturn(List.of(BudgetTestDataFactory.buildExpenseDTO()));

            List<Budget> result = budgetService.getBudgetsByDate(LocalDate.now(), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("should return empty when no budgets match")
        void shouldReturnEmptyWhenNoMatch() {
            when(budgetRepository.findBudgetsByDate(any(LocalDate.class), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(Collections.emptyList());

            List<Budget> result = budgetService.getBudgetsByDate(
                    LocalDate.now().plusYears(1), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }
    }
}
