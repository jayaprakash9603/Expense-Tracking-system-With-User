package com.jaya.task.user.service.service;

import com.jaya.task.user.service.dto.ExpenseReportPreferenceDTO;
import com.jaya.task.user.service.modal.ExpenseReportPreference;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.ExpenseReportPreferenceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ExpenseReportPreferenceService {

    private final ExpenseReportPreferenceRepository expenseReportPreferenceRepository;
    private final UserService userService;

    
    private static final String DEFAULT_LAYOUT_CONFIG = """
            [
              {"id":"overview-cards","name":"Overview Cards","visible":true,"type":"full"},
              {"id":"daily-spending","name":"Daily Spending Pattern","visible":true,"type":"full"},
              {"id":"category-breakdown","name":"Category Breakdown","visible":true,"type":"half"},
              {"id":"payment-methods","name":"Payment Methods","visible":true,"type":"half"},
              {"id":"expenses-accordion","name":"Grouped Expenses","visible":true,"type":"full"}
            ]
            """.trim();

    



    @Transactional(readOnly = true)
    public ExpenseReportPreferenceDTO getUserExpenseReportPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        Optional<ExpenseReportPreference> existing = expenseReportPreferenceRepository.findByUserId(user.getId());

        if (existing.isPresent()) {
            return toDTO(existing.get());
        } else {
            
            ExpenseReportPreferenceDTO defaultDto = new ExpenseReportPreferenceDTO();
            defaultDto.setUserId(user.getId());
            defaultDto.setLayoutConfig(DEFAULT_LAYOUT_CONFIG);
            defaultDto.setCreatedAt(LocalDateTime.now());
            defaultDto.setUpdatedAt(LocalDateTime.now());

            log.debug("Returning default expense report preference for user: userId={}", user.getId());

            return defaultDto;
        }
    }

    


    @Transactional
    public ExpenseReportPreferenceDTO saveExpenseReportPreference(String jwt, String layoutConfig) {
        User user = userService.getUserProfile(jwt);

        ExpenseReportPreference preference = expenseReportPreferenceRepository
                .findByUserId(user.getId())
                .orElse(new ExpenseReportPreference());

        preference.setUserId(user.getId());
        preference.setLayoutConfig(layoutConfig);

        ExpenseReportPreference saved = expenseReportPreferenceRepository.save(preference);

        log.info("Expense report preference saved for user: userId={}", user.getId());

        return toDTO(saved);
    }

    


    @Transactional
    public void resetExpenseReportPreference(String jwt) {
        User user = userService.getUserProfile(jwt);

        expenseReportPreferenceRepository.deleteByUserId(user.getId());

        log.info("Expense report preference reset for user: userId={}", user.getId());
    }

    


    private ExpenseReportPreferenceDTO toDTO(ExpenseReportPreference entity) {
        ExpenseReportPreferenceDTO dto = new ExpenseReportPreferenceDTO();
        dto.setId(entity.getId());
        dto.setUserId(entity.getUserId());
        dto.setLayoutConfig(entity.getLayoutConfig());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}
