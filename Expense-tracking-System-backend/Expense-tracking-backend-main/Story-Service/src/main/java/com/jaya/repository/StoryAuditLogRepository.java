package com.jaya.repository;

import com.jaya.models.StoryAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StoryAuditLogRepository extends JpaRepository<StoryAuditLog, UUID> {

    // Find audit logs for a specific story
    List<StoryAuditLog> findByStoryIdOrderByCreatedAtDesc(UUID storyId);

    // Find audit logs by admin
    Page<StoryAuditLog> findByAdminIdOrderByCreatedAtDesc(Integer adminId, Pageable pageable);

    // Find audit logs by action type
    Page<StoryAuditLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

    // Find audit logs in date range
    List<StoryAuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    // Find recent audit logs
    Page<StoryAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
