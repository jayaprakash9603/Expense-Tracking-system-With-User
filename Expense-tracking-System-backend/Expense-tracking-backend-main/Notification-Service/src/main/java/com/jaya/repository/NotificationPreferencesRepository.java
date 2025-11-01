package com.jaya.repository;

import com.jaya.modal.NotificationPreferences;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * NotificationPreferencesRepository
 * JPA repository for notification preferences persistence
 * Provides CRUD operations and custom queries for notification preferences
 */
@Repository
public interface NotificationPreferencesRepository extends JpaRepository<NotificationPreferences, Integer> {

    /**
     * Find notification preferences by user ID
     * 
     * @param userId the user ID
     * @return Optional containing the notification preferences if found
     */
    Optional<NotificationPreferences> findByUserId(Integer userId);

    /**
     * Check if notification preferences exist for a user
     * 
     * @param userId the user ID
     * @return true if preferences exist, false otherwise
     */
    boolean existsByUserId(Integer userId);

    /**
     * Delete notification preferences by user ID
     * 
     * @param userId the user ID
     */
    void deleteByUserId(Integer userId);
}