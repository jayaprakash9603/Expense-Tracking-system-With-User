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

    
    List<StoryAuditLog> findByStoryIdOrderByCreatedAtDesc(UUID storyId);

    
    Page<StoryAuditLog> findByAdminIdOrderByCreatedAtDesc(Integer adminId, Pageable pageable);

    
    Page<StoryAuditLog> findByActionOrderByCreatedAtDesc(String action, Pageable pageable);

    
    List<StoryAuditLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    
    Page<StoryAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
