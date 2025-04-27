package com.jaya.service;

import com.jaya.models.AuditExpense;
import com.jaya.models.User;
import com.jaya.repository.AuditExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;

@Service
public class AuditExpenseService {

    @Autowired
    private AuditExpenseRepository auditExpenseRepository;

    // Method to log an audit entry when an expense is created, updated, or deleted
    public void logAudit(User user, Integer expenseId, String actionType, String details) {
        AuditExpense auditExpense = new AuditExpense();
        auditExpense.setUser(user);
        auditExpense.setExpenseId(expenseId);  // Set expenseId as Integer
        auditExpense.setActionType(actionType);  // Action could be "create", "update", or "delete"
        auditExpense.setDetails(details);
        auditExpense.setTimestamp(LocalDateTime.now());  // Capture the timestamp of the action

        auditExpenseRepository.save(auditExpense);  // Save the log to the database
    }

    // Method to retrieve audit logs for a specific expense ID
    public List<AuditExpense> getAuditLogsForExpense(Integer expenseId) {
        // Fetch the audit logs by expense ID
        return auditExpenseRepository.findByExpenseId(expenseId);  // Use Integer for expenseId
    }

    public List<AuditExpense> getAllAuditLogs(User user) {
        List<AuditExpense> auditExpenses = auditExpenseRepository.findByUserId(user.getId());
        List<AuditExpense> createdExpenses = new ArrayList<>();

        for (int i = 0; i < auditExpenses.size(); i++) {
            AuditExpense auditExpense = auditExpenses.get(i);
            AuditExpense newExpense = new AuditExpense();

            // Don't set the ID – let it auto-generate
            newExpense.setId(auditExpense.getId());
            newExpense.setExpenseId(auditExpense.getExpenseId());
            newExpense.setActionType(auditExpense.getActionType());
            newExpense.setDetails(auditExpense.getDetails());
            newExpense.setTimestamp(auditExpense.getTimestamp());
            newExpense.setUser(auditExpense.getUser());

            // This is your per-user audit log index
            newExpense.setUserAuditIndex(i + 1);
            newExpense.setExpenseAuditIndex(i+1);
            createdExpenses.add(newExpense);
        }

        return createdExpenses;
    }


    public List<AuditExpense> getLogsFromLastFiveMinutes() {
        LocalDateTime fiveMinutesAgo = LocalDateTime.now().minusMinutes(5);
        return auditExpenseRepository.findLogsFromLastFiveMinutes(fiveMinutesAgo);
    }
    
    public List<AuditExpense> getLogsFromLastNMinutes(int minutes) {
        LocalDateTime fromTime = LocalDateTime.now().minusMinutes(minutes);
        return auditExpenseRepository.findLogsFromTime(fromTime);
    }
    
    public List<AuditExpense> getLogsFromLastNHours(int hours) {
        LocalDateTime fromTime = LocalDateTime.now().minusHours(hours);
        return auditExpenseRepository.findLogsFromTime(fromTime);
    }
    
    public List<AuditExpense> getLogsFromLastNDays(int days) {
        LocalDateTime fromTime = LocalDateTime.now().minusDays(days);
        return auditExpenseRepository.findLogsFromTime(fromTime);
    }
    
    
    public List<AuditExpense> getLogsFromLastNSeconds(int seconds) {
        LocalDateTime fromTime = LocalDateTime.now().minusSeconds(seconds);
        return auditExpenseRepository.findLogsFromTime(fromTime);
    }
    
    public List<AuditExpense> getLogsForSpecificDay(LocalDate date) {
        // Convert LocalDate to LocalDateTime (start of the day and end of the day)
        LocalDateTime startOfDay = date.atStartOfDay();  // Midnight of the given date
        LocalDateTime endOfDay = date.atTime(23, 59, 59); // 23:59:59 of the given date

        return auditExpenseRepository.findLogsBetween(startOfDay, endOfDay);
    }
    
    public List<AuditExpense> getLogsByActionType(String actionType) {
        return auditExpenseRepository.findLogsByActionType(actionType);
    }
    
    public List<AuditExpense> getLogsByExpenseIdAndActionType(Integer expenseId, String actionType) {
        return auditExpenseRepository.findLogsByExpenseIdAndActionType(expenseId, actionType);
    }
    

    public List<AuditExpense> getLogsForToday() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfDay, endOfDay);
    }
    

    public List<AuditExpense> getLogsForYesterday() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        LocalDateTime startOfDay = yesterday.atStartOfDay();
        LocalDateTime endOfDay = yesterday.atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfDay, endOfDay);
    }
    
    

    public List<AuditExpense> getLogsForCurrentMonth() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfMonth = today.withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth = today.with(TemporalAdjusters.lastDayOfMonth()).atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfMonth, endOfMonth);
    }

    public List<AuditExpense> getLogsForLastMonth() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfLastMonth = today.minusMonths(1).withDayOfMonth(1);
        LocalDate lastDayOfLastMonth = today.minusMonths(1).with(TemporalAdjusters.lastDayOfMonth());
        LocalDateTime startOfLastMonth = firstDayOfLastMonth.atStartOfDay();
        LocalDateTime endOfLastMonth = lastDayOfLastMonth.atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfLastMonth, endOfLastMonth);
    }

    public List<AuditExpense> getLogsForCurrentWeek() {
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate endOfWeek = today.with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));
        LocalDateTime startOfWeekTime = startOfWeek.atStartOfDay();
        LocalDateTime endOfWeekTime = endOfWeek.atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfWeekTime, endOfWeekTime);
    }

    public List<AuditExpense> getLogsForLastWeek() {
        LocalDate today = LocalDate.now();
        LocalDate startOfLastWeek = today.minusWeeks(1).with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        LocalDate endOfLastWeek = today.minusWeeks(1).with(TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY));
        LocalDateTime startOfLastWeekTime = startOfLastWeek.atStartOfDay();
        LocalDateTime endOfLastWeekTime = endOfLastWeek.atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfLastWeekTime, endOfLastWeekTime);
    }

    public List<AuditExpense> getLogsForCurrentYear() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfYear = today.withDayOfYear(1).atStartOfDay();
        LocalDateTime endOfYear = today.with(TemporalAdjusters.lastDayOfYear()).atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfYear, endOfYear);
    }

    public List<AuditExpense> getLogsForLastYear() {
        LocalDate today = LocalDate.now();
        LocalDate firstDayOfLastYear = today.minusYears(1).withDayOfYear(1);
        LocalDate lastDayOfLastYear = today.minusYears(1).with(TemporalAdjusters.lastDayOfYear());
        LocalDateTime startOfLastYear = firstDayOfLastYear.atStartOfDay();
        LocalDateTime endOfLastYear = lastDayOfLastYear.atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfLastYear, endOfLastYear);
    }

    public List<AuditExpense> getLogsForYear(int year) {
        LocalDate firstDayOfYear = LocalDate.of(year, 1, 1);
        LocalDate lastDayOfYear = LocalDate.of(year, 12, 31);
        LocalDateTime startOfYear = firstDayOfYear.atStartOfDay();
        LocalDateTime endOfYear = lastDayOfYear.atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfYear, endOfYear);
    }
    
    public List<AuditExpense> getLogsForMonth(int year, int month) {
        LocalDate startOfMonth = LocalDate.of(year, month, 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
        LocalDateTime startOfMonthTime = startOfMonth.atStartOfDay();
        LocalDateTime endOfMonthTime = endOfMonth.atTime(LocalTime.MAX);
        return auditExpenseRepository.findByTimestampBetween(startOfMonthTime, endOfMonthTime);
    }
    
    
}
