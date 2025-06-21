package com.jaya.service;

import com.corundumstudio.socketio.SocketIOServer;
import com.jaya.config.SocketIOConfig;
import com.jaya.models.Friendship;
import com.jaya.models.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class SocketService {

    @Autowired
    private SocketIOServer socketIOServer;

    @Autowired
    @Lazy
    private FriendshipService friendshipService;

    // Notify user about a new friend request
    public void notifyNewFriendRequest(Friendship friendship) {
        Integer recipientId = friendship.getRecipient().getId();
        Integer senderId=friendship.getRequester().getId();
        if (SocketIOConfig.isUserConnected(recipientId)) {
            // Get socket client for recipient
            com.corundumstudio.socketio.SocketIOClient recipientClient =
                    SocketIOConfig.getClientForUser(socketIOServer, recipientId);

            if (recipientClient != null) {
                recipientClient.sendEvent("newFriendRequest", recipientId,senderId);
            }

            System.out.println("Friends request send to user id"+recipientId);
        }
    }

    // Notify user about a friend request response
    public void notifyFriendRequestResponse(Friendship friendship) {
        Integer requesterId = friendship.getRequester().getId();

        // Check if requester is connected
        if (SocketIOConfig.isUserConnected(requesterId)) {
            // Get socket client for requester
            com.corundumstudio.socketio.SocketIOClient requesterClient =
                    SocketIOConfig.getClientForUser(socketIOServer, requesterId);
            if (requesterClient != null) {
                // Send notification to requester
                requesterClient.sendEvent("friendRequestResponse", friendship);
            }
        }
    }


    public void notifyUserOnline(User user) {
        // Get all accepted friendships for the user
        List<Friendship> friendships = friendshipService.getUserFriendships(user.getId());

        // For each friendship, notify the other user if they're online
        friendships.forEach(friendship -> {
            // Determine which user in the friendship is the friend (not the current user)
            User friend = friendship.getRequester().getId().equals(user.getId())
                    ? friendship.getRecipient()
                    : friendship.getRequester();

            // Check if the friend is connected via socket
            if (SocketIOConfig.isUserConnected(friend.getId())) {
                com.corundumstudio.socketio.SocketIOClient friendClient =
                        SocketIOConfig.getClientForUser(socketIOServer, friend.getId());

                if (friendClient != null) {
                    // Create a simplified user object with only necessary information
                    Map<String, Object> userData = Map.of(
                            "id", user.getId(),
                            "username", user.getUsername(),
                            "firstName", user.getFirstName(),
                            "lastName", user.getLastName()
                    );

                    // Send the online status notification to the friend
                    friendClient.sendEvent("friendStatusChange",
                            Map.of("user", userData, "status", "ONLINE"));
                }
            }
        });
    }
}