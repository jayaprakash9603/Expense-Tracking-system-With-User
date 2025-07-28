package com.jaya.service;


import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "EXPENSE-TRACKING-SYSTEM", url = "http://localhost:6000")
public interface FriendShipService {


    @GetMapping("/api/friendships/can-access-expenses")
    boolean canUserAccessExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId) throws  Exception;

    @GetMapping("/api/friendships/can-modify-expenses")
    boolean canUserModifyExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId) throws Exception;
}
