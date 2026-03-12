package com.jaya.repository;

import com.jaya.model.Event;
import com.jaya.testutil.EventTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EntityScan("com.jaya.model")
class EventRepositoryIntegrationTest {

    private static final Integer REPO_TEST_USER_ID = 99999;

    @Autowired
    private EventRepository eventRepository;

    @Nested
    @DisplayName("findByUserIdOrderByStartDateDesc")
    class FindByUserIdOrderByStartDateDesc {

        @Test
        @DisplayName("shouldReturnEventsOrderedByStartDate")
        void shouldReturnEventsOrderedByStartDate() {
            Event e1 = EventTestDataFactory.buildEvent();
            e1.setId(null);
            e1.setStartDate(LocalDate.of(2025, 1, 15));
            e1.setEndDate(LocalDate.of(2025, 1, 20));

            Event e2 = EventTestDataFactory.buildEvent();
            e2.setId(null);
            e2.setEventName("Birthday Party");
            e2.setStartDate(LocalDate.of(2025, 3, 10));
            e2.setEndDate(LocalDate.of(2025, 3, 12));

            Event e3 = EventTestDataFactory.buildEvent();
            e3.setId(null);
            e3.setEventName("Anniversary");
            e3.setStartDate(LocalDate.of(2025, 2, 1));
            e3.setEndDate(LocalDate.of(2025, 2, 5));

            e1.setUserId(REPO_TEST_USER_ID);
            e2.setUserId(REPO_TEST_USER_ID);
            e3.setUserId(REPO_TEST_USER_ID);
            eventRepository.saveAll(List.of(e1, e2, e3));

            List<Event> result = eventRepository.findByUserIdOrderByStartDateDesc(REPO_TEST_USER_ID);

            assertThat(result).hasSize(3);
            assertThat(result.get(0).getStartDate()).isEqualTo(LocalDate.of(2025, 3, 10));
            assertThat(result.get(1).getStartDate()).isEqualTo(LocalDate.of(2025, 2, 1));
            assertThat(result.get(2).getStartDate()).isEqualTo(LocalDate.of(2025, 1, 15));
        }
    }

    @Nested
    @DisplayName("findByIdAndUserId")
    class FindByIdAndUserId {

        @Test
        @DisplayName("shouldReturnEventWhenIdAndUserIdMatch")
        void shouldReturnEventWhenIdAndUserIdMatch() {
            Event event = EventTestDataFactory.buildEvent();
            event.setId(null);
            event.setUserId(REPO_TEST_USER_ID);
            Event saved = eventRepository.save(event);

            Optional<Event> result = eventRepository.findByIdAndUserId(saved.getId(), REPO_TEST_USER_ID);

            assertThat(result).isPresent();
            assertThat(result.get().getEventName()).isEqualTo("Wedding Celebration");
        }

        @Test
        @DisplayName("shouldReturnEmptyWhenUserIdDoesNotMatch")
        void shouldReturnEmptyWhenUserIdDoesNotMatch() {
            Event event = EventTestDataFactory.buildEvent();
            event.setId(null);
            event.setUserId(REPO_TEST_USER_ID);
            Event saved = eventRepository.save(event);

            Optional<Event> result = eventRepository.findByIdAndUserId(saved.getId(), REPO_TEST_USER_ID + 1);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByUserIdAndStatus")
    class FindByUserIdAndStatus {

        @Test
        @DisplayName("shouldFilterByStatus")
        void shouldFilterByStatus() {
            Event planning = EventTestDataFactory.buildEvent();
            planning.setId(null);
            planning.setUserId(REPO_TEST_USER_ID);
            planning.setStatus(Event.EventStatus.PLANNING);

            Event completed = EventTestDataFactory.buildEvent();
            completed.setId(null);
            completed.setUserId(REPO_TEST_USER_ID);
            completed.setEventName("Completed Wedding");
            completed.setStatus(Event.EventStatus.COMPLETED);

            eventRepository.saveAll(List.of(planning, completed));

            List<Event> result = eventRepository.findByUserIdAndStatus(REPO_TEST_USER_ID, Event.EventStatus.PLANNING);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getStatus()).isEqualTo(Event.EventStatus.PLANNING);
        }
    }

    @Nested
    @DisplayName("findByUserIdAndEventType")
    class FindByUserIdAndEventType {

