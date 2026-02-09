package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.model.BudgetReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;





@Repository
public interface BudgetReportPreferenceRepository extends JpaRepository<BudgetReportPreference, Long> {

    





    Optional<BudgetReportPreference> findByUserId(Integer userId);

    





    void deleteByUserId(Integer userId);
}
