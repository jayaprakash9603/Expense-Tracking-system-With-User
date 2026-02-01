package com.jaya.repository;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jaya.dto.ExpenseSearchDTO;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseDetails;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.jpa.repository.EntityGraph;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {

        List<Expense> findByDateBetween(LocalDate from, LocalDate to);

        // Optimized single expense fetch with details to avoid lazy loading N+1 when
        // serializing (READ ONLY - for display purposes only)
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "1"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = :userId AND e.id = :id")
        Expense findByUserIdAndIdReadOnly(@Param("userId") Integer userId, @Param("id") Integer id);

        // For updates - fetches entity in write mode
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "1")
        })
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = :userId AND e.id = :id")
        Expense findByUserIdAndId(@Param("userId") Integer userId, @Param("id") Integer id);

        // Fixed N+1: Using EntityGraph for pagination to avoid N+1 queries
        @EntityGraph(attributePaths = { "expense" })
        Page<Expense> findByUserId(Integer userId, Pageable pageable);

        // Fixed N+1: Using EntityGraph for pagination to avoid N+1 queries
        @EntityGraph(attributePaths = { "expense" })
        Page<Expense> findByUserIdAndDateBetween(Integer userId, LocalDate startDate, LocalDate endDate,
                        Pageable pageable);

        // Optimized includeInBudget filtered range with joined details
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true")
        })
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense d WHERE e.userId = :userId AND e.includeInBudget = true AND e.date BETWEEN :startDate AND :endDate ORDER BY e.date DESC")
        List<Expense> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(@Param("userId") Integer userId,
                        @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

        @Modifying
        @Query("DELETE FROM Expense e WHERE e.id IN :ids AND e.userId = :userId")
        int deleteByIdsAndUserId(@Param("ids") List<Integer> ids, @Param("userId") Integer userId);

        @Modifying
        @Query("DELETE FROM ExpenseDetails ed WHERE ed.expense.id IN :expenseIds")
        int deleteExpenseDetailsByExpenseIds(@Param("expenseIds") List<Integer> expenseIds);

        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = :userId")
        List<Expense> findByUserId(@Param("userId") Integer userId);

        // Optimized with JOIN FETCH to avoid N+1 queries
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = :userId")
        List<Expense> findByUserIdWithSort(@Param("userId") Integer userId, Sort sort);

        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = :userId AND e.date BETWEEN :startDate AND :endDate")
        List<Expense> findByUserIdAndDateBetween(@Param("userId") Integer userId,
                        @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = :userId AND e.date BETWEEN :startDate AND :endDate")
        List<Expense> findByUserAndDateBetween(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("userId") Integer userId);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = :userId AND e.date = :date")
        List<Expense> findByUserIdAndDate(@Param("userId") Integer userId, @Param("date") LocalDate date);

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "100"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.id IN :ids")
        List<Expense> findByIdIn(@Param("ids") List<Integer> ids);

        @Query("SELECT e FROM ExpenseDetails e JOIN e.expense exp WHERE exp.userId = :userId AND e.amount = :amount")
        List<ExpenseDetails> findByUserAndAmount(@Param("userId") Integer userId, @Param("amount") double amount);

        @Query("SELECT e FROM Expense e JOIN FETCH e.expense d WHERE e.userId = :userId AND d.amount BETWEEN :minAmount AND :maxAmount")
        List<Expense> findExpensesByUserAndAmountRange(@Param("userId") Integer userId,
                        @Param("minAmount") double minAmount, @Param("maxAmount") double maxAmount);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense d WHERE e.userId = :userId AND d.type = 'loss' ORDER BY d.amount DESC")
        Page<Expense> findTopNExpensesByUserAndAmount(@Param("userId") Integer userId, Pageable pageable);

        @Query("SELECT e FROM Expense e WHERE e.userId = ?1 AND e.expense.expenseName = ?2 ORDER BY e.date DESC")
        List<Expense> searchExpensesByUserAndName(@Param("userId") Integer userId,
                        @Param("expenseName") String expenseName);

        /**
         * Fuzzy search expenses by name - supports partial matching and sequence search
         * Searches in expense name, comments, and payment method
         * Optimized with JOIN FETCH to avoid N+1 queries
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT e FROM Expense e JOIN FETCH e.expense d WHERE e.userId = :userId AND " +
                        "(LOWER(d.expenseName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(d.comments) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(d.paymentMethod) LIKE LOWER(CONCAT('%', :query, '%'))) " +
                        "ORDER BY e.date DESC")
        List<Expense> searchExpensesFuzzy(@Param("userId") Integer userId, @Param("query") String query);

        /**
         * Fuzzy search expenses with limit - for search service optimization
         * Uses JPQL with DTO constructor to avoid N+1 problem.
         * Note: The query parameter should already be in pattern format (e.g.,
         * "%j%c%e%")
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "20"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT new com.jaya.dto.ExpenseSearchDTO(e.id, e.date, d.expenseName, d.amount, d.type, d.paymentMethod, d.netAmount, d.comments, e.categoryId, e.categoryName, e.userId, e.includeInBudget) "
                        +
                        "FROM Expense e JOIN e.expense d " +
                        "WHERE e.userId = :userId AND " +
                        "(LOWER(d.expenseName) LIKE LOWER(:query) OR " +
                        "LOWER(d.comments) LIKE LOWER(:query) OR " +
                        "LOWER(d.paymentMethod) LIKE LOWER(:query)) " +
                        "ORDER BY e.date DESC")
        List<ExpenseSearchDTO> searchExpensesFuzzyWithLimit(@Param("userId") Integer userId,
                        @Param("query") String query);

        @Query("SELECT SUM(ed.netAmount) FROM ExpenseDetails ed WHERE LOWER(ed.expenseName) = LOWER(:expenseName)")
        Double getTotalExpenseByName(@Param("expenseName") String expenseName);

        @Query("SELECT SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year AND e.userId = :userId")
        Double getTotalByMonthAndYear(@Param("month") int month, @Param("year") int year,
                        @Param("userId") Integer userId);

        @Query("SELECT LOWER(TRIM(ed.expenseName)), ed.paymentMethod, SUM(ed.netAmount) " +
                        "FROM Expense e JOIN e.expense ed " +
                        "WHERE e.userId = :userId " +
                        "GROUP BY LOWER(TRIM(ed.expenseName)), ed.paymentMethod")
        List<Object[]> findTotalExpensesGroupedByCategoryAndPaymentMethod(@Param("userId") Integer userId);

        @Query("SELECT ed FROM ExpenseDetails ed")
        List<ExpenseDetails> findAllExpenseDetails();

        @Query("SELECT SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE e.date BETWEEN :startDate AND :endDate AND e.userId = :userId")
        Double getTotalByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate,
                        @Param("userId") Integer userId);

        @Query("SELECT ed.paymentMethod, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year AND e.userId = :userId GROUP BY ed.paymentMethod")
        List<Object[]> findTotalByPaymentMethodForCurrentMonth(@Param("month") int month, @Param("year") int year,
                        @Param("userId") Integer userId);

        @Query("SELECT ed.paymentMethod, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year AND e.userId = :userId GROUP BY ed.paymentMethod")
        List<Object[]> findTotalByPaymentMethodForLastMonth(@Param("month") int month, @Param("year") int year,
                        @Param("userId") Integer userId);

        @Query("SELECT ed.paymentMethod, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE e.date BETWEEN :startDate AND :endDate AND e.userId = :userId GROUP BY ed.paymentMethod")
        List<Object[]> findTotalByPaymentMethodBetweenDates(@Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate, @Param("userId") Integer userId);

        @Query("SELECT ed.paymentMethod, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year AND e.userId = :userId GROUP BY ed.paymentMethod")
        List<Object[]> findTotalByPaymentMethodForMonth(@Param("month") int month, @Param("year") int year,
                        @Param("userId") Integer userId);

        @Query("SELECT ed.expenseName, ed.paymentMethod, SUM(ed.netAmount) FROM Expense e " +
                        "JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year AND e.userId = :userId "
                        +
                        "GROUP BY ed.expenseName, ed.paymentMethod")
        List<Object[]> findTotalByExpenseNameAndPaymentMethodForMonth(@Param("month") int month,
                        @Param("year") int year, @Param("userId") Integer userId);

        @Query("SELECT ed.expenseName, ed.paymentMethod, SUM(ed.netAmount) FROM Expense e " +
                        "JOIN e.expense ed WHERE e.date BETWEEN :startDate AND :endDate AND e.userId = :userId " +
                        "GROUP BY ed.expenseName, ed.paymentMethod")
        List<Object[]> findTotalByExpenseNameAndPaymentMethodForDateRange(@Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate, @Param("userId") Integer userId);

        @Query("SELECT ed FROM ExpenseDetails ed JOIN ed.expense e WHERE e.userId = :userId AND LOWER(ed.expenseName) = LOWER(:expenseName)")
        List<ExpenseDetails> findExpensesByUserAndName(@Param("userId") Integer userId,
                        @Param("expenseName") String expenseName);

        @Query("SELECT ed.expenseName, SUM(ed.netAmount) AS totalAmount " +
                        "FROM ExpenseDetails ed " +
                        "JOIN ed.expense e " +
                        "WHERE e.userId = :userId " +
                        "GROUP BY ed.expenseName " +
                        "ORDER BY totalAmount DESC")
        List<Object[]> findTotalExpensesGroupedByCategory(@Param("userId") Integer userId);

        @Query("SELECT ed.expenseName, COUNT(ed.expenseName) AS frequency " +
                        "FROM ExpenseDetails ed " +
                        "JOIN ed.expense e " +
                        "WHERE e.userId = :userId " +
                        "GROUP BY ed.expenseName " +
                        "ORDER BY frequency DESC")
        Page<Object[]> findTopExpenseNamesByUser(@Param("userId") Integer userId, Pageable pageable);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense ed WHERE e.userId = :userId AND ed.type = 'gain'")
        List<Expense> findExpensesWithGainTypeByUser(@Param("userId") Integer userId);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense ed WHERE e.userId = :userId AND ed.type = 'loss'")
        List<Expense> findByLossTypeAndUser(@Param("userId") Integer userId);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense ed WHERE e.userId = :userId AND ed.paymentMethod = :paymentMethod")
        List<Expense> findByUserAndPaymentMethod(@Param("userId") Integer userId,
                        @Param("paymentMethod") String paymentMethod);

        @Query("SELECT e.date, SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE e.userId = :userId GROUP BY e.date ORDER BY e.date ASC")
        List<Object[]> findTotalExpensesGroupedByDate(@Param("userId") Integer userId);

        @Query("SELECT SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE e.date = :today AND e.userId = :userId")
        Double findTotalExpensesForToday(@Param("today") LocalDate today, @Param("userId") Integer userId);

        @Query("SELECT SUM(ed.netAmount) FROM Expense e JOIN e.expense ed WHERE MONTH(e.date) = :month AND YEAR(e.date) = :year AND e.userId = :userId")
        Double findTotalExpensesForCurrentMonth(@Param("month") int month, @Param("year") int year,
                        @Param("userId") Integer userId);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense ed WHERE e.userId = :userId AND ed.type = :type AND ed.paymentMethod = :paymentMethod")
        List<Expense> findByUserAndTypeAndPaymentMethod(@Param("userId") Integer userId, @Param("type") String type,
                        @Param("paymentMethod") String paymentMethod);

        @Query("SELECT DISTINCT e.expense.paymentMethod FROM Expense e")
        List<String> findDistinctPaymentMethods();

        @Query("SELECT ed.paymentMethod, COUNT(ed.paymentMethod) FROM ExpenseDetails ed " +
                        "JOIN ed.expense e WHERE e.userId = :userId " +
                        "GROUP BY ed.paymentMethod ORDER BY COUNT(ed.paymentMethod) DESC")
        List<Object[]> findTopPaymentMethodsByUser(@Param("userId") Integer userId);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense ed WHERE e.userId = :userId AND ed.type = 'gain' ORDER BY ed.amount DESC")
        List<Expense> findTop10GainsByUser(@Param("userId") Integer userId, Pageable pageable);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense ed WHERE e.userId = :userId AND ed.type = 'loss' ORDER BY ed.amount DESC")
        List<Expense> findTop10LossesByUser(@Param("userId") Integer userId, Pageable pageable);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = :userId AND MONTH(e.date) = :month AND YEAR(e.date) = :year")
        List<Expense> findByUserAndMonthAndYear(@Param("userId") Integer userId, @Param("month") int month,
                        @Param("year") int year);

        @Query("SELECT e2.expenseName " +
                        "FROM Expense e1 " +
                        "JOIN ExpenseDetails e2 ON e1.id = e2.expense.id " +
                        "WHERE e1.userId = :userId AND e2.type = 'gain' " +
                        "ORDER BY e2.amount DESC")
        List<String> findTopExpensesByGainForUser(@Param("userId") Integer userId, Pageable pageable);

        @Query("SELECT e2.expenseName " +
                        "FROM Expense e1 " +
                        "JOIN ExpenseDetails e2 ON e1.id = e2.expense.id " +
                        "WHERE e1.userId = :userId AND e2.type = 'loss' " +
                        "ORDER BY e2.amount DESC")
        List<String> findTopExpensesByLoss(@Param("userId") Integer userId, Pageable pageable);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense d WHERE " +
                        "(e.userId = :userId) AND " +
                        "(d.expenseName LIKE %:expenseName% OR :expenseName IS NULL) AND " +
                        "(e.date BETWEEN :startDate AND :endDate OR :startDate IS NULL OR :endDate IS NULL) AND " +
                        "(d.type = :type OR :type IS NULL) AND " +
                        "(d.paymentMethod = :paymentMethod OR :paymentMethod IS NULL) AND " +
                        "(d.amount BETWEEN :minAmount AND :maxAmount OR :minAmount IS NULL OR :maxAmount IS NULL)")
        List<Expense> filterExpensesByUser(
                        @Param("userId") Integer userId,
                        @Param("expenseName") String expenseName,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("type") String type,
                        @Param("paymentMethod") String paymentMethod,
                        @Param("minAmount") Double minAmount,
                        @Param("maxAmount") Double maxAmount);

        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = ?1 AND e.expense.expenseName = ?2 AND e.date < ?3 ORDER BY e.date DESC")
        List<Expense> findByUserAndExpenseNameBeforeDate(Integer userId, String expenseName, LocalDate date,
                        Pageable pageable);

        @Query("SELECT ed.expenseName, SUM(ed.amount) as total " +
                        "FROM Expense e JOIN e.expense ed " +
                        "WHERE YEAR(e.date) = :year AND e.userId = :userId " +
                        "GROUP BY ed.expenseName " +
                        "ORDER BY total DESC")
        List<Object[]> findExpenseByNameAndUserId(@Param("year") int year, @Param("userId") Integer userId);

        // For Bar/Line Chart: Monthly Expenses
        @Query("SELECT MONTH(e.date) as month, SUM(ed.amount) as total " +
                        "FROM Expense e JOIN e.expense ed " +
                        "WHERE YEAR(e.date) = :year AND e.userId = :userId " +
                        "AND ed.type = 'loss' AND ed.paymentMethod <> 'creditPaid' " +
                        "GROUP BY MONTH(e.date) " +
                        "ORDER BY MONTH(e.date)")
        List<Object[]> findMonthlyLossExpensesByUserId(@Param("year") int year, @Param("userId") Integer userId);

        // For Polar Area Chart: Payment Method Distribution
        @Query("SELECT ed.paymentMethod, SUM(ed.amount) as total " +
                        "FROM Expense e JOIN e.expense ed " +
                        "WHERE YEAR(e.date) = :year AND e.userId = :userId " +
                        "GROUP BY ed.paymentMethod")
        List<Object[]> findPaymentMethodDistributionByUserId(@Param("year") int year, @Param("userId") Integer userId);

        // For date range with flowType and type filtering
        @Query("SELECT ed.paymentMethod, SUM(ed.amount) as total " +
                        "FROM Expense e JOIN e.expense ed " +
                        "WHERE e.date BETWEEN :startDate AND :endDate AND e.userId = :userId " +
                        "AND (:flowType IS NULL OR " +
                        "    (:flowType = 'inflow' AND ed.amount > 0) OR " +
                        "    (:flowType = 'outflow' AND ed.amount < 0)) " +
                        "AND (:type IS NULL OR ed.type = :type) " +
                        "GROUP BY ed.paymentMethod")
        List<Object[]> findPaymentMethodDistributionByDateRange(
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate,
                        @Param("userId") Integer userId,
                        @Param("flowType") String flowType,
                        @Param("type") String type);

        // For year with flowType and type filtering
        @Query("SELECT ed.paymentMethod, SUM(ed.amount) as total " +
                        "FROM Expense e JOIN e.expense ed " +
                        "WHERE YEAR(e.date) = :year AND e.userId = :userId " +
                        "AND (:flowType IS NULL OR " +
                        "    (:flowType = 'inflow' AND ed.amount > 0) OR " +
                        "    (:flowType = 'outflow' AND ed.amount < 0)) " +
                        "AND (:type IS NULL OR ed.type = :type) " +
                        "GROUP BY ed.paymentMethod")
        List<Object[]> findPaymentMethodDistributionByUserIdWithFilters(
                        @Param("year") int year,
                        @Param("userId") Integer userId,
                        @Param("flowType") String flowType,
                        @Param("type") String type);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE YEAR(e.date) = :year AND e.userId = :userId")
        List<Expense> findByYearAndUser(@Param("year") int year, @Param("userId") int userId);

        // Fixed N+1: Added JOIN FETCH for expense details
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense ed " +
                        "WHERE YEAR(e.date) = :year AND e.userId = :userId " +
                        "AND ed.paymentMethod != 'creditPaid' AND ed.type = 'loss'")
        List<Expense> findExpensesWithDetailsByUserIdAndYear(
                        @Param("year") int year, @Param("userId") Integer userId);

        // Batch fetch for a user with join fetch to eliminate N+1 when converting to
        // DTO
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "100"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT e FROM Expense e JOIN FETCH e.expense WHERE e.userId = :userId AND e.id IN :expenseIds")
        List<Expense> findAllByUserIdAndIdIn(@Param("userId") Integer userId,
                        @Param("expenseIds") Set<Integer> expenseIds);
}
