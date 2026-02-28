package com.jaya.scheduler;

import com.jaya.service.StoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Scheduled jobs for story-related tasks.
 * Conditional on scheduling.enabled property to avoid duplicate execution in monolithic mode.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "scheduling.enabled", havingValue = "true", matchIfMissing = true)
public class StoryScheduledJobs {

    private final StoryService storyService;

    



    @Scheduled(fixedRate = 60000) 
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

    



    @Scheduled(fixedRate = 3600000) 
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

    



    @Scheduled(cron = "0 0 6 * * *")
    public void generateDailyWelcomeStory() {
        log.info("Generating daily welcome story at {}", LocalDateTime.now());
        try {
            storyService.generateDailyWelcomeStory();
        } catch (Exception e) {
            log.error("Error generating daily welcome story", e);
        }
    }

    



    @Scheduled(fixedRate = 1800000) 
    public void checkBudgetThresholds() {
        log.debug("Checking budget thresholds at {}", LocalDateTime.now());
        try {
            
            
            storyService.checkAndGenerateBudgetStories();
        } catch (Exception e) {
            log.error("Error checking budget thresholds", e);
        }
    }

    



    @Scheduled(fixedRate = 3600000) 
    public void checkBillReminders() {
        log.debug("Checking bill reminders at {}", LocalDateTime.now());
        try {
            storyService.checkAndGenerateBillReminders();
        } catch (Exception e) {
            log.error("Error checking bill reminders", e);
        }
    }

    



    @Scheduled(cron = "0 0 9 * * MON")
    public void generateWeeklySummary() {
        log.info("Generating weekly summary stories at {}", LocalDateTime.now());
        try {
            storyService.generateWeeklySummaryStories();
        } catch (Exception e) {
            log.error("Error generating weekly summary", e);
        }
    }

    



    @Scheduled(cron = "0 0 10 1 * *")
    public void generateMonthlyAchievements() {
        log.info("Generating monthly achievement stories at {}", LocalDateTime.now());
        try {
            storyService.generateMonthlyAchievementStories();
        } catch (Exception e) {
            log.error("Error generating monthly achievements", e);
        }
    }

    




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
