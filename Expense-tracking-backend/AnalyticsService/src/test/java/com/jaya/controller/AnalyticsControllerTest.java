package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.dto.*;
import com.jaya.dto.report.VisualReportRequest;
import com.jaya.service.AnalyticsEntityService;
import com.jaya.service.AnalyticsOverviewService;
import com.jaya.service.VisualReportService;
import com.jaya.testutil.TestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsControllerTest {

    @Mock private AnalyticsOverviewService analyticsOverviewService;
    @Mock private AnalyticsEntityService analyticsEntityService;
    @Mock private VisualReportService visualReportService;

    @InjectMocks
    private AnalyticsController analyticsController;

    private static final String JWT = TestDataFactory.TEST_JWT;

    // ─── getApplicationOverview Tests ───────────────────────────────

    @Nested
    @DisplayName("GET /api/analytics/overview")
    class GetOverviewTests {

        @Test
        @DisplayName("should return overview DTO with 200 OK")
        void shouldReturnOverview() {
            ApplicationOverviewDTO dto = new ApplicationOverviewDTO();
            dto.setTotalExpenses(5000.0);
            dto.setFriendsCount(12);
            when(analyticsOverviewService.getOverview(JWT, 1)).thenReturn(dto);

            ResponseEntity<ApplicationOverviewDTO> response =
                    analyticsController.getApplicationOverview(JWT, 1);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isNotNull();
            assertThat(response.getBody().getTotalExpenses()).isEqualTo(5000.0);
        }

        @Test
        @DisplayName("should pass null targetId when not provided")
        void shouldPassNullTargetId() {
            ApplicationOverviewDTO dto = new ApplicationOverviewDTO();
            when(analyticsOverviewService.getOverview(JWT, null)).thenReturn(dto);

            ResponseEntity<ApplicationOverviewDTO> response =
                    analyticsController.getApplicationOverview(JWT, null);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            verify(analyticsOverviewService).getOverview(JWT, null);
        }
    }

    // ─── getEntityAnalytics Tests ───────────────────────────────────

    @Nested
    @DisplayName("POST /api/analytics/entity")
    class GetEntityAnalyticsTests {

        @Test
        @DisplayName("should normalize request and return analytics DTO")
        void shouldNormalizeAndReturnAnalytics() {
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .build();

            CategoryAnalyticsDTO expected = CategoryAnalyticsDTO.builder().build();
            when(analyticsEntityService.getAnalytics(eq(JWT), any(AnalyticsRequestDTO.class)))
                    .thenReturn(expected);

            ResponseEntity<CategoryAnalyticsDTO> response =
                    analyticsController.getEntityAnalytics(JWT, request);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getBody()).isSameAs(expected);
        }

        @Test
        @DisplayName("should apply default dates when not provided in request")
        void shouldApplyDefaultDates() {
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .build();

            when(analyticsEntityService.getAnalytics(eq(JWT), any(AnalyticsRequestDTO.class)))
                    .thenReturn(CategoryAnalyticsDTO.builder().build());

            analyticsController.getEntityAnalytics(JWT, request);

            verify(analyticsEntityService).getAnalytics(eq(JWT), argThat(req ->
                    req.getEndDate().equals(LocalDate.now()) &&
                    req.getStartDate().equals(LocalDate.now().minusMonths(6)) &&
                    req.getTrendType().equals("MONTHLY")
            ));
        }

        @Test
        @DisplayName("should preserve provided dates in request")
        void shouldPreserveProvidedDates() {
            LocalDate start = LocalDate.of(2024, 1, 1);
            LocalDate end = LocalDate.of(2024, 6, 30);
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .startDate(start)
                    .endDate(end)
                    .trendType("WEEKLY")
                    .build();

            when(analyticsEntityService.getAnalytics(eq(JWT), any(AnalyticsRequestDTO.class)))
                    .thenReturn(CategoryAnalyticsDTO.builder().build());

            analyticsController.getEntityAnalytics(JWT, request);

            verify(analyticsEntityService).getAnalytics(eq(JWT), argThat(req ->
                    req.getStartDate().equals(start) &&
                    req.getEndDate().equals(end) &&
                    req.getTrendType().equals("WEEKLY")
            ));
        }
    }

    // ─── downloadVisualReport Tests ─────────────────────────────────

    @Nested
    @DisplayName("GET /api/analytics/report/excel")
    class DownloadReportTests {

        @Test
        @DisplayName("should return Excel file with proper headers")
        void shouldReturnExcelFile() throws IOException {
            ByteArrayInputStream stream = new ByteArrayInputStream(new byte[]{1, 2, 3});
            when(visualReportService.generateVisualReport(eq(JWT), any(VisualReportRequest.class)))
                    .thenReturn(stream);

            ResponseEntity<InputStreamResource> response = analyticsController.downloadVisualReport(
                    JWT, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 3, 31),
                    null, null, false, "COMPREHENSIVE",
                    true, true, true, 1);

            assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
            assertThat(response.getHeaders().getContentDisposition().toString())
                    .contains("attachment");
            assertThat(response.getHeaders().getContentType().toString())
                    .contains("spreadsheetml");
        }

        @Test
        @DisplayName("should use allTime date range when allTime=true")
        void shouldUseAllTimeDateRange() throws IOException {
            when(visualReportService.generateVisualReport(eq(JWT), any(VisualReportRequest.class)))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            analyticsController.downloadVisualReport(
                    JWT, null, null, null, null, true, "COMPREHENSIVE",
                    true, true, true, 1);

            verify(visualReportService).generateVisualReport(eq(JWT), argThat(req ->
                    req.getStartDate().equals(LocalDate.of(2000, 1, 1)) &&
                    req.getEndDate().equals(LocalDate.now())
            ));
        }

        @Test
        @DisplayName("should use year/month when provided")
        void shouldUseYearMonth() throws IOException {
            when(visualReportService.generateVisualReport(eq(JWT), any(VisualReportRequest.class)))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            analyticsController.downloadVisualReport(
                    JWT, null, null, 2024, 3, false, "COMPREHENSIVE",
                    true, true, true, null);

            verify(visualReportService).generateVisualReport(eq(JWT), argThat(req ->
                    req.getStartDate().equals(LocalDate.of(2024, 3, 1)) &&
                    req.getEndDate().equals(LocalDate.of(2024, 3, 31))
            ));
        }

        @Test
        @DisplayName("should default date range when no params provided")
        void shouldDefaultDateRange() throws IOException {
            when(visualReportService.generateVisualReport(eq(JWT), any(VisualReportRequest.class)))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            analyticsController.downloadVisualReport(
                    JWT, null, null, null, null, false, "COMPREHENSIVE",
                    true, true, true, null);

            verify(visualReportService).generateVisualReport(eq(JWT), argThat(req ->
                    req.getEndDate().equals(LocalDate.now()) &&
                    req.getStartDate().equals(LocalDate.now().minusMonths(3))
            ));
        }

        @Test
        @DisplayName("should generate filename with date range and timestamp")
        void shouldGenerateProperFilename() throws IOException {
            when(visualReportService.generateVisualReport(eq(JWT), any(VisualReportRequest.class)))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            ResponseEntity<InputStreamResource> response = analyticsController.downloadVisualReport(
                    JWT, LocalDate.of(2024, 1, 1), LocalDate.of(2024, 3, 31),
                    null, null, false, "COMPREHENSIVE",
                    true, true, true, null);

            String disposition = response.getHeaders().get("Content-Disposition").get(0);
            assertThat(disposition).contains("expense_report_");
            assertThat(disposition).contains("20240101_to_20240331");
            assertThat(disposition).endsWith(".xlsx");
        }

        @Test
        @DisplayName("should use all_time in filename when allTime=true")
        void shouldUseAllTimeFilename() throws IOException {
            when(visualReportService.generateVisualReport(eq(JWT), any(VisualReportRequest.class)))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            ResponseEntity<InputStreamResource> response = analyticsController.downloadVisualReport(
                    JWT, null, null, null, null, true, "COMPREHENSIVE",
                    true, true, true, null);

            String disposition = response.getHeaders().get("Content-Disposition").get(0);
            assertThat(disposition).contains("all_time");
        }

        @Test
        @DisplayName("should propagate IOException")
        void shouldPropagateIOException() throws IOException {
            when(visualReportService.generateVisualReport(eq(JWT), any(VisualReportRequest.class)))
                    .thenThrow(new IOException("Generation failed"));

            assertThatThrownBy(() -> analyticsController.downloadVisualReport(
                    JWT, null, null, null, null, false, "COMPREHENSIVE",
                    true, true, true, null))
                    .isInstanceOf(IOException.class);
        }

        @Test
        @DisplayName("should pass includeCharts/Formulas/ConditionalFormatting flags")
        void shouldPassFeatureFlags() throws IOException {
            when(visualReportService.generateVisualReport(eq(JWT), any(VisualReportRequest.class)))
                    .thenReturn(new ByteArrayInputStream(new byte[0]));

            analyticsController.downloadVisualReport(
                    JWT, null, null, null, null, false, "EXPENSE",
                    false, false, false, null);

            verify(visualReportService).generateVisualReport(eq(JWT), argThat(req ->
                    !req.isIncludeCharts() &&
                    !req.isIncludeFormulas() &&
                    !req.isIncludeConditionalFormatting() &&
                    req.getReportType() == VisualReportRequest.ReportType.EXPENSE
            ));
        }
    }
}
