package com.jaya.service;

import com.jaya.dto.User;
import com.jaya.models.EmailLog;
import com.jaya.repository.EmailLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class EmailLogService {

    @Autowired
    private EmailLogRepository emailLogRepository;

    public List<EmailLog> getAllEmailLogs(User user) {
        return emailLogRepository.findByUser(user);
    }

    public List<EmailLog> getLogsForCurrentMonth(User user) {
        LocalDateTime start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = LocalDate.now().plusMonths(1).withDayOfMonth(1).atStartOfDay();
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsForLastMonth(User user) {
        LocalDateTime start = LocalDate.now().minusMonths(1).withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsForCurrentYear(User user) {
        LocalDateTime start = LocalDate.now().withDayOfYear(1).atStartOfDay();
        LocalDateTime end = LocalDate.now().plusYears(1).withDayOfYear(1).atStartOfDay();
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsForLastYear(User user) {
        LocalDateTime start = LocalDate.now().minusYears(1).withDayOfYear(1).atStartOfDay();
        LocalDateTime end = LocalDate.now().withDayOfYear(1).atStartOfDay();
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsForCurrentWeek(User user) {
        LocalDateTime start = LocalDate.now().with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime end = start.plusWeeks(1);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsForLastWeek(User user) {
        LocalDateTime start = LocalDate.now().minusWeeks(1).with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime end = start.plusWeeks(1);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsForToday(User user) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsForSpecificYear(int year,User user) {
        LocalDateTime start = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime end = start.plusYears(1);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsForSpecificMonth(int year, int month,User user) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsForSpecificDay(int year, int month, int day,User user) {
        LocalDateTime start = LocalDate.of(year, month, day).atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsFromLastNMinutes(int minutes,User user) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusMinutes(minutes);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsFromLastNHours(int hours,User user) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusHours(hours);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsFromLastNDays(int days,User user) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(days);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsFromLastNSeconds(int seconds,User user) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusSeconds(seconds);
        return emailLogRepository.findByUserAndSentAtBetween(user,start, end);
    }

    public List<EmailLog> getLogsFromLast5Minutes(User user) {
        return getLogsFromLastNMinutes(5,user);
    }
}