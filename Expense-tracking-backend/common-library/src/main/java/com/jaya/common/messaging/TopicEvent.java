package com.jaya.common.messaging;

import org.springframework.context.ApplicationEvent;

public class TopicEvent extends ApplicationEvent {

    private final String topic;
    private final String key;
    private final Object payload;

    public TopicEvent(Object source, String topic, String key, Object payload) {
        super(source);
        this.topic = topic;
        this.key = key;
        this.payload = payload;
    }

    public TopicEvent(Object source, String topic, Object payload) {
        this(source, topic, null, payload);
    }

    public String getTopic() {
        return topic;
    }

    public String getKey() {
        return key;
    }

    public Object getPayload() {
        return payload;
    }

    @SuppressWarnings("unchecked")
    public <T> T getPayloadAs(Class<T> type) {
        return (T) payload;
    }
}
