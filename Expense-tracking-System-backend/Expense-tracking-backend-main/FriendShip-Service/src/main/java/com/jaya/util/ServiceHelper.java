package com.jaya.util;

import com.jaya.models.UserDto;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class ServiceHelper {

    @Autowired
    private UserService userService;

    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    private final Map<Integer, UserDto> userCacheById = new ConcurrentHashMap<>();
    private volatile boolean allUsersLoaded = false;

    private void ensureAllUsersLoaded() {
        if (!allUsersLoaded) {
            synchronized (this) {
                if (!allUsersLoaded) {
                    List<UserDto> allUsers = userService.getAllUsers();
                    if (allUsers != null) {
                        for (UserDto user : allUsers) {
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

    public UserDto validateUser(Integer userId) throws Exception {
        if (userId == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        // Load all users once and serve from in-memory cache to avoid
        // repeated remote calls and database queries for each group member.
        ensureAllUsersLoaded();

        UserDto cached = userCacheById.get(userId);
        if (cached != null) {
            return cached;
        }

        UserDto reqUser = userService.getUserProfileById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User not found with ID: " + userId);
        }

        if (reqUser.getId() != null) {
            userCacheById.put(reqUser.getId(), reqUser);
        }

        return reqUser;
    }

}
