package com.jaya.service;

import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.models.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "USER-SERVICE", url = "${USER_SERVICE_URL:http://localhost:6001}", contextId = "categoryUserClient")
public interface UserService {

    @GetMapping("/api/user/profile")
    public User getuserProfile(@RequestHeader("Authorization") String jwt);

    @GetMapping("/auth/user/{userId}")
    public User getUserProfileById(@PathVariable("userId") Integer id) throws ResourceNotFoundException;
}
