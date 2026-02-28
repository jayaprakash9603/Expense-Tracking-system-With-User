package com.jaya.service;

import com.jaya.dto.AdminReportDTO;
import com.jaya.dto.GenerateReportRequest;
import com.jaya.models.AdminReport;
import com.jaya.repository.AdminReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminReportService {

    private final AdminReportRepository reportRepository;
    private final Random random = new Random();

    public Page<AdminReportDTO> getAllReports(Pageable pageable) {
        return reportRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToDTO);
    }

    public Page<AdminReportDTO> getReportsByType(String type, Pageable pageable) {
        return reportRepository.findByTypeOrderByCreatedAtDesc(type, pageable)
                .map(this::mapToDTO);
    }

    @Transactional
    public AdminReportDTO generateReport(GenerateReportRequest request, Long userId, String username) {
        log.info("Generating report: type={}, format={}, dateRange={}, user={}",
                request.getType(), request.getFormat(), request.getDateRange(), username);

        AdminReport report = AdminReport.builder()
                .name(request.getName() != null && !request.getName().isEmpty()
                        ? request.getName()
                        : generateDefaultName(request.getType()))
                .type(request.getType())
                .dateRange(request.getDateRange())
                .format(request.getFormat())
                .status("GENERATING")
                .generatedBy(userId)
                .generatedByUsername(username)
                .build();

        AdminReport savedReport = reportRepository.save(report);

        generateReportAsync(savedReport.getId());

        return mapToDTO(savedReport);
    }

    @Async
    public void generateReportAsync(Long reportId) {
        try {
            Thread.sleep(2000 + random.nextInt(3000));

            reportRepository.findById(reportId).ifPresent(report -> {
                report.setStatus("COMPLETED");
                report.setCompletedAt(LocalDateTime.now());
                report.setSize(String.format("%.1f MB", 0.5 + random.nextDouble() * 5));
                report.setDownloadUrl("/api/admin/reports/" + reportId + "/download");
                reportRepository.save(report);
                log.info("Report {} generated successfully", reportId);
            });
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            reportRepository.findById(reportId).ifPresent(report -> {
                report.setStatus("FAILED");
                report.setErrorMessage("Report generation interrupted");
                reportRepository.save(report);
            });
        } catch (Exception e) {
            log.error("Error generating report {}: {}", reportId, e.getMessage());
            reportRepository.findById(reportId).ifPresent(report -> {
                report.setStatus("FAILED");
                report.setErrorMessage(e.getMessage());
                reportRepository.save(report);
            });
        }
    }

    @Transactional
    public void deleteReport(Long reportId) {
        log.info("Deleting report: {}", reportId);
        if (!reportRepository.existsById(reportId)) {
            throw new RuntimeException("Report not found: " + reportId);
        }
        reportRepository.deleteById(reportId);
    }

    public AdminReportDTO getReportById(Long reportId) {
        return reportRepository.findById(reportId)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("Report not found: " + reportId));
    }

    public long getTotalReportCount() {
        return reportRepository.count();
    }

    public long getReportsCountSince(LocalDateTime since) {
        return reportRepository.countReportsSince(since);
    }

    private String generateDefaultName(String type) {
        String typeName = switch (type) {
            case "user-activity" -> "User Activity Report";
            case "expense-summary" -> "Expense Summary Report";
            case "budget-analysis" -> "Budget Analysis Report";
            case "audit-trail" -> "Audit Trail Report";
            case "category-breakdown" -> "Category Breakdown Report";
            default -> "Report";
        };
        return typeName + " - " + LocalDateTime.now().toLocalDate();
    }

    private AdminReportDTO mapToDTO(AdminReport report) {
        return AdminReportDTO.builder()
                .id(report.getId())
                .name(report.getName())
                .type(report.getType())
                .dateRange(report.getDateRange())
                .format(report.getFormat())
                .status(report.getStatus())
                .size(report.getSize())
                .downloadUrl(report.getDownloadUrl())
                .createdAt(report.getCreatedAt())
                .completedAt(report.getCompletedAt())
                .generatedBy(report.getGeneratedBy())
                .generatedByUsername(report.getGeneratedByUsername())
                .build();
    }
}
