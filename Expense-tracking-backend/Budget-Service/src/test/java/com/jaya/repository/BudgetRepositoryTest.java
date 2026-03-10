package com.jaya.repository;

import com.jaya.dto.BudgetSearchDTO;
import com.jaya.models.Budget;
import com.jaya.testutil.BudgetTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.datasource.url=jdbc:h2:mem:budget_repo_test;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver"
})
class BudgetRepositoryTest {

    @Autowired
    private BudgetRepository budgetRepository;

    private Budget savedBudget;

    private Budget buildRepoTestBudget() {
        Budget budget = new Budget();
        budget.setName("Monthly Groceries");
        budget.setDescription("Budget for monthly grocery shopping");
        budget.setAmount(5000.0);
        budget.setRemainingAmount(3000.0);
        budget.setStartDate(LocalDate.now().minusDays(15));
        budget.setEndDate(LocalDate.now().plusDays(15));
        budget.setUserId(BudgetTestDataFactory.TEST_USER_ID);
        budget.setExpenseIds(null);
        budget.setBudgetHasExpenses(false);
        budget.setIncludeInBudget(true);
        return budget;
    }

    @BeforeEach
    void setUp() {
        budgetRepository.deleteAll();
        savedBudget = budgetRepository.save(buildRepoTestBudget());
    }

    @Nested
    @DisplayName("findByUserId")
    class FindByUserId {

        @Test
        @DisplayName("should return budgets for existing user")
        void shouldReturnBudgetsForUser() {
            List<Budget> budgets = budgetRepository.findByUserId(BudgetTestDataFactory.TEST_USER_ID);

            assertThat(budgets).isNotEmpty();
            assertThat(budgets).hasSize(1);
            assertThat(budgets.get(0).getName()).isEqualTo("Monthly Groceries");
        }

