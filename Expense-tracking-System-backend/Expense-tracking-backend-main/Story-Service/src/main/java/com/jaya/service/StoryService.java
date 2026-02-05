package com.jaya.service;

import com.jaya.dto.*;
import com.jaya.models.Story;
import com.jaya.models.enums.StoryStatus;
import com.jaya.models.enums.StoryType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface StoryService {

        
        StoryListResponse getActiveStoriesForUser(Integer userId);

        StoryDTO getStoryById(UUID storyId, Integer userId);

        void markStorySeen(UUID storyId, Integer userId);

        void markStoryCtaClicked(UUID storyId, UUID ctaId, Integer userId);

        void dismissStory(UUID storyId, Integer userId);

        
        StoryDTO createStory(CreateStoryRequest request, Integer adminId);

        StoryDTO updateStory(UUID storyId, UpdateStoryRequest request, Integer adminId);

        void deleteStory(UUID storyId, Integer adminId);

        void activateStory(UUID storyId, Integer adminId);

        void deactivateStory(UUID storyId, Integer adminId);

        void archiveStory(UUID storyId, Integer adminId);

        void unarchiveStory(UUID storyId, Integer adminId);

        
        StoryDTO getStoryById(UUID storyId);

        Page<StoryDTO> getAllStories(Pageable pageable);

        Page<StoryDTO> getStoriesByStatus(StoryStatus status, Pageable pageable);

        Page<StoryDTO> getStoriesByType(StoryType type, Pageable pageable);

        
        Story createSystemStory(CreateStoryRequest request);

        void createBudgetThresholdStory(Integer userId, Integer budgetId, String budgetName,
                        double percentage, double amount, double spent);

        void createBillReminderStory(Integer userId, Integer billId, String billName,
                        double amount, String dueDate);

        void createExpenseSpikeStory(Integer userId, String categoryName,
                        double currentAmount, double averageAmount);

        
        int expireOldStories();

        int archiveExpiredStories();

        void cleanupOldArchivedStories(int daysOld);

        
        void generateDailyWelcomeStory();

        void checkAndGenerateBudgetStories();

        void checkAndGenerateBillReminders();

        void generateWeeklySummaryStories();

        void generateMonthlyAchievementStories();
}
