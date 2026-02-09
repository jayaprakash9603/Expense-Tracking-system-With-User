package com.jaya.util;

import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.models.User;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ServiceHelper {

    @Autowired
    private UserService userService;

    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    public User validateUser(Integer userId) {
        if (userId == null) {
            throw ResourceNotFoundException.userNotFound(0);
        }
        User reqUser = userService.getUserProfileById(userId);
        if (reqUser == null) {
            throw ResourceNotFoundException.userNotFound(userId);
        }
        return reqUser;
    }

}
