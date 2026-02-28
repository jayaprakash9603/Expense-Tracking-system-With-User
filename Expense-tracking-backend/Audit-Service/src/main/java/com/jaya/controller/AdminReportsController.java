package com.jaya.controller;

import com.jaya.dto.AdminReportDTO;
import com.jaya.dto.GenerateReportRequest;
import com.jaya.service.AdminReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Slf4j
public class AdminReportsController {

    private final AdminReportService reportService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String type) {

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AdminReportDTO> reportPage;

            if (type != null && !type.isEmpty() && !type.equals("all")) {
                reportPage = reportService.getReportsByType(type, pageable);
            } else {
                reportPage = reportService.getAllReports(pageable);
            }

            long totalCount = reportService.getTotalReportCount();
            long reportsThisMonth = reportService.getReportsCountSince(
                    LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0));

            Map<String, Object> response = new HashMap<>();
            response.put("content", reportPage.getContent());
            response.put("currentPage", reportPage.getNumber());
            response.put("totalItems", reportPage.getTotalElements());
            response.put("totalPages", reportPage.getTotalPages());
            response.put("size", reportPage.getSize());
            response.put("totalCount", totalCount);
            response.put("reportsThisMonth", reportsThisMonth);

            log.debug("Fetched {} reports (page {}/{})",
                    reportPage.getContent().size(), page, reportPage.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching reports: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch reports");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<Map<String, Object>> generateReport(
            @RequestBody GenerateReportRequest request,
            @RequestHeader(value = "X-User-Id", required = false) Long userId,
            @RequestHeader(value = "X-Username", required = false) String username) {

        try {
            log.info("Generate report request: type={}, format={}, dateRange={}",
                    request.getType(), request.getFormat(), request.getDateRange());

            Long effectiveUserId = userId != null ? userId : 1L;
            String effectiveUsername = username != null ? username : "admin";

            AdminReportDTO report = reportService.generateReport(request, effectiveUserId, effectiveUsername);

            Map<String, Object> response = new HashMap<>();
            response.put("report", report);
            response.put("message", "Report generation started");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Error generating report: {}", e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to generate report");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{reportId}")
    public ResponseEntity<Map<String, Object>> getReportById(@PathVariable Long reportId) {
        try {
            AdminReportDTO report = reportService.getReportById(reportId);

            Map<String, Object> response = new HashMap<>();
            response.put("report", report);

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Report not found: {}", reportId);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Report not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error fetching report {}: {}", reportId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch report");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @DeleteMapping("/{reportId}")
    public ResponseEntity<Map<String, Object>> deleteReport(@PathVariable Long reportId) {
        try {
            reportService.deleteReport(reportId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Report deleted successfully");
            response.put("reportId", reportId);

            log.info("Report {} deleted successfully", reportId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Report not found for deletion: {}", reportId);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Report not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error deleting report {}: {}", reportId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete report");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/{reportId}/download")
    public ResponseEntity<Map<String, Object>> downloadReport(@PathVariable Long reportId) {
        try {
            AdminReportDTO report = reportService.getReportById(reportId);

            if (!"COMPLETED".equals(report.getStatus())) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Report not ready");
                errorResponse.put("message", "Report is still " + report.getStatus().toLowerCase());
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Download initiated");
            response.put("reportId", reportId);
            response.put("reportName", report.getName());
            response.put("format", report.getFormat());
            response.put("size", report.getSize());

            log.info("Download requested for report {}", reportId);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Report not found for download: {}", reportId);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Report not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error downloading report {}: {}", reportId, e.getMessage(), e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to download report");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
