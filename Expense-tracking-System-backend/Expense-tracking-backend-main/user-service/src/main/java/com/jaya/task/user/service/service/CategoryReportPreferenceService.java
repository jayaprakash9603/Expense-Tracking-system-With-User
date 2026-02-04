package com.jaya.task.user.service.service;

import com.jaya.task.user.service.dto.CategoryReportPreferenceDTO;
import com.jaya.task.user.service.modal.CategoryReportPreference;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.CategoryReportPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryReportPreferenceService {

    private final CategoryReportPreferenceRepository categoryReportPreferenceRepository;
    private final UserService userService;

    // Default category report configuration
    private static final String DEFAULT_LAYOUT_CONFIG = """
            [
              {"id":"overview-cards","name":"Overview Cards","visible":true,"type":"full"},
              {"id":"daily-spending","name":"Daily Spending Pattern","visible":true,"type":"full"},
              {"id":"usage-analysis","name":"Usage Analysis","visible":true,"type":"full"},
              {"id":"category-distribution","name":"Category Distribution","visible":true,"type":"full"},
              {"id":"category-accordion","name":"Category Expenses","visible":true,"type":"full"}
            ]
            """.trim();

    /**
     * Get category report preference for the authenticated user
     * Returns default configuration if no custom preference exists
     */
    @Transactional(readOnly = true)
    public CategoryReportPreferenceDTO getUserCategoryReportPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        Optional<CategoryReportPreference> existing = categoryReportPreferenceRepository.findByUserId(user.getId());

        if (existing.isPresent()) {
            return toDTO(existing.get());
        } else {
            // Return default configuration without saving
            CategoryReportPreferenceDTO defaultDto = new CategoryReportPreferenceDTO();
            defaultDto.setUserId(user.getId());
            defaultDto.setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
            defaultDto.setCreatedAt(LocalDateTime.now());
            defaultDto.setUpdatedAt(LocalDateTime.now());

            log.debug("Returning default category report preference for user: userId={}", user.getId());

            return defaultDto;
        }
    }

    /**
     * Save or update category report preference for authenticated user
     */
    @Transactional
    public CategoryReportPreferenceDTO saveCategoryReportPreference(String jwt, String layoutConfig) {
        User user = userService.getUserProfile(jwt);

        CategoryReportPreference preference = categoryReportPreferenceRepository
                .findByUserId(user.getId())
                .orElse(new CategoryReportPreference());

        preference.setUserId(user.getId());
        preference.setLayoutConfig(layoutConfig);

        CategoryReportPreference saved = categoryReportPreferenceRepository.save(preference);

        log.info("Category report preference saved for user: userId={}", user.getId());

        return toDTO(saved);
    }

    /**
     * Reset category report preference to default (delete custom preference)
     */
    @Transactional
    public void resetCategoryReportPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        categoryReportPreferenceRepository.deleteByUserId(user.getId());

        log.info("Category report preference reset for user: userId={}", user.getId());
    }

    /**
     * Convert entity to DTO
     */
    private CategoryReportPreferenceDTO toDTO(CategoryReportPreference entity) {
        CategoryReportPreferenceDTO dto = new CategoryReportPreferenceDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setLayoutConfig(entity.getLayoutConfig());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
