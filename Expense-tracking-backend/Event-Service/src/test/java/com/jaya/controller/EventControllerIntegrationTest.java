package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.EventBudgetDTO;
import com.jaya.dto.EventDonationDTO;
import com.jaya.dto.EventDTO;
import com.jaya.dto.EventExpenseDTO;
import com.jaya.service.EventService;
import com.jaya.testutil.EventTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
class EventControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EventService eventService;

    @Nested
    @DisplayName("POST /api/events")
    class CreateEvent {

        @Test
        @DisplayName("shouldCreateEventAndReturn201")
        void shouldCreateEventAndReturn201() throws Exception {
            EventDTO dto = EventTestDataFactory.buildEventDTO();
            dto.setEventName("Wedding Celebration");
            when(eventService.createEvent(any(EventDTO.class))).thenReturn(dto);

            ResultActions result = mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(dto)));

            result.andExpect(status().isCreated())
                    .andExpect(jsonPath("$.eventName").value("Wedding Celebration"));
        }

        @Test
        @DisplayName("shouldReturn400Or500WithEmptyBody")
        void shouldReturn400Or500WithEmptyBody() throws Exception {
            ResultActions result = mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(""));

            int status = result.andReturn().getResponse().getStatus();
            assertThat(status).isGreaterThanOrEqualTo(400);
        }
    }

    @Nested
    @DisplayName("PUT /api/events/{eventId}/user/{userId}")
    class UpdateEvent {

        @Test
        @DisplayName("shouldUpdateEventAndReturn200")
        void shouldUpdateEventAndReturn200() throws Exception {
            EventDTO dto = EventTestDataFactory.buildEventDTO();
            when(eventService.updateEvent(anyInt(), any(EventDTO.class), anyInt())).thenReturn(dto);

            mockMvc.perform(put("/api/events/1/user/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("shouldReturn500WhenEventNotFound")
        void shouldReturn500WhenEventNotFound() throws Exception {
            when(eventService.updateEvent(anyInt(), any(EventDTO.class), anyInt()))
                    .thenThrow(new RuntimeException("Event not found"));

            mockMvc.perform(put("/api/events/1/user/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(EventTestDataFactory.buildEventDTO())))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("DELETE /api/events/{eventId}/user/{userId}")
    class DeleteEvent {

        @Test
        @DisplayName("shouldDeleteEventAndReturn204")
        void shouldDeleteEventAndReturn204() throws Exception {
            doNothing().when(eventService).deleteEvent(anyInt(), anyInt());

            mockMvc.perform(delete("/api/events/1/user/1"))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("GET /api/events/{eventId}/user/{userId}")
    class GetEventById {

        @Test
        @DisplayName("shouldReturnEventById")
        void shouldReturnEventById() throws Exception {
            EventDTO dto = EventTestDataFactory.buildEventDTO();
            when(eventService.getEventById(anyInt(), anyInt())).thenReturn(dto);

            mockMvc.perform(get("/api/events/1/user/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.eventName").exists());
        }

        @Test
        @DisplayName("shouldReturn500WhenNotFound")
        void shouldReturn500WhenNotFound() throws Exception {
            when(eventService.getEventById(anyInt(), anyInt()))
                    .thenThrow(new RuntimeException("Event not found"));

            mockMvc.perform(get("/api/events/1/user/1"))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET /api/events/user/{userId}")
    class GetAllEventsByUser {

        @Test
        @DisplayName("shouldReturnAllEventsForUser")
        void shouldReturnAllEventsForUser() throws Exception {
            List<EventDTO> events = List.of(EventTestDataFactory.buildEventDTO());
            when(eventService.getAllEventsByUser(anyInt())).thenReturn(events);

            mockMvc.perform(get("/api/events/user/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1));
        }

        @Test
        @DisplayName("shouldReturnEmptyListForUser")
        void shouldReturnEmptyListForUser() throws Exception {
            when(eventService.getAllEventsByUser(anyInt())).thenReturn(Collections.emptyList());

            mockMvc.perform(get("/api/events/user/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(0));
        }
    }

    @Nested
    @DisplayName("POST /api/events/expenses")
    class AddExpense {

        @Test
        @DisplayName("shouldAddExpenseAndReturn201")
        void shouldAddExpenseAndReturn201() throws Exception {
            EventExpenseDTO dto = EventTestDataFactory.buildEventExpenseDTO(1);
            when(eventService.addExpenseToEvent(any(EventExpenseDTO.class))).thenReturn(dto);

            mockMvc.perform(post("/api/events/expenses")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("PUT /api/events/expenses/{expenseId}/user/{userId}")
    class UpdateExpense {

        @Test
        @DisplayName("shouldUpdateExpenseAndReturn200")
        void shouldUpdateExpenseAndReturn200() throws Exception {
            EventExpenseDTO dto = EventTestDataFactory.buildEventExpenseDTO(1);
            when(eventService.updateEventExpense(anyInt(), any(EventExpenseDTO.class), anyInt())).thenReturn(dto);

            mockMvc.perform(put("/api/events/expenses/1/user/1")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("DELETE /api/events/expenses/{expenseId}/user/{userId}")
    class DeleteExpense {

        @Test
        @DisplayName("shouldDeleteExpenseAndReturn204")
        void shouldDeleteExpenseAndReturn204() throws Exception {
            doNothing().when(eventService).deleteEventExpense(anyInt(), anyInt());

            mockMvc.perform(delete("/api/events/expenses/1/user/1"))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("GET /api/events/{eventId}/expenses/total")
    class GetTotalExpenses {

        @Test
        @DisplayName("shouldReturnTotalExpenses")
        void shouldReturnTotalExpenses() throws Exception {
            when(eventService.getTotalExpensesByEvent(anyInt())).thenReturn(BigDecimal.valueOf(25000));

            mockMvc.perform(get("/api/events/1/expenses/total"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").value(25000));
        }
    }

    @Nested
    @DisplayName("GET /api/events/{eventId}/expenses/category-wise")
    class GetCategoryWiseExpenses {

        @Test
        @DisplayName("shouldReturnCategoryWiseExpenses")
        void shouldReturnCategoryWiseExpenses() throws Exception {
            Map<String, BigDecimal> categoryExpenses = Map.of("Venue", BigDecimal.valueOf(25000));
            when(eventService.getCategoryWiseExpenses(anyInt())).thenReturn(categoryExpenses);

            mockMvc.perform(get("/api/events/1/expenses/category-wise"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.Venue").value(25000));
        }
    }

    @Nested
    @DisplayName("POST /api/events/donations")
    class AddDonation {

        @Test
        @DisplayName("shouldAddDonationAndReturn201")
        void shouldAddDonationAndReturn201() throws Exception {
            EventDonationDTO dto = EventTestDataFactory.buildEventDonationDTO(1);
            when(eventService.addDonationToEvent(any(EventDonationDTO.class))).thenReturn(dto);

            mockMvc.perform(post("/api/events/donations")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("POST /api/events/budgets")
    class CreateBudget {

        @Test
        @DisplayName("shouldCreateBudgetAndReturn201")
        void shouldCreateBudgetAndReturn201() throws Exception {
            EventBudgetDTO dto = EventTestDataFactory.buildEventBudgetDTO(1);
            when(eventService.createEventBudget(any(EventBudgetDTO.class))).thenReturn(dto);

            mockMvc.perform(post("/api/events/budgets")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(dto)))
                    .andExpect(status().isCreated());
        }
    }

    @Nested
    @DisplayName("GET /api/events/{eventId}/summary/user/{userId}")
    class GetEventSummary {

        @Test
        @DisplayName("shouldReturnEventSummary")
        void shouldReturnEventSummary() throws Exception {
            Map<String, Object> summary = Map.of("totalExpenses", 25000, "totalBudget", 100000);
            when(eventService.getEventSummary(anyInt(), anyInt())).thenReturn(summary);

            mockMvc.perform(get("/api/events/1/summary/user/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalExpenses").value(25000));
        }
    }

    @Nested
    @DisplayName("GET /api/events/{eventId}/analytics/user/{userId}")
    class GetEventAnalytics {

        @Test
        @DisplayName("shouldReturnEventAnalytics")
        void shouldReturnEventAnalytics() throws Exception {
            Map<String, Object> analytics = Map.of("categoryBreakdown", Map.of());
            when(eventService.getEventAnalytics(anyInt(), anyInt())).thenReturn(analytics);

            mockMvc.perform(get("/api/events/1/analytics/user/1"))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    @DisplayName("GET /api/events/{eventId}/financial-overview/user/{userId}")
    class GetFinancialOverview {

        @Test
        @DisplayName("shouldReturnFinancialOverview")
        void shouldReturnFinancialOverview() throws Exception {
            Map<String, Object> overview = Map.of("remainingBudget", 75000);
            when(eventService.getEventFinancialOverview(anyInt(), anyInt())).thenReturn(overview);

            mockMvc.perform(get("/api/events/1/financial-overview/user/1"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.remainingBudget").value(75000));
        }
    }

    @Nested
    @DisplayName("GET /api/events/categories")
    class GetCategories {

        @Test
        @DisplayName("shouldReturnCategories")
        void shouldReturnCategories() throws Exception {
            List<String> categories = List.of("Venue", "Catering");
            when(eventService.getEventCategories()).thenReturn(categories);

            mockMvc.perform(get("/api/events/categories"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("GET /api/events/payment-methods")
    class GetPaymentMethods {

        @Test
        @DisplayName("shouldReturnPaymentMethods")
        void shouldReturnPaymentMethods() throws Exception {
            List<String> methods = List.of("Cash", "Bank Transfer");
            when(eventService.getPaymentMethods()).thenReturn(methods);

            mockMvc.perform(get("/api/events/payment-methods"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("GET /api/events/user/{userId}/status-counts")
    class GetStatusCounts {

        @Test
        @DisplayName("shouldReturnStatusCounts")
        void shouldReturnStatusCounts() throws Exception {
            Map<String, Long> counts = Map.of("PLANNING", 3L, "COMPLETED", 2L);
            when(eventService.getEventStatusCounts(anyInt())).thenReturn(counts);

            mockMvc.perform(get("/api/events/user/1/status-counts"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.PLANNING").value(3))
                    .andExpect(jsonPath("$.COMPLETED").value(2));
        }
    }

    @Nested
    @DisplayName("GET /api/events/user/{userId}/monthly-summary/{year}/{month}")
    class GetMonthlySummary {

        @Test
        @DisplayName("shouldReturnMonthlySummary")
        void shouldReturnMonthlySummary() throws Exception {
            List<Map<String, Object>> summary = List.of(Map.of("eventName", "Wedding", "totalExpenses", 25000));
            when(eventService.getMonthlyEventSummary(anyInt(), anyInt(), anyInt())).thenReturn(summary);

            mockMvc.perform(get("/api/events/user/1/monthly-summary/2025/3"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1));
        }
    }

    @Nested
    @DisplayName("POST /api/events/{eventId}/update-totals")
    class UpdateTotals {

        @Test
        @DisplayName("shouldUpdateTotalsAndReturn200")
        void shouldUpdateTotalsAndReturn200() throws Exception {
            doNothing().when(eventService).updateEventTotals(anyInt());

            mockMvc.perform(post("/api/events/1/update-totals"))
                    .andExpect(status().isOk());
        }
    }
}
