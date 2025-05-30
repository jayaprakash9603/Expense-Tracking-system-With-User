package com.jaya.repository;

import com.jaya.models.EmailLog;
import com.jaya.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Integer> {
    List<EmailLog> findBySentAtBetween(LocalDateTime start, LocalDateTime end);

    List<EmailLog>findByUser(User user);

    List<EmailLog> findByUserAndSentAtBetween(User user, LocalDateTime startDate, LocalDateTime endDate);
}