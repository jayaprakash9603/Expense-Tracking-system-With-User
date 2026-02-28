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
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId ORDER BY b.startDate DESC")
        List<Budget> findByUserId(@Param("userId") Integer userId);

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.id = :budgetId")
        Optional<Budget> findByUserIdAndIdReadOnly(@Param("userId") Integer userId,
                        @Param("budgetId") Integer budgetId);

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "false")
        })
        @Query("SELECT b FROM Budget b WHERE b.userId = :userId AND b.id = :budgetId")
        Optional<Budget> findByUserIdAndId(@Param("userId") Integer userId, @Param("budgetId") Integer budgetId);

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

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId AND b.startDate > :startDate ORDER BY b.startDate ASC")
        List<Budget> findByUserIdAndStartDateAfter(@Param("userId") Integer userId,
                        @Param("startDate") LocalDate startDate);

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId AND b.endDate < :endDate ORDER BY b.endDate DESC")
        List<Budget> findByUserIdAndEndDateBefore(@Param("userId") Integer userId, @Param("endDate") LocalDate endDate);

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

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE :date BETWEEN b.startDate AND b.endDate " +
                        "AND b.userId = :userId ORDER BY b.startDate DESC")
        List<Budget> findBudgetsByDate(@Param("date") LocalDate date, @Param("userId") Integer userId);

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "100"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.id IN :budgetIds AND b.userId = :userId")
        List<Budget> findByIdInAndUserId(@Param("budgetIds") List<Integer> budgetIds, @Param("userId") Integer userId);

        @Query("SELECT COUNT(DISTINCT b) FROM Budget b WHERE b.userId = :userId")
        long countByUserId(@Param("userId") Integer userId);

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId " +
                        "ORDER BY b.startDate DESC, b.id ASC")
        List<Budget> findByUserIdOrderByStartDateDesc(@Param("userId") Integer userId);

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "20"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        @Query("SELECT DISTINCT b FROM Budget b WHERE b.userId = :userId AND " +
                        "(LOWER(b.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
                        "LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
                        "ORDER BY b.startDate DESC")
        List<Budget> searchBudgetsFuzzy(@Param("userId") Integer userId, @Param("query") String query);

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