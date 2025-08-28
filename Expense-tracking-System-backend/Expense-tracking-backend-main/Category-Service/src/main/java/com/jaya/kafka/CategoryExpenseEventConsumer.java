package com.jaya.kafka;


import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.events.CategoryExpenseEvent;
import com.jaya.models.Category;
import com.jaya.repository.CategoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

// imports trimmed after batch refactor

@Service
public class CategoryExpenseEventConsumer {

    private static final Logger logger = LoggerFactory.getLogger(CategoryExpenseEventConsumer.class);

    @Autowired
    private CategoryRepository categoryRepository;




    @Autowired
    private ObjectMapper objectMapper;

    // Batch + concurrent listener for high throughput
    @KafkaListener(topics = "category-expense-events", groupId = "category-expense-group",
            containerFactory = "categoryBatchFactory")
    @Transactional
    public void handleCategoryExpenseEvents(java.util.List<String> eventsJson) {
        if (eventsJson == null || eventsJson.isEmpty()) return;

    // Parse all events first, preserving poll order
    java.util.List<CategoryExpenseEvent> parsed = new java.util.ArrayList<>(eventsJson.size());
    java.util.Set<Integer> impactedCategoryIds = new java.util.HashSet<>();

        for (String eventJson : eventsJson) {
            try {
                CategoryExpenseEvent event = objectMapper.readValue(eventJson, CategoryExpenseEvent.class);
                String action = event.getAction() == null ? "" : event.getAction().toUpperCase();
                int categoryId = event.getCategoryId();

                // Keep original action; treat null/unknown as ADD for backward compatibility
                if (!"ADD".equals(action) && !"REMOVE".equals(action) && !"UPDATE".equals(action)) {
                    action = "ADD";
                }
                // Record event in-order and collect impacted categories
                CategoryExpenseEvent normalized = new CategoryExpenseEvent(event.getUserId(), event.getExpenseId(), event.getCategoryId(), event.getCategoryName(), action);
                parsed.add(normalized);
                impactedCategoryIds.add(categoryId);
            } catch (Exception e) {
                logger.error("Error parsing category expense event in batch: {}", eventJson, e);
            }
        }
        if (impactedCategoryIds.isEmpty()) return;

        java.util.List<Category> categories = categoryRepository.findAllById(impactedCategoryIds);
        java.util.Map<Integer, Category> byId = new java.util.HashMap<>();
        for (Category c : categories) byId.put(c.getId(), c);

        if (byId.size() != impactedCategoryIds.size()) {
            java.util.Set<Integer> missing = new java.util.HashSet<>(impactedCategoryIds);
            missing.removeAll(byId.keySet());
            if (!missing.isEmpty()) {
                logger.warn("Some categories referenced in events were not found in bulk load: {} (fallback fetching individually)", missing);
                for (Integer mid : missing) {
                    try {
                        java.util.Optional<Category> mc = categoryRepository.findById(mid);
                        mc.ifPresent(c -> byId.put(mid, c));
                    } catch (Exception ex) {
                        logger.warn("Category {} still not found: {}", mid, ex.getMessage());
                    }
                }
            }
        }

        // Apply events in the order they were polled to avoid dropping any
        for (CategoryExpenseEvent e : parsed) {
            Category cat = byId.get(e.getCategoryId());
            if (cat == null) continue;
            if (cat.getExpenseIds() == null) cat.setExpenseIds(new java.util.HashMap<>());
            java.util.Set<Integer> set = cat.getExpenseIds().getOrDefault(e.getUserId(), new java.util.HashSet<>());
            String action = e.getAction();
            if ("REMOVE".equals(action)) {
                set.remove(e.getExpenseId());
            } else {
                // ADD and UPDATE -> ensure present
                set.add(e.getExpenseId());
            }
            if (set.isEmpty()) cat.getExpenseIds().remove(e.getUserId());
            else cat.getExpenseIds().put(e.getUserId(), set);
        }

        // Persist once
        // Retry on optimistic locking conflicts
        int maxRetries = 3;
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                categoryRepository.saveAll(byId.values());
                logger.info("Batch-processed {} category events across {} categories (ordered)", eventsJson.size(), byId.size());
                break;
            } catch (org.springframework.dao.OptimisticLockingFailureException olfe) {
                if (attempt == maxRetries) {
                    logger.error("Optimistic locking failed after {} attempts; some updates may be retried by next poll", maxRetries, olfe);
                    throw olfe;
                }
                logger.warn("Optimistic lock conflict (attempt {}/{}); reloading categories and reapplying batch", attempt, maxRetries);
                // Reload fresh categories and re-apply parsed events
                java.util.Set<Integer> reloadIds = new java.util.HashSet<>(byId.keySet());
                byId.clear();
                for (Category c : categoryRepository.findAllById(reloadIds)) byId.put(c.getId(), c);
                // Re-apply in-order
                for (CategoryExpenseEvent e : parsed) {
                    Category cat = byId.get(e.getCategoryId());
                    if (cat == null) continue;
                    if (cat.getExpenseIds() == null) cat.setExpenseIds(new java.util.HashMap<>());
                    java.util.Set<Integer> set = cat.getExpenseIds().getOrDefault(e.getUserId(), new java.util.HashSet<>());
                    String action = e.getAction();
                    if ("REMOVE".equals(action)) set.remove(e.getExpenseId());
                    else set.add(e.getExpenseId());
                    if (set.isEmpty()) cat.getExpenseIds().remove(e.getUserId());
                    else cat.getExpenseIds().put(e.getUserId(), set);
                }
            }
        }
    }

    // Legacy single-record helpers removed in favor of the batch path
}