package com.jaya.common.event;

import java.lang.annotation.*;

/**
 * Marks a method as an event listener.
 * Works with both Kafka consumers and Spring ApplicationEvent listeners.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface EventListener {

    /**
     * The topic/event type to listen to.
     * For Kafka: the topic name.
     * For in-memory: the event class name or custom channel.
     */
    String value() default "";

    /**
     * The consumer group ID (Kafka only).
     */
    String groupId() default "";
}
