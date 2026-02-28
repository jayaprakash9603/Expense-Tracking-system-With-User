package com.jaya.common.event;

/**
 * Abstraction for event publishing.
 * Supports both Kafka (microservices) and in-memory (monolithic) modes.
 * 
 * @param <T> the event type
 */
public interface EventPublisher<T> {

    /**
     * Publish an event.
     *
     * @param event the event to publish
     */
    void publish(T event);

    /**
     * Publish an event to a specific topic/channel.
     *
     * @param topic the topic/channel name
     * @param event the event to publish
     */
    void publish(String topic, T event);

    /**
     * Publish an event with a partition key for ordered delivery.
     *
     * @param topic the topic/channel name
     * @param key the partition key (e.g., userId)
     * @param event the event to publish
     */
    void publish(String topic, String key, T event);
}
