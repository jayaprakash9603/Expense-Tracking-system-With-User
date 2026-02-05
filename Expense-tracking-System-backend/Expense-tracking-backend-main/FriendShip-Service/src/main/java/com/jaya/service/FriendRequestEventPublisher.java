package com.jaya.service;

import com.jaya.events.FriendRequestEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class FriendRequestEventPublisher {

    private static final String FRIEND_REQUEST_TOPIC = "friend-request-events";

    @Autowired
    private KafkaTemplate<String, FriendRequestEvent> friendRequestKafkaTemplate;

    public void publishFriendRequestEvent(FriendRequestEvent event) {
        try {
            log.info("Publishing friend request event: {} for friendship ID: {}",
                    event.getEventType(), event.getFriendshipId());

            CompletableFuture<SendResult<String, FriendRequestEvent>> future = friendRequestKafkaTemplate
                    .send(FRIEND_REQUEST_TOPIC, event.getFriendshipId().toString(), event);

            future.whenComplete((result, ex) -> {
                if (ex == null) {
                    log.info("Successfully published friend request event: {} to topic: {} with offset: {}",
                            event.getEventType(), FRIEND_REQUEST_TOPIC, result.getRecordMetadata().offset());
                } else {
                    log.error("Failed to publish friend request event: {} for friendship ID: {}. Error: {}",
                            event.getEventType(), event.getFriendshipId(), ex.getMessage(), ex);
                }
            });
        } catch (Exception e) {
            log.error("Exception while publishing friend request event for friendship ID: {}. Error: {}",
                    event.getFriendshipId(), e.getMessage(), e);
        }
    }
}
