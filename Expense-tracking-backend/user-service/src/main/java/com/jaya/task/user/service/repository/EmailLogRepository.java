package com.jaya.task.user.service.repository;


import com.jaya.task.user.service.modal.EmailLog;
import com.jaya.task.user.service.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository("userEmailLogRepository")
public interface EmailLogRepository extends JpaRepository<EmailLog, Integer> {
    List<EmailLog> findBySentAtBetween(LocalDateTime start, LocalDateTime end);

    List<EmailLog>findByUser(User user);

    List<EmailLog> findByUserAndSentAtBetween(User user, LocalDateTime startDate, LocalDateTime endDate);
}