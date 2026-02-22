package com.jaya.util;

import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Category-service-specific helper. Named to avoid conflict with com.jaya.util.ServiceHelper
 * from other services in monolithic mode.
 */
@Component("categoryServiceHelper")
public class CategoryServiceHelper {

    @Autowired
    private IUserServiceClient IUserServiceClient;

    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    public UserDTO validateUser(Integer userId) {
        if (userId == null) {
            throw ResourceNotFoundException.userNotFound(0);
        }
        UserDTO reqUser = IUserServiceClient.getUserById(userId);
        if (reqUser == null) {
            throw ResourceNotFoundException.userNotFound(userId);
        }
        return reqUser;
    }

}