        @Test
        @DisplayName("should return empty list for unknown user")
        void shouldReturnEmptyForUnknownUser() {
            List<Budget> budgets = budgetRepository.findByUserId(9999);

            assertThat(budgets).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByUserIdAndId")
    class FindByUserIdAndId {

        @Test
        @DisplayName("should return budget when found")
        void shouldReturnBudgetWhenFound() {
            Optional<Budget> result = budgetRepository.findByUserIdAndId(
                    BudgetTestDataFactory.TEST_USER_ID, savedBudget.getId());

            assertThat(result).isPresent();
            assertThat(result.get().getName()).isEqualTo("Monthly Groceries");
        }

        @Test
        @DisplayName("should return empty when budget not found")
        void shouldReturnEmptyWhenNotFound() {
            Optional<Budget> result = budgetRepository.findByUserIdAndId(
                    BudgetTestDataFactory.TEST_USER_ID, 9999);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should return empty when user ID does not match")
        void shouldReturnEmptyWhenUserMismatch() {
            Optional<Budget> result = budgetRepository.findByUserIdAndId(
                    9999, savedBudget.getId());

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findBudgetsByDate")
    class FindBudgetsByDate {

        @Test
        @DisplayName("should return budgets containing the date")
        void shouldReturnBudgetsContainingDate() {
            List<Budget> budgets = budgetRepository.findBudgetsByDate(
                    LocalDate.now(), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(budgets).isNotEmpty();
            assertThat(budgets.get(0).getId()).isEqualTo(savedBudget.getId());
        }

        @Test
        @DisplayName("should return empty when date is outside range")
        void shouldReturnEmptyWhenDateOutsideRange() {
            List<Budget> budgets = budgetRepository.findBudgetsByDate(
                    LocalDate.now().plusYears(1), BudgetTestDataFactory.TEST_USER_ID);

            assertThat(budgets).isEmpty();
        }
    }

    @Nested
    @DisplayName("countByUserId")
    class CountByUserId {

        @Test
        @DisplayName("should return correct count")
        void shouldReturnCorrectCount() {
            long count = budgetRepository.countByUserId(BudgetTestDataFactory.TEST_USER_ID);

            assertThat(count).isEqualTo(1);
        }

        @Test
        @DisplayName("should return zero for unknown user")
        void shouldReturnZeroForUnknownUser() {
            long count = budgetRepository.countByUserId(9999);

            assertThat(count).isEqualTo(0);
        }

        @Test
        @DisplayName("should count multiple budgets")
        void shouldCountMultipleBudgets() {
            Budget second = buildRepoTestBudget();
            second.setName("Second Budget");
            budgetRepository.save(second);

            long count = budgetRepository.countByUserId(BudgetTestDataFactory.TEST_USER_ID);

            assertThat(count).isEqualTo(2);
        }
    }

    @Nested
    @DisplayName("searchBudgetsFuzzy")
    class SearchBudgetsFuzzy {

        @Test
        @DisplayName("should find budget by name")
        void shouldFindByName() {
            List<Budget> results = budgetRepository.searchBudgetsFuzzy(
                    BudgetTestDataFactory.TEST_USER_ID, "Groceries");

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getName()).isEqualTo("Monthly Groceries");
        }

        @Test
        @DisplayName("should find budget by description")
        void shouldFindByDescription() {
            List<Budget> results = budgetRepository.searchBudgetsFuzzy(
                    BudgetTestDataFactory.TEST_USER_ID, "grocery shopping");

            assertThat(results).hasSize(1);
        }

        @Test
        @DisplayName("should return empty for no match")
        void shouldReturnEmptyForNoMatch() {
            List<Budget> results = budgetRepository.searchBudgetsFuzzy(
                    BudgetTestDataFactory.TEST_USER_ID, "nonexistent xyz");

            assertThat(results).isEmpty();
        }

        @Test
        @DisplayName("should be case-insensitive")
        void shouldBeCaseInsensitive() {
            List<Budget> results = budgetRepository.searchBudgetsFuzzy(
                    BudgetTestDataFactory.TEST_USER_ID, "MONTHLY");

            assertThat(results).hasSize(1);
        }
    }

    @Nested
    @DisplayName("findByIdInAndUserId")
    class FindByIdInAndUserId {

        @Test
        @DisplayName("should return matching budgets")
        void shouldReturnMatchingBudgets() {
            Budget second = buildRepoTestBudget();
            second.setName("Second Budget");
            Budget savedSecond = budgetRepository.save(second);

            List<Budget> results = budgetRepository.findByIdInAndUserId(
                    new ArrayList<>(List.of(savedBudget.getId(), savedSecond.getId())),
                    BudgetTestDataFactory.TEST_USER_ID);

            assertThat(results).hasSize(2);
        }

        @Test
        @DisplayName("should return subset when some IDs not found")
        void shouldReturnSubsetWhenSomeNotFound() {
            List<Budget> results = budgetRepository.findByIdInAndUserId(
                    new ArrayList<>(List.of(savedBudget.getId(), 9999)),
                    BudgetTestDataFactory.TEST_USER_ID);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).getId()).isEqualTo(savedBudget.getId());
        }

        @Test
        @DisplayName("should return empty when no IDs match")
        void shouldReturnEmptyWhenNoMatch() {
            List<Budget> results = budgetRepository.findByIdInAndUserId(
                    new ArrayList<>(List.of(8888, 9999)),
                    BudgetTestDataFactory.TEST_USER_ID);

            assertThat(results).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual")
    class FindActiveBudgets {

        @Test
        @DisplayName("should return active budgets for today")
        void shouldReturnActiveBudgets() {
            List<Budget> results = budgetRepository
                    .findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            BudgetTestDataFactory.TEST_USER_ID, LocalDate.now(), LocalDate.now());

            assertThat(results).isNotEmpty();
        }

        @Test
        @DisplayName("should return empty for future date")
        void shouldReturnEmptyForFutureDate() {
            LocalDate futureDate = LocalDate.now().plusYears(2);
            List<Budget> results = budgetRepository
                    .findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                            BudgetTestDataFactory.TEST_USER_ID, futureDate, futureDate);

            assertThat(results).isEmpty();
        }
    }

    @Nested
    @DisplayName("searchBudgetsFuzzyWithLimit")
    class SearchBudgetsFuzzyWithLimit {

        @Test
        @DisplayName("should return search DTOs matching pattern")
        void shouldReturnSearchDTOs() {
            List<BudgetSearchDTO> results = budgetRepository.searchBudgetsFuzzyWithLimit(
                    BudgetTestDataFactory.TEST_USER_ID, "%Groceries%");

            assertThat(results).isNotEmpty();
            assertThat(results.get(0).getName()).isEqualTo("Monthly Groceries");
        }

        @Test
        @DisplayName("should return empty for non-matching pattern")
        void shouldReturnEmptyForNoMatch() {
            List<BudgetSearchDTO> results = budgetRepository.searchBudgetsFuzzyWithLimit(
                    BudgetTestDataFactory.TEST_USER_ID, "%nonexistent%");

            assertThat(results).isEmpty();
        }
    }
}
