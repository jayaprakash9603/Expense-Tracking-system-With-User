package com.jaya.task.user.service.service;

import com.jaya.task.user.service.dto.BillReportPreferenceDTO;
import com.jaya.task.user.service.model.BillReportPreference;
import com.jaya.task.user.service.repository.BillReportPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;





@Service
public class BillReportPreferenceService {

    private final BillReportPreferenceRepository repository;

    



    public static final String DEFAULT_LAYOUT_CONFIG = """
            [
                {"id":"overview-cards","name":"Overview Cards","visible":true,"type":"full"},
                {"id":"category-chart","name":"Expenses by Category","visible":true,"type":"half"},
                {"id":"payment-method-chart","name":"Payment Methods","visible":true,"type":"half"},
                {"id":"expense-trend","name":"Expense Trend","visible":true,"type":"full"},
                {"id":"top-items-radial","name":"Top Expense Items (Radial)","visible":true,"type":"half"},
                {"id":"top-items-bar","name":"Top Expense Items (Bar)","visible":true,"type":"half"},
                {"id":"bills-table","name":"Detailed Bills Table","visible":true,"type":"full"},
                {"id":"category-breakdown","name":"Category Breakdown","visible":true,"type":"full"}
            ]
            """;

    public BillReportPreferenceService(BillReportPreferenceRepository repository) {
        this.repository = repository;
    }

    






    public BillReportPreferenceDTO getPreferences(Integer userId) {
        Optional<BillReportPreference> preference = repository.findByUserId(userId);
        return preference.map(this::toDTO).orElse(null);
    }

    






    @Transactional
    public BillReportPreferenceDTO savePreferences(Integer userId, String layoutConfig) {
        Optional<BillReportPreference> existing = repository.findByUserId(userId);

        BillReportPreference preference;
        if (existing.isPresent()) {
            preference = existing.get();
            preference.setLayoutConfig(layoutConfig);
        } else {
            preference = new BillReportPreference(userId, layoutConfig);
        }

        BillReportPreference saved = repository.save(preference);
        return toDTO(saved);
    }

    





    @Transactional
    public void resetPreferences(Integer userId) {
        repository.deleteByUserId(userId);
    }

    





    private BillReportPreferenceDTO toDTO(BillReportPreference entity) {
        return new BillReportPreferenceDTO(
                entity.getId(),
                entity.getUserId(),
                entity.getLayoutConfig(),
                entity.getCreatedAt(),
                entity.getUpdatedAt());
    }
}
