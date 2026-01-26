package com.jaya;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

/**
 * Search Service Application
 * 
 * Provides unified search across all expense tracking domains:
 * - Expenses
 * - Budgets
 * - Categories
 * - Bills
 * - Payment Methods
 * - Friends
 * 
 * Features:
 * - Aggregates results from multiple microservices
 * - Parallel async calls for performance
 * - Optional Redis caching (falls back to in-memory)
 * - User-scoped security
 */
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class SearchServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(SearchServiceApplication.class, args);
    }
}
