package com.jaya.service.processor;

/**
 * Interface for processing notification events
 * Follows Interface Segregation Principle and Open/Closed Principle
 * 
 * @param <T> Type of event to process
 */
public interface NotificationEventProcessor<T> {

    /**
     * Process the event and create notification if user preferences allow it
     * 
     * @param event Event to process
     */
    void process(T event);

    /**
     * Get the notification type identifier for preference checking
     * 
     * @param event Event to get type from
     * @return Notification type string (e.g., "expenseAdded", "budgetExceeded")
     */
    String getNotificationType(T event);

    /**
     * Extract user ID from the event
     * 
     * @param event Event to extract user ID from
     * @return User ID
     */
    Integer getUserId(T event);
}
