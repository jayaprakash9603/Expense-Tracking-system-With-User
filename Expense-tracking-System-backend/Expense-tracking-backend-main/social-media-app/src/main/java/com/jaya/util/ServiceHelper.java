package com.jaya.util;

import com.jaya.dto.User;
import com.jaya.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class ServiceHelper {


    @Autowired
    private UserService userService;


    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    public User validateUser(Integer userId) throws Exception {

        User reqUser = userService.findUserById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return reqUser;
    }





}
