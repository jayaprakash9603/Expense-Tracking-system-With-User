package com.jaya.cron;

import com.jaya.service.MomentumService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@Slf4j
public class DailyMomentumCronJob {

    private final MomentumService momentumService;

    public DailyMomentumCronJob(MomentumService momentumService) {
        this.momentumService = momentumService;
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void computeDailyMomentum() {
        log.info("Starting daily momentum computation");
        LocalDate today = LocalDate.now();

        try {
            momentumService.computeForAllUsers(today);
            log.info("Completed daily momentum computation for {}", today);
        } catch (Exception e) {
            log.error("Error during daily momentum computation: {}", e.getMessage(), e);
        }

        try {
            momentumService.cleanupOldInsights(today.minusDays(30));
        } catch (Exception e) {
            log.warn("Error cleaning up old momentum insights: {}", e.getMessage());
        }
    }
}
