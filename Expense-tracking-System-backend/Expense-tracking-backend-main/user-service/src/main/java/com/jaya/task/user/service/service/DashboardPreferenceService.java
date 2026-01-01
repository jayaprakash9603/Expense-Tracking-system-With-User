package com.jaya.task.user.service.service;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.dto.DashboardPreferenceDTO;
import com.jaya.task.user.service.modal.DashboardPreference;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.DashboardPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DashboardPreferenceService {

    private final DashboardPreferenceRepository dashboardPreferenceRepository;
    private final UserService userService;

    // Default dashboard configuration
    private static final String DEFAULT_LAYOUT_CONFIG = """
            [
              {"id":"metrics","name":"Key Metrics","visible":true,"type":"full"},
              {"id":"daily-spending","name":"Daily Spending","visible":true,"type":"full"},
              {"id":"quick-access","name":"Quick Access","visible":true,"type":"full"},
              {"id":"summary-overview","name":"Summary Overview","visible":true,"type":"half"},
              {"id":"category-breakdown","name":"Category Breakdown","visible":true,"type":"half"},
              {"id":"monthly-trend","name":"Monthly Trend","visible":true,"type":"half"},
              {"id":"payment-methods","name":"Payment Methods","visible":true,"type":"half"},
              {"id":"recent-transactions","name":"Recent Transactions","visible":true,"type":"bottom"},
              {"id":"budget-overview","name":"Budget Overview","visible":true,"type":"bottom"}
            ]
            """.trim();

    /**
     * Get dashboard preference for the authenticated user
     * Returns default configuration if no custom preference exists
     */
    @Transactional(readOnly = true)
    public DashboardPreferenceDTO getUserDashboardPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        Optional<DashboardPreference> existing = dashboardPreferenceRepository.findByUserId(user.getId());

        if (existing.isPresent()) {
            return toDTO(existing.get());
        } else {
            // Return default configuration without saving
            DashboardPreferenceDTO defaultDto = new DashboardPreferenceDTO();
            defaultDto.setUserId(user.getId());
            defaultDto.setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
            defaultDto.setCreatedAt(LocalDateTime.now());
            defaultDto.setUpdatedAt(LocalDateTime.now());

            log.debug("Returning default dashboard preference for user: userId={}", user.getId());

            return defaultDto;
        }
    }

    /**
     * Save or update dashboard preference for authenticated user
     */
    @Transactional
    public DashboardPreferenceDTO saveDashboardPreference(String jwt, String layoutConfig) {
        User user = userService.getUserProfile(jwt);

        DashboardPreference preference = dashboardPreferenceRepository
                .findByUserId(user.getId())
                .orElse(new DashboardPreference());

        preference.setUserId(user.getId());
        preference.setLayoutConfig(layoutConfig);

        DashboardPreference saved = dashboardPreferenceRepository.save(preference);

        log.info("Dashboard preference saved for user: userId={}", user.getId());

        return toDTO(saved);
    }

    /**
     * Reset dashboard preference to default (delete custom preference)
     */
    @Transactional
    public void resetDashboardPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        dashboardPreferenceRepository.deleteByUserId(user.getId());

        log.info("Dashboard preference reset for user: userId={}", user.getId());
    }

    /**
     * Convert entity to DTO
     */
    private DashboardPreferenceDTO toDTO(DashboardPreference entity) {
        DashboardPreferenceDTO dto = new DashboardPreferenceDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setLayoutConfig(entity.getLayoutConfig());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
