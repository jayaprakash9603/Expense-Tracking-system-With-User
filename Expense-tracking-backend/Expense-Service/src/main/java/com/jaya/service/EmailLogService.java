package com.jaya.service;

import com.jaya.common.dto.UserDTO;
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

    public List<EmailLog> getAllEmailLogs(UserDTO UserDTO) {
        return emailLogRepository.findByUserId(UserDTO.getId());
    }

    public List<EmailLog> getLogsForCurrentMonth(UserDTO UserDTO) {
        LocalDateTime start = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = LocalDate.now().plusMonths(1).withDayOfMonth(1).atStartOfDay();
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsForLastMonth(UserDTO UserDTO) {
        LocalDateTime start = LocalDate.now().minusMonths(1).withDayOfMonth(1).atStartOfDay();
        LocalDateTime end = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsForCurrentYear(UserDTO UserDTO) {
        LocalDateTime start = LocalDate.now().withDayOfYear(1).atStartOfDay();
        LocalDateTime end = LocalDate.now().plusYears(1).withDayOfYear(1).atStartOfDay();
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsForLastYear(UserDTO UserDTO) {
        LocalDateTime start = LocalDate.now().minusYears(1).withDayOfYear(1).atStartOfDay();
        LocalDateTime end = LocalDate.now().withDayOfYear(1).atStartOfDay();
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsForCurrentWeek(UserDTO UserDTO) {
        LocalDateTime start = LocalDate.now().with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime end = start.plusWeeks(1);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsForLastWeek(UserDTO UserDTO) {
        LocalDateTime start = LocalDate.now().minusWeeks(1).with(java.time.DayOfWeek.MONDAY).atStartOfDay();
        LocalDateTime end = start.plusWeeks(1);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsForToday(UserDTO UserDTO) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsForSpecificYear(int year,UserDTO UserDTO) {
        LocalDateTime start = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime end = start.plusYears(1);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsForSpecificMonth(int year, int month,UserDTO UserDTO) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsForSpecificDay(int year, int month, int day,UserDTO UserDTO) {
        LocalDateTime start = LocalDate.of(year, month, day).atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsFromLastNMinutes(int minutes,UserDTO UserDTO) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusMinutes(minutes);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsFromLastNHours(int hours,UserDTO UserDTO) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusHours(hours);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsFromLastNDays(int days,UserDTO UserDTO) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusDays(days);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsFromLastNSeconds(int seconds,UserDTO UserDTO) {
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start = end.minusSeconds(seconds);
        return emailLogRepository.findByUserIdAndSentAtBetween(UserDTO.getId(),start, end);
    }

    public List<EmailLog> getLogsFromLast5Minutes(UserDTO UserDTO) {
        return getLogsFromLastNMinutes(5,UserDTO);
    }
}

