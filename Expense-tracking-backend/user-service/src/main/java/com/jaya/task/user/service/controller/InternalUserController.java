package com.jaya.task.user.service.controller;

import com.jaya.common.dto.UserDTO;
import com.jaya.task.user.service.mapper.UserMapper;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.service.UserProfileCacheService;
import com.jaya.task.user.service.service.UserService;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
@Validated
@PreAuthorize("hasAuthority('ROLE_SERVICE')")
public class InternalUserController {

    private final UserService userService;
    private final UserMapper mapper;
    private final UserProfileCacheService userProfileCacheService;

    @GetMapping("/all")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        List<UserDTO> result = userService.getAllUsers().stream()
                .map(mapper::toDTO)
                .toList();
        return ResponseEntity.ok(result);
    }

    @GetMapping(value = {"/email", "/by-email"})
    public ResponseEntity<UserDTO> getUserByEmail(
            @RequestParam @NotNull @Email(message = "Valid email is required") String email) {
        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(mapper.toDTO(user));
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<UserDTO> getUserById(
            @PathVariable @NotNull @Positive(message = "User ID must be positive") Integer id) {
        UserDTO cached = userProfileCacheService.getUserById(id);
        return cached != null ? ResponseEntity.ok(cached) : ResponseEntity.notFound().build();
    }
}
