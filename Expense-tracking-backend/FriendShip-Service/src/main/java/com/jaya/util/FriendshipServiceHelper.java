package com.jaya.util;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Friendship-service-specific helper. Named to avoid conflict with com.jaya.util.ServiceHelper
 * from other services in monolithic mode.
 */
@Component("friendshipServiceHelper")
public class FriendshipServiceHelper {

    @Autowired
    private IUserServiceClient userClient;

    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    private final Map<Integer, UserDTO> userCacheById = new ConcurrentHashMap<>();
    private volatile boolean allUsersLoaded = false;

    private void ensureAllUsersLoaded() {
        if (!allUsersLoaded) {
            synchronized (this) {
                if (!allUsersLoaded) {
                    List<UserDTO> allUsers = userClient.getAllUsers();
                    if (allUsers != null) {
                        for (UserDTO user : allUsers) {
                            if (user != null && user.getId() != null) {
                                userCacheById.put(user.getId(), user);
                            }
                        }
                    }
                    allUsersLoaded = true;
                }
            }
        }
    }

    public UserDTO validateUser(Integer userId) throws Exception {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        ensureAllUsersLoaded();

        UserDTO cached = userCacheById.get(userId);
        if (cached != null) {
            return cached;
        }

        UserDTO reqUser = userClient.getUserById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }

        if (reqUser.getId() != null) {
            userCacheById.put(reqUser.getId(), reqUser);
        }

        return reqUser;
    }
}
