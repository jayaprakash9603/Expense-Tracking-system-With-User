package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.ExpenseDTO;
import com.jaya.dto.ProgressStatus;
import com.jaya.exceptions.GlobalExceptions;
import com.jaya.kafka.service.UnifiedActivityService;
import com.jaya.mapper.ExpenseMapper;
import com.jaya.models.Expense;
import com.jaya.repository.ExpenseRepository;
import com.jaya.service.*;
import com.jaya.service.cashflow.CashflowAggregationService;
import com.jaya.testutil.ExpenseTestDataFactory;
import com.jaya.util.BulkProgressTracker;
import com.jaya.util.UserPermissionHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.quality.Strictness;
import org.mockito.junit.jupiter.MockitoSettings;
import org.springframework.core.task.SyncTaskExecutor;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Field;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ExpenseControllerIntegrationTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock
    private ExpenseService expenseService;
    @Mock
    private ExpenseServiceHelper expenseServiceHelper;
    @Mock
    private IUserServiceClient userClient;
    @Mock
    private FriendShipService friendShipService;
    @Mock
    private ExpenseRepository expenseRepository;
    @Mock
    private ExcelService excelService;
    @Mock
    private EmailService emailService;
    @Mock
    private KafkaProducerService kafkaProducerService;
    @Mock
    private UserPermissionHelper userPermissionHelper;
    @Mock
    private BulkProgressTracker bulkProgressTracker;
    @Mock
    private UnifiedActivityService unifiedActivityService;
    @Mock
    private ReportHistoryService reportHistoryService;
    @Mock
    private BillExportClient billExportClient;
    @Mock
    private CashflowAggregationService cashflowAggregationService;
    @Mock
    private ExpenseViewService expenseViewService;
    @Mock
    private ExpenseMapper expenseMapper;
    @Mock
    private UserSettingsService userSettingsService;

    @BeforeEach
    void setUp() {
        ExpenseController controller = new ExpenseController(
                expenseService,
                expenseServiceHelper,
                userClient,
                friendShipService,
                expenseRepository,
                excelService,
                emailService,
                kafkaProducerService,
                userPermissionHelper,
                bulkProgressTracker,
                new SyncTaskExecutor(),
                unifiedActivityService,
                reportHistoryService,
                billExportClient,
                cashflowAggregationService,
                expenseViewService);
        ReflectionTestUtils.setField(controller, "expenseService", expenseService);
        ReflectionTestUtils.setField(controller, "friendshipService", friendShipService);
        setParentField(controller, BaseExpenseController.class, "IUserServiceClient", userClient);
        setParentField(controller, BaseExpenseController.class, "permissionHelper", userPermissionHelper);
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptions())
                .build();

        when(userClient.getUserProfile(anyString())).thenReturn(ExpenseTestDataFactory.buildUser());
        when(userPermissionHelper.getTargetUserWithPermissionCheck(any(), any(UserDTO.class), anyBoolean()))
                .thenAnswer(inv -> {
                    Integer targetId = inv.getArgument(0);
                    if (targetId == null) {
                        return ExpenseTestDataFactory.buildUser();
                    }
                    if (targetId == 2) {
                        return ExpenseTestDataFactory.buildFriendUser();
                    }
                    return ExpenseTestDataFactory.buildUser();
                });
    }

    private void setParentField(Object target, Class<?> parentClass, String fieldName, Object value) {
        try {
            Field field = parentClass.getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (Exception e) {
            throw new RuntimeException("Failed to set field " + fieldName, e);
        }
    }

    @Test
    void addExpenseReturns201WithPayloadWhenValidBodyAndAuth() throws Exception {
        ExpenseDTO requestBody = ExpenseTestDataFactory.buildExpenseDTO();
        ExpenseDTO created = ExpenseTestDataFactory.buildExpenseDTO();
        created.setDate(requestBody.getDate());
        when(expenseService.addExpense(any(ExpenseDTO.class), eq(ExpenseTestDataFactory.TEST_USER_ID)))
                .thenReturn(created);

        ResultActions result = mockMvc.perform(post("/api/expenses/add-expense")
                .header("Authorization", ExpenseTestDataFactory.TEST_JWT)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requestBody)));

        result.andExpect(status().isCreated())
                .andExpect(jsonPath("$.date").exists())
                .andExpect(jsonPath("$.userId").value(ExpenseTestDataFactory.TEST_USER_ID));
    }

    @Test
    void editExpenseReturns200() throws Exception {
        Expense expense = ExpenseTestDataFactory.buildExpense();
        when(expenseService.getExpenseById(anyInt(), eq(ExpenseTestDataFactory.TEST_USER_ID))).thenReturn(expense);
        when(expenseService.updateExpense(anyInt(), any(Expense.class), eq(ExpenseTestDataFactory.TEST_USER_ID)))
                .thenReturn(expense);

        mockMvc.perform(put("/api/expenses/edit-expense/100")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isOk());
    }

    @Test
    void deleteExpenseReturns200() throws Exception {
        Expense expense = ExpenseTestDataFactory.buildExpense();
        when(expenseService.getExpenseById(anyInt(), eq(ExpenseTestDataFactory.TEST_USER_ID))).thenReturn(expense);
        doNothing().when(expenseService).deleteExpense(anyInt(), eq(ExpenseTestDataFactory.TEST_USER_ID));

        mockMvc.perform(delete("/api/expenses/delete/100")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT))
                .andExpect(status().isOk());
    }

    @Test
    void fetchExpensesReturns200Array() throws Exception {
        List<Expense> expenses = List.of(ExpenseTestDataFactory.buildExpense());
        when(expenseService.getExpensesByUserAndSort(eq(ExpenseTestDataFactory.TEST_USER_ID), anyString()))
                .thenReturn(expenses);

        mockMvc.perform(get("/api/expenses/fetch-expenses")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getExpenseByIdReturns200() throws Exception {
        Expense expense = ExpenseTestDataFactory.buildExpense();
        when(expenseService.getExpenseById(100, ExpenseTestDataFactory.TEST_USER_ID)).thenReturn(expense);

        mockMvc.perform(get("/api/expenses/expense/100")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(100));
    }

    @Test
    void addMultipleTrackedReturns202WithJobId() throws Exception {
        when(bulkProgressTracker.start(eq(ExpenseTestDataFactory.TEST_USER_ID), anyInt(), anyString()))
                .thenReturn("job1");
        List<Expense> expenses = List.of(ExpenseTestDataFactory.buildExpense());

        mockMvc.perform(post("/api/expenses/add-multiple/tracked")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(expenses)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.jobId").value("job1"));
    }

    @Test
    void getAddMultipleProgressReturns200WhenStatusExists() throws Exception {
        ProgressStatus status = new ProgressStatus("job1", 10, ExpenseTestDataFactory.TEST_USER_ID);
        when(userClient.getUserProfile(ExpenseTestDataFactory.TEST_JWT)).thenReturn(ExpenseTestDataFactory.buildUser());
        when(bulkProgressTracker.get("job1")).thenReturn(status);

        mockMvc.perform(get("/api/expenses/add-multiple/progress/job1")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobId").value("job1"));
    }

    @Test
    void addExpenseReturns400WhenAuthorizationMissing() throws Exception {
        ExpenseDTO requestBody = ExpenseTestDataFactory.buildExpenseDTO();

        mockMvc.perform(post("/api/expenses/add-expense")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getUserExpensesReturns403WhenFriendshipServiceDeniesAccess() throws Exception {
        when(userClient.getUserProfile(ExpenseTestDataFactory.TEST_JWT)).thenReturn(ExpenseTestDataFactory.buildUser());
        when(friendShipService.canUserAccessExpenses(eq(ExpenseTestDataFactory.FRIEND_USER_ID), eq(ExpenseTestDataFactory.TEST_USER_ID)))
                .thenReturn(false);

        mockMvc.perform(get("/api/expenses/UserDTO/" + ExpenseTestDataFactory.FRIEND_USER_ID)
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT))
                .andExpect(status().isForbidden());
    }
}
