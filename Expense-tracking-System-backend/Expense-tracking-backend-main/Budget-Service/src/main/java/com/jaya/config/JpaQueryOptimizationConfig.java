package com.jaya.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * JPA Configuration for Query Optimization
 * 
 * This configuration enables query optimizations to prevent N+1 query problems:
 * 
 * 1. Query Hints: Added to repository methods for batch fetching and caching
 * 2. Batch Fetching: Configured in application.yaml to load related entities in
 * batches
 * 3. Query Cache: Enabled for frequently executed queries
 * 4. Second-level Cache: Configured for entity caching
 * 5. JDBC Batching: Enabled for batch inserts/updates
 * 
 * Performance Benefits:
 * - Reduces database round trips
 * - Minimizes N+1 query problems
 * - Improves query response times
 * - Reduces memory footprint with proper fetch sizes
 * - Enables query result caching for read-heavy operations
 * 
 * @author Budget Service Team
 */
@Configuration
@EnableJpaRepositories(basePackages = "com.jaya.repository")
@EnableTransactionManagement
public class JpaQueryOptimizationConfig {

    /**
     * Configuration is primarily done via:
     * 1. Repository @QueryHints annotations
     * 2. application.yaml JPA properties
     * 3. Entity-level optimizations
     * 
     * Additional runtime optimizations can be added here if needed.
     */

}
