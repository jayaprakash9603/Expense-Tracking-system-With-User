package com.jaya.util;

import com.jaya.models.Budget;
import com.jaya.repository.BudgetRepository;
import com.jaya.testutil.BudgetTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BudgetBatchOperationsTest {

    @Mock
    private BudgetRepository budgetRepository;

    @InjectMocks
    private BudgetBatchOperations batchOperations;

    private Budget testBudget;

    @BeforeEach
    void setUp() {
        testBudget = BudgetTestDataFactory.buildBudget();
    }

    @Nested
    @DisplayName("fetchBudgetsByIds")
    class FetchBudgetsByIds {

        @Test
        @DisplayName("should return map of budgets")
        void shouldReturnMap() {
            when(budgetRepository.findByIdInAndUserId(anyList(), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(List.of(testBudget));

            Map<Integer, Budget> result = batchOperations.fetchBudgetsByIds(
                    List.of(100), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
            assertThat(result).containsKey(100);
            assertThat(result.get(100).getName()).isEqualTo("Monthly Groceries");
        }

        @Test
        @DisplayName("should return empty map for null input")
        void shouldReturnEmptyForNull() {
            Map<Integer, Budget> result = batchOperations.fetchBudgetsByIds(
                    null, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should return empty map for empty input")
        void shouldReturnEmptyForEmpty() {
            Map<Integer, Budget> result = batchOperations.fetchBudgetsByIds(
                    Collections.emptyList(), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should return partial results when some IDs not found")
        void shouldReturnPartialResults() {
            when(budgetRepository.findByIdInAndUserId(anyList(), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(List.of(testBudget));

            Map<Integer, Budget> result = batchOperations.fetchBudgetsByIds(
                    List.of(100, 9999), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
            assertThat(result).containsKey(100);
        }
    }

    @Nested
    @DisplayName("fetchBudgetsAsList")
    class FetchBudgetsAsList {

        @Test
        @DisplayName("should return list of budgets")
        void shouldReturnList() {
            when(budgetRepository.findByIdInAndUserId(anyList(), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(List.of(testBudget));

            List<Budget> result = batchOperations.fetchBudgetsAsList(
                    Set.of(100), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("should return empty for null input")
        void shouldReturnEmptyForNull() {
            List<Budget> result = batchOperations.fetchBudgetsAsList(
                    null, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("validateBudgetIdsExist")
    class ValidateBudgetIdsExist {

        @Test
        @DisplayName("should return true when all IDs exist")
        void shouldReturnTrueWhenAllExist() {
            when(budgetRepository.findByIdInAndUserId(anyList(), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(List.of(testBudget));

            boolean result = batchOperations.validateBudgetIdsExist(
                    List.of(100), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isTrue();
        }

        @Test
        @DisplayName("should return false when some IDs missing")
        void shouldReturnFalseWhenSomeMissing() {
            when(budgetRepository.findByIdInAndUserId(anyList(), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(List.of(testBudget));

            boolean result = batchOperations.validateBudgetIdsExist(
                    List.of(100, 999), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isFalse();
        }

        @Test
        @DisplayName("should return true for empty list")
        void shouldReturnTrueForEmpty() {
            boolean result = batchOperations.validateBudgetIdsExist(
                    Collections.emptyList(), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isTrue();
        }
    }

    @Nested
    @DisplayName("getMissingBudgetIds")
    class GetMissingBudgetIds {

        @Test
        @DisplayName("should return missing IDs")
        void shouldReturnMissingIds() {
            when(budgetRepository.findByIdInAndUserId(anyList(), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(List.of(testBudget));

            Set<Integer> result = batchOperations.getMissingBudgetIds(
                    List.of(100, 999), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
            assertThat(result).contains(999);
        }

        @Test
        @DisplayName("should return empty when all exist")
        void shouldReturnEmptyWhenAllExist() {
            when(budgetRepository.findByIdInAndUserId(anyList(), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(List.of(testBudget));

            Set<Integer> result = batchOperations.getMissingBudgetIds(
                    List.of(100), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should return empty for null input")
        void shouldReturnEmptyForNull() {
            Set<Integer> result = batchOperations.getMissingBudgetIds(
                    null, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("getBudgetsByIdsOptimized")
    class GetBudgetsByIdsOptimized {

        @Test
        @DisplayName("should return set of budgets")
        void shouldReturnSet() {
            when(budgetRepository.findByIdInAndUserId(anyList(), eq(BudgetTestDataFactory.TEST_USER_ID)))
                    .thenReturn(List.of(testBudget));

            Set<Budget> result = batchOperations.getBudgetsByIdsOptimized(
                    Set.of(100), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("should return empty for null input")
        void shouldReturnEmptyForNull() {
            Set<Budget> result = batchOperations.getBudgetsByIdsOptimized(
                    null, BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should return empty for empty input")
        void shouldReturnEmptyForEmpty() {
            Set<Budget> result = batchOperations.getBudgetsByIdsOptimized(
                    Collections.emptySet(), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }
    }
}
