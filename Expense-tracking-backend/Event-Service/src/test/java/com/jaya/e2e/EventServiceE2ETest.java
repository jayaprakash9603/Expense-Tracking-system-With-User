package com.jaya.e2e;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.EventBudgetDTO;
import com.jaya.dto.EventDonationDTO;
import com.jaya.dto.EventDTO;
import com.jaya.dto.EventExpenseDTO;
import com.jaya.model.Event;
import com.jaya.repository.EventBudgetRepository;
import com.jaya.repository.EventDonationRepository;
import com.jaya.repository.EventExpenseRepository;
import com.jaya.repository.EventRepository;
import com.jaya.testutil.EventTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:event_service_e2e;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
})
class EventServiceE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private EventExpenseRepository eventExpenseRepository;

    @Autowired
    private EventDonationRepository eventDonationRepository;

    @Autowired
    private EventBudgetRepository eventBudgetRepository;

    @Nested
    @DisplayName("Workflow 1: Full event lifecycle")
    class FullEventLifecycle {

        @Test
        @DisplayName("create event, add expense/donation/budget, verify totals")
        void fullEventLifecycle() throws Exception {
            EventDTO eventDTO = EventTestDataFactory.buildEventDTO();
            eventDTO.setId(null);
            eventDTO.setTotalBudget(BigDecimal.valueOf(100000));

            ResultActions createEvent = mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(eventDTO)));
            createEvent.andExpect(status().isCreated());
            Integer eventId = Integer.parseInt(objectMapper.readTree(createEvent.andReturn().getResponse().getContentAsString()).get("id").asText());

            EventExpenseDTO expenseDTO = EventTestDataFactory.buildEventExpenseDTO(eventId);
            expenseDTO.setId(null);
            expenseDTO.setAmount(BigDecimal.valueOf(25000));
            expenseDTO.setCategory("Venue");

            mockMvc.perform(post("/api/events/expenses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(expenseDTO)))
                    .andExpect(status().isCreated());

            EventDonationDTO donationDTO = EventTestDataFactory.buildEventDonationDTO(eventId);
            donationDTO.setId(null);
            donationDTO.setAmount(BigDecimal.valueOf(10000));

            mockMvc.perform(post("/api/events/donations")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(donationDTO)))
                    .andExpect(status().isCreated());

            EventBudgetDTO budgetDTO = EventTestDataFactory.buildEventBudgetDTO(eventId);
            budgetDTO.setId(null);
            budgetDTO.setCategory("Venue");
            budgetDTO.setAllocatedAmount(BigDecimal.valueOf(30000));

            mockMvc.perform(post("/api/events/budgets")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(budgetDTO)))
                    .andExpect(status().isCreated());

            Integer userId = EventTestDataFactory.TEST_USER_ID;

            mockMvc.perform(get("/api/events/{eventId}/summary/user/{userId}", eventId, userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalExpenses").value(25000))
                    .andExpect(jsonPath("$.totalDonations").value(10000));

            mockMvc.perform(get("/api/events/{eventId}/financial-overview/user/{userId}", eventId, userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.remainingBudget").value(5000));
        }
    }

    @Nested
    @DisplayName("Workflow 2: Expense deletion resets totals")
    class ExpenseDeletionResetsTotals {

        @Test
        @DisplayName("delete expense and verify totalExpenses resets to 0")
        void expenseDeletionResetsTotals() throws Exception {
            EventDTO eventDTO = EventTestDataFactory.buildEventDTO();
            eventDTO.setId(null);
            eventDTO.setTotalBudget(BigDecimal.valueOf(50000));

            ResultActions createEvent = mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(eventDTO)));
            createEvent.andExpect(status().isCreated());
            Integer eventId = Integer.parseInt(objectMapper.readTree(createEvent.andReturn().getResponse().getContentAsString()).get("id").asText());

            EventExpenseDTO expenseDTO = EventTestDataFactory.buildEventExpenseDTO(eventId, BigDecimal.valueOf(20000), EventTestDataFactory.TEST_USER_ID);
            expenseDTO.setId(null);

            ResultActions addExpense = mockMvc.perform(post("/api/events/expenses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(expenseDTO)));
            addExpense.andExpect(status().isCreated());
            Integer expenseId = Integer.parseInt(objectMapper.readTree(addExpense.andReturn().getResponse().getContentAsString()).get("id").asText());

            Integer userId = EventTestDataFactory.TEST_USER_ID;

            mockMvc.perform(get("/api/events/{eventId}/summary/user/{userId}", eventId, userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalExpenses").value(20000));

            mockMvc.perform(delete("/api/events/expenses/{expenseId}/user/{userId}", expenseId, userId))
                    .andExpect(status().isNoContent());

            mockMvc.perform(get("/api/events/{eventId}/summary/user/{userId}", eventId, userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalExpenses").value(0));
        }
    }

    @Nested
    @DisplayName("Workflow 3: Authorization mismatch")
    class AuthorizationMismatch {

        @Test
        @DisplayName("update expense as different user returns 500")
        void updateExpenseAsDifferentUserReturns500() throws Exception {
            EventDTO eventDTO = EventTestDataFactory.buildEventDTO();
            eventDTO.setId(null);
            eventDTO.setUserId(EventTestDataFactory.TEST_USER_ID);

            ResultActions createEvent = mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(eventDTO)));
            createEvent.andExpect(status().isCreated());
            Integer eventId = Integer.parseInt(objectMapper.readTree(createEvent.andReturn().getResponse().getContentAsString()).get("id").asText());

            EventExpenseDTO expenseDTO = EventTestDataFactory.buildEventExpenseDTO(eventId);
            expenseDTO.setId(null);
            expenseDTO.setUserId(EventTestDataFactory.TEST_USER_ID);

            ResultActions addExpense = mockMvc.perform(post("/api/events/expenses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(expenseDTO)));
            addExpense.andExpect(status().isCreated());
            Integer expenseId = Integer.parseInt(objectMapper.readTree(addExpense.andReturn().getResponse().getContentAsString()).get("id").asText());

            EventExpenseDTO updateDTO = EventTestDataFactory.buildEventExpenseDTO(eventId);
            updateDTO.setAmount(BigDecimal.valueOf(30000));

            mockMvc.perform(put("/api/events/expenses/{expenseId}/user/{userId}", expenseId, EventTestDataFactory.OTHER_USER_ID)
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(updateDTO)))
                    .andExpect(status().isInternalServerError());
        }

        @Test
        @DisplayName("delete expense as different user returns 500")
        void deleteExpenseAsDifferentUserReturns500() throws Exception {
            EventDTO eventDTO = EventTestDataFactory.buildEventDTO();
            eventDTO.setId(null);
            eventDTO.setUserId(EventTestDataFactory.TEST_USER_ID);

            ResultActions createEvent = mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(eventDTO)));
            createEvent.andExpect(status().isCreated());
            Integer eventId = Integer.parseInt(objectMapper.readTree(createEvent.andReturn().getResponse().getContentAsString()).get("id").asText());

            EventExpenseDTO expenseDTO = EventTestDataFactory.buildEventExpenseDTO(eventId);
            expenseDTO.setId(null);
            expenseDTO.setUserId(EventTestDataFactory.TEST_USER_ID);

            ResultActions addExpense = mockMvc.perform(post("/api/events/expenses")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(expenseDTO)));
            addExpense.andExpect(status().isCreated());
            Integer expenseId = Integer.parseInt(objectMapper.readTree(addExpense.andReturn().getResponse().getContentAsString()).get("id").asText());

            mockMvc.perform(delete("/api/events/expenses/{expenseId}/user/{userId}", expenseId, EventTestDataFactory.OTHER_USER_ID))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("Workflow 4: Search and filter")
    class SearchAndFilter {

        @Test
        @DisplayName("search by eventName and filter by status")
        void searchAndFilter() throws Exception {
            Integer userId = EventTestDataFactory.TEST_USER_ID;
            LocalDate today = LocalDate.now();

            EventDTO weddingDTO = EventTestDataFactory.buildEventDTO("Wedding Celebration", Event.EventType.WEDDING, Event.EventStatus.PLANNING, BigDecimal.valueOf(100000));
            weddingDTO.setId(null);
            weddingDTO.setStartDate(today);
            weddingDTO.setEndDate(today.plusDays(7));

            ResultActions createWedding = mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(weddingDTO)));
            createWedding.andExpect(status().isCreated());

            EventDTO birthdayDTO = EventTestDataFactory.buildEventDTO("Birthday Party", Event.EventType.BIRTHDAY, Event.EventStatus.PLANNING, BigDecimal.valueOf(50000));
            birthdayDTO.setId(null);
            birthdayDTO.setStartDate(today);
            birthdayDTO.setEndDate(today.plusDays(1));

            mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(birthdayDTO)))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/events/user/{userId}/search", userId)
                    .param("eventName", "Wedding"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(1))
                    .andExpect(jsonPath("$[0].eventName").value("Wedding Celebration"));

            mockMvc.perform(get("/api/events/user/{userId}/status/PLANNING", userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }

    @Nested
    @DisplayName("Workflow 5: Analytics with zero budget")
    class AnalyticsWithZeroBudget {

        @Test
        @DisplayName("analytics returns budgetUtilization 0 when totalBudget is 0")
        void analyticsWithZeroBudget() throws Exception {
            EventDTO eventDTO = EventTestDataFactory.buildEventDTO();
            eventDTO.setId(null);
            eventDTO.setTotalBudget(BigDecimal.ZERO);

            ResultActions createEvent = mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(eventDTO)));
            createEvent.andExpect(status().isCreated());
            Integer eventId = Integer.parseInt(objectMapper.readTree(createEvent.andReturn().getResponse().getContentAsString()).get("id").asText());

            Integer userId = EventTestDataFactory.TEST_USER_ID;

            mockMvc.perform(get("/api/events/{eventId}/analytics/user/{userId}", eventId, userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.budgetUtilization").value(0));
        }
    }

    @Nested
    @DisplayName("P1 Workflow: Monthly summary and status counts")
    class MonthlySummaryAndStatusCounts {

        @Test
        @DisplayName("status counts and monthly summary")
        void statusCountsAndMonthlySummary() throws Exception {
            Integer userId = EventTestDataFactory.TEST_USER_ID;
            int year = LocalDate.now().getYear();
            int month = LocalDate.now().getMonthValue();
            LocalDate today = LocalDate.of(year, month, 15);

            EventDTO planningDTO = EventTestDataFactory.buildEventDTO("Planning Event", Event.EventType.WEDDING, Event.EventStatus.PLANNING, BigDecimal.valueOf(50000));
            planningDTO.setId(null);
            planningDTO.setStartDate(today);
            planningDTO.setEndDate(today.plusDays(1));

            mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(planningDTO)))
                    .andExpect(status().isCreated());

            EventDTO completedDTO = EventTestDataFactory.buildEventDTO("Completed Event", Event.EventType.BIRTHDAY, Event.EventStatus.COMPLETED, BigDecimal.valueOf(30000));
            completedDTO.setId(null);
            completedDTO.setStartDate(today);
            completedDTO.setEndDate(today.plusDays(1));

            mockMvc.perform(post("/api/events")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(completedDTO)))
                    .andExpect(status().isCreated());

            mockMvc.perform(get("/api/events/user/{userId}/status-counts", userId))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.PLANNING").value(1))
                    .andExpect(jsonPath("$.COMPLETED").value(1));

            mockMvc.perform(get("/api/events/user/{userId}/monthly-summary/{year}/{month}", userId, year, month))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.length()").value(2));
        }
    }
}
