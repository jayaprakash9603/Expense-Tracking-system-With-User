package com.jaya.task.user.service.repository.deletion;

import com.jaya.task.user.service.modal.deletion.DeletionOutbox;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DeletionOutboxRepository extends JpaRepository<DeletionOutbox, Long> {

    @Query("SELECT o FROM DeletionOutbox o WHERE o.publishedAt IS NULL AND o.nextAttemptAt <= :now ORDER BY o.id ASC")
    List<DeletionOutbox> findPendingBatch(@Param("now") LocalDateTime now);
}
