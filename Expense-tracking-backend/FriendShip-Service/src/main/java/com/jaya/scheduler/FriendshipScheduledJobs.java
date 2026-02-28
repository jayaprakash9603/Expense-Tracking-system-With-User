package com.jaya.scheduler;

import com.jaya.service.SharedResourceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled jobs for friendship-related tasks.
 * Conditional on scheduling.enabled property to avoid duplicate execution in monolithic mode.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(name = "scheduling.enabled", havingValue = "true", matchIfMissing = true)
public class FriendshipScheduledJobs {

    private final SharedResourceService sharedResourceService;

    /**
     * Deactivate expired shared resources hourly.
     */
    @Scheduled(cron = "0 0 * * * *")
    public void deactivateExpiredShares() {
        log.info("Running scheduled job to deactivate expired shares");
        sharedResourceService.deactivateExpiredSharesInternal();
    }
}
