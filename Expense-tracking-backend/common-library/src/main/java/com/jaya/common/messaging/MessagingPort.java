package com.jaya.common.messaging;

import java.util.concurrent.CompletableFuture;

public interface MessagingPort {

    void send(String topic, Object event);

    void send(String topic, String key, Object event);

    CompletableFuture<Void> sendAsync(String topic, String key, Object event);
}
