package com.jaya.aspects;

import com.jaya.annotations.CheckPermission;
import com.jaya.common.dto.UserDTO;
import com.jaya.exceptions.UserException;

import com.jaya.service.FriendShipService;
import com.jaya.common.service.client.IUserServiceClient;
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
    private IUserServiceClient IUserServiceClient;

    @Autowired
    private FriendShipService friendshipService;

    private final ConcurrentHashMap<Integer, UserDTO> targetUserCache = new ConcurrentHashMap<>();

    @Around("@annotation(checkPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint, CheckPermission checkPermission) throws Throwable {
        Object[] args = joinPoint.getArgs();
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Parameter[] parameters = signature.getMethod().getParameters();

        String jwt = null;
        Integer targetId = null;

        for (int i = 0; i < parameters.length; i++) {
            Parameter param = parameters[i];

            if (param.getName().equals(checkPermission.jwtParam()) ||
                    (param.isAnnotationPresent(org.springframework.web.bind.annotation.RequestHeader.class) &&
                            param.getAnnotation(org.springframework.web.bind.annotation.RequestHeader.class).value()
                                    .equals("Authorization"))) {
                jwt = (String) args[i];
            }

            if (param.getName().equals(checkPermission.targetIdParam()) ||
                    (param.isAnnotationPresent(org.springframework.web.bind.annotation.RequestParam.class) &&
                            param.getAnnotation(org.springframework.web.bind.annotation.RequestParam.class).value()
                                    .equals("targetId"))) {
                targetId = (Integer) args[i];
            }
        }

        if (jwt == null) {
            throw new RuntimeException("JWT token not found in method parameters");
        }

        UserDTO reqUser;
        try {
            reqUser = IUserServiceClient.getUserProfile(jwt);
        } catch (Exception e) {
            throw new RuntimeException("Invalid JWT token or UserDTO not found");
        }

        if (targetId == null) {
            targetId = reqUser.getId();
        }

        UserDTO targetUser = targetUserCache.computeIfAbsent(targetId, id -> {
            try {
                return IUserServiceClient.findUserById(id);
            } catch (Exception e) {
                throw new RuntimeException("Target UserDTO not found with ID: " + id);
            }
        });

        if (targetUser == null) {
            throw new RuntimeException("Target UserDTO not found");
        }

        if (!targetId.equals(reqUser.getId())) {
            boolean hasAccess = checkPermission.needWriteAccess()
                    ? friendshipService.canUserModifyExpenses(targetId, reqUser.getId())
                    : friendshipService.canUserAccessExpenses(targetId, reqUser.getId());

            if (!hasAccess) {
                String action = checkPermission.needWriteAccess() ? "modify" : "access";
                throw new RuntimeException("You don't have permission to " + action + " this UserDTO's expenses");
            }
        }

        return joinPoint.proceed();
    }

    public void clearUserCache() {
        targetUserCache.clear();
    }

    public void removeUserFromCache(Integer userId) {
        targetUserCache.remove(userId);
    }
}