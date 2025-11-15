package com.jaya.task.user.service.service;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.exceptions.UserAlreadyExistsException;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.UserUpdateRequest;
import com.jaya.task.user.service.request.SignupRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.function.Consumer;

@Service
public class UserServiceImplementation implements UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    PasswordEncoder passwordEncoder;

    
    @Override
    public User getUserProfile(String jwt) {
        String email = JwtProvider.getEmailFromJwt(jwt);
        User user = userRepository.findByEmail(email);

        // Debug logging
        System.out.println("=== GET USER PROFILE DEBUG ===");
        System.out.println("Roles from user T: " + (user != null ? user.getRoles() : null));
        System.out.println("User found: " + (user != null));
        if (user != null) {
            System.out.println("User roles count: " + user.getRoles().size());
            for (String roleName : user.getRoles()) {
                System.out.println("User role: " + roleName);
            }

            // Handle existing users with null currentMode (created before this feature)
            if (user.getCurrentMode() == null || user.getCurrentMode().trim().isEmpty()) {
                // Set default mode to USER
                user.setCurrentMode("USER");
                user.setUpdatedAt(LocalDateTime.now());
                user = userRepository.save(user);
                System.out.println("Set default currentMode to USER for existing user: " + user.getEmail());
            }
        }

        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User updateUserProfile(String jwt, UserUpdateRequest updateRequest) {
        User reqUser = getUserProfile(jwt);

        if (reqUser == null) {
            throw new RuntimeException("User not found");
        }

        // If email is provided in the request, validate permission to update that user
        // Otherwise, update the requesting user's own profile
        User userToUpdate;
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().isEmpty()) {
            // Validation: User can only update their own profile unless they're admin
            if (!canUpdateProfile(reqUser, updateRequest.getEmail())) {
                throw new RuntimeException("You can only update your own profile");
            }
            userToUpdate = userRepository.findByEmail(updateRequest.getEmail());
            if (userToUpdate == null) {
                throw new RuntimeException("User not found");
            }
        } else {
            // No email provided, update requesting user's own profile
            userToUpdate = reqUser;
        }

        // Update user fields
        updateUserFields(userToUpdate, updateRequest, reqUser);

        // Save and return updated user
        return userRepository.save(userToUpdate);
    }

    private void updateUserFields(User userToUpdate, UserUpdateRequest updateRequest, User requestingUser) {
        // Update full name
        applyIfHasText(updateRequest.getFullName(), v -> userToUpdate.setFullName(trim(v)));

        // Update email
        applyIfHasText(updateRequest.getEmail(), v -> userToUpdate.setEmail(trimToLower(v)));

        // Update password if provided
        applyIfHasText(updateRequest.getPassword(), v -> userToUpdate.setPassword(passwordEncoder.encode(v)));

        // Update phone number (null check only, allow empty if that's desired)
        applyIfPresent(updateRequest.getPhoneNumber(), v -> userToUpdate.setPhoneNumber(trim(v)));

        // Update username
        applyIfPresent(updateRequest.getUsername(), v -> userToUpdate.setUsername(trim(v)));

        // Update website
        applyIfPresent(updateRequest.getWebsite(), v -> userToUpdate.setWebsite(trim(v)));

        // Update location
        applyIfPresent(updateRequest.getLocation(), v -> userToUpdate.setLocation(trim(v)));

        // Update bio
        applyIfPresent(updateRequest.getBio(), v -> userToUpdate.setBio(trim(v)));

        // Update profile image URL
        applyIfPresent(updateRequest.getProfileImage(), v -> userToUpdate.setProfileImage(trim(v)));

        // Update cover image URL
        applyIfPresent(updateRequest.getCoverImage(), v -> userToUpdate.setCoverImage(trim(v)));

        // Update mobile
        applyIfPresent(updateRequest.getMobile(), v -> userToUpdate.setMobile(trim(v)));

        // Update occupation
        applyIfPresent(updateRequest.getOccupation(), v -> userToUpdate.setOccupation(trim(v)));

        // Update date of birth
        applyIfPresent(updateRequest.getDateOfBirth(), v -> userToUpdate.setDateOfBirth(trim(v)));

        // Update first name
        applyIfHasText(updateRequest.getFirstName(), v -> userToUpdate.setFirstName(trim(v)));

        // Update last name
        applyIfHasText(updateRequest.getLastName(), v -> userToUpdate.setLastName(trim(v)));

        // Update gender
        applyIfHasText(updateRequest.getGender(), v -> userToUpdate.setGender(upperTrim(v)));

        // Update roles if provided and user is admin
        if (updateRequest.getRoleNames() != null && requestingUser.hasRole("ADMIN")) {
            updateUserRoles(userToUpdate, updateRequest.getRoleNames());
        }

        // Update timestamp
        touchUpdatedAt(userToUpdate);
    }

    private void updateUserRoles(User user, List<String> roleNames) {
        Set<String> normalized = normalizeRoleNames(roleNames);

        Set<String> newRoles = new HashSet<>();
        for (String role : normalized) {
            if (roleRepository.findByName(role).isPresent()) {
                newRoles.add(role);
            } else {
                // Extract original-like name for message (remove prefix if present)
                String originalName = role.startsWith("ROLE_") ? role.substring(5) : role;
                throw new RuntimeException("Role not found: " + originalName);
            }
        }

        if (!newRoles.isEmpty()) {
            user.setRoles(newRoles);
        }
    }

    @Override
    public void deleteUser(Integer userId) throws AccessDeniedException {
        Optional<User> user = userRepository.findById(userId);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("User is not present");
        }
        userRepository.deleteById(userId);
    }

    @Override
    public boolean checkEmailAvailability(String email) {
        return !userRepository.existsByEmail(email);
    }

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public void updatePassword(User user, String newPassword) {
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Override
    public User signup(SignupRequest signupRequest) {
        if (signupRequest == null) {
            throw new IllegalArgumentException("SignupRequest cannot be null");
        }

        String email = trimToLower(signupRequest.getEmail());
        String firstName = trim(signupRequest.getFirstName());
        String lastName = trim(signupRequest.getLastName());
        String password = signupRequest.getPassword();

        if (!hasText(email))
            throw new IllegalArgumentException("Email is required");
        if (!hasText(firstName))
            throw new IllegalArgumentException("First Name is required");
        if (!hasText(lastName))
            throw new IllegalArgumentException("Last Name is required");
        if (!hasText(password))
            throw new IllegalArgumentException("Password is required");

        if (userRepository.findByEmail(email) != null) {
            throw new UserAlreadyExistsException("User already exists with email: " + email);
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setFirstName(firstName);
        newUser.setLastName(lastName);
        newUser.setFullName((firstName + " " + lastName).trim());
        newUser.setPassword(passwordEncoder.encode(password));

        // Roles
        Set<String> userRoles = new HashSet<>();
        Set<Role> rolesToUpdate = new HashSet<>();

        if (signupRequest.getRoles() != null && !signupRequest.getRoles().isEmpty()) {
            for (String roleName : signupRequest.getRoles()) {
                if (!hasText(roleName))
                    continue;
                String normalizedRoleName = roleName.toUpperCase().trim();
                Optional<Role> existingRole = roleRepository.findByName(normalizedRoleName);
                Role role;
                if (existingRole.isPresent()) {
                    role = existingRole.get();
                } else if (normalizedRoleName.equals("USER") || normalizedRoleName.equals("ADMIN")) {
                    role = roleRepository.save(new Role(normalizedRoleName, "Auto-created role"));
                } else {
                    throw new RuntimeException(
                            "Invalid role: " + roleName + ". Only USER and ADMIN roles are allowed during signup.");
                }
                userRoles.add(role.getName());
                rolesToUpdate.add(role);
            }
        } else {
            Role role;
            Optional<Role> userRole = roleRepository.findByName("USER");
            role = userRole.orElseGet(() -> roleRepository.save(new Role("USER", "Default user role")));
            userRoles.add(role.getName());
            rolesToUpdate.add(role);
        }

        newUser.setRoles(userRoles);
        newUser.setCreatedAt(java.time.LocalDateTime.now());
        newUser.setUpdatedAt(java.time.LocalDateTime.now());

        User savedUser = userRepository.save(newUser);

        // Update role user ids
        for (Role role : rolesToUpdate) {
            if (role.getUsers() == null) {
                role.setUsers(new java.util.HashSet<>());
            }
            role.getUsers().add(savedUser.getId());
            roleRepository.save(role);
        }

        return savedUser;
    }

    @Override
    public User switchUserMode(String jwt, String newMode) {
        User user = getUserProfile(jwt);

        if (user == null) {
            throw new RuntimeException("User not found");
        }

        // Validate the new mode
        if (!newMode.equals("USER") && !newMode.equals("ADMIN")) {
            throw new IllegalArgumentException("Invalid mode. Must be USER or ADMIN");
        }

        // Check if user has ADMIN role when trying to switch to ADMIN mode
        if (newMode.equals("ADMIN") && !user.hasRole("ADMIN")) {
            throw new RuntimeException("User does not have ADMIN role");
        }

        // Update the current mode
        user.setCurrentMode(newMode);
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    // ========= Pure and reusable helpers =========

    // Pure: checks if a string has non-whitespace text
    private static boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }

    // Pure: trim or return null
    private static String trim(String s) {
        return s == null ? null : s.trim();
    }

    // Pure: lower case + trim
    private static String trimToLower(String s) {
        return s == null ? null : s.toLowerCase().trim();
    }

    // Pure: upper case + trim
    private static String upperTrim(String s) {
        return s == null ? null : s.toUpperCase().trim();
    }

    // Pure: normalize role names to ROLE_* UPPER format
    private static Set<String> normalizeRoleNames(List<String> roleNames) {
        Set<String> result = new HashSet<>();
        if (roleNames == null)
            return result;
        for (String roleName : roleNames) {
            if (!hasText(roleName))
                continue;
            String normalized = upperTrim(roleName);
            if (!normalized.startsWith("ROLE_")) {
                normalized = "ROLE_" + normalized;
            }
            result.add(normalized);
        }
        return result;
    }

    // Pure: permission check for profile update
    private static boolean canUpdateProfile(User requestingUser, String targetEmail) {
        if (requestingUser == null || !hasText(targetEmail))
            return false;
        String reqEmail = requestingUser.getEmail();
        return (reqEmail != null && reqEmail.equals(targetEmail)) || requestingUser.hasRole("ADMIN");
    }

    // Reusable: apply setter if value is non-null
    private static void applyIfPresent(String value, Consumer<String> setter) {
        if (value != null)
            setter.accept(value);
    }

    // Reusable: apply setter if value has text (non-empty after trim)
    private static void applyIfHasText(String value, Consumer<String> setter) {
        if (hasText(value))
            setter.accept(value);
    }

    // Reusable: update timestamp
    private static void touchUpdatedAt(User user) {
        user.setUpdatedAt(LocalDateTime.now());
    }
}
