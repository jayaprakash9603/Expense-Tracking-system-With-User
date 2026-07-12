package com.jaya.task.user.service.repository.deletion;

import com.jaya.task.user.service.modal.deletion.DeletionSaga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DeletionSagaRepository extends JpaRepository<DeletionSaga, Long> {

    Optional<DeletionSaga> findByCorrelationId(String correlationId);

    @Query("SELECT s FROM DeletionSaga s WHERE s.userId = :userId AND s.state IN " +
            "(com.jaya.task.user.service.modal.deletion.DeletionSaga.State.REQUESTED, " +
            " com.jaya.task.user.service.modal.deletion.DeletionSaga.State.PURGING, " +
            " com.jaya.task.user.service.modal.deletion.DeletionSaga.State.FAILED)")
    Optional<DeletionSaga> findActiveByUserId(@Param("userId") Integer userId);

    /**
     * Claims sagas whose grace period has elapsed. The pessimistic lock keeps a
     * single scheduler instance from double-processing when running multiple pods.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM DeletionSaga s WHERE s.state = " +
            "com.jaya.task.user.service.modal.deletion.DeletionSaga.State.REQUESTED " +
            "AND s.scheduledPurgeAt <= :cutoff ORDER BY s.scheduledPurgeAt ASC")
    List<DeletionSaga> claimDueSagas(@Param("cutoff") LocalDateTime cutoff);

    List<DeletionSaga> findTop50ByStateOrderByRequestedAtAsc(DeletionSaga.State state);
}
