package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.model.BillReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;





@Repository
public interface BillReportPreferenceRepository extends JpaRepository<BillReportPreference, Long> {

    





    Optional<BillReportPreference> findByUserId(Integer userId);

    





    void deleteByUserId(Integer userId);
}
