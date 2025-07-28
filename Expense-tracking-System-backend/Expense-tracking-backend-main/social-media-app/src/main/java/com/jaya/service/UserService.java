package com.jaya.service;



import com.jaya.dto.User;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(name = "USER-SERVICE", url = "http://localhost:6001")
public interface UserService {

    @GetMapping("/api/user/profile")
    public User findUserByJwt(@RequestHeader("Authorization") String jwt);


    @GetMapping("/auth/{userId}")
    public User findUserById(@PathVariable("userId") Integer id) throws Exception;
}
