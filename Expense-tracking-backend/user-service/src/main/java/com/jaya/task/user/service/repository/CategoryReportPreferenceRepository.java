package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.CategoryReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryReportPreferenceRepository extends JpaRepository<CategoryReportPreference, Long> {

    Optional<CategoryReportPreference> findByUserId(Integer userId);

    void deleteByUserId(Integer userId);
}
