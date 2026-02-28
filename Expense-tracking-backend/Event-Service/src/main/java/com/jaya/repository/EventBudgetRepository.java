package com.jaya.repository;

import com.jaya.model.EventBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventBudgetRepository extends JpaRepository<EventBudget, Integer> {

    List<EventBudget> findByEventIdAndUserId(Integer eventId, Integer userId);

    Optional<EventBudget> findByEventIdAndCategory(Integer eventId, String category);

    @Query("SELECT SUM(eb.allocatedAmount) FROM EventBudget eb WHERE eb.event.id = :eventId")
    BigDecimal getTotalBudgetByEventId(@Param("eventId") Integer eventId);

    @Query("SELECT SUM(eb.spentAmount) FROM EventBudget eb WHERE eb.event.id = :eventId")
    BigDecimal getTotalSpentByEventId(@Param("eventId") Integer eventId);
}