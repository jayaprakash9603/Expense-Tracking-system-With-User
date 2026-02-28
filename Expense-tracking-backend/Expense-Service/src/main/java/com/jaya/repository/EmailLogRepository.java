package com.jaya.repository;

import com.jaya.common.dto.UserDTO;
import com.jaya.models.EmailLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmailLogRepository extends JpaRepository<EmailLog, Integer> {
    List<EmailLog> findBySentAtBetween(LocalDateTime start, LocalDateTime end);

    List<EmailLog> findByUserId(Integer userId);

    List<EmailLog> findByUserIdAndSentAtBetween(Integer userId, LocalDateTime startDate, LocalDateTime endDate);
}
