package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.exceptions.UserNotFoundException;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.UserUpdateRequest;
import com.jaya.task.user.service.service.CustomUserServiceImplementation;
import com.jaya.task.user.service.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/user")
@Validated
@AllArgsConstructor
public class UserController {

    private UserService userService;
    private UserRepository userRepository;
    private RoleRepository roleRepository;
    private PasswordEncoder passwordEncoder;
    private CustomUserServiceImplementation customUserService;

    @GetMapping("/profile")
    public ResponseEntity<User> findUserByJwt(@RequestHeader("Authorization") String jwt) {
        User user = userService.getUserProfile(jwt);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/email")
    public ResponseEntity<User> getUserByEmail(
            @RequestHeader("Authorization") String jwt,
            @RequestParam @NotNull @Email(message = "Valid email is required") String email) {

        User user = userService.getUserByEmail(email);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(
            @PathVariable @NotNull @Positive(message = "User ID must be positive") Integer id,
            @RequestHeader("Authorization") String jwt) {

        // Get the current user from JWT

        if (id <= 0) {
            throw new UserNotFoundException("user not found");
        }
        User currentUser = userService.getUserProfile(jwt);

        // Check if user is admin or accessing their own profile
        boolean isAdmin = currentUser.getRoles() != null &&
                currentUser.getRoles().contains("ADMIN");
        boolean isOwnProfile = currentUser.getId().equals(id);

        if (!isAdmin && !isOwnProfile) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to access this user's profile"));
        }

        Optional<User> user = userRepository.findById(id);
        return user.map(u -> ResponseEntity.ok(u))
                .orElse(ResponseEntity.notFound().build());

    }

    @PutMapping()
    public ResponseEntity<?> updateUser(
            @RequestHeader("Authorization") String jwt,
            @Valid @RequestBody UserUpdateRequest updateRequest) {

        try {
            User updatedUser = userService.updateUserProfile(jwt, updateRequest);

            return ResponseEntity.ok(Map.of(
                    "message", "User updated successfully",
                    "user", updatedUser));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable @NotNull @Positive(message = "User ID must be positive") Integer id,
            @RequestHeader("Authorization") String jwt) throws AccessDeniedException {

        try {
            User reqUser = userService.getUserProfile(jwt);
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            // Check if user has ADMIN authority
            boolean isAdmin = auth.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));

            // Check if user is deleting their own account
            boolean isOwnAccount = reqUser.getId().intValue() == id;

            if (isOwnAccount || isAdmin) {
                // Additional validation: Check if user exists
                if (!userRepository.existsById(id)) {
                    return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
                }

                // Get the user before deletion to access their roles
                Optional<User> userToDelete = userRepository.findById(id);
                if (userToDelete.isPresent()) {
                    User user = userToDelete.get();

                    // Remove user ID from all roles' users sets
                    if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                        for (String roleName : user.getRoles()) {
                            Optional<Role> roleOpt = roleRepository.findByName(roleName);
                            if (roleOpt.isPresent()) {
                                Role role = roleOpt.get();
                                if (role.getUsers() != null) {
                                    role.getUsers().remove(user.getId().intValue());
                                    roleRepository.save(role);
                                }
                            }
                        }
                    }
                }

                // Delete the user
                userService.deleteUser(id);
                return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);
            } else {
                return new ResponseEntity<>("You don't have permission to delete this user", HttpStatus.FORBIDDEN);
            }

        } catch (Exception e) {
            return new ResponseEntity<>("Error deleting user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> addRoleToUser(
            @PathVariable @NotNull @Positive(message = "User ID must be positive") Integer userId,
            @PathVariable @NotNull @Positive(message = "Role ID must be positive") Integer roleId,
            @RequestHeader("Authorization") String jwt) {

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found with ID: " + userId));
            }

            Optional<Role> roleOpt = roleRepository.findById(roleId);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Role not found with ID: " + roleId));
            }

            User user = userOpt.get();
            Role role = roleOpt.get();

            // Check if user already has this role
            String normalizedRoleName = role.getName().toUpperCase().trim();
            if (user.getRoles() != null && user.getRoles().contains(normalizedRoleName)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "User already has role: " + role.getName()));
            }

            // Get current user roles or initialize if null
            Set<String> userRoles = user.getRoles();
            if (userRoles == null) {
                userRoles = new HashSet<>();
            }

            // Add the new role to user's roles set
            userRoles.add(normalizedRoleName);
            user.setRoles(userRoles);
            user.setUpdatedAt(LocalDateTime.now());

            // Save the user with updated roles
            User savedUser = userRepository.save(user);

            // Update the role's users set with the user's ID
            if (role.getUsers() == null) {
                role.setUsers(new HashSet<>());
            }
            role.getUsers().add(savedUser.getId().intValue());
            roleRepository.save(role);

            // Generate new token for the user if they're updating their own roles
            String currentUserEmail = JwtProvider.getEmailFromJwt(jwt);
            String newToken = null;

            if (savedUser.getEmail().equals(currentUserEmail)) {
                // User is updating their own roles, generate new token
                UserDetails userDetails = customUserService.loadUserByUsername(savedUser.getEmail());
                Authentication authentication = new UsernamePasswordAuthenticationToken(
                        userDetails.getUsername(),
                        null,
                        userDetails.getAuthorities());
                newToken = JwtProvider.generateToken(authentication);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Role added successfully");
            response.put("user", savedUser);
            if (newToken != null) {
                response.put("newToken", newToken);
                response.put("tokenRefreshRequired", true);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to add role: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> removeRoleFromUser(
            @PathVariable @NotNull @Positive(message = "User ID must be positive") Integer userId,
            @PathVariable @NotNull @Positive(message = "Role ID must be positive") Integer roleId,
            @RequestHeader("Authorization") String jwt) {

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found with ID: " + userId));
            }

            Optional<Role> roleOpt = roleRepository.findById(roleId);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "Role not found with ID: " + roleId));
            }

            User user = userOpt.get();
            Role role = roleOpt.get();

            // Check if user has at least one role and prevent removing the last one
            if (user.getRoles() == null || user.getRoles().size() <= 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Cannot remove the last role from user"));
            }

            // Check if user has this role
            String normalizedRoleName = role.getName().toUpperCase().trim();
            if (user.getRoles() == null || !user.getRoles().contains(normalizedRoleName)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "User doesn't have role: " + role.getName()));
            }

            // Get current user roles and remove the specified role (same logic as direct
            // set manipulation)
            Set<String> userRoles = new HashSet<>(user.getRoles());
            userRoles.remove(normalizedRoleName);
            user.setRoles(userRoles);
            user.setUpdatedAt(LocalDateTime.now());

            // Save the user with updated roles
            User savedUser = userRepository.save(user);

            // Update the role's users set by removing the user's ID (same logic as signup
            // but reverse)
            if (role.getUsers() != null) {
                role.getUsers().remove(savedUser.getId().intValue());
                roleRepository.save(role);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "Role removed successfully",
                    "user", savedUser));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to remove role: " + e.getMessage()));
        }
    }

    @PutMapping("/switch-mode")
    public ResponseEntity<?> switchUserMode(
            @RequestHeader("Authorization") String jwt,
            @RequestParam @NotNull String mode) {

        try {
            // Validate mode parameter
            if (!mode.equals("USER") && !mode.equals("ADMIN")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid mode. Must be USER or ADMIN"));
            }

            User updatedUser = userService.switchUserMode(jwt, mode);

            return ResponseEntity.ok(Map.of(
                    "message", "Mode switched successfully",
                    "user", updatedUser,
                    "currentMode", updatedUser.getCurrentMode()));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to switch mode: " + e.getMessage()));
        }
    }

}