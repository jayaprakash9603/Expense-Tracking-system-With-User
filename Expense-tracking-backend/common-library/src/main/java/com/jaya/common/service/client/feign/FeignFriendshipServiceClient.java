package com.jaya.common.service.client.feign;

import com.jaya.common.service.client.IFriendshipServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@FeignClient(
    name = "FRIENDSHIP-SERVICE",
    url = "${FRIENDSHIP_SERVICE_URL:http://localhost:6009}",
    contextId = "commonFriendshipServiceClient"
)
@Profile("!monolithic")
public interface FeignFriendshipServiceClient extends IFriendshipServiceClient {

    @Override
    @GetMapping("/api/friendships/internal/can-access-expenses")
    boolean canUserAccessExpenses(@RequestParam("targetUserId") Integer targetUserId,
                                  @RequestParam("requesterId") Integer requesterId);

    @Override
    @GetMapping("/api/friendships/internal/can-modify-expenses")
    boolean canUserModifyExpenses(@RequestParam("targetUserId") Integer targetUserId,
                                  @RequestParam("requesterId") Integer requesterId);

    @Override
    @GetMapping("/api/friendships/internal/are-friends/{userId1}/{userId2}")
    boolean areFriends(@PathVariable("userId1") Integer userId1,
                       @PathVariable("userId2") Integer userId2);

    @Override
    @GetMapping("/api/friendships/internal/friend-ids")
    List<Integer> getFriendIds(@RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/friendships/internal/get-access-level")
    String getUserAccessLevel(@RequestParam("userId") Integer userId,
                              @RequestParam("viewerId") Integer viewerId);
}
