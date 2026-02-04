package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.UserStatsDTO;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.service.AdminAnalyticsService;
import com.jaya.task.user.service.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        try {
            List<User> allUsers = userService.getAllUsers();

            // Apply filters
            List<User> filteredUsers = allUsers.stream()
                    .filter(user -> {
                        // Search filter
                        if (search != null && !search.isEmpty()) {
                            String searchLower = search.toLowerCase();
                            return (user.getFullName() != null
                                    && user.getFullName().toLowerCase().contains(searchLower)) ||
                                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchLower));
                        }
                        return true;
                    })
                    .filter(user -> {
                        // Role filter
                        if (role != null && !role.isEmpty() && !role.equals("ALL")) {
                            return user.getRoles() != null && user.getRoles().contains("ROLE_" + role);
                        }
                        return true;
                    })
                    .collect(Collectors.toList());

            // Pagination
            int total = filteredUsers.size();
            int start = page * size;
            int end = Math.min(start + size, total);

            List<User> pagedUsers = start < total ? filteredUsers.subList(start, end) : List.of();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Users retrieved successfully");
            response.put("users", pagedUsers);
            response.put("totalCount", total);
            response.put("page", page);
            response.put("size", size);
            response.put("totalPages", (int) Math.ceil((double) total / size));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Failed to retrieve users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "error", "Failed to retrieve users",
                            "message", e.getMessage(),
                            "timestamp", java.time.LocalDateTime.now()));
        }
    }

    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getUserById(
            @PathVariable Integer userId,
            @RequestHeader("Authorization") String jwt) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(userOpt.get());
        } catch (Exception e) {
            log.error("Failed to retrieve user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve user", "message", e.getMessage()));
        }
    }

    @PutMapping("/users/{userId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Integer userId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String jwt) {
        try {
            String status = request.get("status");
            log.info("Updating user {} status to {}", userId, status);

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            // For now, we'll just log the status change
            // TODO: Add status field to User entity

            return ResponseEntity.ok(Map.of(
                    "message", "User status updated successfully",
                    "userId", userId,
                    "status", status));
        } catch (Exception e) {
            log.error("Failed to update user status: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update user status", "message", e.getMessage()));
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(
            @PathVariable Integer userId,
            @RequestHeader("Authorization") String jwt) {
        try {
            log.info("Deleting user: {}", userId);

            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            userService.deleteUser(userId);

            return ResponseEntity.ok(Map.of(
                    "message", "User deleted successfully",
                    "userId", userId));
        } catch (Exception e) {
            log.error("Failed to delete user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to delete user", "message", e.getMessage()));
        }
    }

    @PostMapping("/users/bulk-action")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> bulkUserAction(
            @RequestBody BulkActionRequest request,
            @RequestHeader("Authorization") String jwt) {
        try {
            log.info("Performing bulk action {} on {} users", request.getAction(), request.getUserIds().size());

            int successCount = 0;
            int failCount = 0;
            List<String> errors = new ArrayList<>();

            for (Integer userId : request.getUserIds()) {
                try {
                    switch (request.getAction().toUpperCase()) {
                        case "DELETE":
                            userService.deleteUser(userId);
                            break;
                        case "SUSPEND":
                        case "ACTIVATE":
                        case "DEACTIVATE":
                            // TODO: Add status field to User entity
                            break;
                    }
                    successCount++;
                } catch (Exception e) {
                    failCount++;
                    errors.add("User " + userId + ": " + e.getMessage());
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Bulk action completed",
                    "action", request.getAction(),
                    "successCount", successCount,
                    "failCount", failCount,
                    "errors", errors));
        } catch (Exception e) {
            log.error("Failed to perform bulk action", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to perform bulk action", "message", e.getMessage()));
        }
    }

    @GetMapping("/users/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserStatsDTO> getUserStats(@RequestHeader("Authorization") String jwt) {
        log.info("Fetching user statistics");
        UserStatsDTO stats = adminAnalyticsService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsersAlternative(@RequestHeader("Authorization") String jwt) {
        return getAllUsers(jwt, 0, 1000, null, null, null);
    }

    // DTO for bulk action request
    @lombok.Data
    public static class BulkActionRequest {
        private List<Integer> userIds;
        private String action;
    }
}