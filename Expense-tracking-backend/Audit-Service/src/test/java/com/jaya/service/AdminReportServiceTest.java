package com.jaya.service;

import com.jaya.dto.AdminReportDTO;
import com.jaya.dto.GenerateReportRequest;
import com.jaya.models.AdminReport;
import com.jaya.repository.AdminReportRepository;
import com.jaya.testutil.AuditTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminReportServiceTest {

    @Mock
    private AdminReportRepository reportRepository;

    @InjectMocks
    private AdminReportService adminReportService;

    private AdminReport testReport;
    private Pageable defaultPageable;

    @BeforeEach
    void setUp() {
        testReport = AuditTestDataFactory.buildAdminReport();
        defaultPageable = PageRequest.of(0, 20);
    }

    // ─── getAllReports ──────────────────────────────────────────────

    @Nested
    @DisplayName("getAllReports")
    class GetAllReportsTests {

        @Test
        @DisplayName("should return paginated reports mapped to DTOs")
        void shouldReturnPaginatedReports() {
            Page<AdminReport> entityPage = new PageImpl<>(List.of(testReport), defaultPageable, 1);
            when(reportRepository.findAllByOrderByCreatedAtDesc(defaultPageable)).thenReturn(entityPage);

            Page<AdminReportDTO> result = adminReportService.getAllReports(defaultPageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("Test Report");
        }

        @Test
        @DisplayName("should return empty page when no reports exist")
        void shouldReturnEmptyPage() {
            Page<AdminReport> emptyPage = new PageImpl<>(List.of(), defaultPageable, 0);
            when(reportRepository.findAllByOrderByCreatedAtDesc(defaultPageable)).thenReturn(emptyPage);

            Page<AdminReportDTO> result = adminReportService.getAllReports(defaultPageable);

            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }
    }

    // ─── getReportsByType ──────────────────────────────────────────

    @Nested
    @DisplayName("getReportsByType")
    class GetReportsByTypeTests {

        @Test
        @DisplayName("should return reports filtered by type")
        void shouldReturnReportsByType() {
            Page<AdminReport> page = new PageImpl<>(List.of(testReport), defaultPageable, 1);
            when(reportRepository.findByTypeOrderByCreatedAtDesc("expense-summary", defaultPageable))
                    .thenReturn(page);

            Page<AdminReportDTO> result = adminReportService.getReportsByType(
                    "expense-summary", defaultPageable);

            assertThat(result.getTotalElements()).isEqualTo(1);
            assertThat(result.getContent().get(0).getType()).isEqualTo("expense-summary");
        }
    }

    // ─── generateReport ────────────────────────────────────────────

    @Nested
    @DisplayName("generateReport")
    class GenerateReportTests {

        @Test
        @DisplayName("should create report with GENERATING status and custom name")
        void shouldCreateReportWithCustomName() {
            GenerateReportRequest request = AuditTestDataFactory.buildGenerateReportRequest();
            when(reportRepository.save(any(AdminReport.class))).thenAnswer(invocation -> {
                AdminReport saved = invocation.getArgument(0);
                saved.setId(1L);
                return saved;
            });

            AdminReportDTO result = adminReportService.generateReport(request, 1L, "admin");

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("My Report");
            assertThat(result.getStatus()).isEqualTo("GENERATING");
            assertThat(result.getType()).isEqualTo("expense-summary");
            assertThat(result.getFormat()).isEqualTo("PDF");
            assertThat(result.getGeneratedBy()).isEqualTo(1L);
            assertThat(result.getGeneratedByUsername()).isEqualTo("admin");
            verify(reportRepository).save(any(AdminReport.class));
        }

        @Test
        @DisplayName("should use default name when request name is null")
        void shouldUseDefaultNameWhenNull() {
            GenerateReportRequest request = GenerateReportRequest.builder()
                    .type("expense-summary")
                    .dateRange("last-30-days")
                    .format("CSV")
                    .name(null)
                    .build();
            when(reportRepository.save(any(AdminReport.class))).thenAnswer(invocation -> {
                AdminReport saved = invocation.getArgument(0);
                saved.setId(2L);
                return saved;
            });

            AdminReportDTO result = adminReportService.generateReport(request, 1L, "admin");

            assertThat(result.getName()).startsWith("Expense Summary Report");
        }

        @Test
        @DisplayName("should use default name when request name is empty")
        void shouldUseDefaultNameWhenEmpty() {
            GenerateReportRequest request = GenerateReportRequest.builder()
                    .type("budget-analysis")
                    .dateRange("last-7-days")
                    .format("PDF")
                    .name("")
                    .build();
            when(reportRepository.save(any(AdminReport.class))).thenAnswer(invocation -> {
                AdminReport saved = invocation.getArgument(0);
                saved.setId(3L);
                return saved;
            });

            AdminReportDTO result = adminReportService.generateReport(request, 1L, "admin");

            assertThat(result.getName()).startsWith("Budget Analysis Report");
        }

        @Test
        @DisplayName("should generate default name for all report types")
        void shouldGenerateDefaultNameForAllTypes() {
            String[][] typeAndExpected = {
                    {"user-activity", "User Activity Report"},
                    {"expense-summary", "Expense Summary Report"},
                    {"budget-analysis", "Budget Analysis Report"},
                    {"audit-trail", "Audit Trail Report"},
                    {"category-breakdown", "Category Breakdown Report"},
                    {"unknown-type", "Report"}
            };

            for (String[] pair : typeAndExpected) {
                GenerateReportRequest request = GenerateReportRequest.builder()
                        .type(pair[0]).format("PDF").dateRange("all").build();
                when(reportRepository.save(any(AdminReport.class))).thenAnswer(invocation -> {
                    AdminReport saved = invocation.getArgument(0);
                    saved.setId(10L);
                    return saved;
                });

                AdminReportDTO result = adminReportService.generateReport(request, 1L, "admin");

                assertThat(result.getName()).startsWith(pair[1]);
            }
        }
    }

    // ─── generateReportAsync ────────────────────────────────────────

    @Nested
    @DisplayName("generateReportAsync")
    class GenerateReportAsyncTests {

        @Test
        @DisplayName("should update report to COMPLETED")
        void shouldUpdateToCompleted() {
            AdminReport report = AuditTestDataFactory.buildGeneratingReport();
            when(reportRepository.findById(2L)).thenReturn(Optional.of(report));
            when(reportRepository.save(any(AdminReport.class))).thenReturn(report);

            adminReportService.generateReportAsync(2L);

            verify(reportRepository).save(argThat(r ->
                    "COMPLETED".equals(r.getStatus()) &&
                            r.getCompletedAt() != null &&
                            r.getSize() != null &&
                            r.getDownloadUrl() != null
            ));
        }

        @Test
        @DisplayName("should do nothing when report not found")
        void shouldDoNothingWhenNotFound() {
            when(reportRepository.findById(999L)).thenReturn(Optional.empty());

            adminReportService.generateReportAsync(999L);

            verify(reportRepository, never()).save(any());
        }
    }

    // ─── deleteReport ──────────────────────────────────────────────

    @Nested
    @DisplayName("deleteReport")
    class DeleteReportTests {

        @Test
        @DisplayName("should delete existing report")
        void shouldDeleteExistingReport() {
            when(reportRepository.existsById(1L)).thenReturn(true);

            adminReportService.deleteReport(1L);

            verify(reportRepository).deleteById(1L);
        }

        @Test
        @DisplayName("should throw when report not found")
        void shouldThrowWhenNotFound() {
            when(reportRepository.existsById(999L)).thenReturn(false);

            assertThatThrownBy(() -> adminReportService.deleteReport(999L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Report not found");
        }
    }

    // ─── getReportById ─────────────────────────────────────────────

    @Nested
    @DisplayName("getReportById")
    class GetReportByIdTests {

        @Test
        @DisplayName("should return report DTO when found")
        void shouldReturnReportWhenFound() {
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));

            AdminReportDTO result = adminReportService.getReportById(1L);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1L);
            assertThat(result.getName()).isEqualTo("Test Report");
        }

        @Test
        @DisplayName("should throw when report not found")
        void shouldThrowWhenNotFound() {
            when(reportRepository.findById(999L)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> adminReportService.getReportById(999L))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Report not found");
        }
    }

    // ─── getTotalReportCount / getReportsCountSince ─────────────────

    @Nested
    @DisplayName("Count methods")
    class CountMethodsTests {

        @Test
        @DisplayName("should return total report count")
        void shouldReturnTotalCount() {
            when(reportRepository.count()).thenReturn(25L);

            long result = adminReportService.getTotalReportCount();

            assertThat(result).isEqualTo(25L);
        }

        @Test
        @DisplayName("should return count since given date")
        void shouldReturnCountSince() {
            LocalDateTime since = LocalDateTime.now().minusDays(30);
            when(reportRepository.countReportsSince(since)).thenReturn(10L);

            long result = adminReportService.getReportsCountSince(since);

            assertThat(result).isEqualTo(10L);
        }
    }

    // ─── mapToDTO verification ──────────────────────────────────────

    @Nested
    @DisplayName("DTO mapping")
    class DtoMappingTests {

        @Test
        @DisplayName("should correctly map all fields from entity to DTO")
        void shouldMapAllFields() {
            when(reportRepository.findById(1L)).thenReturn(Optional.of(testReport));

            AdminReportDTO dto = adminReportService.getReportById(1L);

            assertThat(dto.getId()).isEqualTo(testReport.getId());
            assertThat(dto.getName()).isEqualTo(testReport.getName());
            assertThat(dto.getType()).isEqualTo(testReport.getType());
            assertThat(dto.getDateRange()).isEqualTo(testReport.getDateRange());
            assertThat(dto.getFormat()).isEqualTo(testReport.getFormat());
            assertThat(dto.getStatus()).isEqualTo(testReport.getStatus());
            assertThat(dto.getSize()).isEqualTo(testReport.getSize());
            assertThat(dto.getDownloadUrl()).isEqualTo(testReport.getDownloadUrl());
            assertThat(dto.getCreatedAt()).isEqualTo(testReport.getCreatedAt());
            assertThat(dto.getCompletedAt()).isEqualTo(testReport.getCompletedAt());
            assertThat(dto.getGeneratedBy()).isEqualTo(testReport.getGeneratedBy());
            assertThat(dto.getGeneratedByUsername()).isEqualTo(testReport.getGeneratedByUsername());
        }
    }
}
