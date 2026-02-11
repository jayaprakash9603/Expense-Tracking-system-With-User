package com.jaya.util;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class ServiceHelper {


    @Autowired
    private IUserServiceClient IUserServiceClient;


    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    public UserDTO validateUser(Integer userId) throws Exception {

        UserDTO reqUser = IUserServiceClient.findUserById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("UserDTO ID cannot be null");
        }
        return reqUser;
    }





}
