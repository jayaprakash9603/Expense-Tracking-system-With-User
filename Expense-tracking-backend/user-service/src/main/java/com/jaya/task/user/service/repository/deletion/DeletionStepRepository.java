package com.jaya.task.user.service.repository.deletion;

import com.jaya.task.user.service.modal.deletion.DeletionSaga;
import com.jaya.task.user.service.modal.deletion.DeletionStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeletionStepRepository extends JpaRepository<DeletionStep, Long> {

    Optional<DeletionStep> findByIdempotencyKey(String idempotencyKey);

    List<DeletionStep> findBySaga(DeletionSaga saga);
}
