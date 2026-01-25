package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.exceptions.UserNotFoundException;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.TwoFactorUpdateRequest;
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

    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String USER_KEY = "user";
    private static final String USER_NOT_FOUND_MSG = "User not found with ID: ";
    private static final String ROLE_NOT_FOUND_MSG = "Role not found with ID: ";

    private final UserService userService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final CustomUserServiceImplementation customUserService;

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
    public ResponseEntity<Object> getUserById(
            @PathVariable @NotNull @Positive(message = "User ID must be positive") Integer id,
            @RequestHeader("Authorization") String jwt) {

        // Get the current user from JWT
        User currentUser = userService.getUserProfile(jwt);

        // Check if user is admin or accessing their own profile
        boolean isAdmin = currentUser.getRoles() != null &&
                currentUser.getRoles().contains("ADMIN");
        boolean isOwnProfile = currentUser.getId().equals(id);

        if (!isAdmin && !isOwnProfile) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(ERROR_KEY, "You don't have permission to access this user's profile"));
        }

        Optional<User> user = userRepository.findById(id);
        return user.<ResponseEntity<Object>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());

    }

    @PutMapping()
    public ResponseEntity<Object> updateUser(
            @RequestHeader("Authorization") String jwt,
            @Valid @RequestBody UserUpdateRequest updateRequest) {

        try {
            User updatedUser = userService.updateUserProfile(jwt, updateRequest);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "User updated successfully",
                    USER_KEY, updatedUser));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to update user: " + e.getMessage()));
        }
    }

    @PutMapping("/two-factor")
    public ResponseEntity<Object> updateTwoFactorAuthentication(
            @RequestHeader("Authorization") String jwt,
            @Valid @RequestBody TwoFactorUpdateRequest request) {

        try {
            User user = userService.getUserProfile(jwt);
            user.setTwoFactorEnabled(Boolean.TRUE.equals(request.getEnabled()));
            User updatedUser = userRepository.save(user);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Two-factor authentication updated successfully",
                    "twoFactorEnabled", updatedUser.isTwoFactorEnabled()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to update two-factor authentication: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable @NotNull @Positive(message = "User ID must be positive") Integer id,
            @RequestHeader("Authorization") String jwt) throws AccessDeniedException {

        try {
            User reqUser = userService.getUserProfile(jwt);

            if (!canDeleteUser(reqUser, id)) {
                return new ResponseEntity<>("You don't have permission to delete this user", HttpStatus.FORBIDDEN);
            }

            // Additional validation: Check if user exists
            if (!userRepository.existsById(id)) {
                return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
            }

            // Remove user from all associated roles
            removeUserFromRoles(id);

            // Delete the user
            userService.deleteUser(id);
            return new ResponseEntity<>("User deleted successfully", HttpStatus.OK);

        } catch (UserNotFoundException e) {
            return new ResponseEntity<>("User not found: " + e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (RuntimeException e) {
            return new ResponseEntity<>("Error deleting user: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private boolean canDeleteUser(User reqUser, Integer targetUserId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwnAccount = reqUser.getId().intValue() == targetUserId;
        return isOwnAccount || isAdmin;
    }

    private void removeUserFromRoles(Integer userId) {
        Optional<User> userToDelete = userRepository.findById(userId);
        if (userToDelete.isPresent()) {
            User user = userToDelete.get();
            if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                for (String roleName : user.getRoles()) {
                    removeUserIdFromRole(user.getId(), roleName);
                }
            }
        }
    }

    private void removeUserIdFromRole(Integer userId, String roleName) {
        Optional<Role> roleOpt = roleRepository.findByName(roleName);
        if (roleOpt.isPresent()) {
            Role role = roleOpt.get();
            if (role.getUsers() != null) {
                role.getUsers().remove(userId);
                roleRepository.save(role);
            }
        }
    }

    @PostMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> addRoleToUser(
            @PathVariable @NotNull @Positive(message = "User ID must be positive") Integer userId,
            @PathVariable @NotNull @Positive(message = "Role ID must be positive") Integer roleId,
            @RequestHeader("Authorization") String jwt) {

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(ERROR_KEY, USER_NOT_FOUND_MSG + userId));
            }

            Optional<Role> roleOpt = roleRepository.findById(roleId);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(ERROR_KEY, ROLE_NOT_FOUND_MSG + roleId));
            }

            User user = userOpt.get();
            Role role = roleOpt.get();

            // Check if user already has this role
            String normalizedRoleName = role.getName().toUpperCase().trim();
            Set<String> userRoles = user.getRoles() != null ? user.getRoles() : new HashSet<>();

            if (userRoles.contains(normalizedRoleName)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(ERROR_KEY, "User already has role: " + role.getName()));
            }

            // Add the new role to user's roles set
            userRoles.add(normalizedRoleName);
            user.setRoles(userRoles);
            user.setUpdatedAt(LocalDateTime.now());

            // Save the user with updated roles
            User savedUser = userRepository.save(user);

            // Update the role's users set with the user's ID
            Set<Integer> roleUsers = role.getUsers() != null ? role.getUsers() : new HashSet<>();
            roleUsers.add(savedUser.getId());
            role.setUsers(roleUsers);
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
            response.put(MESSAGE_KEY, "Role added successfully");
            response.put(USER_KEY, savedUser);
            if (newToken != null) {
                response.put("newToken", newToken);
                response.put("tokenRefreshRequired", true);
            }

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to add role: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}/roles/{roleId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Object> removeRoleFromUser(
            @PathVariable @NotNull @Positive(message = "User ID must be positive") Integer userId,
            @PathVariable @NotNull @Positive(message = "Role ID must be positive") Integer roleId,
            @RequestHeader("Authorization") String jwt) {

        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(ERROR_KEY, USER_NOT_FOUND_MSG + userId));
            }

            Optional<Role> roleOpt = roleRepository.findById(roleId);
            if (roleOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(ERROR_KEY, ROLE_NOT_FOUND_MSG + roleId));
            }

            User user = userOpt.get();
            Role role = roleOpt.get();

            Set<String> userRoles = user.getRoles();
            // Check if user has at least one role and prevent removing the last one
            if (userRoles == null || userRoles.size() <= 1) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(ERROR_KEY, "Cannot remove the last role from user"));
            }

            // Check if user has this role
            String normalizedRoleName = role.getName().toUpperCase().trim();
            if (!userRoles.contains(normalizedRoleName)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of(ERROR_KEY, "User doesn't have role: " + role.getName()));
            }

            // Get current user roles and remove the specified role
            Set<String> updatedRoles = new HashSet<>(userRoles);
            updatedRoles.remove(normalizedRoleName);
            user.setRoles(updatedRoles);
            user.setUpdatedAt(LocalDateTime.now());

            // Save the user with updated roles
            User savedUser = userRepository.save(user);

            // Update the role's users set by removing the user's ID
            if (role.getUsers() != null) {
                role.getUsers().remove(savedUser.getId());
                roleRepository.save(role);
            }

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Role removed successfully",
                    USER_KEY, savedUser));

        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to remove role: " + e.getMessage()));
        }
    }

    @PutMapping("/switch-mode")
    public ResponseEntity<Object> switchUserMode(
            @RequestHeader("Authorization") String jwt,
            @RequestParam @NotNull String mode) {

        try {
            // Validate mode parameter
            if (!"USER".equals(mode) && !"ADMIN".equals(mode)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of(ERROR_KEY, "Invalid mode. Must be USER or ADMIN"));
            }

            User updatedUser = userService.switchUserMode(jwt, mode);

            return ResponseEntity.ok(Map.of(
                    MESSAGE_KEY, "Mode switched successfully",
                    USER_KEY, updatedUser,
                    "currentMode", updatedUser.getCurrentMode()));

        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of(ERROR_KEY, e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(ERROR_KEY, "Failed to switch mode: " + e.getMessage()));
        }
    }

}