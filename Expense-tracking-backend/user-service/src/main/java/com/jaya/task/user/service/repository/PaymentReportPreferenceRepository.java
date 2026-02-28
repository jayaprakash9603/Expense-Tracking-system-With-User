package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.PaymentReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;





@Repository
public interface PaymentReportPreferenceRepository extends JpaRepository<PaymentReportPreference, Long> {

    Optional<PaymentReportPreference> findByUserId(Integer userId);

    void deleteByUserId(Integer userId);
}
