package com.jaya.util;
import com.jaya.dto.User;
import com.jaya.exceptions.UserException;
import com.jaya.service.FriendShipService;;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.function.Function;

@Component
public class UserPermissionHelper {

    private final UserService userService;
    private final FriendShipService friendshipService;

    @Autowired
    public UserPermissionHelper(UserService userService, FriendShipService friendshipService) {
        this.userService = userService;
        this.friendshipService = friendshipService;
    }

    public User getTargetUserWithPermissionCheck(Integer targetId, User reqUser, boolean needWriteAccess) throws Exception {
        if (targetId == null) {
            return reqUser;
        }
        User targetUser = userService.findUserById(targetId);
        if (targetUser == null) {
            throw new RuntimeException("Target user not found");
        }

        boolean hasAccess = needWriteAccess ?
                friendshipService.canUserModifyExpenses(targetId, reqUser.getId()) :
                friendshipService.canUserAccessExpenses(targetId, reqUser.getId());

        if (!hasAccess) {
            String action = needWriteAccess ? "modify" : "access";
            throw new RuntimeException("You don't have permission to " + action + " this user's expenses");
        }
        return targetUser;
    }

    public <T> ResponseEntity<?> executeWithPermissionCheck(String jwt, Integer targetId, boolean needWriteAccess,
                                                            Function<User, T> operation, Function<RuntimeException, ResponseEntity<?>> runtimeHandler) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, needWriteAccess);
            T result = operation.apply(targetUser);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return runtimeHandler.apply(e);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
