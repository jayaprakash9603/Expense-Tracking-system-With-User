
package com.jaya.config;

import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.util.FriendshipMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;


@Configuration
public class FriendshipMapperConfig {

    @Autowired
    private IUserServiceClient userClient;

    @PostConstruct
    public void initFriendshipMapper() {
        FriendshipMapper.setUserClient(userClient);
    }
}