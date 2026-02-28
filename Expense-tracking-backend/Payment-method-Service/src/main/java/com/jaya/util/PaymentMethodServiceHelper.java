package com.jaya.util;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Payment-method-service-specific helper. Named to avoid conflict with com.jaya.util.ServiceHelper
 * from other services in monolithic mode.
 */
@Component("paymentMethodServiceHelper")
public class PaymentMethodServiceHelper {

    @Autowired
    private IUserServiceClient userClient;

    public static final String DEFAULT_TYPE = "loss";
    public static final String DEFAULT_PAYMENT_METHOD = "cash";
    public static final String DEFAULT_COMMENT = "";

    public UserDTO validateUser(Integer userId) throws Exception {
        UserDTO reqUser = userClient.getUserById(userId);
        if (reqUser == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        return reqUser;
    }
}
