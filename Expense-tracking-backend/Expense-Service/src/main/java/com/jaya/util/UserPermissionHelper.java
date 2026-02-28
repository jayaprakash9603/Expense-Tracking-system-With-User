package com.jaya.util;
import com.jaya.common.dto.UserDTO;
import com.jaya.exceptions.UserException;
import com.jaya.service.FriendShipService;
import com.jaya.common.service.client.IUserServiceClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.function.Function;


@Component
public class UserPermissionHelper {

    private final IUserServiceClient IUserServiceClient;
    private final FriendShipService friendshipService;

    private final Logger logger= LoggerFactory.getLogger(UserPermissionHelper.class);

    @Autowired
    public UserPermissionHelper(IUserServiceClient IUserServiceClient, FriendShipService friendshipService) {
        this.IUserServiceClient = IUserServiceClient;
        this.friendshipService = friendshipService;
    }


    public UserDTO validateUser(String jwt) throws Exception {

        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        if (reqUser == null) {
            throw new IllegalArgumentException("UserDTO ID cannot be null");
        }
        return reqUser;
    }
    public UserDTO getTargetUserWithPermissionCheck(Integer targetId, UserDTO reqUser, boolean needWriteAccess)  {

        try {
            if (targetId == null) {
                return reqUser;
            }
            UserDTO targetUser = IUserServiceClient.getUserById(targetId);
            if (targetUser == null) {
                throw new RuntimeException("Target UserDTO not found");
            }

            boolean hasAccess = needWriteAccess ?
                    friendshipService.canUserModifyExpenses(targetId, reqUser.getId()) :
                    friendshipService.canUserAccessExpenses(targetId, reqUser.getId());

                    System.out.println("can access the expense"+friendshipService.canUserModifyExpenses(targetId, reqUser.getId()));
            if (!hasAccess) {
                String action = needWriteAccess ? "modify" : "access";
                throw new RuntimeException("You don't have permission to " + action + " this UserDTO's expenses");
            }
            return targetUser;
        }
        catch (Exception e)
        {
            logger.error("Exception occurred"+e);
        }
        return reqUser;
    }


    public UserDTO getTargetUserWithPermissionCheck(Integer targetId, String jwt, boolean needWriteAccess) throws Exception {

        UserDTO reqUser=validateUser(jwt);

        try {
            if (targetId == null) {
                return reqUser;
            }
            UserDTO targetUser = IUserServiceClient.getUserById(targetId);
            if (targetUser == null) {
                throw new RuntimeException("Target UserDTO not found");
            }

            boolean hasAccess = needWriteAccess ?
                    friendshipService.canUserModifyExpenses(targetId, reqUser.getId()) :
                    friendshipService.canUserAccessExpenses(targetId, reqUser.getId());

            if (!hasAccess) {
                String action = needWriteAccess ? "modify" : "access";
                throw new RuntimeException("You don't have permission to " + action + " this UserDTO's expenses");
            }
            return targetUser;
        }
        catch (Exception e)
        {
            logger.error("Exception occurred"+e);
        }
        return reqUser;
    }

    public <T> ResponseEntity<?> executeWithPermissionCheck(String jwt, Integer targetId, boolean needWriteAccess,
                                                            Function<UserDTO, T> operation, Function<RuntimeException, ResponseEntity<?>> runtimeHandler) {
        try {
            UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
            UserDTO targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, needWriteAccess);
            T result = operation.apply(targetUser);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return runtimeHandler.apply(e);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
}
