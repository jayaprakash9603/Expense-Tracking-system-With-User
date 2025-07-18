package com.jaya.repository;

import com.jaya.models.AuditExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditExpenseRepository extends JpaRepository<AuditExpense, Long> {

    List<AuditExpense> findByExpenseId(Integer expenseId);


    List<AuditExpense>findByUserId(Integer userId);

    @Query("SELECT a FROM AuditExpense a WHERE a.timestamp >= :fromTime")
    List<AuditExpense> findLogsFromLastFiveMinutes(@Param("fromTime") LocalDateTime fromTime);




    @Query("SELECT a FROM AuditExpense a WHERE a.timestamp >= :fromTime")
    List<AuditExpense> findLogsFromTime(@Param("fromTime") LocalDateTime fromTime);


    List<AuditExpense> findByTimestampBetween(LocalDateTime startTime, LocalDateTime endTime);


    @Query("SELECT a FROM AuditExpense a WHERE a.timestamp BETWEEN :startOfDay AND :endOfDay")
    List<AuditExpense> findLogsBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);


    @Query("SELECT a FROM AuditExpense a WHERE a.actionType = :actionType")
    List<AuditExpense> findLogsByActionType(String actionType);

    @Query("SELECT a FROM AuditExpense a WHERE a.expenseId = :expenseId AND a.actionType = :actionType")
    List<AuditExpense> findLogsByExpenseIdAndActionType(Integer expenseId, String actionType);
}
