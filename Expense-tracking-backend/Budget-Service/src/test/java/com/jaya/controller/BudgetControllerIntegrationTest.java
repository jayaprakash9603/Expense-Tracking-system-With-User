package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.client.BudgetFriendshipClient;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.BudgetReport;
import com.jaya.dto.BudgetSearchDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.exceptions.BudgetNotFoundException;
import com.jaya.kafka.service.UnifiedActivityService;
import com.jaya.models.Budget;
import com.jaya.service.BudgetService;
import com.jaya.testutil.BudgetTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BudgetController.class)
class BudgetControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BudgetService budgetService;

    @MockBean
    private IUserServiceClient userServiceClient;

    @MockBean
    private UnifiedActivityService unifiedActivityService;

    @MockBean
    private BudgetFriendshipClient friendshipService;

    private UserDTO reqUser;
    private Budget testBudget;

    @BeforeEach
    void setUp() {
        reqUser = BudgetTestDataFactory.buildUser();
        testBudget = BudgetTestDataFactory.buildBudget();
        when(userServiceClient.getUserProfile(BudgetTestDataFactory.TEST_JWT)).thenReturn(reqUser);
    }

    @Nested
    @DisplayName("POST /api/budgets")
    class CreateBudget {

        @Test
        @DisplayName("should create budget and return 201")
        void shouldCreateBudget() throws Exception {
            when(budgetService.createBudget(any(Budget.class), eq(reqUser.getId())))
                    .thenReturn(testBudget);

            mockMvc.perform(post("/api/budgets")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(BudgetTestDataFactory.buildBudgetWithoutId())))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.id").value(100))
                    .andExpect(jsonPath("$.name").value("Monthly Groceries"))
                    .andExpect(jsonPath("$.amount").value(5000.0));
        }

        @Test
        @DisplayName("should reject request when JWT invalid")
        void shouldRejectWhenJwtInvalid() throws Exception {
            when(userServiceClient.getUserProfile("Bearer invalid-token")).thenReturn(null);

            mockMvc.perform(post("/api/budgets")
                            .header("Authorization", "Bearer invalid-token")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(BudgetTestDataFactory.buildBudgetWithoutId())))
                    .andExpect(status().is5xxServerError());
        }
    }

    @Nested
    @DisplayName("PUT /api/budgets/{budgetId}")
    class EditBudget {

        @Test
        @DisplayName("should edit budget and return 200")
        void shouldEditBudget() throws Exception {
            when(budgetService.getBudgetById(100, reqUser.getId())).thenReturn(testBudget);
            when(budgetService.editBudget(eq(100), any(Budget.class), eq(reqUser.getId())))
                    .thenReturn(testBudget);

            mockMvc.perform(put("/api/budgets/100")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testBudget)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(100))
                    .andExpect(jsonPath("$.name").value("Monthly Groceries"));
        }

        @Test
        @DisplayName("should return error when budget not found")
        void shouldReturnErrorWhenNotFound() throws Exception {
            when(budgetService.getBudgetById(999, reqUser.getId()))
                    .thenThrow(new BudgetNotFoundException("budget not Found999"));

            mockMvc.perform(put("/api/budgets/999")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(testBudget)))
                    .andExpect(status().is5xxServerError());
        }
    }

    @Nested
    @DisplayName("DELETE /api/budgets/{budgetId}")
    class DeleteBudget {

        @Test
        @DisplayName("should delete budget and return 204")
        void shouldDeleteBudget() throws Exception {
            when(budgetService.getBudgetById(100, reqUser.getId())).thenReturn(testBudget);

            mockMvc.perform(delete("/api/budgets/100")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("should return error when budget not found on delete")
        void shouldReturnErrorWhenNotFound() throws Exception {
            when(budgetService.getBudgetById(999, reqUser.getId()))
                    .thenThrow(new BudgetNotFoundException("budget not Found999"));

            mockMvc.perform(delete("/api/budgets/999")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().is5xxServerError());
        }
    }

    @Nested
    @DisplayName("GET /api/budgets/{budgetId}")
    class GetBudgetById {

        @Test
        @DisplayName("should return budget by ID")
        void shouldReturnBudgetById() throws Exception {
            when(budgetService.getBudgetById(100, reqUser.getId())).thenReturn(testBudget);

            mockMvc.perform(get("/api/budgets/100")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(100))
                    .andExpect(jsonPath("$.name").value("Monthly Groceries"))
                    .andExpect(jsonPath("$.amount").value(5000.0));
        }

        @Test
        @DisplayName("should return error when budget not found")
        void shouldReturnErrorWhenNotFound() throws Exception {
            when(budgetService.getBudgetById(999, reqUser.getId()))
                    .thenThrow(new BudgetNotFoundException("budget not Found999"));

            mockMvc.perform(get("/api/budgets/999")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().is5xxServerError());
        }

        @Test
        @DisplayName("should return unauthorized when no JWT")
        void shouldReturnUnauthorizedWithoutJwt() throws Exception {
            when(userServiceClient.getUserProfile(null)).thenReturn(null);

            mockMvc.perform(get("/api/budgets/100"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("GET /api/budgets")
    class GetAllBudgets {

        @Test
        @DisplayName("should return all budgets for user")
        void shouldReturnAllBudgets() throws Exception {
            when(budgetService.getAllBudgetForUser(reqUser.getId()))
                    .thenReturn(List.of(testBudget));

            mockMvc.perform(get("/api/budgets")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(100));
        }

        @Test
        @DisplayName("should return empty list when no budgets")
        void shouldReturnEmptyList() throws Exception {
            when(budgetService.getAllBudgetForUser(reqUser.getId()))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/budgets")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$").isEmpty());
        }
    }

    @Nested
    @DisplayName("GET /api/budgets/{budgetId}/expenses")
    class GetExpensesWithinBudgetDates {

        @Test
        @DisplayName("should return expenses for budget")
        void shouldReturnExpenses() throws Exception {
            ExpenseDTO expense = BudgetTestDataFactory.buildExpenseDTO();
            when(budgetService.getExpensesForUserByBudgetId(reqUser.getId(), 100))
                    .thenReturn(List.of(expense));

            mockMvc.perform(get("/api/budgets/100/expenses")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(501));
        }
    }

    @Nested
    @DisplayName("GET /api/budgets/report/{budgetId}")
    class GetBudgetReport {

        @Test
        @DisplayName("should return budget report")
        void shouldReturnReport() throws Exception {
            BudgetReport report = BudgetTestDataFactory.buildBudgetReport();
            when(budgetService.calculateBudgetReport(reqUser.getId(), 100))
                    .thenReturn(report);

            mockMvc.perform(get("/api/budgets/report/100")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.budgetId").value(100))
                    .andExpect(jsonPath("$.budgetName").value("Monthly Groceries"))
                    .andExpect(jsonPath("$.allocatedAmount").value(5000.0));
        }
    }

    @Nested
    @DisplayName("GET /api/budgets/reports")
    class GetAllBudgetReports {

        @Test
        @DisplayName("should return all budget reports for user")
        void shouldReturnAllReports() throws Exception {
            BudgetReport report = BudgetTestDataFactory.buildBudgetReport();
            when(budgetService.getAllBudgetReportsForUser(reqUser.getId()))
                    .thenReturn(List.of(report));

            mockMvc.perform(get("/api/budgets/reports")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].budgetId").value(100));
        }
    }

    @Nested
    @DisplayName("GET /api/budgets/filter-by-date")
    class GetBudgetsByDate {

        @Test
        @DisplayName("should return budgets for date")
        void shouldReturnBudgetsForDate() throws Exception {
            when(budgetService.getBudgetsByDate(any(LocalDate.class), eq(reqUser.getId())))
                    .thenReturn(List.of(testBudget));

            mockMvc.perform(get("/api/budgets/filter-by-date")
                            .param("date", LocalDate.now().toString())
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].id").value(100));
        }
    }

    @Nested
    @DisplayName("GET /api/budgets/search")
    class SearchBudgets {

        @Test
        @DisplayName("should return matching budgets")
        void shouldReturnMatchingBudgets() throws Exception {
            BudgetSearchDTO dto = BudgetTestDataFactory.buildBudgetSearchDTO();
            when(budgetService.searchBudgets(eq(reqUser.getId()), eq("Groceries"), anyInt()))
                    .thenReturn(List.of(dto));

            mockMvc.perform(get("/api/budgets/search")
                            .param("query", "Groceries")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$[0].name").value("Monthly Groceries"));
        }

        @Test
        @DisplayName("should return empty for no matches")
        void shouldReturnEmptyForNoMatches() throws Exception {
            when(budgetService.searchBudgets(eq(reqUser.getId()), eq("xyz"), anyInt()))
                    .thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/budgets/search")
                            .param("query", "xyz")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$").isEmpty());
        }
    }

    @Nested
    @DisplayName("DELETE /api/budgets (deleteAll)")
    class DeleteAllBudgets {

        @Test
        @DisplayName("should delete all budgets and return 204")
        void shouldDeleteAllBudgets() throws Exception {
            when(budgetService.getAllBudgetForUser(reqUser.getId()))
                    .thenReturn(List.of(testBudget));

            mockMvc.perform(delete("/api/budgets")
                            .header("Authorization", BudgetTestDataFactory.TEST_JWT))
                    .andExpect(status().isNoContent());
        }
    }
}
