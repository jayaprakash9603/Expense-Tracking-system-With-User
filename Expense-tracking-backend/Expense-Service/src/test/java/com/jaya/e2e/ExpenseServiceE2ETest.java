package com.jaya.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ProgressStatus;
import com.jaya.kafka.AuditEventProducer;
import com.jaya.kafka.BudgetExpenseKafkaProducerService;
import com.jaya.kafka.CategoryExpenseKafkaProducerService;
import com.jaya.kafka.PaymentMethodKafkaProducerService;
import com.jaya.models.Expense;
import com.jaya.models.ExpenseCategory;
import com.jaya.models.ExpenseDetails;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.BillExportClient;
import com.jaya.service.BudgetServices;
import com.jaya.service.CategoryServiceWrapper;
import com.jaya.service.ExpenseServiceHelper;
import com.jaya.service.FriendShipService;
import com.jaya.service.MomentumService;
import com.jaya.service.PaymentMethodServices;
import com.jaya.testutil.ExpenseTestDataFactory;
import com.jaya.util.BulkProgressTracker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.http.MediaType;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@Testcontainers
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect"
})
class ExpenseServiceE2ETest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("expense_e2e")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureDatasource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", mysql::getJdbcUrl);
        registry.add("spring.datasource.username", mysql::getUsername);
        registry.add("spring.datasource.password", mysql::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "com.mysql.cj.jdbc.Driver");
    }

    private static final String TEST_JWT = "Bearer test-jwt";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private BulkProgressTracker bulkProgressTracker;

    @MockBean
    private IUserServiceClient userClient;

    @MockBean
    private FriendShipService friendShipService;

    @MockBean
    private CategoryServiceWrapper categoryService;

    @MockBean
    private BudgetServices budgetService;

    @MockBean
    private PaymentMethodServices paymentMethodService;

    @MockBean
    private CategoryExpenseKafkaProducerService categoryExpenseKafkaProducerService;

    @MockBean
    private PaymentMethodKafkaProducerService paymentMethodKafkaProducerService;

    @MockBean
    private BudgetExpenseKafkaProducerService budgetExpenseKafkaProducerService;

    @MockBean
    private AuditEventProducer auditEventProducer;

    @MockBean
    private KafkaTemplate<String, Object> kafkaTemplate;

    @MockBean
    private MomentumService momentumService;

    @MockBean
    private ExpenseServiceHelper expenseServiceHelper;

    @MockBean
    private BillExportClient billExportClient;

    @MockBean
    @Qualifier("expensePostExecutor")
    private AsyncTaskExecutor expensePostExecutor;

    @BeforeEach
    void setUp() throws Exception {
        objectMapper.registerModule(new JavaTimeModule());

        when(userClient.getUserProfile(TEST_JWT)).thenReturn(ExpenseTestDataFactory.buildUser());
        when(userClient.getUserById(1)).thenReturn(ExpenseTestDataFactory.buildUser());
        when(userClient.getUserById(2)).thenReturn(ExpenseTestDataFactory.buildFriendUser());

        doReturn(true).when(friendShipService).canUserAccessExpenses(anyInt(), anyInt());
        doReturn(true).when(friendShipService).canUserModifyExpenses(anyInt(), anyInt());
        doReturn(com.jaya.models.AccessLevel.FULL).when(friendShipService).getUserAccessLevel(anyInt(), anyInt());

        ExpenseCategory category = new ExpenseCategory();
        category.setId(10);
        category.setName("Food");
        ExpenseCategory othersCategory = new ExpenseCategory();
        othersCategory.setId(99);
        othersCategory.setName("Others");
        doReturn(category).when(categoryService).getById(eq(10), anyInt());
        doReturn(List.of(category)).when(categoryService).getByName(eq("Food"), anyInt());
        doReturn(List.of(othersCategory)).when(categoryService).getByName(eq("Others"), anyInt());
        doReturn(null).when(budgetService).getBudgetById(anyInt(), anyInt());

        when(paymentMethodService.getAllPaymentMethods(anyInt())).thenReturn(Collections.emptyList());

        doAnswer(inv -> {
            ((Runnable) inv.getArgument(0)).run();
            return null;
        }).when(expensePostExecutor).execute(any(Runnable.class));
    }

    @Nested
    @DisplayName("Workflow 1: Create expense -> fetch list -> update -> delete -> verify repository")
    class ExpenseCrudWorkflow {

        @Test
        @DisplayName("full CRUD lifecycle with repository state verification")
        void fullCrudLifecycle() throws Exception {
            assertThat(expenseRepository.count()).isZero();

            ExpenseDTO createDto = ExpenseTestDataFactory.buildExpenseDTO();
            createDto.setBudgetIds(new HashSet<>());
            ResultActions createResult = mockMvc.perform(post("/api/expenses/add-expense")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(createDto)))
                    .andExpect(status().isCreated());

            Integer createdId = objectMapper.readTree(createResult.andReturn().getResponse().getContentAsString())
                    .get("id").asInt();
            assertThat(createdId).isNotNull();
            assertThat(expenseRepository.count()).isEqualTo(1);

            mockMvc.perform(get("/api/expenses/fetch-expenses")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].id").value(createdId));

            Expense updatePayload = expenseRepository.findById(createdId).orElseThrow();
            updatePayload.getExpense().setExpenseName("Updated Lunch");
            updatePayload.getExpense().setAmount(300);

            mockMvc.perform(put("/api/expenses/edit-expense/" + createdId)
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updatePayload)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.expense.expenseName").value("Updated Lunch"));

            mockMvc.perform(delete("/api/expenses/delete/" + createdId)
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk());

            assertThat(expenseRepository.findById(createdId)).isEmpty();
        }
    }

    @Nested
    @DisplayName("Workflow 2: Tracked bulk import success")
    class TrackedBulkImportSuccess {

        @Test
        @DisplayName("post tracked with one valid expense, poll progress, assert COMPLETED")
        void trackedBulkImportSuccess() throws Exception {
            Expense validExpense = ExpenseTestDataFactory.buildExpenseWithoutId();
            validExpense.setId(null);
            validExpense.setBudgetIds(new HashSet<>());
            if (validExpense.getExpense() != null) {
                validExpense.getExpense().setId(null);
            }
            List<Expense> payload = List.of(validExpense);

            ResultActions postResult = mockMvc.perform(post("/api/expenses/add-multiple/tracked")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isAccepted())
                    .andExpect(jsonPath("$.jobId").exists());

            String jobId = objectMapper.readTree(postResult.andReturn().getResponse().getContentAsString())
                    .get("jobId").asText();

            ResultActions progressResult = mockMvc.perform(get("/api/expenses/add-multiple/progress/" + jobId)
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk());

            String status = objectMapper.readTree(progressResult.andReturn().getResponse().getContentAsString())
                    .get("status").asText();
            int processed = objectMapper.readTree(progressResult.andReturn().getResponse().getContentAsString())
                    .get("processed").asInt();
            int total = objectMapper.readTree(progressResult.andReturn().getResponse().getContentAsString())
                    .get("total").asInt();

            assertThat(status).isEqualTo("COMPLETED");
            assertThat(processed).isEqualTo(total);
            assertThat(processed).isEqualTo(1);
        }
    }

    @Nested
    @DisplayName("Workflow 3: Tracked bulk import failure")
    class TrackedBulkImportFailure {

        @Test
        @DisplayName("post tracked with invalid expense, poll progress, assert FAILED")
        void trackedBulkImportFailure() throws Exception {
            Expense invalidExpense = new Expense();
            invalidExpense.setDate(null);
            invalidExpense.setUserId(1);
            invalidExpense.setCategoryId(10);
            invalidExpense.setCategoryName("Food");
            ExpenseDetails details = new ExpenseDetails();
            details.setExpenseName("");
            details.setAmount(0);
            details.setType("loss");
            details.setPaymentMethod("cash");
            details.setExpense(invalidExpense);
            invalidExpense.setExpense(details);

            List<Expense> payload = List.of(invalidExpense);

            ResultActions postResult = mockMvc.perform(post("/api/expenses/add-multiple/tracked")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(payload)))
                    .andExpect(status().isAccepted())
                    .andExpect(jsonPath("$.jobId").exists());

            String jobId = objectMapper.readTree(postResult.andReturn().getResponse().getContentAsString())
                    .get("jobId").asText();

            for (int i = 0; i < 50; i++) {
                ProgressStatus ps = bulkProgressTracker.get(jobId);
                if (ps != null && "FAILED".equals(ps.getStatus())) {
                    assertThat(ps.getStatus()).isEqualTo("FAILED");
                    return;
                }
                Thread.sleep(50);
            }

            ProgressStatus status = bulkProgressTracker.get(jobId);
            assertThat(status).isNotNull();
            assertThat(status.getStatus()).isEqualTo("FAILED");
        }
    }
}
