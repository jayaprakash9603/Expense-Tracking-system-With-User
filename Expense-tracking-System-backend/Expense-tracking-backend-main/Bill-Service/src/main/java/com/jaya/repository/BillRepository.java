package com.jaya.repository;

import com.jaya.dto.BillSearchDTO;
import com.jaya.models.Bill;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import jakarta.persistence.QueryHint;

import java.util.List;
import java.util.Optional;

public interface BillRepository extends JpaRepository<Bill, Integer> {

    List<Bill> findByUserId(Integer userId);

    Bill findByExpenseId(Integer expenseId);

    @Query("SELECT b FROM Bill b WHERE b.id = :billId AND b.userId = :userId")
    Optional<Bill> findByIdAndUserId(@Param("billId") Integer billId, @Param("userId") Integer userId);

    /**
     * Fuzzy search bills by name, description, or category - supports partial
     * matching
     * Optimized with query hints for read-only operations
     */
    @QueryHints({
            @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "20"),
            @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
    })
    @Query("SELECT DISTINCT b FROM Bill b WHERE b.userId = :userId AND " +
            "(LOWER(b.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(b.category) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY b.date DESC")
    List<Bill> searchBillsFuzzy(@Param("userId") Integer userId, @Param("query") String query);

    /**
     * Fuzzy search bills with limit - returns DTOs to avoid lazy loading
     * Note: The query parameter should already be in pattern format (e.g.,
     * "%j%c%e%")
     */
    @Query("SELECT new com.jaya.dto.BillSearchDTO(b.id, b.name, b.description, b.amount, b.paymentMethod, " +
            "b.type, b.date, b.netAmount, b.category, b.categoryId, b.userId) " +
            "FROM Bill b WHERE b.userId = :userId AND " +
            "(LOWER(b.name) LIKE LOWER(:query) OR " +
            "LOWER(b.description) LIKE LOWER(:query) OR " +
            "LOWER(b.category) LIKE LOWER(:query)) " +
            "ORDER BY b.date DESC")
    List<BillSearchDTO> searchBillsFuzzyWithLimit(@Param("userId") Integer userId,
            @Param("query") String query);

}
