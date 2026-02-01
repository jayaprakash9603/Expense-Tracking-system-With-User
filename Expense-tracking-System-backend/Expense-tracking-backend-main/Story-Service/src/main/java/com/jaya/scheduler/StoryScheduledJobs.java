package com.jaya.scheduler;

import com.jaya.service.StoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Scheduled jobs for story lifecycle management
 * Handles automatic expiration, archival, and system story generation
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StoryScheduledJobs {

    private final StoryService storyService;

    /**
     * Expire stories that have passed their expiration time
     * Runs every minute
     */
    @Scheduled(fixedRate = 60000) // Every 1 minute
    public void expireStories() {
        log.debug("Running story expiration job at {}", LocalDateTime.now());
        try {
            int expiredCount = storyService.expireOldStories();
            if (expiredCount > 0) {
                log.info("Expired {} stories", expiredCount);
            }
        } catch (Exception e) {
            log.error("Error during story expiration job", e);
        }
    }

    /**
     * Archive expired stories after grace period
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // Every 1 hour
    public void archiveExpiredStories() {
        log.debug("Running story archival job at {}", LocalDateTime.now());
        try {
            int archivedCount = storyService.archiveExpiredStories();
            if (archivedCount > 0) {
                log.info("Archived {} expired stories", archivedCount);
            }
        } catch (Exception e) {
            log.error("Error during story archival job", e);
        }
    }

    /**
     * Generate daily welcome story for all users
     * Runs at 6:00 AM every day
     */
    @Scheduled(cron = "0 0 6 * * *")
    public void generateDailyWelcomeStory() {
        log.info("Generating daily welcome story at {}", LocalDateTime.now());
        try {
            storyService.generateDailyWelcomeStory();
        } catch (Exception e) {
            log.error("Error generating daily welcome story", e);
        }
    }

    /**
     * Check and generate budget threshold stories
     * Runs every 30 minutes
     */
    @Scheduled(fixedRate = 1800000) // Every 30 minutes
    public void checkBudgetThresholds() {
        log.debug("Checking budget thresholds at {}", LocalDateTime.now());
        try {
            // This will be triggered by Kafka events from Budget-Service
            // But we also run periodic check for missed events
            storyService.checkAndGenerateBudgetStories();
        } catch (Exception e) {
            log.error("Error checking budget thresholds", e);
        }
    }

    /**
     * Check and generate bill reminder stories
     * Runs every hour
     */
    @Scheduled(fixedRate = 3600000) // Every 1 hour
    public void checkBillReminders() {
        log.debug("Checking bill reminders at {}", LocalDateTime.now());
        try {
            storyService.checkAndGenerateBillReminders();
        } catch (Exception e) {
            log.error("Error checking bill reminders", e);
        }
    }

    /**
     * Generate weekly spending summary story
     * Runs every Monday at 9:00 AM
     */
    @Scheduled(cron = "0 0 9 * * MON")
    public void generateWeeklySummary() {
        log.info("Generating weekly summary stories at {}", LocalDateTime.now());
        try {
            storyService.generateWeeklySummaryStories();
        } catch (Exception e) {
            log.error("Error generating weekly summary", e);
        }
    }

    /**
     * Generate monthly achievement stories
     * Runs on 1st of each month at 10:00 AM
     */
    @Scheduled(cron = "0 0 10 1 * *")
    public void generateMonthlyAchievements() {
        log.info("Generating monthly achievement stories at {}", LocalDateTime.now());
        try {
            storyService.generateMonthlyAchievementStories();
        } catch (Exception e) {
            log.error("Error generating monthly achievements", e);
        }
    }

    /**
     * Clean up old archived stories
     * Runs daily at 3:00 AM
     * Removes archived stories older than 90 days
     */
    @Scheduled(cron = "0 0 3 * * *")
    public void cleanupOldStories() {
        log.info("Cleaning up old archived stories at {}", LocalDateTime.now());
        try {
            storyService.cleanupOldArchivedStories(90);
        } catch (Exception e) {
            log.error("Error cleaning up old stories", e);
        }
    }
}
