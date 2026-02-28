package com.jaya.repository;

import com.jaya.model.EventExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface EventExpenseRepository extends JpaRepository<EventExpense, Integer> {

    List<EventExpense> findByEventIdAndUserId(Integer eventId, Integer userId);

    List<EventExpense> findByEventIdAndCategory(Integer eventId, String category);

    List<EventExpense> findByEventIdAndExpenseDateBetween(Integer eventId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(ee.amount) FROM EventExpense ee WHERE ee.event.id = :eventId")
    BigDecimal getTotalExpensesByEventId(@Param("eventId") Integer eventId);

    @Query("SELECT SUM(ee.amount) FROM EventExpense ee WHERE ee.event.id = :eventId AND ee.category = :category")
    BigDecimal getTotalExpensesByEventIdAndCategory(@Param("eventId") Integer eventId, @Param("category") String category);

    @Query("SELECT ee.category, SUM(ee.amount) FROM EventExpense ee WHERE ee.event.id = :eventId GROUP BY ee.category")
    List<Object[]> getCategoryWiseExpenses(@Param("eventId") Integer eventId);
}