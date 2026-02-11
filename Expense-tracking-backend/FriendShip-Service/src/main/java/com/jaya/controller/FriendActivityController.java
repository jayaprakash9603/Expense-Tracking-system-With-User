package com.jaya.controller;

import com.jaya.dto.FriendActivityDTO;
import com.jaya.service.FriendActivityService;
import com.jaya.common.service.client.IUserServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/activities")
@RequiredArgsConstructor
@Slf4j
public class FriendActivityController {

    private final FriendActivityService friendActivityService;
    private final userClient userClient;

    @GetMapping
    public ResponseEntity<List<FriendActivityDTO>> getActivities(
            @RequestHeader("Authorization") String jwt) throws Exception {

        Integer userId = getUserIdFromToken(jwt);
        List<FriendActivityDTO> activities = friendActivityService.getActivitiesForUser(userId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<FriendActivityDTO>> getActivitiesPaged(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws Exception {

        Integer userId = getUserIdFromToken(jwt);
        Page<FriendActivityDTO> activities = friendActivityService.getActivitiesForUser(userId, page, size);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<FriendActivityDTO>> getUnreadActivities(
            @RequestHeader("Authorization") String jwt) throws Exception {

        Integer userId = getUserIdFromToken(jwt);
        List<FriendActivityDTO> activities = friendActivityService.getUnreadActivitiesForUser(userId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("Authorization") String jwt) throws Exception {

        Integer userId = getUserIdFromToken(jwt);
        long count = friendActivityService.getUnreadCount(userId);

        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/service/{service}")
    public ResponseEntity<List<FriendActivityDTO>> getActivitiesByService(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String service) throws Exception {

        Integer userId = getUserIdFromToken(jwt);
        List<FriendActivityDTO> activities = friendActivityService.getActivitiesByService(userId, service);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/friend/{friendId}")
    public ResponseEntity<List<FriendActivityDTO>> getActivitiesByFriend(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer friendId) throws Exception {

        Integer userId = getUserIdFromToken(jwt);
        List<FriendActivityDTO> activities = friendActivityService.getActivitiesByFriend(userId, friendId);
        return ResponseEntity.ok(activities);
    }

    @GetMapping("/recent")
    public ResponseEntity<List<FriendActivityDTO>> getRecentActivities(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "7") int days) throws Exception {

        Integer userId = getUserIdFromToken(jwt);
        List<FriendActivityDTO> activities = friendActivityService.getRecentActivities(userId, days);
        return ResponseEntity.ok(activities);
    }

    @PutMapping("/{activityId}/read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long activityId) throws Exception {

        getUserIdFromToken(jwt);

        friendActivityService.markAsRead(activityId);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Activity marked as read");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead(
            @RequestHeader("Authorization") String jwt) throws Exception {

        Integer userId = getUserIdFromToken(jwt);
        int count = friendActivityService.markAllAsRead(userId);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "All activities marked as read");
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getActivitySummary(
            @RequestHeader("Authorization") String jwt) throws Exception {

        Integer userId = getUserIdFromToken(jwt);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalUnread", friendActivityService.getUnreadCount(userId));
        summary.put("expenseActivities", friendActivityService.getActivitiesByService(userId, "EXPENSE").size());
        summary.put("recentActivities", friendActivityService.getRecentActivities(userId, 7).size());

        return ResponseEntity.ok(summary);
    }

    private Integer getUserIdFromToken(String jwt) throws Exception {
        return userClient.getUserProfile(jwt).getId();
    }
}
