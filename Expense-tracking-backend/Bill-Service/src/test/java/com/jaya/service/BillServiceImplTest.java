package com.jaya.service;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.BillSearchDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Bill;
import com.jaya.repository.BillRepository;
import com.jaya.testutil.BillTestDataFactory;
import com.jaya.util.BillServiceHelper;
import com.jaya.util.BulkProgressTracker;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BillServiceImplTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private BillExpenseClient expenseService;

    @Mock
    private BillServiceHelper helper;

    @Mock
    private BulkProgressTracker progressTracker;

    @InjectMocks
    private BillServiceImpl billService;

    @Nested
    @DisplayName("createBill")
    class CreateBillTests {

        @Test
        @DisplayName("should create bill when expense and bill save both succeed")
        void shouldCreateBillSuccessfully() throws Exception {
            Bill inputBill = BillTestDataFactory.buildBillWithoutId();
            UserDTO user = BillTestDataFactory.buildUser();
            ExpenseDTO expense = BillTestDataFactory.buildExpenseDTO();
            Bill mappedBill = BillTestDataFactory.buildBillWithoutId();
            Bill savedBill = BillTestDataFactory.buildBill();

            when(helper.validateUser(1)).thenReturn(user);
            when(helper.createExpenseFromBill(inputBill, user)).thenReturn(expense);
            when(expenseService.addExpense(expense, 1)).thenReturn(expense);
            when(helper.mapExpenseToBill(inputBill, expense)).thenReturn(mappedBill);
            when(billRepository.save(mappedBill)).thenReturn(savedBill);

            Bill result = billService.createBill(inputBill, 1);

            assertThat(result).isNotNull();
            assertThat(result.getId()).isEqualTo(1001);
            verify(helper).validateBillData(inputBill);
            verify(billRepository).save(mappedBill);
        }

        @Test
        @DisplayName("should throw when associated expense creation fails")
        void shouldThrowWhenExpenseCreationFails() throws Exception {
            Bill inputBill = BillTestDataFactory.buildBillWithoutId();
            UserDTO user = BillTestDataFactory.buildUser();
            ExpenseDTO expense = BillTestDataFactory.buildExpenseDTO();
            expense.setId(null);

            when(helper.validateUser(1)).thenReturn(user);
            when(helper.createExpenseFromBill(inputBill, user)).thenReturn(expense);
            when(expenseService.addExpense(expense, 1)).thenReturn(expense);

            assertThatThrownBy(() -> billService.createBill(inputBill, 1))
                    .isInstanceOf(Exception.class)
                    .hasMessageContaining("Error creating bill");

            verify(billRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("updateBill")
    class UpdateBillTests {

        @Test
        @DisplayName("should update bill and mapped expense fields")
        void shouldUpdateBillSuccessfully() throws Exception {
            Bill updateRequest = BillTestDataFactory.buildBill();
            Bill existing = BillTestDataFactory.buildBill();
            ExpenseDTO existingExpense = BillTestDataFactory.buildExpenseDTO();
            ExpenseDTO updatedExpense = BillTestDataFactory.buildExpenseDTO();

            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findById(1001)).thenReturn(Optional.of(existing));
            when(expenseService.getExpenseById(existing.getExpenseId(), 1)).thenReturn(existingExpense);
            when(expenseService.updateExpenseWithBillService(eq(existing.getExpenseId()), any(ExpenseDTO.class), eq(1)))
                    .thenReturn(updatedExpense);
            when(billRepository.save(existing)).thenReturn(existing);

            Bill result = billService.updateBill(updateRequest, 1);

            assertThat(result).isNotNull();
            verify(expenseService).updateExpenseWithBillService(eq(existing.getExpenseId()), any(ExpenseDTO.class), eq(1));
            verify(billRepository).save(existing);
        }

        @Test
        @DisplayName("should throw when expense does not exist")
        void shouldThrowWhenAssociatedExpenseNotFound() throws Exception {
            Bill updateRequest = BillTestDataFactory.buildBill();

            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findById(1001)).thenReturn(Optional.of(BillTestDataFactory.buildBill()));
            when(expenseService.getExpenseById(9001, 1)).thenReturn(null);

            assertThatThrownBy(() -> billService.updateBill(updateRequest, 1))
                    .isInstanceOf(Exception.class)
                    .hasMessageContaining("Associated expense not found");
        }
    }

    @Nested
    @DisplayName("getByBillId")
    class GetByBillIdTests {

        @Test
        @DisplayName("should return bill when found")
        void shouldReturnBillWhenFound() throws Exception {
            Bill bill = BillTestDataFactory.buildBill();
            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findById(1001)).thenReturn(Optional.of(bill));

            Bill result = billService.getByBillId(1001, 1);

            assertThat(result).isEqualTo(bill);
        }

        @Test
        @DisplayName("should wrap not found exception")
        void shouldThrowWhenBillNotFound() throws Exception {
            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findById(1001)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> billService.getByBillId(1001, 1))
                    .isInstanceOf(Exception.class)
                    .hasMessageContaining("Error retrieving bill");
        }
    }

    @Nested
    @DisplayName("delete methods")
    class DeleteTests {

        @Test
        @DisplayName("should delete bill and its associated expense")
        void shouldDeleteBillAndExpense() throws Exception {
            Bill bill = BillTestDataFactory.buildBill();
            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findById(1001)).thenReturn(Optional.of(bill));

            billService.deleteBill(1001, 1);

            verify(expenseService).deleteExpensesByIdsWithBillService(List.of(9001), 1);
            verify(billRepository).deleteById(1001);
        }

        @Test
        @DisplayName("should delete all bills even when expense cleanup fails")
        void shouldDeleteAllBillsForUser() throws Exception {
            Bill b1 = BillTestDataFactory.buildBill();
            Bill b2 = BillTestDataFactory.buildGainBill();
            b2.setExpenseId(9002);

            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findByUserId(1)).thenReturn(List.of(b1, b2));
            doThrow(new RuntimeException("expense cleanup failed"))
                    .when(expenseService).deleteExpensesByIdsWithBillService(any(), eq(1));

            String result = billService.deleteAllBillsForUser(1);

            assertThat(result).isEqualTo("All bills are deleted successfully");
            verify(billRepository).deleteById(1001);
            verify(billRepository).deleteById(1002);
        }
    }

    @Nested
    @DisplayName("getAllBillsForUser overloads")
    class GetAllBillsTests {

        @Test
        @DisplayName("should return all bills")
        void shouldReturnAllBills() throws Exception {
            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findByUserId(1)).thenReturn(List.of(BillTestDataFactory.buildBill()));

            List<Bill> result = billService.getAllBillsForUser(1);

            assertThat(result).hasSize(1);
        }

        @Test
        @DisplayName("should filter by month and year")
        void shouldFilterByMonthAndYear() throws Exception {
            Bill inMonth = BillTestDataFactory.buildBill();
            inMonth.setDate(LocalDate.of(2026, 3, 5));
            Bill outMonth = BillTestDataFactory.buildGainBill();
            outMonth.setDate(LocalDate.of(2026, 2, 25));

            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findByUserId(1)).thenReturn(List.of(inMonth, outMonth));

            List<Bill> result = billService.getAllBillsForUser(1, 3, 2026);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getDate().getMonthValue()).isEqualTo(3);
        }

        @Test
        @DisplayName("should filter by relative month range")
        void shouldFilterByRange() throws Exception {
            Bill inRange = BillTestDataFactory.buildBill();
            inRange.setDate(LocalDate.now().withDayOfMonth(5));
            Bill outRange = BillTestDataFactory.buildGainBill();
            outRange.setDate(LocalDate.now().minusMonths(2));

            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findByUserId(1)).thenReturn(List.of(inRange, outRange));

            List<Bill> result = billService.getAllBillsForUser(1, "month", 0);

            assertThat(result).isNotEmpty();
        }

        @Test
        @DisplayName("should throw for invalid range keyword")
        void shouldThrowForInvalidRange() throws Exception {
            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());

            assertThatThrownBy(() -> billService.getAllBillsForUser(1, "quarter", 0))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Invalid range");
        }
    }

    @Nested
    @DisplayName("date and type filters")
    class FilterTests {

        @Test
        @DisplayName("should filter by type and date range")
        void shouldFilterBillsByTypeAndDateRange() throws Exception {
            Bill lossInRange = BillTestDataFactory.buildBill();
            lossInRange.setType("loss");
            lossInRange.setDate(LocalDate.of(2026, 3, 5));
            Bill gainInRange = BillTestDataFactory.buildGainBill();
            gainInRange.setDate(LocalDate.of(2026, 3, 6));

            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());

            List<Bill> result = billService.filterBillsByTypeAndRange(
                    1,
                    List.of(lossInRange, gainInRange),
                    "loss",
                    LocalDate.of(2026, 3, 1),
                    LocalDate.of(2026, 3, 31));

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getType()).isEqualTo("loss");
        }

        @Test
        @DisplayName("should throw for invalid bill type")
        void shouldThrowForInvalidType() throws Exception {
            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());

                assertThatThrownBy(() -> billService.filterBillsByTypeAndRange(
                    1,
                    List.of(BillTestDataFactory.buildBill()),
                    "credit",
                    null,
                    null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Type must be either 'loss' or 'gain'");
        }

        @Test
        @DisplayName("should throw when toDate is before fromDate")
        void shouldThrowForInvalidDateRange() throws Exception {
            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());

            assertThatThrownBy(() -> billService.filterBillsByTypeAndRange(
                    1,
                    List.of(BillTestDataFactory.buildBill()),
                    "loss",
                    LocalDate.of(2026, 3, 10),
                    LocalDate.of(2026, 3, 1)))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("toDate cannot be earlier than fromDate");
        }
    }

    @Nested
    @DisplayName("bulk and progress")
    class BulkTests {

        @Test
        @DisplayName("should save multiple bills")
        void shouldAddMultipleBills() throws Exception {
            UserDTO user = BillTestDataFactory.buildUser();
            Bill b1 = BillTestDataFactory.buildBillWithoutId();
            Bill b2 = BillTestDataFactory.buildBillWithoutId();
            b2.setName("Water Bill");

            ExpenseDTO e1 = BillTestDataFactory.buildExpenseDTO();
            ExpenseDTO e2 = BillTestDataFactory.buildExpenseDTO();
            e2.setId(9002);

            Bill mapped1 = BillTestDataFactory.buildBillWithoutId();
            Bill mapped2 = BillTestDataFactory.buildBillWithoutId();
            mapped2.setExpenseId(9002);

            when(helper.validateUser(1)).thenReturn(user);
            when(helper.createExpenseFromBill(b1, user)).thenReturn(e1);
            when(helper.createExpenseFromBill(b2, user)).thenReturn(e2);
            when(expenseService.addExpense(e1, 1)).thenReturn(e1);
            when(expenseService.addExpense(e2, 1)).thenReturn(e2);
            when(helper.mapExpenseToBill(b1, e1)).thenReturn(mapped1);
            when(helper.mapExpenseToBill(b2, e2)).thenReturn(mapped2);
            when(billRepository.save(mapped1)).thenReturn(mapped1);
            when(billRepository.save(mapped2)).thenReturn(mapped2);

            List<Bill> result = billService.addMultipleBills(List.of(b1, b2), 1);

            assertThat(result).hasSize(2);
            verify(billRepository, times(2)).save(any(Bill.class));
        }

        @Test
        @DisplayName("should update progress and fail job on exception")
        void shouldFailProgressWhenBulkFails() throws Exception {
            UserDTO user = BillTestDataFactory.buildUser();
            Bill b1 = BillTestDataFactory.buildBillWithoutId();
            Bill b2 = BillTestDataFactory.buildBillWithoutId();
            b2.setName("broken-bill");

            ExpenseDTO e1 = BillTestDataFactory.buildExpenseDTO();

            when(helper.validateUser(1)).thenReturn(user);
            when(helper.createExpenseFromBill(b1, user)).thenReturn(e1);
            when(expenseService.addExpense(e1, 1)).thenReturn(e1);
            when(helper.mapExpenseToBill(b1, e1)).thenReturn(BillTestDataFactory.buildBillWithoutId());
            when(billRepository.save(any(Bill.class))).thenReturn(BillTestDataFactory.buildBillWithoutId());
            when(helper.createExpenseFromBill(b2, user)).thenThrow(new IllegalArgumentException("bad bill"));

            assertThatThrownBy(() -> billService.addMultipleBillsWithProgress(List.of(b1, b2), 1, "job-1"))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("bad bill");

            verify(progressTracker).fail("job-1", "bad bill");
        }
    }

    @Nested
    @DisplayName("searchBills")
    class SearchTests {

        @Test
        @DisplayName("should return empty list for blank query")
        void shouldReturnEmptyForBlankQuery() {
            List<BillSearchDTO> result = billService.searchBills(1, "  ", 20);
            assertThat(result).isEmpty();
            verify(billRepository, never()).searchBillsFuzzyWithLimit(any(), any());
        }

        @Test
        @DisplayName("should transform query to subsequence pattern and apply limit")
        void shouldSearchWithSubsequencePatternAndLimit() {
            BillSearchDTO r1 = new BillSearchDTO(1, "Electricity", "desc", 20.0, "UPI", "loss", LocalDate.now(),
                    20.0, "Utilities", 1, 1);
            BillSearchDTO r2 = new BillSearchDTO(2, "Water", "desc", 30.0, "Cash", "loss", LocalDate.now(), 30.0,
                    "Utilities", 1, 1);

            when(billRepository.searchBillsFuzzyWithLimit(1, "%e%l%e%c%"))
                    .thenReturn(List.of(r1, r2));

            List<BillSearchDTO> result = billService.searchBills(1, "elec", 1);

            assertThat(result).hasSize(1);
            ArgumentCaptor<String> queryCaptor = ArgumentCaptor.forClass(String.class);
            verify(billRepository).searchBillsFuzzyWithLimit(eq(1), queryCaptor.capture());
            assertThat(queryCaptor.getValue()).isEqualTo("%e%l%e%c%");
        }
    }

    @Nested
    @DisplayName("misc")
    class MiscTests {

        @Test
        @DisplayName("should return empty when filtering null source list")
        void shouldReturnEmptyForNullSource() throws Exception {
            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findByUserId(1)).thenReturn(Collections.emptyList());

            List<Bill> result = billService.filterBillsByTypeAndRange(1, null, null, null, null);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should load unique item names from bill expenses")
        void shouldGetUniqueItemNames() throws Exception {
            Bill b1 = BillTestDataFactory.buildBill();
            Bill b2 = BillTestDataFactory.buildGainBill();
            b2.setExpenses(List.of(BillTestDataFactory.buildDetailedExpense()));

            when(helper.validateUser(1)).thenReturn(BillTestDataFactory.buildUser());
            when(billRepository.findByUserId(1)).thenReturn(List.of(b1, b2));

            List<String> result = billService.getAllUniqueItemNames(1);

            assertThat(result).contains("Bulb");
        }
    }
}
