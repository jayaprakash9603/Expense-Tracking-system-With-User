package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.AdminReportDTO;
import com.jaya.dto.GenerateReportRequest;
import com.jaya.service.AdminReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static com.jaya.testutil.AuditTestDataFactory.*;
import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class AdminReportsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminReportService reportService;

    @MockBean
    private JavaMailSender javaMailSender;

    private AdminReportDTO testReportDTO;

    @BeforeEach
    void setUp() {
        testReportDTO = buildAdminReportDTO();
    }

    // ─── GET /api/admin/reports ─────────────────────────────────────

    @Nested
    @DisplayName("GET /api/admin/reports")
    class GetAllReportsTests {

        @Test
        @DisplayName("should return all reports without type filter")
        void shouldReturnAllReports() throws Exception {
            Page<AdminReportDTO> page = new PageImpl<>(
                    List.of(testReportDTO), PageRequest.of(0, 20), 1);
            when(reportService.getAllReports(any())).thenReturn(page);
            when(reportService.getTotalReportCount()).thenReturn(5L);
            when(reportService.getReportsCountSince(any())).thenReturn(2L);

            mockMvc.perform(get("/api/admin/reports"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)))
                    .andExpect(jsonPath("$.currentPage").value(0))
                    .andExpect(jsonPath("$.totalItems").value(1))
                    .andExpect(jsonPath("$.totalPages").value(1))
                    .andExpect(jsonPath("$.totalCount").value(5))
                    .andExpect(jsonPath("$.reportsThisMonth").value(2));
        }

        @Test
        @DisplayName("should filter reports by type")
        void shouldFilterByType() throws Exception {
            Page<AdminReportDTO> page = new PageImpl<>(
                    List.of(testReportDTO), PageRequest.of(0, 20), 1);
            when(reportService.getReportsByType(eq("expense-summary"), any())).thenReturn(page);
            when(reportService.getTotalReportCount()).thenReturn(5L);
            when(reportService.getReportsCountSince(any())).thenReturn(1L);

            mockMvc.perform(get("/api/admin/reports")
                            .param("type", "expense-summary"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(1)));
        }

        @Test
        @DisplayName("should treat type=all as no filter")
        void shouldTreatTypeAllAsNoFilter() throws Exception {
            Page<AdminReportDTO> page = new PageImpl<>(List.of(), PageRequest.of(0, 20), 0);
            when(reportService.getAllReports(any())).thenReturn(page);
            when(reportService.getTotalReportCount()).thenReturn(0L);
            when(reportService.getReportsCountSince(any())).thenReturn(0L);

            mockMvc.perform(get("/api/admin/reports")
                            .param("type", "all"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.content", hasSize(0)));

            verify(reportService).getAllReports(any());
            verify(reportService, never()).getReportsByType(any(), any());
        }

        @Test
        @DisplayName("should return 500 on service error")
        void shouldReturn500OnError() throws Exception {
            when(reportService.getAllReports(any())).thenThrow(new RuntimeException("DB error"));

            mockMvc.perform(get("/api/admin/reports"))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.error").value("Failed to fetch reports"));
        }
    }

    // ─── POST /api/admin/reports/generate ───────────────────────────

    @Nested
    @DisplayName("POST /api/admin/reports/generate")
    class GenerateReportTests {

        @Test
        @DisplayName("should generate report with custom headers")
        void shouldGenerateReportWithHeaders() throws Exception {
            GenerateReportRequest request = buildGenerateReportRequest();
            when(reportService.generateReport(any(), eq(42L), eq("testadmin")))
                    .thenReturn(testReportDTO);

            mockMvc.perform(post("/api/admin/reports/generate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request))
                            .header("X-User-Id", 42L)
                            .header("X-Username", "testadmin"))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.report").exists())
                    .andExpect(jsonPath("$.message").value("Report generation started"));
        }

        @Test
        @DisplayName("should use defaults when headers absent")
        void shouldUseDefaultsWhenHeadersAbsent() throws Exception {
            GenerateReportRequest request = buildGenerateReportRequest();
            when(reportService.generateReport(any(), eq(1L), eq("admin")))
                    .thenReturn(testReportDTO);

            mockMvc.perform(post("/api/admin/reports/generate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.report").exists());
        }

        @Test
        @DisplayName("should return 500 on service error")
        void shouldReturn500OnError() throws Exception {
            GenerateReportRequest request = buildGenerateReportRequest();
            when(reportService.generateReport(any(), any(), any()))
                    .thenThrow(new RuntimeException("Generation failed"));

            mockMvc.perform(post("/api/admin/reports/generate")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.error").value("Failed to generate report"));
        }
    }

    // ─── GET /api/admin/reports/{reportId} ──────────────────────────

    @Nested
    @DisplayName("GET /api/admin/reports/{reportId}")
    class GetReportByIdTests {

        @Test
        @DisplayName("should return report when found")
        void shouldReturnReport() throws Exception {
            when(reportService.getReportById(1L)).thenReturn(testReportDTO);

            mockMvc.perform(get("/api/admin/reports/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.report").exists());
        }

        @Test
        @DisplayName("should return 404 when not found")
        void shouldReturn404WhenNotFound() throws Exception {
            when(reportService.getReportById(999L))
                    .thenThrow(new RuntimeException("Report not found"));

            mockMvc.perform(get("/api/admin/reports/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("Report not found"));
        }
    }

    // ─── DELETE /api/admin/reports/{reportId} ───────────────────────

    @Nested
    @DisplayName("DELETE /api/admin/reports/{reportId}")
    class DeleteReportTests {

        @Test
        @DisplayName("should delete report successfully")
        void shouldDeleteReport() throws Exception {
            doNothing().when(reportService).deleteReport(1L);

            mockMvc.perform(delete("/api/admin/reports/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Report deleted successfully"))
                    .andExpect(jsonPath("$.reportId").value(1));
        }

        @Test
        @DisplayName("should return 404 when report not found")
        void shouldReturn404WhenNotFound() throws Exception {
            doThrow(new RuntimeException("Report not found")).when(reportService).deleteReport(999L);

            mockMvc.perform(delete("/api/admin/reports/999"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("Report not found"));
        }
    }

    // ─── GET /api/admin/reports/{reportId}/download ─────────────────

    @Nested
    @DisplayName("GET /api/admin/reports/{reportId}/download")
    class DownloadReportTests {

        @Test
        @DisplayName("should download completed report")
        void shouldDownloadCompletedReport() throws Exception {
            AdminReportDTO completedReport = buildAdminReportDTO();
            completedReport.setStatus("COMPLETED");
            completedReport.setName("Expense Summary");
            completedReport.setFormat("PDF");
            completedReport.setSize("2.5 MB");
            when(reportService.getReportById(1L)).thenReturn(completedReport);

            mockMvc.perform(get("/api/admin/reports/1/download"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("Download initiated"))
                    .andExpect(jsonPath("$.reportId").value(1))
                    .andExpect(jsonPath("$.reportName").value("Expense Summary"))
                    .andExpect(jsonPath("$.format").value("PDF"))
                    .andExpect(jsonPath("$.size").value("2.5 MB"));
        }

        @Test
        @DisplayName("should return 400 when report not completed")
        void shouldReturn400WhenNotCompleted() throws Exception {
            AdminReportDTO pendingReport = buildAdminReportDTO();
            pendingReport.setStatus("PENDING");
            when(reportService.getReportById(1L)).thenReturn(pendingReport);

            mockMvc.perform(get("/api/admin/reports/1/download"))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.error").value("Report not ready"))
                    .andExpect(jsonPath("$.message").value("Report is still pending"));
        }

        @Test
        @DisplayName("should return 404 when report not found")
        void shouldReturn404WhenNotFound() throws Exception {
            when(reportService.getReportById(999L))
                    .thenThrow(new RuntimeException("Report not found"));

            mockMvc.perform(get("/api/admin/reports/999/download"))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.error").value("Report not found"));
        }
    }
}
