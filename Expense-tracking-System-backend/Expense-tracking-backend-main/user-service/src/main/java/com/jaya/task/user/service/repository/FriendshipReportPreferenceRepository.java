package com.jaya.task.user.service.repository;

import com.jaya.task.user.service.modal.FriendshipReportPreference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for Friendship Report Preferences
 * Handles persistence of user-specific layout configurations
 */
@Repository
public interface FriendshipReportPreferenceRepository extends JpaRepository<FriendshipReportPreference, Long> {

    /**
     * Find friendship report preference by user ID
     */
    Optional<FriendshipReportPreference> findByUserId(Integer userId);

    /**
     * Delete friendship report preference by user ID (for reset)
     */
    void deleteByUserId(Integer userId);
}
