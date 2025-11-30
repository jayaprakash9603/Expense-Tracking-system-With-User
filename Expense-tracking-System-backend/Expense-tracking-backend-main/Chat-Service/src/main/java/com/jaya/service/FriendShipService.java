package com.jaya.service;


import com.jaya.dto.FriendshipResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "FRIENDSHIP-SERVICE", url = "${FRIENDSHIP_SERVICE_URL:http://localhost:6009}")
public interface FriendShipService {


    @GetMapping("/api/friendships/are-friends/{userId1}/{userId2}")
    boolean areFriends(@PathVariable("userId1") Integer userId1,
                       @PathVariable("userId2") Integer userId2);

    @GetMapping("/api/friendships/can-access-expenses")
    boolean canUserAccessExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId) throws  Exception;

    @GetMapping("/api/friendships/can-modify-expenses")
    boolean canUserModifyExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId) throws Exception;
}
