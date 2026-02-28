package com.jaya.common.service.client.local;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Local implementation for User Service client in monolithic mode.
 * Calls the local UserService bean directly instead of making HTTP calls.
 * 
 * Uses ApplicationContext to lazily resolve the service bean to avoid
 * circular dependency issues during startup.
 */
@Component
@Profile("monolithic")
@Slf4j
public class LocalUserServiceClient implements IUserServiceClient {

    private final ApplicationContext applicationContext;
    private Object userService;
    private Object userRepository;

    @Autowired
    public LocalUserServiceClient(@Lazy ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    /**
     * Lazily resolve the actual UserService bean.
     * The bean is from user-service module: com.jaya.task.user.service.service.UserService
     */
    private Object getUserService() {
        if (userService == null) {
            try {
                // Try to get UserService from user-service module
                userService = applicationContext.getBean("userServiceImpl");
            } catch (Exception e) {
                log.warn("Could not find userServiceImpl, trying UserService class", e);
                try {
                    userService = applicationContext.getBean(
                        Class.forName("com.jaya.task.user.service.service.UserService"));
                } catch (ClassNotFoundException ex) {
                    log.error("UserService class not found", ex);
                    throw new RuntimeException("UserService not available in monolithic mode", ex);
                }
            }
        }
        return userService;
    }

    /**
     * Lazily resolve the UserRepository bean for direct DB lookups (e.g. getUserById).
     */
    private Object getUserRepository() {
        if (userRepository == null) {
            try {
                userRepository = applicationContext.getBean(
                    Class.forName("com.jaya.task.user.service.repository.UserRepository"));
            } catch (Exception e) {
                log.warn("Could not find UserRepository bean", e);
            }
        }
        return userRepository;
    }

    @Override
    public UserDTO getUserProfile(String jwt) {
        log.debug("LocalUserServiceClient: Getting user profile from JWT");
        // In monolithic mode, the JwtTokenValidator has already set the email
        // in the SecurityContext, so we can resolve the user from there
        try {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder
                            .getContext().getAuthentication();
            if (auth != null && auth.getName() != null && !"anonymousUser".equals(auth.getName())) {
                String email = auth.getName();
                log.debug("LocalUserServiceClient: Resolved email from SecurityContext: {}", email);
                return findUserByEmail(email);
            }
        } catch (Exception e) {
            log.warn("Could not get user from SecurityContext", e);
        }
        throw new RuntimeException("Unable to resolve user profile in monolithic mode - no authenticated user found");
    }

    @Override
    public UserDTO getUserById(Integer userId) {
        log.debug("LocalUserServiceClient: Getting user by ID: {}", userId);
        try {
            // Strategy 1: Try service-level methods via reflection
            Object service = getUserService();
            for (String methodName : new String[]{"getUserById", "findById"}) {
                try {
                    var method = service.getClass().getMethod(methodName, Integer.class);
                    Object result = method.invoke(service, userId);
                    // Handle Optional return type
                    if (result instanceof java.util.Optional) {
                        result = ((java.util.Optional<?>) result).orElse(null);
                    }
                    if (result != null) {
                        return convertToUserDTO(result);
                    }
                } catch (NoSuchMethodException ignored) {
                    // Try next method name
                }
            }

            // Strategy 2: Fall back to UserRepository.findById(Object)
            Object repo = getUserRepository();
            if (repo != null) {
                var method = repo.getClass().getMethod("findById", Object.class);
                Object result = method.invoke(repo, userId);
                if (result instanceof java.util.Optional) {
                    result = ((java.util.Optional<?>) result).orElse(null);
                }
                if (result != null) {
                    return convertToUserDTO(result);
                }
            }

            throw new RuntimeException("User not found with ID: " + userId);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling local UserService.getUserById", e);
            throw new RuntimeException("Failed to get user by ID locally", e);
        }
    }

    @Override
    public List<UserDTO> getAllUsers() {
        log.debug("LocalUserServiceClient: Getting all users");
        try {
            Object service = getUserService();
            var method = service.getClass().getMethod("getAllUsers");
            @SuppressWarnings("unchecked")
            List<Object> result = (List<Object>) method.invoke(service);
            return result.stream()
                    .map(this::convertToUserDTO)
                    .toList();
        } catch (Exception e) {
            log.error("Error calling local UserService.getAllUsers", e);
            throw new RuntimeException("Failed to get all users locally", e);
        }
    }

    @Override
    public UserDTO findUserByEmail(String email) {
        log.debug("LocalUserServiceClient: Finding user by email: {}", email);
        try {
            Object service = getUserService();
            // UserServiceImplementation has findByEmail(String), not findUserByEmail
            Object result = null;
            for (String methodName : new String[]{"findByEmail", "getUserByEmail", "findUserByEmail"}) {
                try {
                    var method = service.getClass().getMethod(methodName, String.class);
                    result = method.invoke(service, email);
                    break;
                } catch (NoSuchMethodException ignored) {
                    // Try next method name
                }
            }
            if (result == null) {
                log.warn("No user found for email: {}", email);
                return null;
            }
            return convertToUserDTO(result);
        } catch (Exception e) {
            log.error("Error calling local UserService.findUserByEmail", e);
            throw new RuntimeException("Failed to find user by email locally", e);
        }
    }

    /**
     * Convert the User entity to UserDTO.
     * Uses reflection to handle different User classes from different modules.
     */
    private UserDTO convertToUserDTO(Object user) {
        if (user == null) return null;
        try {
            UserDTO dto = new UserDTO();
            dto.setId((Integer) getProperty(user, "id"));
            dto.setEmail((String) getProperty(user, "email"));
            dto.setFirstName((String) getPropertySafe(user, "firstName"));
            dto.setLastName((String) getPropertySafe(user, "lastName"));
            dto.setFullName((String) getPropertySafe(user, "fullName"));
            dto.setImage((String) getPropertySafe(user, "image", "profileImage"));
            return dto;
        } catch (Exception e) {
            log.error("Error converting user to DTO", e);
            throw new RuntimeException("Failed to convert user to DTO", e);
        }
    }

    private Object getProperty(Object obj, String propertyName) throws Exception {
        String getterName = "get" + Character.toUpperCase(propertyName.charAt(0)) + propertyName.substring(1);
        var method = obj.getClass().getMethod(getterName);
        return method.invoke(obj);
    }

    private Object getPropertySafe(Object obj, String... propertyNames) {
        for (String propertyName : propertyNames) {
            try {
                return getProperty(obj, propertyName);
            } catch (Exception ignored) {
                // Try next property name
            }
        }
        return null;
    }
}
