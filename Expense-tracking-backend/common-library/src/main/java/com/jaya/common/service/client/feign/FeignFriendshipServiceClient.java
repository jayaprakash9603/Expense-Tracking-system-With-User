package com.jaya.common.service.client.feign;

import com.jaya.common.service.client.IFriendshipServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Feign client implementation for Friendship Service.
 * Active only in microservices mode (when 'monolithic' profile is NOT active).
 */
@FeignClient(
    name = "FRIENDSHIP-SERVICE",
    url = "${FRIENDSHIP_SERVICE_URL:http://localhost:6009}",
    contextId = "commonFriendshipServiceClient"
)
@Profile("!monolithic")
public interface FeignFriendshipServiceClient extends IFriendshipServiceClient {

    @Override
    @GetMapping("/api/friendship/can-access-expenses")
    boolean canUserAccessExpenses(@RequestParam("targetUserId") Integer targetUserId,
                                  @RequestParam("requesterId") Integer requesterId);

    @Override
    @GetMapping("/api/friendship/can-modify-expenses")
    boolean canUserModifyExpenses(@RequestParam("targetUserId") Integer targetUserId,
                                  @RequestParam("requesterId") Integer requesterId);

    @Override
    @GetMapping("/api/friendship/are-friends/{userId1}/{userId2}")
    boolean areFriends(@PathVariable("userId1") Integer userId1,
                       @PathVariable("userId2") Integer userId2);

    @Override
    @GetMapping("/api/friendship/friend-ids")
    List<Integer> getFriendIds(@RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/friendship/access-level")
    String getUserAccessLevel(@RequestParam("userId") Integer userId,
                              @RequestParam("viewerId") Integer viewerId);
}
