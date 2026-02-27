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

        if (user != null && (user.getCurrentMode() == null || user.getCurrentMode().trim().isEmpty())) {
            user.setCurrentMode("USER");
            user.setUpdatedAt(LocalDateTime.now());
            user = userRepository.save(user);
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

        User userToUpdate;
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().isEmpty()) {

            if (!canUpdateProfile(reqUser, updateRequest.getEmail())) {
                throw new RuntimeException("You can only update your own profile");
            }
            userToUpdate = userRepository.findByEmail(updateRequest.getEmail());
            if (userToUpdate == null) {
                throw new RuntimeException("User not found");
            }
        } else {

            userToUpdate = reqUser;
        }

        updateUserFields(userToUpdate, updateRequest, reqUser);

        return userRepository.save(userToUpdate);
    }

    private void updateUserFields(User userToUpdate, UserUpdateRequest updateRequest, User requestingUser) {

        applyIfHasText(updateRequest.getFullName(), v -> userToUpdate.setFullName(trim(v)));

        applyIfHasText(updateRequest.getEmail(), v -> userToUpdate.setEmail(trimToLower(v)));

        applyIfHasText(updateRequest.getPassword(), v -> userToUpdate.setPassword(passwordEncoder.encode(v)));

        applyIfPresent(updateRequest.getPhoneNumber(), v -> userToUpdate.setPhoneNumber(trim(v)));

        applyIfPresent(updateRequest.getUsername(), v -> userToUpdate.setUsername(trim(v)));

        applyIfPresent(updateRequest.getWebsite(), v -> userToUpdate.setWebsite(trim(v)));

        applyIfPresent(updateRequest.getLocation(), v -> userToUpdate.setLocation(trim(v)));

        applyIfPresent(updateRequest.getBio(), v -> userToUpdate.setBio(trim(v)));

        applyIfPresent(updateRequest.getProfileImage(), v -> userToUpdate.setProfileImage(trim(v)));

        applyIfPresent(updateRequest.getCoverImage(), v -> userToUpdate.setCoverImage(trim(v)));

        applyIfPresent(updateRequest.getMobile(), v -> userToUpdate.setMobile(trim(v)));

        applyIfPresent(updateRequest.getOccupation(), v -> userToUpdate.setOccupation(trim(v)));

        applyIfPresent(updateRequest.getDateOfBirth(), v -> userToUpdate.setDateOfBirth(trim(v)));

        applyIfHasText(updateRequest.getFirstName(), v -> userToUpdate.setFirstName(trim(v)));

        applyIfHasText(updateRequest.getLastName(), v -> userToUpdate.setLastName(trim(v)));

        applyIfHasText(updateRequest.getGender(), v -> userToUpdate.setGender(upperTrim(v)));

        if (updateRequest.getIsTourCompleted() != null) {
            userToUpdate.setIsTourCompleted(updateRequest.getIsTourCompleted());
        }

        if (updateRequest.getRoleNames() != null && requestingUser.hasRole("ADMIN")) {
            updateUserRoles(userToUpdate, updateRequest.getRoleNames());
        }

        touchUpdatedAt(userToUpdate);
    }

    private void updateUserRoles(User user, List<String> roleNames) {
        Set<String> normalized = normalizeRoleNames(roleNames);

        Set<String> newRoles = new HashSet<>();
        for (String role : normalized) {
            if (roleRepository.findByName(role).isPresent()) {
                newRoles.add(role);
            } else {

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

        if (!newMode.equals("USER") && !newMode.equals("ADMIN")) {
            throw new IllegalArgumentException("Invalid mode. Must be USER or ADMIN");
        }

        if (newMode.equals("ADMIN") && !user.hasRole("ADMIN")) {
            throw new RuntimeException("User does not have ADMIN role");
        }

        user.setCurrentMode(newMode);
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    private static boolean hasText(String s) {
        return s != null && !s.trim().isEmpty();
    }

    private static String trim(String s) {
        return s == null ? null : s.trim();
    }

    private static String trimToLower(String s) {
        return s == null ? null : s.toLowerCase().trim();
    }

    private static String upperTrim(String s) {
        return s == null ? null : s.toUpperCase().trim();
    }

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

    private static boolean canUpdateProfile(User requestingUser, String targetEmail) {
        if (requestingUser == null || !hasText(targetEmail))
            return false;
        String reqEmail = requestingUser.getEmail();
        return (reqEmail != null && reqEmail.equals(targetEmail)) || requestingUser.hasRole("ADMIN");
    }

    private static void applyIfPresent(String value, Consumer<String> setter) {
        if (value != null)
            setter.accept(value);
    }

    private static void applyIfHasText(String value, Consumer<String> setter) {
        if (hasText(value))
            setter.accept(value);
    }

    private static void touchUpdatedAt(User user) {
        user.setUpdatedAt(LocalDateTime.now());
    }
}
