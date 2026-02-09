package com.jaya.service.processor;

public interface NotificationEventProcessor<T> {

    void process(T event);

    String getNotificationType(T event);

    Integer getUserId(T event);
}
