package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.FriendshipReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;





@Repository
public interface FriendshipReportPreferenceRepository extends JpaRepository<FriendshipReportPreference, Long> {

    


    Optional<FriendshipReportPreference> findByUserId(Integer userId);

    


    void deleteByUserId(Integer userId);
}
