package com.jaya.aspects;

import com.jaya.annotations.CheckPermission;
import com.jaya.dto.User;
import com.jaya.exceptions.UserException;

import com.jaya.service.FriendShipService;
import com.jaya.service.UserService;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Parameter;
import java.util.concurrent.ConcurrentHashMap;

@Aspect
@Component
public class PermissionAspect {

    @Autowired
    private UserService userService;

    @Autowired
    private FriendShipService friendshipService;

    // Cache for target users to avoid repeated database calls
    private final ConcurrentHashMap<Integer, User> targetUserCache = new ConcurrentHashMap<>();

    @Around("@annotation(checkPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, CheckPermission checkPermission) throws Throwable {
        Object[] args = joinPoint.getArgs();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Parameter[] parameters = signature.getMethod().getParameters();

        String jwt = null;
        Integer targetId = null;

        // Extract JWT and targetId from method parameters
        for (int i = 0; i < parameters.length; i++) {
            Parameter param = parameters[i];

            // Check for JWT parameter
            if (param.getName().equals(checkPermission.jwtParam()) ||
                    (param.isAnnotationPresent(org.springframework.web.bind.annotation.RequestHeader.class) &&
                            param.getAnnotation(org.springframework.web.bind.annotation.RequestHeader.class).value().equals("Authorization"))) {
                jwt = (String) args[i];
            }

            // Check for targetId parameter
            if (param.getName().equals(checkPermission.targetIdParam()) ||
                    (param.isAnnotationPresent(org.springframework.web.bind.annotation.RequestParam.class) &&
                            param.getAnnotation(org.springframework.web.bind.annotation.RequestParam.class).value().equals("targetId"))) {
                targetId = (Integer) args[i];
            }
        }

        if (jwt == null) {
            throw new RuntimeException("JWT token not found in method parameters");
        }

        // Get requesting user
        User reqUser;
        try {
            reqUser = userService.findUserByJwt(jwt);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token or user not found");
        }

        // If targetId is null, use the requesting user's ID
        if (targetId == null) {
            targetId = reqUser.getId();
        }

        // Check if target user is already cached
        User targetUser = targetUserCache.computeIfAbsent(targetId, id -> {
            try {
                return userService.findUserById(id);
            } catch (Exception e) {
                throw new RuntimeException("Target user not found with ID: " + id);
            }
        });

        if (targetUser == null) {
            throw new RuntimeException("Target user not found");
        }

        // Skip permission check if user is accessing their own data
        if (!targetId.equals(reqUser.getId())) {
            // Perform permission check
            boolean hasAccess = checkPermission.needWriteAccess()
                    ? friendshipService.canUserModifyExpenses(targetId, reqUser.getId())
                    : friendshipService.canUserAccessExpenses(targetId, reqUser.getId());

            if (!hasAccess) {
                String action = checkPermission.needWriteAccess() ? "modify" : "access";
                throw new RuntimeException("You don't have permission to " + action + " this user's expenses");
            }
        }

        // Proceed with the original method
        return joinPoint.proceed();
    }

    // Method to clear cache if needed
    public void clearUserCache() {
        targetUserCache.clear();
    }

    // Method to remove specific user from cache
    public void removeUserFromCache(Integer userId) {
        targetUserCache.remove(userId);
    }
}