
package com.jaya.config;

import com.jaya.service.UserService;
import com.jaya.util.FriendshipMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;


@Configuration
public class FriendshipMapperConfig {

    @Autowired
    private UserService userService;

    @PostConstruct
    public void initFriendshipMapper() {
        FriendshipMapper.setUserService(userService);
    }
}