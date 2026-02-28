package com.jaya.service;


import com.jaya.models.AccessLevel;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "FRIENDSHIP-SERVICE", url = "${friendship.service.url:http://localhost:6009}", contextId = "expenseFriendshipClient")
public interface FriendShipService {


    @GetMapping("/api/friendships/can-access-expenses")
    boolean canUserAccessExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId) throws  Exception;

    @GetMapping("/api/friendships/can-modify-expenses")
    boolean canUserModifyExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId) throws Exception;


    @GetMapping("/api/friendships/get-access-level")
    AccessLevel getUserAccessLevel(@RequestParam Integer userId, @RequestParam Integer viewerId) throws Exception;
}

