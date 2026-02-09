package com.jaya.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.User;
import com.jaya.models.ReportHistory;
import com.jaya.repository.ReportHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReportHistoryService {

    private static final Logger logger = LoggerFactory.getLogger(ReportHistoryService.class);

    @Autowired
    private ReportHistoryRepository reportHistoryRepository;

    @Autowired
    private ObjectMapper objectMapper;

    


    @Transactional
    public ReportHistory logReportSuccess(User user, String reportName, String reportType,
            String description, String recipientEmail,
            Integer expenseCount, String fileName,
            Map<String, Object> filters) {
        ReportHistory history = new ReportHistory();
        history.setUserId(user.getId());
        history.setUserEmail(user.getEmail());
        history.setReportName(reportName);
        history.setReportType(reportType);
        history.setDescription(description);
        history.setRecipientEmail(recipientEmail);
        history.setStatus("SUCCESS");
        history.setExpenseCount(expenseCount);
        history.setFileName(fileName);
        history.setDate(LocalDateTime.now());

        
        if (filters != null && !filters.isEmpty()) {
            try {
                history.setFilterCriteria(objectMapper.writeValueAsString(filters));
            } catch (JsonProcessingException e) {
                logger.error("Error converting filters to JSON: {}", e.getMessage());
                history.setFilterCriteria(filters.toString());
            }
        }

        ReportHistory saved = reportHistoryRepository.save(history);
        logger.info("Report history logged successfully - ID: {}, Type: {}, User: {}",
                saved.getId(), reportType, user.getEmail());
        return saved;
    }

    


    @Transactional
    public ReportHistory logReportFailure(User user, String reportName, String reportType,
            String description, String recipientEmail,
            String errorMessage, Map<String, Object> filters) {
        ReportHistory history = new ReportHistory();
        history.setUserId(user.getId());
        history.setUserEmail(user.getEmail());
        history.setReportName(reportName);
        history.setReportType(reportType);
        history.setDescription(description);
        history.setRecipientEmail(recipientEmail);
        history.setStatus("FAILED");
        history.setErrorMessage(errorMessage);
        history.setDate(LocalDateTime.now());

        
        if (filters != null && !filters.isEmpty()) {
            try {
                history.setFilterCriteria(objectMapper.writeValueAsString(filters));
            } catch (JsonProcessingException e) {
                logger.error("Error converting filters to JSON: {}", e.getMessage());
                history.setFilterCriteria(filters.toString());
            }
        }

        ReportHistory saved = reportHistoryRepository.save(history);
        logger.error("Report generation failed - ID: {}, Type: {}, User: {}, Error: {}",
                saved.getId(), reportType, user.getEmail(), errorMessage);
        return saved;
    }

    


    public List<ReportHistory> getReportHistoryByUser(User user) {
        List<ReportHistory> reports = reportHistoryRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        
        reports.forEach(report -> report.setUserEmail(user.getEmail()));
        return reports;
    }

    


    public List<ReportHistory> getReportHistoryByStatus(User user, String status) {
        List<ReportHistory> reports = reportHistoryRepository.findByUserIdAndStatusOrderByCreatedAtDesc(user.getId(),
                status);
        
        reports.forEach(report -> report.setUserEmail(user.getEmail()));
        return reports;
    }

    


    public List<ReportHistory> getRecentReportHistory(User user) {
        List<ReportHistory> reports = reportHistoryRepository.findTop10ByUserIdOrderByCreatedAtDesc(user.getId());
        
        reports.forEach(report -> report.setUserEmail(user.getEmail()));
        return reports;
    }

    


    public List<ReportHistory> getReportHistoryByDateRange(User user, LocalDateTime startDate, LocalDateTime endDate) {
        List<ReportHistory> reports = reportHistoryRepository.findByUserIdAndDateRange(user.getId(), startDate,
                endDate);
        
        reports.forEach(report -> report.setUserEmail(user.getEmail()));
        return reports;
    }

    


    public Map<String, Object> getReportStatistics(User user) {
        Map<String, Object> stats = new HashMap<>();

        long successCount = reportHistoryRepository.countByUserIdAndStatus(user.getId(), "SUCCESS");
        long failedCount = reportHistoryRepository.countByUserIdAndStatus(user.getId(), "FAILED");
        long totalCount = successCount + failedCount;

        stats.put("totalReports", totalCount);
        stats.put("successfulReports", successCount);
        stats.put("failedReports", failedCount);

        if (totalCount > 0) {
            double successRate = (double) successCount / totalCount * 100;
            stats.put("successRate", String.format("%.2f%%", successRate));
        } else {
            stats.put("successRate", "0%");
        }

        return stats;
    }

    


    public Map<String, Object> createFilterMap(String... keyValuePairs) {
        Map<String, Object> filters = new HashMap<>();
        for (int i = 0; i < keyValuePairs.length - 1; i += 2) {
            if (keyValuePairs[i + 1] != null && !keyValuePairs[i + 1].isEmpty()) {
                filters.put(keyValuePairs[i], keyValuePairs[i + 1]);
            }
        }
        return filters;
    }
}
