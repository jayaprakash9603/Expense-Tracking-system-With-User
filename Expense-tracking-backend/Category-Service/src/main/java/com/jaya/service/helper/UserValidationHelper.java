package com.jaya.service.helper;

import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.models.User;
import com.jaya.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserValidationHelper {

    private final UserService userService;

    public User validateAndGetUser(Integer userId) {
        if (userId == null) {
            log.warn("User validation failed: userId is null");
            throw ResourceNotFoundException.userNotFound(0);
        }

        User user = userService.getUserProfileById(userId);
        if (user == null) {
            log.warn("User validation failed: user not found for ID {}", userId);
            throw ResourceNotFoundException.userNotFound(userId);
        }

        log.debug("User validated successfully: userId={}", userId);
        return user;
    }

    public boolean isAdmin(User user) {
        return user != null && user.hasAdminRole();
    }

    public boolean isInAdminMode(User user) {
        return user != null && user.isInAdminMode();
    }
}
