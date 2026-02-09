package com.jaya.controller;

import com.jaya.dto.UserDto;
import com.jaya.service.FriendShipService;
import com.jaya.service.PresenceService;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chats/presence")
public class PresenceController {

    @Autowired
    private PresenceService presenceService;

    @Autowired
    private UserService userService;

    @Autowired
    private FriendShipService friendshipService;

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUserPresence(
            @PathVariable Integer userId,
            @RequestHeader("Authorization") String jwt) {

        UserDto currentUser = userService.getuserProfile(jwt);
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        Map<String, Object> response = new HashMap<>();
        boolean isOnline = presenceService.isUserOnline(userId);
        response.put("userId", userId);
        response.put("online", isOnline);

        if (!isOnline) {
            var lastSeen = presenceService.getLastSeen(userId);
            if (lastSeen != null) {
                response.put("lastSeen", lastSeen.toString());
            }
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/friends")
    public ResponseEntity<Map<String, Object>> getFriendsPresence(
            @RequestHeader("Authorization") String jwt) {

        UserDto currentUser = userService.getuserProfile(jwt);
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        List<Integer> friendIds = friendshipService.getFriendIds(currentUser.getId());
        Map<Integer, Object> presenceInfo = presenceService.getPresenceInfoForUsers(friendIds);

        Map<String, Object> response = new HashMap<>();
        response.put("friends", presenceInfo);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/batch")
    public ResponseEntity<Map<Integer, Object>> getBatchPresence(
            @RequestParam List<Integer> userIds,
            @RequestHeader("Authorization") String jwt) {

        UserDto currentUser = userService.getuserProfile(jwt);
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        Map<Integer, Object> presenceInfo = presenceService.getPresenceInfoForUsers(userIds);
        return ResponseEntity.ok(presenceInfo);
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Void> heartbeat(@RequestHeader("Authorization") String jwt) {
        UserDto currentUser = userService.getuserProfile(jwt);
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        presenceService.heartbeat(currentUser.getId());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/online")
    public ResponseEntity<Set<Integer>> getOnlineUsers(@RequestHeader("Authorization") String jwt) {
        UserDto currentUser = userService.getuserProfile(jwt);
        if (currentUser == null) {
            return ResponseEntity.status(401).build();
        }

        Set<Integer> onlineUsers = presenceService.getAllOnlineUsers();
        return ResponseEntity.ok(onlineUsers);
    }
}
