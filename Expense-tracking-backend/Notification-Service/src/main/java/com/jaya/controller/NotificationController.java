package com.jaya.controller;

import com.jaya.modal.Notification;
import com.jaya.modal.NotificationPreferences;
import com.jaya.common.dto.UserDTO;
import com.jaya.repository.NotificationRepository;
import com.jaya.repository.NotificationPreferencesRepository;
import com.jaya.service.NotificationService;
import com.jaya.common.service.client.IUserServiceClient;
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
    private IUserServiceClient userClient;

    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        try {
            UserDTO user = userClient.getUserProfile(jwt);
            Page<Notification> notifications = notificationRepository
                    .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(page, size));

            return ResponseEntity.ok(notifications.getContent());
        } catch (Exception e) {
            System.err.println("Error fetching user profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of());
        }
    }

    @GetMapping("/unread")
    public ResponseEntity<List<Notification>> getUnreadNotifications(
            @RequestHeader("Authorization") String jwt) {

        try {
            UserDTO user = userClient.getUserProfile(jwt);
            List<Notification> notifications = notificationRepository
                    .findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId());

            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            System.err.println("Error fetching user profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(List.of());
        }
    }

    @GetMapping("/count/unread")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @RequestHeader("Authorization") String jwt) {

        try {
            UserDTO user = userClient.getUserProfile(jwt);
            Long count = notificationRepository.countUnreadNotifications(user.getId());

            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            System.err.println("Error fetching user profile: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("unreadCount", 0L));
        }
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<String> markAsRead(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer notificationId) {

        UserDTO user = userClient.getUserProfile(jwt);
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
        UserDTO user = userClient.getUserProfile(jwt);
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

        UserDTO user = userClient.getUserProfile(jwt);
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

        UserDTO user = userClient.getUserProfile(jwt);
        NotificationPreferences preferences = preferencesRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreferences(user.getId()));

        return ResponseEntity.ok(preferences);
    }

    @PutMapping("/preferences")
    public ResponseEntity<String> updateNotificationPreferences(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Map<String, Boolean> preferences) {

        UserDTO user = userClient.getUserProfile(jwt);
        notificationService.updateNotificationPreferences(user, preferences);

        return ResponseEntity.ok("Notification preferences updated successfully");
    }

    @PostMapping("/test")
    public ResponseEntity<String> sendTestNotification(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Map<String, String> request) {

        UserDTO user = userClient.getUserProfile(jwt);
        String message = request.getOrDefault("message", "This is a test notification");
        String alertType = request.getOrDefault("alertType", "TEST");

        notificationService.sendCustomAlert(user, message, alertType);
        return ResponseEntity.ok("Test notification sent successfully");
    }

    @GetMapping("/history")
    public ResponseEntity<List<String>> getNotificationHistory(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "50") int limit) {

        UserDTO user = userClient.getUserProfile(jwt);
        List<String> history = notificationService.getNotificationHistory(user, limit);

        return ResponseEntity.ok(history);
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<String> cleanupOldNotifications(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "30") int daysOld) {

        UserDTO user = userClient.getUserProfile(jwt);
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);

        notificationRepository.deleteByUserIdAndCreatedAtBefore(user.getId(), cutoffDate);
        return ResponseEntity.ok("Old notifications cleaned up successfully");
    }

    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllNotifications(@RequestHeader("Authorization") String jwt) {
        UserDTO user = userClient.getUserProfile(jwt);
        notificationService.deleteAllNotifications(user.getId());
        return ResponseEntity.ok("All notifications deleted successfully");
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Notification>> getFilteredNotifications(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Boolean isRead,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "0") Integer offset) {

        UserDTO user = userClient.getUserProfile(jwt);
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
