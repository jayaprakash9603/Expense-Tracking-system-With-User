package com.jaya.service;

import com.jaya.dto.AnalyticsEntityType;
import com.jaya.dto.AnalyticsRequestDTO;
import com.jaya.dto.CategoryAnalyticsDTO;
import com.jaya.testutil.TestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsEntityServiceTest {

    @Mock
    private CategoryAnalyticsService categoryAnalyticsService;

    @InjectMocks
    private AnalyticsEntityService analyticsEntityService;

    // ─── normalizeRequest Tests ──────────────────────────────────────

    @Nested
    @DisplayName("normalizeRequest")
    class NormalizeRequestTests {

        @Test
        @DisplayName("should keep provided dates and trendType unchanged")
        void shouldKeepProvidedValues() {
            LocalDate start = LocalDate.of(2024, 1, 1);
            LocalDate end = LocalDate.of(2024, 6, 30);
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .startDate(start)
                    .endDate(end)
                    .trendType("WEEKLY")
                    .targetId(1)
                    .build();

            AnalyticsRequestDTO result = analyticsEntityService.normalizeRequest(request);

            assertThat(result.getStartDate()).isEqualTo(start);
            assertThat(result.getEndDate()).isEqualTo(end);
            assertThat(result.getTrendType()).isEqualTo("WEEKLY");
            assertThat(result.getEntityType()).isEqualTo(AnalyticsEntityType.CATEGORY);
            assertThat(result.getEntityId()).isEqualTo(10);
            assertThat(result.getTargetId()).isEqualTo(1);
        }

        @Test
        @DisplayName("should default endDate to today when null")
        void shouldDefaultEndDate() {
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .build();

            AnalyticsRequestDTO result = analyticsEntityService.normalizeRequest(request);

            assertThat(result.getEndDate()).isEqualTo(LocalDate.now());
        }

        @Test
        @DisplayName("should default startDate to 6 months before endDate when null")
        void shouldDefaultStartDate() {
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .build();

            AnalyticsRequestDTO result = analyticsEntityService.normalizeRequest(request);

            assertThat(result.getStartDate()).isEqualTo(LocalDate.now().minusMonths(6));
        }

        @Test
        @DisplayName("should default trendType to MONTHLY when null")
        void shouldDefaultTrendTypeWhenNull() {
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .build();

            AnalyticsRequestDTO result = analyticsEntityService.normalizeRequest(request);

            assertThat(result.getTrendType()).isEqualTo("MONTHLY");
        }

        @Test
        @DisplayName("should default trendType to MONTHLY when blank")
        void shouldDefaultTrendTypeWhenBlank() {
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .entityId(10)
                    .trendType("   ")
                    .build();

            AnalyticsRequestDTO result = analyticsEntityService.normalizeRequest(request);

            assertThat(result.getTrendType()).isEqualTo("MONTHLY");
        }

        @Test
        @DisplayName("should handle null request by creating defaults")
        void shouldHandleNullRequest() {
            AnalyticsRequestDTO result = analyticsEntityService.normalizeRequest(null);

            assertThat(result).isNotNull();
            assertThat(result.getEndDate()).isEqualTo(LocalDate.now());
            assertThat(result.getStartDate()).isEqualTo(LocalDate.now().minusMonths(6));
            assertThat(result.getTrendType()).isEqualTo("MONTHLY");
        }
    }

    // ─── getAnalytics routing Tests ─────────────────────────────────

    @Nested
    @DisplayName("getAnalytics - routing")
    class GetAnalyticsRoutingTests {

        @Test
        @DisplayName("should route CATEGORY type to getCategoryAnalytics")
        void shouldRouteCategoryType() {
            AnalyticsRequestDTO request = TestDataFactory.buildCategoryAnalyticsRequest();
            CategoryAnalyticsDTO expected = CategoryAnalyticsDTO.builder().build();
            when(categoryAnalyticsService.getCategoryAnalytics(
                    anyString(), anyInt(), any(), any(), anyString(), anyInt()))
                    .thenReturn(expected);

            CategoryAnalyticsDTO result = analyticsEntityService.getAnalytics(TestDataFactory.TEST_JWT, request);

            assertThat(result).isSameAs(expected);
            verify(categoryAnalyticsService).getCategoryAnalytics(
                    eq(TestDataFactory.TEST_JWT),
                    eq(TestDataFactory.TEST_CATEGORY_ID),
                    any(LocalDate.class),
                    any(LocalDate.class),
                    eq("MONTHLY"),
                    eq(TestDataFactory.TEST_TARGET_ID));
        }

        @Test
        @DisplayName("should route PAYMENT_METHOD type to getPaymentMethodAnalytics")
        void shouldRoutePaymentMethodType() {
            AnalyticsRequestDTO request = TestDataFactory.buildPaymentMethodAnalyticsRequest();
            CategoryAnalyticsDTO expected = CategoryAnalyticsDTO.builder().build();
            when(categoryAnalyticsService.getPaymentMethodAnalytics(
                    anyString(), anyInt(), any(), any(), anyString(), anyInt()))
                    .thenReturn(expected);

            CategoryAnalyticsDTO result = analyticsEntityService.getAnalytics(TestDataFactory.TEST_JWT, request);

            assertThat(result).isSameAs(expected);
            verify(categoryAnalyticsService).getPaymentMethodAnalytics(
                    eq(TestDataFactory.TEST_JWT),
                    eq(TestDataFactory.TEST_PAYMENT_METHOD_ID),
                    any(LocalDate.class),
                    any(LocalDate.class),
                    eq("MONTHLY"),
                    eq(TestDataFactory.TEST_TARGET_ID));
        }

        @Test
        @DisplayName("should route BILL type to getBillAnalytics")
        void shouldRouteBillType() {
            AnalyticsRequestDTO request = TestDataFactory.buildBillAnalyticsRequest();
            CategoryAnalyticsDTO expected = CategoryAnalyticsDTO.builder().build();
            when(categoryAnalyticsService.getBillAnalytics(
                    anyString(), anyInt(), any(), any(), anyString(), anyInt()))
                    .thenReturn(expected);

            CategoryAnalyticsDTO result = analyticsEntityService.getAnalytics(TestDataFactory.TEST_JWT, request);

            assertThat(result).isSameAs(expected);
            verify(categoryAnalyticsService).getBillAnalytics(
                    eq(TestDataFactory.TEST_JWT),
                    eq(TestDataFactory.TEST_BILL_ID),
                    any(LocalDate.class),
                    any(LocalDate.class),
                    eq("MONTHLY"),
                    eq(TestDataFactory.TEST_TARGET_ID));
        }
    }

    // ─── getAnalytics validation Tests ──────────────────────────────

    @Nested
    @DisplayName("getAnalytics - validation")
    class GetAnalyticsValidationTests {

        @Test
        @DisplayName("should throw when entityType is null")
        void shouldThrowWhenEntityTypeNull() {
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityId(10)
                    .build();

            assertThatThrownBy(() -> analyticsEntityService.getAnalytics(TestDataFactory.TEST_JWT, request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("entityType is required");
        }

        @Test
        @DisplayName("should throw when entityId is null")
        void shouldThrowWhenEntityIdNull() {
            AnalyticsRequestDTO request = AnalyticsRequestDTO.builder()
                    .entityType(AnalyticsEntityType.CATEGORY)
                    .build();

            assertThatThrownBy(() -> analyticsEntityService.getAnalytics(TestDataFactory.TEST_JWT, request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("entityId is required");
        }
    }
}
