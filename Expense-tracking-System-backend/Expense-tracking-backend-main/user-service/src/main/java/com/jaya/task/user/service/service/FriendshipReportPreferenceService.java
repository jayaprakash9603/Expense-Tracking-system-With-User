package com.jaya.task.user.service.service;

import com.jaya.task.user.service.dto.FriendshipReportPreferenceDTO;
import com.jaya.task.user.service.modal.FriendshipReportPreference;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.FriendshipReportPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for managing Friendship Report Preferences
 * Handles CRUD operations for user layout configurations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FriendshipReportPreferenceService {

    private final FriendshipReportPreferenceRepository friendshipReportPreferenceRepository;
    private final UserService userService;

    // Default friendship report configuration - matches frontend DEFAULT_SECTIONS
    private static final String DEFAULT_LAYOUT_CONFIG = """
            [
              {"id":"overview-cards","name":"Overview Cards","visible":true,"type":"full"},
              {"id":"access-level-chart","name":"Access Level Distribution","visible":true,"type":"half"},
              {"id":"activity-chart","name":"Friendship Activity","visible":true,"type":"half"},
              {"id":"sharing-status-chart","name":"Sharing Status Overview","visible":true,"type":"half"},
              {"id":"top-friends-chart","name":"Top Active Friends","visible":true,"type":"half"},
              {"id":"friends-table","name":"Friends Overview Table","visible":true,"type":"full"}
            ]
            """.trim();

    /**
     * Get friendship report preference for the authenticated user
     * Returns default configuration if no custom preference exists
     */
    @Transactional(readOnly = true)
    public FriendshipReportPreferenceDTO getUserFriendshipReportPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        Optional<FriendshipReportPreference> existing = friendshipReportPreferenceRepository.findByUserId(user.getId());

        if (existing.isPresent()) {
            log.debug("Returning custom friendship report preference for user: userId={}", user.getId());
            return toDTO(existing.get());
        } else {
            // Return default configuration without saving
            FriendshipReportPreferenceDTO defaultDto = new FriendshipReportPreferenceDTO();
            defaultDto.setUserId(user.getId());
            defaultDto.setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
            defaultDto.setCreatedAt(LocalDateTime.now());
            defaultDto.setUpdatedAt(LocalDateTime.now());

            log.debug("Returning default friendship report preference for user: userId={}", user.getId());

            return defaultDto;
        }
    }

    /**
     * Save or update friendship report preference for authenticated user
     */
    @Transactional
    public FriendshipReportPreferenceDTO saveFriendshipReportPreference(String jwt, String layoutConfig) {
        User user = userService.getUserProfile(jwt);

        FriendshipReportPreference preference = friendshipReportPreferenceRepository
                .findByUserId(user.getId())
                .orElse(new FriendshipReportPreference());

        preference.setUserId(user.getId());
        preference.setLayoutConfig(layoutConfig);

        FriendshipReportPreference saved = friendshipReportPreferenceRepository.save(preference);

        log.info("Friendship report preference saved for user: userId={}", user.getId());

        return toDTO(saved);
    }

    /**
     * Reset friendship report preference to default (delete custom preference)
     */
    @Transactional
    public void resetFriendshipReportPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        friendshipReportPreferenceRepository.deleteByUserId(user.getId());

        log.info("Friendship report preference reset for user: userId={}", user.getId());
    }

    /**
     * Convert entity to DTO
     */
    private FriendshipReportPreferenceDTO toDTO(FriendshipReportPreference entity) {
        FriendshipReportPreferenceDTO dto = new FriendshipReportPreferenceDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setLayoutConfig(entity.getLayoutConfig());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
