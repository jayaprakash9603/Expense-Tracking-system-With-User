package com.jaya.dto;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;

import static org.assertj.core.api.Assertions.*;

class AnalyticsEntityTypeTest {

    @Nested
    @DisplayName("fromValue - exact matches")
    class ExactMatchTests {

        @Test
        @DisplayName("should parse CATEGORY")
        void shouldParseCategory() {
            assertThat(AnalyticsEntityType.fromValue("CATEGORY"))
                    .isEqualTo(AnalyticsEntityType.CATEGORY);
        }

        @Test
        @DisplayName("should parse PAYMENT_METHOD")
        void shouldParsePaymentMethod() {
            assertThat(AnalyticsEntityType.fromValue("PAYMENT_METHOD"))
                    .isEqualTo(AnalyticsEntityType.PAYMENT_METHOD);
        }

        @Test
        @DisplayName("should parse BILL")
        void shouldParseBill() {
            assertThat(AnalyticsEntityType.fromValue("BILL"))
                    .isEqualTo(AnalyticsEntityType.BILL);
        }
    }

    @Nested
    @DisplayName("fromValue - case insensitivity & normalization")
    class NormalizationTests {

        @ParameterizedTest
        @CsvSource({
                "category, CATEGORY",
                "Category, CATEGORY",
                "CATEGORY, CATEGORY",
                "payment_method, PAYMENT_METHOD",
                "payment-method, PAYMENT_METHOD",
                "PAYMENT-METHOD, PAYMENT_METHOD",
                "Payment Method, PAYMENT_METHOD",
                "payment method, PAYMENT_METHOD",
                "bill, BILL",
                "Bill, BILL"
        })
        @DisplayName("should normalize various formats")
        void shouldNormalizeFormats(String input, String expectedName) {
            AnalyticsEntityType result = AnalyticsEntityType.fromValue(input);
            assertThat(result).isEqualTo(AnalyticsEntityType.valueOf(expectedName));
        }

        @Test
        @DisplayName("should handle leading/trailing whitespace")
        void shouldTrimWhitespace() {
            assertThat(AnalyticsEntityType.fromValue("  CATEGORY  "))
                    .isEqualTo(AnalyticsEntityType.CATEGORY);
        }
    }

    @Nested
    @DisplayName("fromValue - null/invalid handling")
    class InvalidInputTests {

        @Test
        @DisplayName("should return null for null input")
        void shouldReturnNullForNull() {
            assertThat(AnalyticsEntityType.fromValue(null)).isNull();
        }

        @ParameterizedTest
        @ValueSource(strings = {"INVALID", "UNKNOWN", "EXPENSE", ""})
        @DisplayName("should return null for unknown values")
        void shouldReturnNullForUnknown(String value) {
            assertThat(AnalyticsEntityType.fromValue(value)).isNull();
        }
    }
}
