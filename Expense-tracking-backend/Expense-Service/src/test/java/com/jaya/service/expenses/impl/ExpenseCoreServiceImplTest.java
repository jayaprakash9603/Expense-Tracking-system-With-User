package com.jaya.service.expenses.impl;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.kafka.AuditEventProducer;
import com.jaya.kafka.BudgetExpenseKafkaProducerService;
import com.jaya.kafka.CategoryExpenseKafkaProducerService;
import com.jaya.kafka.PaymentMethodKafkaProducerService;
import com.jaya.mapper.ExpenseMapper;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseCategory;
import com.jaya.repository.ExpenseReportRepository;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.BudgetServices;
import com.jaya.service.CategoryServiceWrapper;
import com.jaya.service.MomentumService;
import com.jaya.service.PaymentMethodServices;
import com.jaya.service.UserSettingsService;
import com.jaya.service.KafkaProducerService;
import com.jaya.util.BulkProgressTracker;
import com.jaya.util.ExpenseValidationHelper;
import com.jaya.util.JsonConverter;
import com.jaya.async.AsyncExpensePostProcessor;
import com.jaya.testutil.ExpenseTestDataFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;
import java.util.HashSet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ExpenseCoreServiceImplTest {

    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private ExpenseReportRepository expenseReportRepository;
    @Mock
    private ExpenseValidationHelper helper;
    @Mock
    private CacheManager cacheManager;
    @Mock
    private AsyncExpensePostProcessor asyncExpensePostProcessor;
    @Mock
    private EntityManager entityManager;
    @Mock
    private EntityManagerFactory entityManagerFactory;
    @Mock
    private BudgetServices budgetService;
    @Mock
    private CategoryExpenseKafkaProducerService categoryExpenseKafkaProducer;
    @Mock
    private PaymentMethodKafkaProducerService paymentMethodKafkaProducer;
    @Mock
    private CategoryServiceWrapper categoryService;
    @Mock
    private KafkaProducerService producer;
    @Mock
    private PaymentMethodServices paymentMethodService;
    @Mock
    private JsonConverter jsonConverter;
    @Mock
    private BudgetExpenseKafkaProducerService budgetExpenseKafkaProducerService;
    @Mock
    private BulkProgressTracker progressTracker;
    @Mock
    private AuditEventProducer auditEventProducer;
    @Mock
    private ExpenseMapper expenseMapper;
    @Mock
    private UserSettingsService userSettingsService;
    @Mock
    private org.springframework.kafka.core.KafkaTemplate<String, Object> kafkaTemplate;
    @Mock
    private MomentumService momentumService;

    @InjectMocks
    private ExpenseCoreServiceImpl expenseCoreService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(expenseCoreService, "helper", helper);
        ReflectionTestUtils.setField(expenseCoreService, "cacheManager", cacheManager);
        ReflectionTestUtils.setField(expenseCoreService, "asyncExpensePostProcessor", asyncExpensePostProcessor);
        ReflectionTestUtils.setField(expenseCoreService, "entityManager", entityManager);
        ReflectionTestUtils.setField(expenseCoreService, "entityManagerFactory", entityManagerFactory);
        ReflectionTestUtils.setField(expenseCoreService, "budgetService", budgetService);
        ReflectionTestUtils.setField(expenseCoreService, "categoryExpenseKafkaProducer", categoryExpenseKafkaProducer);
        ReflectionTestUtils.setField(expenseCoreService, "paymentMethodKafkaProducer", paymentMethodKafkaProducer);
        ReflectionTestUtils.setField(expenseCoreService, "categoryService", categoryService);
        ReflectionTestUtils.setField(expenseCoreService, "producer", producer);
        ReflectionTestUtils.setField(expenseCoreService, "paymentMethodService", paymentMethodService);
        ReflectionTestUtils.setField(expenseCoreService, "jsonConverter", jsonConverter);
        ReflectionTestUtils.setField(expenseCoreService, "budgetExpenseKafkaProducerService", budgetExpenseKafkaProducerService);
        ReflectionTestUtils.setField(expenseCoreService, "progressTracker", progressTracker);
        ReflectionTestUtils.setField(expenseCoreService, "auditEventProducer", auditEventProducer);
        ReflectionTestUtils.setField(expenseCoreService, "expenseMapper", expenseMapper);
        ReflectionTestUtils.setField(expenseCoreService, "userSettingsService", userSettingsService);
        ReflectionTestUtils.setField(expenseCoreService, "kafkaTemplate", kafkaTemplate);
        ReflectionTestUtils.setField(expenseCoreService, "momentumService", momentumService);
    }

    @Nested
    class AddExpense {

        @Test
        void shouldCreateExpenseWhenPayloadValidAndNoBudgets() throws Exception {
            UserDTO user = ExpenseTestDataFactory.buildUser();
            ExpenseDTO dto = ExpenseTestDataFactory.buildExpenseDTO();
            dto.setBudgetIds(new HashSet<>());

            Expense expenseWithoutId = ExpenseTestDataFactory.buildExpenseWithoutId();
            expenseWithoutId.setBudgetIds(new HashSet<>());

            ExpenseCategory category = new ExpenseCategory();
            category.setId(10);
            category.setName("Food");

            Expense savedExpense = ExpenseTestDataFactory.buildExpense();
            savedExpense.setId(101);
            savedExpense.setBudgetIds(new HashSet<>());

            ExpenseDTO resultDto = new ExpenseDTO();
            resultDto.setId(101);

            when(helper.validateUser(ExpenseTestDataFactory.TEST_USER_ID)).thenReturn(user);
            when(expenseMapper.toEntity(dto)).thenReturn(expenseWithoutId);
            when(categoryService.getById(10, ExpenseTestDataFactory.TEST_USER_ID)).thenReturn(category);
            when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);
            when(userSettingsService.getUserSettings(ExpenseTestDataFactory.TEST_USER_ID))
                    .thenReturn(ExpenseTestDataFactory.buildUserSettingsMasked(false));
            when(expenseMapper.toDTO(savedExpense, false)).thenReturn(resultDto);

            ExpenseDTO result = expenseCoreService.addExpense(dto, ExpenseTestDataFactory.TEST_USER_ID);

            assertThat(result.getId()).isEqualTo(101);
            verify(expenseRepository).save(any(Expense.class));
            verify(momentumService).invalidateAndRecompute(ExpenseTestDataFactory.TEST_USER_ID);
        }

        @Test
        void shouldThrowWhenExpenseDateMissing() throws Exception {
            UserDTO user = ExpenseTestDataFactory.buildUser();
            ExpenseDTO dto = ExpenseTestDataFactory.buildExpenseDTO();
            dto.setDate(null);

            Expense expenseWithoutId = ExpenseTestDataFactory.buildExpenseWithoutId();
            expenseWithoutId.setDate(null);

            when(helper.validateUser(ExpenseTestDataFactory.TEST_USER_ID)).thenReturn(user);
            when(expenseMapper.toEntity(dto)).thenReturn(expenseWithoutId);

            assertThatThrownBy(() -> expenseCoreService.addExpense(dto, ExpenseTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("date must not be null");
        }
    }

    @Nested
    class UpdateExpense {

        @Test
        void shouldThrowWhenExpenseNotFound() {
            when(expenseRepository.findByUserIdAndId(ExpenseTestDataFactory.TEST_USER_ID, 100)).thenReturn(null);

            assertThatThrownBy(() -> expenseCoreService.updateExpense(100, ExpenseTestDataFactory.buildExpense(),
                    ExpenseTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Expense not found");
        }

        @Test
        void shouldThrowWhenExpenseIsBill() {
            Expense existingExpense = ExpenseTestDataFactory.buildExpense();
            existingExpense.setBill(true);
            when(expenseRepository.findByUserIdAndId(ExpenseTestDataFactory.TEST_USER_ID, 100))
                    .thenReturn(existingExpense);

            assertThatThrownBy(() -> expenseCoreService.updateExpense(100, ExpenseTestDataFactory.buildExpense(),
                    ExpenseTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("bill expense");
        }
    }

    @Nested
    class DeleteExpense {

        @Test
        void shouldThrowWhenExpenseNotFound() {
            when(expenseRepository.findByUserIdAndId(ExpenseTestDataFactory.TEST_USER_ID, 100)).thenReturn(null);

            assertThatThrownBy(() -> expenseCoreService.deleteExpense(100, ExpenseTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Expense not found");
        }

        @Test
        void shouldThrowWhenDeletingBillExpense() {
            Expense existingExpense = ExpenseTestDataFactory.buildExpense();
            existingExpense.setBill(true);
            when(expenseRepository.findByUserIdAndId(ExpenseTestDataFactory.TEST_USER_ID, 100))
                    .thenReturn(existingExpense);

            assertThatThrownBy(() -> expenseCoreService.deleteExpense(100, ExpenseTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("bill expense");
        }

        @Test
        void shouldDeleteExpenseWhenValid() throws Exception {
            Expense existingExpense = ExpenseTestDataFactory.buildExpense();
            existingExpense.setCategoryId(null);
            existingExpense.setExpense(ExpenseTestDataFactory.buildExpenseDetails());
            existingExpense.getExpense().setPaymentMethod(null);

            UserDTO user = ExpenseTestDataFactory.buildUser();
            when(expenseRepository.findByUserIdAndId(ExpenseTestDataFactory.TEST_USER_ID, 100))
                    .thenReturn(existingExpense);
            when(cacheManager.getCache(anyString())).thenReturn(null);
            when(helper.validateUser(ExpenseTestDataFactory.TEST_USER_ID)).thenReturn(user);
            when(jsonConverter.toJson(any())).thenReturn("{}");

            expenseCoreService.deleteExpense(100, ExpenseTestDataFactory.TEST_USER_ID);

            verify(expenseRepository).deleteById(100);
        }
    }

    @Nested
    class CopyExpense {

        @Test
        void shouldCopyExpenseByDelegatingToAddExpense() throws Exception {
            ExpenseCoreServiceImpl spy = org.mockito.Mockito.spy(expenseCoreService);
            Expense originalExpense = ExpenseTestDataFactory.buildExpense();
            ExpenseDTO savedDto = new ExpenseDTO();
            savedDto.setId(102);
            Expense savedExpense = ExpenseTestDataFactory.buildExpense();
            savedExpense.setId(102);

            UserDTO user = ExpenseTestDataFactory.buildUser();
            when(helper.validateUser(ExpenseTestDataFactory.TEST_USER_ID)).thenReturn(user);
            doReturn(originalExpense).when(spy).getExpenseById(100, ExpenseTestDataFactory.TEST_USER_ID);
            doReturn(savedDto).when(spy).addExpense(any(), eq(ExpenseTestDataFactory.TEST_USER_ID));
            when(expenseMapper.toEntity(savedDto)).thenReturn(savedExpense);

            Expense result = spy.copyExpense(ExpenseTestDataFactory.TEST_USER_ID, 100);

            assertThat(result.getId()).isEqualTo(102);
        }
    }
}
