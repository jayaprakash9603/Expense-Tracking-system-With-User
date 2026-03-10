package com.jaya.dto.report;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;

class VisualReportRequestTest {

    @Test
    @DisplayName("builder should provide correct defaults")
    void shouldProvideDefaults() {
        VisualReportRequest request = VisualReportRequest.builder().build();

        assertThat(request.getReportType()).isEqualTo(VisualReportRequest.ReportType.COMPREHENSIVE);
        assertThat(request.isIncludeCharts()).isTrue();
        assertThat(request.isIncludeFormulas()).isTrue();
        assertThat(request.isIncludeConditionalFormatting()).isTrue();
        assertThat(request.getStartDate()).isNull();
        assertThat(request.getEndDate()).isNull();
        assertThat(request.getTargetId()).isNull();
    }

    @Test
    @DisplayName("builder should allow overriding defaults")
    void shouldAllowOverrides() {
        VisualReportRequest request = VisualReportRequest.builder()
                .reportType(VisualReportRequest.ReportType.EXPENSE)
                .includeCharts(false)
                .includeFormulas(false)
                .includeConditionalFormatting(false)
                .startDate(LocalDate.of(2024, 1, 1))
                .endDate(LocalDate.of(2024, 6, 30))
                .targetId(42)
                .build();

        assertThat(request.getReportType()).isEqualTo(VisualReportRequest.ReportType.EXPENSE);
        assertThat(request.isIncludeCharts()).isFalse();
        assertThat(request.isIncludeFormulas()).isFalse();
        assertThat(request.isIncludeConditionalFormatting()).isFalse();
        assertThat(request.getTargetId()).isEqualTo(42);
    }

    @Test
    @DisplayName("ReportType enum should contain all expected values")
    void shouldContainAllReportTypes() {
        assertThat(VisualReportRequest.ReportType.values())
                .containsExactlyInAnyOrder(
                        VisualReportRequest.ReportType.EXPENSE,
                        VisualReportRequest.ReportType.BUDGET,
                        VisualReportRequest.ReportType.CATEGORY,
                        VisualReportRequest.ReportType.COMPREHENSIVE);
    }

    @Test
    @DisplayName("SheetType enum should contain all expected values")
    void shouldContainAllSheetTypes() {
        assertThat(VisualReportRequest.SheetType.values()).hasSize(8);
    }
}
