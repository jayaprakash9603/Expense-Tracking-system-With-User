package com.jaya.common.service.client.feign;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
    name = "USER-SERVICE",
    url = "${USER_SERVICE_URL:http://localhost:6001}",
    contextId = "commonUserServiceClient",
    primary = false
)
@Profile("!monolithic")
public interface FeignUserServiceClient extends IUserServiceClient {

    @Override
    @GetMapping(value = "/api/user/profile", headers = "Accept=application/json")
    UserDTO getUserProfile(@RequestHeader("Authorization") String jwt);

    @Override
    @GetMapping("/api/internal/users/{userId}")
    UserDTO getUserById(@PathVariable("userId") Integer userId);

    @Override
    @GetMapping("/api/internal/users/all")
    List<UserDTO> getAllUsers();

    @Override
    @GetMapping("/api/internal/users/by-email")
    UserDTO findUserByEmail(@RequestParam("email") String email);
}
