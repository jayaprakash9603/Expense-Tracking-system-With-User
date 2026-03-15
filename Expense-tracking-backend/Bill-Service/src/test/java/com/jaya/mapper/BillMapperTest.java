package com.jaya.mapper;

import com.jaya.dto.BillRequestDTO;
import com.jaya.dto.BillResponseDTO;
import com.jaya.models.Bill;
import com.jaya.testutil.BillTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BillMapperTest {

    @Nested
    @DisplayName("toEntity")
    class ToEntityTests {

        @Test
        @DisplayName("should map request dto to entity")
        void shouldMapToEntity() {
            BillRequestDTO dto = BillTestDataFactory.buildBillRequestDTO();

            Bill entity = BillMapper.toEntity(dto, 99);

            assertThat(entity).isNotNull();
            assertThat(entity.getName()).isEqualTo(dto.getName());
            assertThat(entity.getUserId()).isEqualTo(dto.getUserId());
            assertThat(entity.getExpenses()).hasSize(1);
        }

        @Test
        @DisplayName("should use default user id and category")
        void shouldApplyDefaults() {
            BillRequestDTO dto = BillTestDataFactory.buildBillRequestDTO();
            dto.setUserId(null);
            dto.setCategory(null);
            dto.setExpenses(null);

            Bill entity = BillMapper.toEntity(dto, 42);

            assertThat(entity.getUserId()).isEqualTo(42);
            assertThat(entity.getCategory()).isEqualTo("Others");
            assertThat(entity.getExpenses()).isEmpty();
        }

        @Test
        @DisplayName("should return null for null input")
        void shouldReturnNullForNullInput() {
            assertThat(BillMapper.toEntity(null, 1)).isNull();
        }
    }

    @Nested
    @DisplayName("toDto")
    class ToDtoTests {

        @Test
        @DisplayName("should map entity to response dto")
        void shouldMapToDto() {
            Bill bill = BillTestDataFactory.buildBill();

            BillResponseDTO dto = BillMapper.toDto(bill);

            assertThat(dto).isNotNull();
            assertThat(dto.getId()).isEqualTo(1001);
            assertThat(dto.getExpenses()).hasSize(1);
            assertThat(dto.isIncludeInBudget()).isTrue();
        }

        @Test
        @DisplayName("should map null expenses as empty list")
        void shouldMapNullExpensesAsEmptyList() {
            Bill bill = BillTestDataFactory.buildBill();
            bill.setExpenses(null);

            BillResponseDTO dto = BillMapper.toDto(bill);

            assertThat(dto.getExpenses()).isEmpty();
        }

        @Test
        @DisplayName("should return null for null entity")
        void shouldReturnNullForNullEntity() {
            assertThat(BillMapper.toDto(null)).isNull();
        }
    }
}
