package com.jaya.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.dto.*;
import com.jaya.mapper.StoryMapper;
import com.jaya.models.*;
import com.jaya.models.enums.*;
import com.jaya.repository.*;
import com.jaya.service.StoryService;
import com.jaya.websocket.StoryWebSocketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
@Slf4j
public class StoryServiceImpl implements StoryService {

    private final StoryRepository storyRepository;
    private final StoryVisibilityRepository visibilityRepository;
    private final StoryAuditLogRepository auditLogRepository;
    private final StoryMapper storyMapper;
    private final StoryWebSocketService webSocketService;
    private final ObjectMapper objectMapper;

    // ==================== User-facing APIs ====================

    @Override
    @Transactional(readOnly = true)
    public StoryListResponse getActiveStoriesForUser(Integer userId) {
        log.debug("Fetching active stories for user: {}", userId);

        List<Story> stories = storyRepository.findActiveStoriesForUser(
                StoryStatus.ACTIVE, userId, LocalDateTime.now());

        // Get dismissed story IDs for this user
        Set<UUID> dismissedIds = visibilityRepository.findDismissedStoryIdsByUserId(userId);

        // Filter out dismissed stories
        stories = stories.stream()
                .filter(s -> !dismissedIds.contains(s.getId()))
                .collect(Collectors.toList());

        // Get visibility info for all stories
        List<UUID> storyIds = stories.stream().map(Story::getId).collect(Collectors.toList());
        Map<UUID, StoryVisibility> visibilityMap = getVisibilityMap(userId, storyIds);

        List<StoryDTO> storyDTOs = storyMapper.toDTOList(stories, visibilityMap);

        int unseenCount = (int) storyDTOs.stream().filter(s -> !s.getSeen()).count();

        return StoryListResponse.builder()
                .stories(storyDTOs)
                .totalCount(storyDTOs.size())
                .unseenCount(unseenCount)
                .hasMore(false)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public StoryDTO getStoryById(UUID storyId, Integer userId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));

        StoryVisibility visibility = visibilityRepository.findByStoryIdAndUserId(storyId, userId)
                .orElse(null);

