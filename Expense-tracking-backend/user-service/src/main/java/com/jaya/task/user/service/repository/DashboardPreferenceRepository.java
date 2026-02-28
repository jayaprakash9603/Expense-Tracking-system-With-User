package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.DashboardPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DashboardPreferenceRepository extends JpaRepository<DashboardPreference, Long> {

    





    Optional<DashboardPreference> findByUserId(Integer userId);

    





    boolean existsByUserId(Integer userId);

    




    void deleteByUserId(Integer userId);
}
