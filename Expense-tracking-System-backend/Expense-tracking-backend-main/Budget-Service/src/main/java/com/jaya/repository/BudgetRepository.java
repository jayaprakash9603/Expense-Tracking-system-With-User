package com.jaya.repository;

import com.jaya.dto.BudgetSearchDTO;
import com.jaya.models.Budget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.QueryHint;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, Integer> {

        // ============================================================
        // OPTIMIZED QUERIES WITH QUERY HINTS FOR PERFORMANCE
        // ============================================================

        /**
         * Find budgets by user ID - Optimized with query hints for batch fetching
         * Uses READ_ONLY hint for better performance when data won't be modified
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId ORDER BY b.startDate DESC")
        List<Budget> findByUserId(@Param("userId") Integer userId);

        /**
         * Find budget by user ID and budget ID - Single result query optimized
         * READ-ONLY version for queries where data won't be modified
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.id = :budgetId")
        Optional<Budget> findByUserIdAndIdReadOnly(@Param("userId") Integer userId,
                        @Param("budgetId") Integer budgetId);

        /**
         * Find budget by user ID and budget ID - For updates (no READ_ONLY hint)
         * Use this when you need to modify the budget
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "false")
        })
        @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.id = :budgetId")
        Optional<Budget> findByUserIdAndId(@Param("userId") Integer userId, @Param("budgetId") Integer budgetId);

        /**
         * Find budgets by user and date range - Optimized for date filtering
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId " +
                        "AND b.startDate < :startDate AND b.endDate > :endDate " +
                        "ORDER BY b.startDate DESC")
        List<Budget> findByUserIdAndStartDateBeforeAndEndDateAfter(
                        @Param("userId") Integer userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * Find budgets by user ID and start date after specified date
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId AND b.startDate > :startDate ORDER BY b.startDate ASC")
        List<Budget> findByUserIdAndStartDateAfter(@Param("userId") Integer userId,
                        @Param("startDate") LocalDate startDate);

        /**
         * Find budgets by user ID and end date before specified date
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId AND b.endDate < :endDate ORDER BY b.endDate DESC")
        List<Budget> findByUserIdAndEndDateBefore(@Param("userId") Integer userId, @Param("endDate") LocalDate endDate);

        /**
         * Find budgets by user ID with start date in range
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId " +
                        "AND b.startDate BETWEEN :startDate AND :endDate ORDER BY b.startDate ASC")
        List<Budget> findByUserIdAndStartDateBetween(
                        @Param("userId") Integer userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * Find budgets by user ID with end date in range
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId " +
                        "AND b.endDate BETWEEN :startDate AND :endDate ORDER BY b.endDate ASC")
        List<Budget> findByUserIdAndEndDateBetween(
                        @Param("userId") Integer userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * Find active budgets for a user on specific dates
         * HIGHLY OPTIMIZED - Most commonly used query in the service
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId " +
                        "AND b.startDate <= :startDate AND b.endDate >= :endDate " +
                        "ORDER BY b.startDate DESC")
        List<Budget> findByUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        @Param("userId") Integer userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * Find budgets by IDs with date constraints - Optimized batch query
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.id IN :budgetIds " +
                        "AND b.userId = :userId " +
                        "AND b.startDate <= :startDate AND b.endDate >= :endDate")
        List<Budget> findByIdInAndUserIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
                        @Param("budgetIds") ArrayList<Integer> budgetIds,
                        @Param("userId") Integer userId,
                        @Param("startDate") LocalDate startDate,
                        @Param("endDate") LocalDate endDate);

        /**
         * Find budgets active on a specific date - HIGHLY OPTIMIZED
         * This is frequently called and benefits most from optimization
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE :date BETWEEN b.startDate AND b.endDate " +
                        "AND b.userId = :userId ORDER BY b.startDate DESC")
        List<Budget> findBudgetsByDate(@Param("date") LocalDate date, @Param("userId") Integer userId);

        /**
         * Batch fetch budgets by multiple IDs - Optimized for bulk operations
         * Prevents N+1 queries when fetching multiple budgets
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "100"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.id IN :budgetIds AND b.userId = :userId")
        List<Budget> findByIdInAndUserId(@Param("budgetIds") List<Integer> budgetIds, @Param("userId") Integer userId);

        /**
         * Count budgets for a user - Optimized count query
         */
        @Query("SELECT COUNT(DISTINCT b) FROM Budget b WHERE b.userId = :userId")
        long countByUserId(@Param("userId") Integer userId);

        /**
         * Find budgets by user ID with pagination support
         * Use this for large result sets to avoid loading everything into memory
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId " +
                        "ORDER BY b.startDate DESC, b.id ASC")
        List<Budget> findByUserIdOrderByStartDateDesc(@Param("userId") Integer userId);

        /**
         * Fuzzy search budgets by name or description - supports partial matching
         * Optimized with query hints for read-only operations
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "20"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId AND " +
                        "(LOWER(b.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
                        "ORDER BY b.startDate DESC")
        List<Budget> searchBudgetsFuzzy(@Param("userId") Integer userId, @Param("query") String query);

        /**
         * Fuzzy search budgets with limit - for search service optimization
         * Uses JPQL with DTO constructor to avoid N+1 problem.
         * Note: The query parameter should already be in pattern format (e.g.,
         * "%j%c%e%")
         */
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "20"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT new com.jaya.dto.BudgetSearchDTO(b.id, b.name, b.description, b.amount, b.remainingAmount, b.startDate, b.endDate, b.userId) "
                        +
                        "FROM Budget b WHERE b.userId = :userId AND " +
                        "(LOWER(b.name) LIKE LOWER(:query) OR " +
                        "LOWER(b.description) LIKE LOWER(:query)) " +
                        "ORDER BY b.startDate DESC")
        List<BudgetSearchDTO> searchBudgetsFuzzyWithLimit(@Param("userId") Integer userId,
                        @Param("query") String query);

}