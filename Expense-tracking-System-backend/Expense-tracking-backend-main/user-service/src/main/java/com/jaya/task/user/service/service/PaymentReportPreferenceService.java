package com.jaya.task.user.service.service;

import com.jaya.task.user.service.dto.PaymentReportPreferenceDTO;
import com.jaya.task.user.service.modal.PaymentReportPreference;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.PaymentReportPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Service for managing Payment Report layout preferences.
 * Follows the same pattern as CategoryReportPreferenceService for consistency.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentReportPreferenceService {

    private final PaymentReportPreferenceRepository paymentReportPreferenceRepository;
    private final UserService userService;

    // Default payment report configuration
    private static final String DEFAULT_LAYOUT_CONFIG = """
            [
              {"id":"overview-cards","name":"Overview Cards","visible":true,"type":"full"},
              {"id":"daily-spending","name":"Daily Spending Pattern","visible":true,"type":"full"},
              {"id":"payment-distribution","name":"Payment Distribution","visible":true,"type":"full"},
              {"id":"usage-analysis","name":"Usage Analysis","visible":true,"type":"full"},
              {"id":"transaction-sizes","name":"Transaction Sizes","visible":true,"type":"half"},
              {"id":"category-breakdown","name":"Category Breakdown","visible":true,"type":"half"},
              {"id":"payment-accordion","name":"Payment Method Expenses","visible":true,"type":"full"}
            ]
            """.trim();

    /**
     * Get payment report preference for the authenticated user
     * Returns default configuration if no custom preference exists
     */
    @Transactional(readOnly = true)
    public PaymentReportPreferenceDTO getUserPaymentReportPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        Optional<PaymentReportPreference> existing = paymentReportPreferenceRepository.findByUserId(user.getId());

        if (existing.isPresent()) {
            return toDTO(existing.get());
        } else {
            // Return default configuration without saving
            PaymentReportPreferenceDTO defaultDto = new PaymentReportPreferenceDTO();
            defaultDto.setUserId(user.getId());
            defaultDto.setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
            defaultDto.setCreatedAt(LocalDateTime.now());
            defaultDto.setUpdatedAt(LocalDateTime.now());

            log.debug("Returning default payment report preference for user: userId={}", user.getId());

            return defaultDto;
        }
    }

    /**
     * Save or update payment report preference for authenticated user
     */
    @Transactional
    public PaymentReportPreferenceDTO savePaymentReportPreference(String jwt, String layoutConfig) {
        User user = userService.getUserProfile(jwt);

        PaymentReportPreference preference = paymentReportPreferenceRepository
                .findByUserId(user.getId())
                .orElse(new PaymentReportPreference());

        preference.setUserId(user.getId());
        preference.setLayoutConfig(layoutConfig);

        PaymentReportPreference saved = paymentReportPreferenceRepository.save(preference);

        log.info("Payment report preference saved for user: userId={}", user.getId());

        return toDTO(saved);
    }

    /**
     * Reset payment report preference to default (delete custom preference)
     */
    @Transactional
    public void resetPaymentReportPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        paymentReportPreferenceRepository.deleteByUserId(user.getId());

        log.info("Payment report preference reset for user: userId={}", user.getId());
    }

    /**
     * Convert entity to DTO
     */
    private PaymentReportPreferenceDTO toDTO(PaymentReportPreference entity) {
        PaymentReportPreferenceDTO dto = new PaymentReportPreferenceDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setLayoutConfig(entity.getLayoutConfig());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
