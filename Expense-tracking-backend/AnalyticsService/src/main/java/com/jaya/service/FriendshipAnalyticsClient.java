package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.Map;

@FeignClient(name = "FRIENDSHIP-SERVICE", url = "${FRIENDSHIP_SERVICE_URL:http://localhost:8080}", contextId = "analyticsFriendshipClient")
public interface FriendshipAnalyticsClient {

    @GetMapping("/api/friendships/stats")
    Map<String, Object> getFriendshipStats(@RequestHeader("Authorization") String jwt);
}

