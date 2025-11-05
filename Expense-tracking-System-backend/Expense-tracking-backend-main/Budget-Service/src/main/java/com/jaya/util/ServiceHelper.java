package com.jaya.util;

import com.jaya.models.UserDto;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Component
public class ServiceHelper {


    @Autowired
    private UserService userService;


    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";


    public UserDto validateUser(Integer userId) throws Exception {

        UserDto reqUser=userService.getUserProfileById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return reqUser;
    }
 private UserDto authenticate(String jwt) {
        UserDto reqUser = userService.getuserProfile(jwt);
        if (reqUser == null) {
            throw new com.jaya.exceptions.UnauthorizedException("Invalid or expired token");
        }
        return reqUser;
    }



}
