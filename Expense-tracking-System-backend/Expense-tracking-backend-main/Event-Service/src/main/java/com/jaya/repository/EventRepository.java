package com.jaya.repository;

import com.jaya.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer> {

    List<Event> findByUserIdOrderByStartDateDesc(Integer userId);

    List<Event> findByUserIdAndStatus(Integer userId, Event.EventStatus status);

    List<Event> findByUserIdAndEventType(Integer userId, Event.EventType eventType);

    List<Event> findByUserIdAndStartDateBetween(Integer userId, LocalDate startDate, LocalDate endDate);

    Optional<Event> findByIdAndUserId(Integer id, Integer userId);

    @Query("SELECT e FROM Event e WHERE e.userId = :userId AND e.eventName LIKE %:eventName%")
    List<Event> findByUserIdAndEventNameContaining(@Param("userId") Integer userId, @Param("eventName") String eventName);

    @Query("SELECT e FROM Event e WHERE e.userId = :userId AND e.startDate <= :date AND e.endDate >= :date")
    List<Event> findActiveEventsByDate(@Param("userId") Integer userId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(e) FROM Event e WHERE e.userId = :userId AND e.status = :status")
    Long countByUserIdAndStatus(@Param("userId") Integer userId, @Param("status") Event.EventStatus status);
}