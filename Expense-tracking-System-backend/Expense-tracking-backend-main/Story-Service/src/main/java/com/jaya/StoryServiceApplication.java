package com.jaya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Story Service Application
 * Provides Instagram-like system stories for expense tracking
 * 
 * Features:
 * - System-generated stories (budget alerts, expense spikes, bill reminders)
 * - Admin-generated stories (announcements, maintenance alerts)
 * - Real-time WebSocket updates
 * - Story lifecycle management (CREATED → ACTIVE → EXPIRED → ARCHIVED)
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableScheduling
public class StoryServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(StoryServiceApplication.class, args);
    }
}
