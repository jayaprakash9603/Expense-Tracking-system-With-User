package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")  // Changed from "/all" to "/users" to avoid conflicts
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String jwt) {
        try {
            List<User> users = userService.getAllUsers();

            if (users == null || users.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "No users found");
                response.put("users", List.of());
                response.put("count", 0);
                return ResponseEntity.ok(response);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Users retrieved successfully");
            response.put("count", users.size());
            response.put("users", users);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to retrieve users");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("timestamp", java.time.LocalDateTime.now());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    // Alternative endpoint if you want to keep "/all"
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllUsersAlternative(@RequestHeader("Authorization") String jwt) {
        return getAllUsers(jwt);  // Delegate to the main method
    }
}