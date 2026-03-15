package com.jaya.service;

import com.jaya.common.messaging.MessagingPort;
import com.jaya.events.FriendRequestEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class FriendRequestEventPublisher {

    private static final String FRIEND_REQUEST_TOPIC = "friend-request-events";

    @Autowired
    private MessagingPort messagingPort;

    public void publishFriendRequestEvent(FriendRequestEvent event) {
        try {
            log.info("Publishing friend request event: {} for friendship ID: {}",
                    event.getEventType(), event.getFriendshipId());

            messagingPort.send(FRIEND_REQUEST_TOPIC, event.getFriendshipId().toString(), event);
            log.info("Successfully published friend request event: {} to topic: {}",
                    event.getEventType(), FRIEND_REQUEST_TOPIC);
        } catch (Exception e) {
            log.error("Exception while publishing friend request event for friendship ID: {}. Error: {}",
                    event.getFriendshipId(), e.getMessage(), e);
        }
    }
}
