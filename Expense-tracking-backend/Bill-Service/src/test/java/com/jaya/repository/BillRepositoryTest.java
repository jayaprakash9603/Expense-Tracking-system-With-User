package com.jaya.repository;

import com.jaya.dto.BillSearchDTO;
import com.jaya.models.Bill;
import com.jaya.testutil.BillTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class BillRepositoryTest {

    @Autowired
    private BillRepository billRepository;

    @Test
    @DisplayName("should find bills by user id")
    void shouldFindByUserId() {
        Bill b1 = BillTestDataFactory.buildBillWithoutId();
        b1.setBudgetIds(null);
        b1.setUserId(1);
        Bill b2 = BillTestDataFactory.buildBillWithoutId();
        b2.setBudgetIds(null);
        b2.setName("Water Bill");
        b2.setUserId(2);

        billRepository.save(b1);
        billRepository.save(b2);

        List<Bill> result = billRepository.findByUserId(1);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUserId()).isEqualTo(1);
    }

    @Test
    @DisplayName("should find by expense id")
    void shouldFindByExpenseId() {
        Bill bill = BillTestDataFactory.buildBillWithoutId();
        bill.setBudgetIds(null);
        bill.setExpenseId(5555);
        billRepository.save(bill);

        Bill result = billRepository.findByExpenseId(5555);

        assertThat(result).isNotNull();
        assertThat(result.getExpenseId()).isEqualTo(5555);
    }

    @Test
    @DisplayName("should find by bill id and user id")
    void shouldFindByIdAndUserId() {
        Bill bill = BillTestDataFactory.buildBillWithoutId();
        bill.setBudgetIds(null);
        bill.setUserId(7);
        Bill saved = billRepository.save(bill);

        assertThat(billRepository.findByIdAndUserId(saved.getId(), 7)).isPresent();
        assertThat(billRepository.findByIdAndUserId(saved.getId(), 8)).isNotPresent();
    }

    @Test
    @DisplayName("should perform fuzzy search with ordering")
    void shouldSearchBillsFuzzyWithLimit() {
        Bill oldBill = BillTestDataFactory.buildBillWithoutId();
        oldBill.setBudgetIds(null);
        oldBill.setUserId(1);
        oldBill.setName("Electricity old");
        oldBill.setDescription("Power charge");
        oldBill.setCategory("Utilities");
        oldBill.setDate(LocalDate.now().minusDays(3));

        Bill newBill = BillTestDataFactory.buildBillWithoutId();
        newBill.setBudgetIds(null);
        newBill.setUserId(1);
        newBill.setName("Electricity new");
        newBill.setDescription("Power charge latest");
        newBill.setCategory("Utilities");
        newBill.setDate(LocalDate.now().minusDays(1));

        billRepository.save(oldBill);
        billRepository.save(newBill);

        List<BillSearchDTO> result = billRepository.searchBillsFuzzyWithLimit(1, "%e%l%e%c%");

        assertThat(result).isNotEmpty();
        assertThat(result.get(0).getName()).isEqualTo("Electricity new");
    }
}
