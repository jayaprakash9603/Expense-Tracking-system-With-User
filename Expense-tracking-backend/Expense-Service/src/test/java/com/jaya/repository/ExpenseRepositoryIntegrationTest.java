package com.jaya.repository;

import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EntityScan("com.jaya.models")
class ExpenseRepositoryIntegrationTest {

    private static final int REPO_USER_ID = 88888;
    private static final int OTHER_USER_ID = 77777;

    @Autowired
    private ExpenseRepository expenseRepository;

    private Expense persistExpense(int userId, LocalDate date, String name, double amount, String type, String paymentMethod) {
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setDate(date);
        expense.setCategoryId(10);
        expense.setCategoryName("Food");
        expense.setIncludeInBudget(true);
        expense.setBudgetIds(Set.of(501));

        ExpenseDetails details = new ExpenseDetails();
        details.setExpenseName(name);
        details.setAmount(amount);
        details.setType(type);
        details.setPaymentMethod(paymentMethod);
        details.setNetAmount(-amount);
        details.setComments("");
        details.setCreditDue(0);
        details.setExpense(expense);
        expense.setExpense(details);

        return expenseRepository.save(expense);
    }

    @Test
    void findByUserIdAndIdReturnsMatchingExpense() {
        Expense saved = persistExpense(REPO_USER_ID, LocalDate.of(2025, 3, 1), "Lunch", 250, "loss", "cash");

        Expense result = expenseRepository.findByUserIdAndId(REPO_USER_ID, saved.getId());

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(saved.getId());
        assertThat(result.getUserId()).isEqualTo(REPO_USER_ID);
        assertThat(result.getExpense().getExpenseName()).isEqualTo("Lunch");
    }

    @Test
    void findByUserIdAndDateBetweenFiltersByRangeAndUser() {
        persistExpense(REPO_USER_ID, LocalDate.of(2025, 2, 15), "InRange1", 100, "loss", "cash");
        persistExpense(REPO_USER_ID, LocalDate.of(2025, 3, 10), "InRange2", 200, "loss", "cash");
        persistExpense(REPO_USER_ID, LocalDate.of(2025, 1, 5), "OutOfRange", 50, "loss", "cash");
        persistExpense(OTHER_USER_ID, LocalDate.of(2025, 2, 20), "OtherUser", 300, "loss", "cash");

        List<Expense> result = expenseRepository.findByUserIdAndDateBetween(
                REPO_USER_ID,
                LocalDate.of(2025, 2, 1),
                LocalDate.of(2025, 3, 31));

        assertThat(result).hasSize(2);
        assertThat(result).allMatch(e -> e.getUserId().equals(REPO_USER_ID));
        assertThat(result.stream().map(e -> e.getExpense().getExpenseName()).toList())
                .containsExactlyInAnyOrder("InRange1", "InRange2");
    }

    @Test
    void deleteByIdsAndUserIdDeletesOnlyUserRowsAndReturnsDeletedCount() {
        Expense e1 = persistExpense(REPO_USER_ID, LocalDate.of(2025, 3, 1), "A", 100, "loss", "cash");
        Expense e2 = persistExpense(REPO_USER_ID, LocalDate.of(2025, 3, 2), "B", 200, "loss", "cash");
        Expense e3 = persistExpense(OTHER_USER_ID, LocalDate.of(2025, 3, 3), "C", 300, "loss", "cash");

        expenseRepository.deleteExpenseDetailsByExpenseIds(List.of(e1.getId(), e2.getId()));
        int deleted = expenseRepository.deleteByIdsAndUserId(
                List.of(e1.getId(), e2.getId(), e3.getId()),
                REPO_USER_ID);

        assertThat(deleted).isEqualTo(2);
        assertThat(expenseRepository.findByUserIdAndId(REPO_USER_ID, e1.getId())).isNull();
        assertThat(expenseRepository.findByUserIdAndId(REPO_USER_ID, e2.getId())).isNull();
        assertThat(expenseRepository.findByUserIdAndId(OTHER_USER_ID, e3.getId())).isNotNull();
    }

    @Test
    void searchExpensesFuzzyFindsByExpenseNameAndComments() {
        persistExpense(REPO_USER_ID, LocalDate.of(2025, 3, 1), "Grocery Shopping", 500, "loss", "card");
        persistExpense(REPO_USER_ID, LocalDate.of(2025, 3, 2), "Lunch at Cafe", 150, "loss", "cash");
        Expense withComments = persistExpense(REPO_USER_ID, LocalDate.of(2025, 3, 3), "Taxi", 80, "loss", "cash");
        withComments.getExpense().setComments("Airport pickup");
        expenseRepository.save(withComments);

        List<Expense> byName = expenseRepository.searchExpensesFuzzy(REPO_USER_ID, "Grocery");
        List<Expense> byComments = expenseRepository.searchExpensesFuzzy(REPO_USER_ID, "Airport");

        assertThat(byName).hasSize(1);
        assertThat(byName.get(0).getExpense().getExpenseName()).isEqualTo("Grocery Shopping");
        assertThat(byComments).hasSize(1);
        assertThat(byComments.get(0).getExpense().getComments()).isEqualTo("Airport pickup");
    }
}
