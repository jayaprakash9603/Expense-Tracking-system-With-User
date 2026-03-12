package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.BulkExpenseBudgetRequest;
import com.jaya.dto.BulkExpenseBudgetResponse;
import com.jaya.dto.ProgressStatus;
import com.jaya.service.BulkExpenseBudgetService;
import com.jaya.testutil.ExpenseTestDataFactory;
import com.jaya.util.BulkProgressTracker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BulkExpenseBudgetController.class)
class BulkExpenseBudgetControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BulkExpenseBudgetService bulkExpenseBudgetService;
    @MockBean
    private IUserServiceClient userClient;
    @MockBean
    private BulkProgressTracker bulkProgressTracker;

    @BeforeEach
    void setUp() {
        when(userClient.getUserProfile(ExpenseTestDataFactory.TEST_JWT)).thenReturn(ExpenseTestDataFactory.buildUser());
    }

    @Test
    void createBulkExpensesAndBudgetsReturns200WithSuccessWhenServiceReturnsSuccess() throws Exception {
        BulkExpenseBudgetRequest request = new BulkExpenseBudgetRequest();
        BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping = new BulkExpenseBudgetRequest.ExpenseBudgetMapping();
        mapping.setExpenses(List.of());
        mapping.setBudgets(List.of());
        request.setMappings(List.of(mapping));

        BulkExpenseBudgetResponse response = BulkExpenseBudgetResponse.builder()
                .success(true)
                .message("Processed")
                .build();
        when(bulkExpenseBudgetService.processBulkExpensesAndBudgets(any(BulkExpenseBudgetRequest.class), eq(ExpenseTestDataFactory.TEST_USER_ID)))
                .thenReturn(response);

        mockMvc.perform(post("/api/bulk/expenses-budgets")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    void createBulkExpensesAndBudgetsReturns400ForEmptyMappings() throws Exception {
        BulkExpenseBudgetRequest request = new BulkExpenseBudgetRequest();
        request.setMappings(Collections.emptyList());

        mockMvc.perform(post("/api/bulk/expenses-budgets")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createBulkExpensesAndBudgetsTrackedReturns202AndJobId() throws Exception {
        BulkExpenseBudgetRequest request = new BulkExpenseBudgetRequest();
        BulkExpenseBudgetRequest.ExpenseBudgetMapping mapping = new BulkExpenseBudgetRequest.ExpenseBudgetMapping();
        mapping.setExpenses(List.of());
        mapping.setBudgets(List.of());
        request.setMappings(List.of(mapping));

        when(bulkProgressTracker.start(eq(ExpenseTestDataFactory.TEST_USER_ID), anyInt(), anyString()))
                .thenReturn("job1");

        mockMvc.perform(post("/api/bulk/expenses-budgets/tracked")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.jobId").value("job1"));
    }

    @Test
    void getBulkProgressReturns200ForSameUser() throws Exception {
        ProgressStatus status = new ProgressStatus("job1", 10, ExpenseTestDataFactory.TEST_USER_ID);
        when(bulkProgressTracker.get("job1")).thenReturn(status);

        mockMvc.perform(get("/api/bulk/expenses-budgets/progress/job1")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.jobId").value("job1"));
    }

    @Test
    void getBulkProgressReturns403WhenStatusUserIdDifferent() throws Exception {
        ProgressStatus status = new ProgressStatus("job1", 10, ExpenseTestDataFactory.FRIEND_USER_ID);
        status.setUserId(ExpenseTestDataFactory.FRIEND_USER_ID);
        when(bulkProgressTracker.get("job1")).thenReturn(status);

        mockMvc.perform(get("/api/bulk/expenses-budgets/progress/job1")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT))
                .andExpect(status().isForbidden());
    }

    @Test
    void getBulkProgressReturns404WhenNoStatus() throws Exception {
        when(bulkProgressTracker.get("nonexistent")).thenReturn(null);

        mockMvc.perform(get("/api/bulk/expenses-budgets/progress/nonexistent")
                        .header("Authorization", ExpenseTestDataFactory.TEST_JWT))
                .andExpect(status().isNotFound());
    }
}