        return storyMapper.toDTO(story, visibility);
    }

    @Override
    @Transactional(readOnly = true)
    public StoryDTO getStoryById(UUID storyId) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));
        return storyMapper.toDTO(story, null);
    }

    @Override
    public void markStorySeen(UUID storyId, Integer userId) {
        log.debug("Marking story {} as seen by user {}", storyId, userId);

        StoryVisibility visibility = visibilityRepository.findByStoryIdAndUserId(storyId, userId)
                .orElseGet(() -> StoryVisibility.builder()
                        .storyId(storyId)
                        .userId(userId)
                        .build());

        visibility.markAsSeen();
        visibilityRepository.save(visibility);
    }

    @Override
    public void markStoryCtaClicked(UUID storyId, UUID ctaId, Integer userId) {
        log.debug("Marking CTA {} clicked on story {} by user {}", ctaId, storyId, userId);

        StoryVisibility visibility = visibilityRepository.findByStoryIdAndUserId(storyId, userId)
                .orElseGet(() -> StoryVisibility.builder()
                        .storyId(storyId)
                        .userId(userId)
                        .build());

        visibility.markCtaClicked(ctaId);
        visibilityRepository.save(visibility);
    }

    @Override
    public void dismissStory(UUID storyId, Integer userId) {
        log.debug("Dismissing story {} for user {}", storyId, userId);

        StoryVisibility visibility = visibilityRepository.findByStoryIdAndUserId(storyId, userId)
                .orElseGet(() -> StoryVisibility.builder()
                        .storyId(storyId)
                        .userId(userId)
                        .build());

        visibility.dismiss();
        visibilityRepository.save(visibility);
    }

    // ==================== Admin APIs ====================

    @Override
    public StoryDTO createStory(CreateStoryRequest request, Integer adminId) {
        log.info("Admin {} creating new story: {}", adminId, request.getTitle());

        Story story = Story.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .backgroundColor(request.getBackgroundColor())
                .backgroundGradient(request.getBackgroundGradient())
                .storyType(request.getStoryType())
                .severity(request.getSeverity())
                .status(request.getAutoActivate() ? StoryStatus.ACTIVE : StoryStatus.CREATED)
                .targetUserId(request.getTargetUserId())
                .isGlobal(request.getIsGlobal() != null ? request.getIsGlobal() : true)
                .durationSeconds(request.getDurationSeconds() != null ? request.getDurationSeconds() : 5)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .metadata(request.getMetadata())
                .createdByAdminId(adminId)
                .expiresAt(LocalDateTime.now().plusHours(
                        request.getExpirationHours() != null ? request.getExpirationHours() : 24))
                .build();

        if (request.getAutoActivate()) {
            story.activate();
        }

        // Add CTA buttons
        if (request.getCtaButtons() != null) {
            for (StoryCTADTO ctaDTO : request.getCtaButtons()) {
                StoryCTA cta = storyMapper.toEntity(ctaDTO);
                story.addCTA(cta);
            }
        }

        Story savedStory = storyRepository.save(story);

        // Audit log
        createAuditLog(savedStory.getId(), adminId, "CREATE", null, savedStory);

        // Broadcast via WebSocket
        StoryDTO dto = storyMapper.toDTO(savedStory);
        if (savedStory.getIsGlobal()) {
            webSocketService.broadcastStoryCreated(dto);
        } else if (savedStory.getTargetUserId() != null) {
            webSocketService.sendStoryToUser(savedStory.getTargetUserId(), dto);
        }

        log.info("Story created successfully: {}", savedStory.getId());
        return dto;
    }

    @Override
    public StoryDTO updateStory(UUID storyId, UpdateStoryRequest request, Integer adminId) {
        log.info("Admin {} updating story: {}", adminId, storyId);

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));

        Story oldStory = copyStory(story);

        if (request.getTitle() != null)
            story.setTitle(request.getTitle());
        if (request.getContent() != null)
            story.setContent(request.getContent());
        if (request.getImageUrl() != null)
            story.setImageUrl(request.getImageUrl());
        if (request.getBackgroundColor() != null)
            story.setBackgroundColor(request.getBackgroundColor());
        if (request.getBackgroundGradient() != null)
            story.setBackgroundGradient(request.getBackgroundGradient());
        if (request.getSeverity() != null)
            story.setSeverity(request.getSeverity());
        if (request.getDurationSeconds() != null)
            story.setDurationSeconds(request.getDurationSeconds());
        if (request.getPriority() != null)
            story.setPriority(request.getPriority());
        if (request.getMetadata() != null)
            story.setMetadata(request.getMetadata());
        if (request.getExpirationHours() != null) {
            story.setExpiresAt(LocalDateTime.now().plusHours(request.getExpirationHours()));
        }

        // Update CTA buttons
        if (request.getCtaButtons() != null) {
            story.getCtaButtons().clear();
            for (StoryCTADTO ctaDTO : request.getCtaButtons()) {
                StoryCTA cta = storyMapper.toEntity(ctaDTO);
                story.addCTA(cta);
            }
        }

        Story savedStory = storyRepository.save(story);

        // Audit log
        createAuditLog(storyId, adminId, "UPDATE", oldStory, savedStory);

        // Broadcast update via WebSocket
        StoryDTO dto = storyMapper.toDTO(savedStory);
        webSocketService.broadcastStoryUpdated(dto);

        return dto;
    }

    @Override
    public void deleteStory(UUID storyId, Integer adminId) {
        log.info("Admin {} deleting story: {}", adminId, storyId);

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));

        story.softDelete();
        storyRepository.save(story);

        // Audit log
        createAuditLog(storyId, adminId, "DELETE", story, null);

        // Broadcast deletion via WebSocket
        webSocketService.broadcastStoryDeleted(storyId);
    }

    @Override
    public void activateStory(UUID storyId, Integer adminId) {
        log.info("Admin {} activating story: {}", adminId, storyId);

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));

        story.activate();
        storyRepository.save(story);

        createAuditLog(storyId, adminId, "ACTIVATE", null, null);

        StoryDTO dto = storyMapper.toDTO(story);
        webSocketService.broadcastStoryCreated(dto);
    }

    @Override
    public void deactivateStory(UUID storyId, Integer adminId) {
        log.info("Admin {} deactivating story: {}", adminId, storyId);

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));

        story.setStatus(StoryStatus.CREATED);
        storyRepository.save(story);

        createAuditLog(storyId, adminId, "DEACTIVATE", null, null);

        webSocketService.broadcastStoryDeleted(storyId);
    }

    @Override
    public void archiveStory(UUID storyId, Integer adminId) {
        log.info("Admin {} archiving story: {}", adminId, storyId);

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));

        story.archive();
        storyRepository.save(story);

        createAuditLog(storyId, adminId, "ARCHIVE", null, null);

        webSocketService.broadcastStoryDeleted(storyId);
    }

    @Override
    public void unarchiveStory(UUID storyId, Integer adminId) {
        log.info("Admin {} unarchiving story: {}", adminId, storyId);

        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new RuntimeException("Story not found: " + storyId));

        story.setStatus(StoryStatus.CREATED);
        storyRepository.save(story);

        createAuditLog(storyId, adminId, "UNARCHIVE", null, null);
    }

    // ==================== Admin Listing ====================

    @Override
    @Transactional(readOnly = true)
    public Page<StoryDTO> getAllStories(Pageable pageable) {
        return storyRepository.findByIsDeletedFalseOrderByCreatedAtDesc(pageable)
                .map(storyMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StoryDTO> getStoriesByStatus(StoryStatus status, Pageable pageable) {
        return storyRepository.findByStatusAndIsDeletedFalseOrderByCreatedAtDesc(status, pageable)
                .map(storyMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StoryDTO> getStoriesByType(StoryType type, Pageable pageable) {
        return storyRepository.findByStoryTypeAndIsDeletedFalseOrderByCreatedAtDesc(type, pageable)
                .map(storyMapper::toDTO);
    }

    // ==================== System Story Generation ====================

    @Override
    public Story createSystemStory(CreateStoryRequest request) {
        log.info("Creating system story: {}", request.getTitle());

        // Check for duplicate (avoid spamming same story)
        if (request.getReferenceId() != null && request.getReferenceType() != null) {
            Optional<Story> existing = storyRepository.findActiveByReference(
                    request.getReferenceType(),
                    request.getReferenceId(),
                    request.getStoryType());

            if (existing.isPresent()) {
                log.debug("Story already exists for reference: {}:{}",
                        request.getReferenceType(), request.getReferenceId());
                return existing.get();
            }
        }

        Story story = Story.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .imageUrl(request.getImageUrl())
                .backgroundColor(request.getBackgroundColor())
                .backgroundGradient(request.getBackgroundGradient())
                .storyType(request.getStoryType())
                .severity(request.getSeverity())
                .status(StoryStatus.ACTIVE)
                .targetUserId(request.getTargetUserId())
                .isGlobal(request.getIsGlobal() != null ? request.getIsGlobal() : false)
                .durationSeconds(request.getDurationSeconds() != null ? request.getDurationSeconds() : 5)
                .priority(request.getPriority() != null ? request.getPriority() : 0)
                .referenceId(request.getReferenceId())
                .referenceType(request.getReferenceType())
                .metadata(request.getMetadata())
                .expiresAt(LocalDateTime.now().plusHours(
                        request.getExpirationHours() != null ? request.getExpirationHours() : 24))
                .build();

        story.activate();

        // Add CTA buttons
        if (request.getCtaButtons() != null) {
            for (StoryCTADTO ctaDTO : request.getCtaButtons()) {
                StoryCTA cta = storyMapper.toEntity(ctaDTO);
                story.addCTA(cta);
            }
        }

        Story savedStory = storyRepository.save(story);

        // Broadcast via WebSocket
        StoryDTO dto = storyMapper.toDTO(savedStory);
        if (savedStory.getTargetUserId() != null) {
            webSocketService.sendStoryToUser(savedStory.getTargetUserId(), dto);
        } else if (savedStory.getIsGlobal()) {
            webSocketService.broadcastStoryCreated(dto);
        }

        return savedStory;
    }

    @Override
    public void createBudgetThresholdStory(Integer userId, Integer budgetId, String budgetName,
            double percentage, double amount, double spent) {
        log.info("Creating budget threshold story for user {} budget {} at {}%",
                userId, budgetId, percentage);

        StoryType type;
        StorySeverity severity;
        String title;
        String content;
        String emoji;

        if (percentage >= 100) {
            type = StoryType.BUDGET_THRESHOLD_100;
            severity = StorySeverity.CRITICAL;
            title = "🚨 Budget Exceeded!";
            content = String.format("Your budget '%s' has been exceeded! You've spent $%.2f of $%.2f allocated.",
                    budgetName, spent, amount);
            emoji = "🚨";
        } else if (percentage >= 90) {
            type = StoryType.BUDGET_THRESHOLD_90;
            severity = StorySeverity.CRITICAL;
            title = "⚠️ Budget Alert: 90% Used";
            content = String.format("Your budget '%s' is at %.0f%%! Only $%.2f remaining.",
                    budgetName, percentage, amount - spent);
            emoji = "⚠️";
        } else {
            type = StoryType.BUDGET_THRESHOLD_80;
            severity = StorySeverity.WARNING;
            title = "📊 Budget Update: 80% Used";
            content = String.format("Your budget '%s' is at %.0f%%. $%.2f remaining of $%.2f.",
                    budgetName, percentage, amount - spent, amount);
            emoji = "📊";
        }

        List<StoryCTADTO> ctas = List.of(
                StoryCTADTO.builder()
                        .label("View Budget")
                        .ctaType(CTAType.GO_TO_BUDGET)
                        .routePath("/budgets/" + budgetId)
                        .isPrimary(true)
                        .displayOrder(0)
                        .build(),
                StoryCTADTO.builder()
                        .label("Manage Budgets")
                        .ctaType(CTAType.MANAGE_BUDGETS)
                        .routePath("/budgets")
                        .displayOrder(1)
                        .build());

        CreateStoryRequest request = CreateStoryRequest.builder()
                .title(title)
                .content(content)
                .storyType(type)
                .severity(severity)
                .targetUserId(userId)
                .isGlobal(false)
                .referenceId(String.valueOf(budgetId))
                .referenceType("BUDGET")
                .priority(percentage >= 100 ? 100 : 50)
                .expirationHours(48)
                .ctaButtons(ctas)
                .build();

        createSystemStory(request);
    }

    @Override
    public void createBillReminderStory(Integer userId, Integer billId, String billName,
            double amount, String dueDate) {
        log.info("Creating bill reminder story for user {} bill {}", userId, billId);

        List<StoryCTADTO> ctas = List.of(
                StoryCTADTO.builder()
                        .label("View Bill")
                        .ctaType(CTAType.VIEW_BILL)
                        .routePath("/bills/" + billId)
                        .isPrimary(true)
                        .displayOrder(0)
                        .build(),
                StoryCTADTO.builder()
                        .label("Pay Now")
                        .ctaType(CTAType.PAY_BILL)
                        .routePath("/bills/" + billId + "/pay")
                        .displayOrder(1)
                        .build());

        CreateStoryRequest request = CreateStoryRequest.builder()
                .title("📅 Bill Due Soon")
                .content(String.format("'%s' bill of $%.2f is due on %s. Don't miss it!",
                        billName, amount, dueDate))
                .storyType(StoryType.BILL_REMINDER)
                .severity(StorySeverity.WARNING)
                .targetUserId(userId)
                .isGlobal(false)
                .referenceId(String.valueOf(billId))
                .referenceType("BILL")
                .priority(60)
                .expirationHours(72)
                .ctaButtons(ctas)
                .build();

        createSystemStory(request);
    }

    @Override
    public void createExpenseSpikeStory(Integer userId, String categoryName,
            double currentAmount, double averageAmount) {
        log.info("Creating expense spike story for user {} category {}", userId, categoryName);

        double percentIncrease = ((currentAmount - averageAmount) / averageAmount) * 100;

        List<StoryCTADTO> ctas = List.of(
                StoryCTADTO.builder()
                        .label("View Report")
                        .ctaType(CTAType.VIEW_REPORT)
                        .routePath("/reports/category/" + categoryName)
                        .isPrimary(true)
                        .displayOrder(0)
                        .build());

        CreateStoryRequest request = CreateStoryRequest.builder()
                .title("📈 Unusual Spending Detected")
                .content(String.format("Your '%s' spending is up %.0f%% this period! Current: $%.2f vs Average: $%.2f",
                        categoryName, percentIncrease, currentAmount, averageAmount))
                .storyType(StoryType.EXPENSE_SPIKE)
                .severity(StorySeverity.INFO)
                .targetUserId(userId)
                .isGlobal(false)
                .referenceId(categoryName)
                .referenceType("CATEGORY")
                .priority(30)
                .expirationHours(24)
                .ctaButtons(ctas)
                .build();

        createSystemStory(request);
    }

    // ==================== Lifecycle Management ====================

    @Override
    public int expireOldStories() {
        log.info("Running story expiration job");
        int count = storyRepository.bulkExpireStories(LocalDateTime.now());
        log.info("Expired {} stories", count);
        return count;
    }

    @Override
    public int archiveExpiredStories() {
        log.info("Archiving expired stories older than 7 days");
        List<Story> expired = storyRepository.findByStatusAndIsDeletedFalse(StoryStatus.EXPIRED);
        int count = 0;
        LocalDateTime threshold = LocalDateTime.now().minusDays(7);

        for (Story story : expired) {
            if (story.getExpiresAt().isBefore(threshold)) {
                story.archive();
                storyRepository.save(story);
                count++;
            }
        }

        log.info("Archived {} stories", count);
        return count;
    }

    @Override
    public void cleanupOldArchivedStories(int daysOld) {
        log.info("Cleaning up archived stories older than {} days", daysOld);
        LocalDateTime threshold = LocalDateTime.now().minusDays(daysOld);
        List<Story> oldStories = storyRepository.findByStatusAndCreatedAtBefore(
                StoryStatus.ARCHIVED, threshold);

        for (Story story : oldStories) {
            story.softDelete();
            storyRepository.save(story);
        }

        log.info("Cleaned up {} old archived stories", oldStories.size());
    }

    @Override
    public void generateDailyWelcomeStory() {
        log.info("Generating daily welcome story");

        // Create a global welcome/tip story for the day
        String[] tips = {
                "💡 Tip: Review your weekly expenses every Sunday to stay on budget!",
                "💡 Tip: Set up automatic bill reminders to never miss a payment!",
                "💡 Tip: Categorize your expenses to understand spending patterns!",
                "💡 Tip: Small daily savings add up to big annual savings!",
                "💡 Tip: Track recurring subscriptions to avoid forgotten charges!"
        };

        int dayOfYear = LocalDateTime.now().getDayOfYear();
        String tip = tips[dayOfYear % tips.length];

        CreateStoryRequest request = CreateStoryRequest.builder()
                .title("Good Morning! ☀️")
                .content(tip)
                .storyType(StoryType.TIP)
                .severity(StorySeverity.INFO)
                .isGlobal(true)
                .priority(10)
                .expirationHours(16)
                .build();

        createSystemStory(request);
    }

    @Override
    public void checkAndGenerateBudgetStories() {
        log.info("Checking budgets for threshold stories");
        // This method is primarily triggered by Kafka events from Budget-Service
        // The periodic check is a fallback for any missed events
        // In a full implementation, this would query Budget-Service via Feign client
        // For now, budget stories are created via createBudgetThresholdStory() when
        // called
        log.debug("Budget story check complete - stories generated via Kafka events");
    }

    @Override
    public void checkAndGenerateBillReminders() {
        log.info("Checking bills for reminder stories");
        // This method is primarily triggered by Kafka events from Bill-Service
        // The periodic check is a fallback for any missed events
        // In a full implementation, this would query Bill-Service via Feign client
        // For now, bill reminder stories are created via createBillReminderStory() when
        // called
        log.debug("Bill reminder check complete - stories generated via Kafka events");
    }

    @Override
    public void generateWeeklySummaryStories() {
        log.info("Generating weekly summary stories");

        // Create a global weekly summary prompt
        CreateStoryRequest request = CreateStoryRequest.builder()
                .title("📊 Week in Review")
                .content("Review your spending this week! Check your reports to see where your money went.")
                .storyType(StoryType.WEEKLY_SUMMARY)
                .severity(StorySeverity.INFO)
                .isGlobal(true)
                .priority(20)
                .expirationHours(48)
                .ctaButtons(List.of(
                        StoryCTADTO.builder()
                                .label("View Reports")
                                .ctaType(CTAType.VIEW_REPORT)
                                .routePath("/reports")
                                .isPrimary(true)
                                .displayOrder(0)
                                .build()))
                .build();

        createSystemStory(request);
    }

    @Override
    public void generateMonthlyAchievementStories() {
        log.info("Generating monthly achievement stories");

        // Create a global monthly milestone story
        CreateStoryRequest request = CreateStoryRequest.builder()
                .title("🎉 New Month, New Goals!")
                .content("A new month has begun! Set new budget goals and track your progress.")
                .storyType(StoryType.ACHIEVEMENT)
                .severity(StorySeverity.SUCCESS)
                .isGlobal(true)
                .priority(15)
                .expirationHours(72)
                .ctaButtons(List.of(
                        StoryCTADTO.builder()
                                .label("Set Goals")
                                .ctaType(CTAType.MANAGE_BUDGETS)
                                .routePath("/budgets/new")
                                .isPrimary(true)
                                .displayOrder(0)
                                .build()))
                .build();

        createSystemStory(request);
    }

    // ==================== Helper Methods ====================

    private Map<UUID, StoryVisibility> getVisibilityMap(Integer userId, List<UUID> storyIds) {
        List<StoryVisibility> visibilities = new ArrayList<>();
        for (UUID storyId : storyIds) {
            visibilityRepository.findByStoryIdAndUserId(storyId, userId)
                    .ifPresent(visibilities::add);
        }
        return visibilities.stream()
                .collect(Collectors.toMap(StoryVisibility::getStoryId, v -> v));
    }

    private void createAuditLog(UUID storyId, Integer adminId, String action,
            Story oldValue, Story newValue) {
        try {
            StoryAuditLog log = StoryAuditLog.builder()
                    .storyId(storyId)
                    .adminId(adminId)
                    .action(action)
                    .oldValue(oldValue != null ? objectMapper.writeValueAsString(storyMapper.toDTO(oldValue)) : null)
                    .newValue(newValue != null ? objectMapper.writeValueAsString(storyMapper.toDTO(newValue)) : null)
                    .build();
            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Failed to create audit log", e);
        }
    }

    private Story copyStory(Story story) {
        return Story.builder()
                .id(story.getId())
                .title(story.getTitle())
                .content(story.getContent())
                .severity(story.getSeverity())
                .status(story.getStatus())
                .build();
    }
}