        @Test
        @DisplayName("shouldFilterByEventType")
        void shouldFilterByEventType() {
            Event wedding = EventTestDataFactory.buildEvent();
            wedding.setId(null);
            wedding.setUserId(REPO_TEST_USER_ID);
            wedding.setEventType(Event.EventType.WEDDING);

            Event birthday = EventTestDataFactory.buildEvent();
            birthday.setId(null);
            birthday.setUserId(REPO_TEST_USER_ID);
            birthday.setEventName("Birthday Party");
            birthday.setEventType(Event.EventType.BIRTHDAY);

            eventRepository.saveAll(List.of(wedding, birthday));

            List<Event> result = eventRepository.findByUserIdAndEventType(REPO_TEST_USER_ID, Event.EventType.WEDDING);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getEventType()).isEqualTo(Event.EventType.WEDDING);
        }
    }

    @Nested
    @DisplayName("findByUserIdAndStartDateBetween")
    class FindByUserIdAndStartDateBetween {

        @Test
        @DisplayName("shouldReturnEventsInDateRange")
        void shouldReturnEventsInDateRange() {
            Event inRange = EventTestDataFactory.buildEvent();
            inRange.setId(null);
            inRange.setUserId(REPO_TEST_USER_ID);
            inRange.setStartDate(LocalDate.of(2025, 2, 15));
            inRange.setEndDate(LocalDate.of(2025, 2, 20));

            Event outOfRange = EventTestDataFactory.buildEvent();
            outOfRange.setId(null);
            outOfRange.setUserId(REPO_TEST_USER_ID);
            outOfRange.setEventName("Out of Range");
            outOfRange.setStartDate(LocalDate.of(2025, 5, 1));
            outOfRange.setEndDate(LocalDate.of(2025, 5, 5));

            eventRepository.saveAll(List.of(inRange, outOfRange));

            List<Event> result = eventRepository.findByUserIdAndStartDateBetween(
                    REPO_TEST_USER_ID,
                    LocalDate.of(2025, 2, 1),
                    LocalDate.of(2025, 2, 28));

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getEventName()).isEqualTo("Wedding Celebration");
        }
    }

    @Nested
    @DisplayName("findByUserIdAndEventNameContaining")
    class FindByUserIdAndEventNameContaining {

        @Test
        @DisplayName("shouldFindByPartialName")
        void shouldFindByPartialName() {
            Event wedding = EventTestDataFactory.buildEvent();
            wedding.setId(null);
            wedding.setUserId(REPO_TEST_USER_ID);
            wedding.setEventName("Wedding Celebration");

            Event birthday = EventTestDataFactory.buildEvent();
            birthday.setId(null);
            birthday.setUserId(REPO_TEST_USER_ID);
            birthday.setEventName("Birthday Party");

            eventRepository.saveAll(List.of(wedding, birthday));

            List<Event> result = eventRepository.findByUserIdAndEventNameContaining(REPO_TEST_USER_ID, "Wedding");

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getEventName()).isEqualTo("Wedding Celebration");
        }
    }

    @Nested
    @DisplayName("countByUserIdAndStatus")
    class CountByUserIdAndStatus {

        @Test
        @DisplayName("shouldCountCorrectly")
        void shouldCountCorrectly() {
            for (int i = 0; i < 3; i++) {
                Event e = EventTestDataFactory.buildEvent();
                e.setId(null);
                e.setUserId(REPO_TEST_USER_ID);
                e.setEventName("Planning " + i);
                e.setStatus(Event.EventStatus.PLANNING);
                eventRepository.save(e);
            }
            for (int i = 0; i < 2; i++) {
                Event e = EventTestDataFactory.buildEvent();
                e.setId(null);
                e.setUserId(REPO_TEST_USER_ID);
                e.setEventName("Completed " + i);
                e.setStatus(Event.EventStatus.COMPLETED);
                eventRepository.save(e);
            }

            Long planningCount = eventRepository.countByUserIdAndStatus(REPO_TEST_USER_ID, Event.EventStatus.PLANNING);
            Long completedCount = eventRepository.countByUserIdAndStatus(REPO_TEST_USER_ID, Event.EventStatus.COMPLETED);

            assertThat(planningCount).isEqualTo(3L);
            assertThat(completedCount).isEqualTo(2L);
        }
    }
}
