package com.jaya.controller;

import com.jaya.modal.Notification;
import com.jaya.modal.NotificationPreferences;
import com.jaya.modal.UserDto;
import com.jaya.repository.NotificationRepository;
import com.jaya.repository.NotificationPreferencesRepository;
import com.jaya.service.NotificationService;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationPreferencesRepository preferencesRepository;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        UserDto user = userService.getuserProfile(jwt);
        Page<Notification> notifications = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size));

        return ResponseEntity.ok(notifications.getContent());
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            @RequestHeader("Authorization") String jwt) {

        UserDto user = userService.getuserProfile(jwt);
        List<Notification> notifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());

        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/count/unread")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("Authorization") String jwt) {

        UserDto user = userService.getuserProfile(jwt);
        Long count = notificationRepository.countUnreadNotifications(user.getId());

        return ResponseEntity.ok(Map.of("unreadCount", count));
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsRead(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer notificationId) {

        UserDto user = userService.getuserProfile(jwt);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(user.getId())) {
            return ResponseEntity.badRequest().body("Unauthorized access to notification");
        }

        notification.setIsRead(true);
        notification.setReadAt(LocalDateTime.now());
        notificationRepository.save(notification);

        return ResponseEntity.ok("Notification marked as read");
    }

    @PutMapping("/read-all")
    public ResponseEntity<String> markAllAsRead(@RequestHeader("Authorization") String jwt) {
        UserDto user = userService.getuserProfile(jwt);
        List<Notification> unreadNotifications = notificationRepository
                .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());

        unreadNotifications.forEach(notification -> {
            notification.setIsRead(true);
            notification.setReadAt(LocalDateTime.now());
        });

        notificationRepository.saveAll(unreadNotifications);
        return ResponseEntity.ok("All notifications marked as read");
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<String> deleteNotification(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer notificationId) {

        UserDto user = userService.getuserProfile(jwt);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUserId().equals(user.getId())) {
            return ResponseEntity.badRequest().body("Unauthorized access to notification");
        }

        notificationRepository.delete(notification);
        return ResponseEntity.ok("Notification deleted successfully");
    }

    @GetMapping("/preferences")
    public ResponseEntity<NotificationPreferences> getNotificationPreferences(
            @RequestHeader("Authorization") String jwt) {

        UserDto user = userService.getuserProfile(jwt);
        NotificationPreferences preferences = preferencesRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreferences(user.getId()));

        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    public ResponseEntity<String> updateNotificationPreferences(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Map<String, Boolean> preferences) {

        UserDto user = userService.getuserProfile(jwt);
        notificationService.updateNotificationPreferences(user, preferences);

        return ResponseEntity.ok("Notification preferences updated successfully");
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTestNotification(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Map<String, String> request) {

        UserDto user = userService.getuserProfile(jwt);
        String message = request.getOrDefault("message", "This is a test notification");
        String alertType = request.getOrDefault("alertType", "TEST");

        notificationService.sendCustomAlert(user, message, alertType);
        return ResponseEntity.ok("Test notification sent successfully");
    }

    @GetMapping("/history")
    public ResponseEntity<List<String>> getNotificationHistory(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "50") int limit) {

        UserDto user = userService.getuserProfile(jwt);
        List<String> history = notificationService.getNotificationHistory(user, limit);

        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<String> cleanupOldNotifications(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "30") int daysOld) {

        UserDto user = userService.getuserProfile(jwt);
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);

        notificationRepository.deleteByUserIdAndCreatedAtBefore(user.getId(), cutoffDate);
        return ResponseEntity.ok("Old notifications cleaned up successfully");
    }

    /**
     * Delete all notifications for the user
     */
    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllNotifications(@RequestHeader("Authorization") String jwt) {
        UserDto user = userService.getuserProfile(jwt);
        notificationService.deleteAllNotifications(user.getId());
        return ResponseEntity.ok("All notifications deleted successfully");
    }

    /**
     * Get notifications with filtering and pagination
     */
    @GetMapping("/filter")
    public ResponseEntity<List<Notification>> getFilteredNotifications(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {

        UserDto user = userService.getuserProfile(jwt);
        List<Notification> notifications = notificationService.getUserNotifications(
                user.getId(), isRead, limit, offset);

        return ResponseEntity.ok(notifications);
    }

    private NotificationPreferences createDefaultPreferences(Integer userId) {
        NotificationPreferences prefs = new NotificationPreferences();
        prefs.setUserId(userId);
        return preferencesRepository.save(prefs);
    }
}