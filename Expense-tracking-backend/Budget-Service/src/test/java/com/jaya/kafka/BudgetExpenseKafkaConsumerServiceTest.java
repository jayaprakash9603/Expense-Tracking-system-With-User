package com.jaya.kafka;

import com.jaya.events.BudgetExpenseEvent;
import com.jaya.models.Budget;
import com.jaya.service.BudgetService;
import com.jaya.testutil.BudgetTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetExpenseKafkaConsumerServiceTest {

    @Mock
    private BudgetService budgetService;

    @InjectMocks
    private BudgetExpenseKafkaConsumerService consumerService;

    private Budget testBudget;

    @BeforeEach
    void setUp() {
        testBudget = BudgetTestDataFactory.buildBudget();
    }

    @Nested
    @DisplayName("handleBudgetExpenseEventDirect - ADD action")
    class AddAction {

        @Test
        @DisplayName("should add expense to budgets")
        void shouldAddExpenseToBudgets() throws Exception {
            BudgetExpenseEvent event = BudgetTestDataFactory.buildBudgetExpenseEvent("ADD");
            when(budgetService.editBudgetWithExpenseId(anySet(), anyInt(), anyInt()))
                    .thenReturn(Set.of(testBudget));

            consumerService.handleBudgetExpenseEventDirect(event);

            verify(budgetService).editBudgetWithExpenseId(
                    eq(event.getBudgetIds()), eq(event.getExpenseId()), eq(event.getUserId()));
        }
    }

    @Nested
    @DisplayName("handleBudgetExpenseEventDirect - UPDATE action")
    class UpdateAction {

        @Test
        @DisplayName("should remove from all budgets then add to new ones")
        void shouldUpdateBudgetLinks() throws Exception {
            BudgetExpenseEvent event = BudgetTestDataFactory.buildBudgetExpenseEvent("UPDATE");
            Budget budgetWithExpense = BudgetTestDataFactory.buildBudget();
            budgetWithExpense.setExpenseIds(new HashSet<>(Set.of(event.getExpenseId())));
            when(budgetService.getAllBudgetForUser(event.getUserId()))
                    .thenReturn(List.of(budgetWithExpense));
            when(budgetService.editBudgetWithExpenseId(anySet(), anyInt(), anyInt()))
                    .thenReturn(Set.of(testBudget));

            consumerService.handleBudgetExpenseEventDirect(event);

            verify(budgetService).editBudget(
                    eq(budgetWithExpense.getId()), any(Budget.class), eq(event.getUserId()));
            verify(budgetService).editBudgetWithExpenseId(
                    eq(event.getBudgetIds()), eq(event.getExpenseId()), eq(event.getUserId()));
        }
    }

    @Nested
    @DisplayName("handleBudgetExpenseEventDirect - REMOVE action")
    class RemoveAction {

        @Test
        @DisplayName("should remove expense from specified budgets")
        void shouldRemoveExpenseFromBudgets() throws Exception {
            BudgetExpenseEvent event = BudgetTestDataFactory.buildBudgetExpenseEvent("REMOVE");
            Budget budgetWithExpense = BudgetTestDataFactory.buildBudget();
            budgetWithExpense.setId(100);
            budgetWithExpense.setExpenseIds(new HashSet<>(Set.of(event.getExpenseId())));
            when(budgetService.getBudgetById(eq(100), eq(event.getUserId())))
                    .thenReturn(budgetWithExpense);
            when(budgetService.save(any(Budget.class))).thenReturn(budgetWithExpense);

            Budget budget101 = BudgetTestDataFactory.buildBudget();
            budget101.setId(101);
            budget101.setExpenseIds(new HashSet<>(Set.of(event.getExpenseId())));
            when(budgetService.getBudgetById(eq(101), eq(event.getUserId())))
                    .thenReturn(budget101);

            consumerService.handleBudgetExpenseEventDirect(event);

            verify(budgetService, atLeastOnce()).save(any(Budget.class));
        }
    }

    @Nested
    @DisplayName("Edge cases")
    class EdgeCases {

        @Test
        @DisplayName("should skip when budget IDs are null")
        void shouldSkipWhenBudgetIdsNull() {
            BudgetExpenseEvent event = BudgetTestDataFactory.buildBudgetExpenseEvent("ADD");
            event.setBudgetIds(null);

            consumerService.handleBudgetExpenseEventDirect(event);

            verifyNoInteractions(budgetService);
        }

        @Test
        @DisplayName("should skip when budget IDs are empty")
        void shouldSkipWhenBudgetIdsEmpty() {
            BudgetExpenseEvent event = BudgetTestDataFactory.buildBudgetExpenseEvent("ADD");
            event.setBudgetIds(Collections.emptySet());

            consumerService.handleBudgetExpenseEventDirect(event);

            verifyNoInteractions(budgetService);
        }

        @Test
        @DisplayName("should handle unknown action gracefully")
        void shouldHandleUnknownAction() {
            BudgetExpenseEvent event = BudgetTestDataFactory.buildBudgetExpenseEvent("UNKNOWN");

            consumerService.handleBudgetExpenseEventDirect(event);

            verify(budgetService, never()).save(any());
        }

        @Test
        @DisplayName("should not propagate service exceptions")
        void shouldNotPropagateExceptions() throws Exception {
            BudgetExpenseEvent event = BudgetTestDataFactory.buildBudgetExpenseEvent("ADD");
            when(budgetService.editBudgetWithExpenseId(anySet(), anyInt(), anyInt()))
                    .thenThrow(new RuntimeException("Service failure"));

            consumerService.handleBudgetExpenseEventDirect(event);
        }
    }
}
