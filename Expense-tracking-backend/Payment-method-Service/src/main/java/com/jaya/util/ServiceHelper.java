package com.jaya.util;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

@Component
public class ServiceHelper {


    @Autowired
    private IUserServiceClient userClient;


    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";


    public UserDTO validateUser(Integer userId) throws Exception {

        UserDTO reqUser=userClient.getUserById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return reqUser;
    }




}
