package com.jaya.service;


import com.jaya.exceptions.UserNotFoundException;
import com.jaya.models.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "USER-SERVICE", url = "${user.service.url:http://localhost:6001}")
public interface UserService {

    @GetMapping("/api/user/profile")
    public UserDto getuserProfile(@RequestHeader("Authorization") String jwt);


    @GetMapping("/auth/{userId}")
    public UserDto getUserProfileById(@PathVariable("userId") Integer id) throws UserNotFoundException;
}
