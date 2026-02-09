package com.jaya.service;

import com.jaya.dto.AnalyticsEntityType;
import com.jaya.dto.AnalyticsRequestDTO;
import com.jaya.dto.CategoryAnalyticsDTO;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class AnalyticsEntityService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsEntityService.class);

    private final CategoryAnalyticsService categoryAnalyticsService;

    public CategoryAnalyticsDTO getAnalytics(String jwt, AnalyticsRequestDTO request) {
        AnalyticsRequestDTO normalized = normalizeRequest(request);

        if (normalized.getEntityType() == null) {
            throw new IllegalArgumentException("entityType is required");
        }
        if (normalized.getEntityId() == null) {
            throw new IllegalArgumentException("entityId is required");
        }

        AnalyticsEntityType type = normalized.getEntityType();
        Integer entityId = normalized.getEntityId();

        log.info("Fetching analytics: type={}, entityId={}, startDate={}, endDate={}, trendType={}, targetId={}",
                type, entityId, normalized.getStartDate(), normalized.getEndDate(),
                normalized.getTrendType(), normalized.getTargetId());

        switch (type) {
            case CATEGORY:
                return categoryAnalyticsService.getCategoryAnalytics(
                        jwt,
                        entityId,
                        normalized.getStartDate(),
                        normalized.getEndDate(),
                        normalized.getTrendType(),
                        normalized.getTargetId());
            case PAYMENT_METHOD:
                return categoryAnalyticsService.getPaymentMethodAnalytics(
                        jwt,
                        entityId,
                        normalized.getStartDate(),
                        normalized.getEndDate(),
                        normalized.getTrendType(),
                        normalized.getTargetId());
            case BILL:
                return categoryAnalyticsService.getBillAnalytics(
                        jwt,
                        entityId,
                        normalized.getStartDate(),
                        normalized.getEndDate(),
                        normalized.getTrendType(),
                        normalized.getTargetId());
            default:
                throw new IllegalArgumentException("Unsupported entityType: " + type);
        }
    }

    public AnalyticsRequestDTO normalizeRequest(AnalyticsRequestDTO request) {
        if (request == null) {
            request = new AnalyticsRequestDTO();
        }

        LocalDate endDate = request.getEndDate() != null ? request.getEndDate() : LocalDate.now();
        LocalDate startDate = request.getStartDate() != null ? request.getStartDate() : endDate.minusMonths(6);
        String trendType = request.getTrendType() != null && !request.getTrendType().isBlank()
                ? request.getTrendType()
                : "MONTHLY";

        return AnalyticsRequestDTO.builder()
                .entityType(request.getEntityType())
                .entityId(request.getEntityId())
                .startDate(startDate)
                .endDate(endDate)
                .trendType(trendType)
                .targetId(request.getTargetId())
                .build();
    }
}
