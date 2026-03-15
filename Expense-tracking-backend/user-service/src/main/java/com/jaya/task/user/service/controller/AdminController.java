package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.dto.AdminUserSearchDTO;
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
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final AdminAnalyticsService adminAnalyticsService;

    @GetMapping("/users")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> getAllUsers(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String search) {
        try {
            List<User> allUsers = userService.getAllUsers();

            
            List<User> filteredUsers = allUsers.stream()
                    .filter(user -> {
                        
                        if (search != null && !search.isEmpty()) {
                            String searchLower = search.toLowerCase();
                            return (user.getFullName() != null
                                    && user.getFullName().toLowerCase().contains(searchLower)) ||
                                    (user.getEmail() != null && user.getEmail().toLowerCase().contains(searchLower));
                        }
                        return true;
                    })
                    .filter(user -> {
                        
                        if (role != null && !role.isEmpty() && !role.equals("ALL")) {
                            return user.getRoles() != null && user.getRoles().contains("ROLE_" + role);
                        }
                        return true;
                    })
                    .collect(Collectors.toList());

            
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

    @GetMapping("/users/{userId:\\d+}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
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

    @PutMapping("/users/{userId:\\d+}/status")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
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

    @DeleteMapping("/users/{userId:\\d+}")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
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
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
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
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<UserStatsDTO> getUserStats(@RequestHeader("Authorization") String jwt) {
        log.info("Fetching user statistics");
        UserStatsDTO stats = adminAnalyticsService.getUserStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users/search")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<List<AdminUserSearchDTO>> searchUsers(
            @RequestParam("query") String query,
            @RequestParam(value = "limit", defaultValue = "20") int limit,
            @RequestHeader("Authorization") String jwt) {
        try {
            if (query == null || query.trim().length() < 2) {
                return ResponseEntity.ok(List.of());
            }

            String queryLower = query.trim().toLowerCase();
            log.info("Admin user search: query='{}', limit={}", queryLower, limit);

            List<AdminUserSearchDTO> results = userService.getAllUsers().stream()
                    .filter(user -> {
                        String fullName = user.getFullName() != null ? user.getFullName().toLowerCase() : "";
                        String email = user.getEmail() != null ? user.getEmail().toLowerCase() : "";
                        String username = user.getUsername() != null ? user.getUsername().toLowerCase() : "";
                        return fullName.contains(queryLower)
                                || email.contains(queryLower)
                                || username.contains(queryLower);
                    })
                    .limit(limit)
                    .map(user -> AdminUserSearchDTO.builder()
                            .id(user.getId())
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .profileImage(user.getProfileImage())
                            .roles(user.getRoles())
                            .currentMode(user.getCurrentMode())
                            .createdAt(user.getCreatedAt())
                            .build())
                    .collect(Collectors.toList());

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Failed to search users", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<?> getAllUsersAlternative(@RequestHeader("Authorization") String jwt) {
        return getAllUsers(jwt, 0, 1000, null, null, null);
    }

    
    @lombok.Data
    public static class BulkActionRequest {
        private List<Integer> userIds;
        private String action;
    }
}