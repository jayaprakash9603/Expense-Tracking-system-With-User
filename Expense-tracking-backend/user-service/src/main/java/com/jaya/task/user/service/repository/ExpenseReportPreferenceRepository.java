package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.ExpenseReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpenseReportPreferenceRepository extends JpaRepository<ExpenseReportPreference, Long> {

    





    Optional<ExpenseReportPreference> findByUserId(Integer userId);

    





    boolean existsByUserId(Integer userId);

    




    void deleteByUserId(Integer userId);
}
