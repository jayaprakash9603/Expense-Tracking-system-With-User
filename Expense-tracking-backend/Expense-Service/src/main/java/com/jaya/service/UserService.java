package com.jaya.service;



import com.jaya.dto.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "USER-SERVICE", url = "${user.service.url:http://localhost:6001}")
public interface UserService {

    @GetMapping("/api/user/profile")
    public User findUserByJwt(@RequestHeader("Authorization") String jwt);


    @GetMapping("/auth/{userId}")
    public User findUserById(@PathVariable("userId") Integer id) throws Exception;


    @GetMapping("/auth/email")
    public User findUserByEmail(
            @RequestParam @NotNull @Email(message = "Valid email is required") String email);
}
