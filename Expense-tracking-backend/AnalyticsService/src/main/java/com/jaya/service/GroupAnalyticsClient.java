package com.jaya.service;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.List;
import java.util.Map;

@FeignClient(name = "GROUP-SERVICE", url = "${GROUP_SERVICE_URL:http://localhost:8080}", contextId = "analyticsGroupClient")
public interface GroupAnalyticsClient {

    @GetMapping("/api/groups")
    List<Map<String, Object>> getAllUserGroups(@RequestHeader("Authorization") String jwt);

    @GetMapping("/api/groups/created")
    List<Map<String, Object>> getGroupsCreatedByUser(@RequestHeader("Authorization") String jwt);

    @GetMapping("/api/groups/member")
    List<Map<String, Object>> getGroupsWhereUserIsMember(@RequestHeader("Authorization") String jwt);
}
