package com.jaya.service.helper;

import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserValidationHelper {

    private final IUserServiceClient IUserServiceClient;

    public UserDTO validateAndGetUser(Integer userId) {
        if (userId == null) {
            log.warn("UserDTO validation failed: userId is null");
            throw ResourceNotFoundException.userNotFound(0);
        }

        UserDTO UserDTO = IUserServiceClient.getUserById(userId);
        if (UserDTO == null) {
            log.warn("UserDTO validation failed: UserDTO not found for ID {}", userId);
            throw ResourceNotFoundException.userNotFound(userId);
        }

        log.debug("UserDTO validated successfully: userId={}", userId);
        return UserDTO;
    }

    public boolean isAdmin(UserDTO UserDTO) {
        return UserDTO != null && UserDTO.hasAdminRole();
    }

    public boolean isInAdminMode(UserDTO UserDTO) {
        return UserDTO != null && UserDTO.isInAdminMode();
    }
}
