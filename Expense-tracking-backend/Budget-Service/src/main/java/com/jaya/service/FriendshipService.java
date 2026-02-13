package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "FRIENDSHIP-SERVICE", url = "${FRIENDSHIP_SERVICE_URL:http://localhost:6009}", contextId = "budgetFriendshipClient")
public interface FriendshipService {

    @GetMapping("/api/friendships/can-access-expenses")
    boolean canUserAccessExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId);

    @GetMapping("/api/friendships/can-modify-expenses")
    boolean canUserModifyExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId);
}
