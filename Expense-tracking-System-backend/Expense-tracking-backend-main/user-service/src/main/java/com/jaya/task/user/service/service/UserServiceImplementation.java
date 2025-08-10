package com.jaya.task.user.service.service;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.UserUpdateRequest;
import jakarta.annotation.security.RolesAllowed;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;


@Service
public class UserServiceImplementation implements UserService{

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
        }

        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserByEmail(String email) {
       return  userRepository.findByEmail(email);
    }

    public User updateUserProfile(String jwt, UserUpdateRequest updateRequest) {
        User reqUser = getUserProfile(jwt);

        // Validation: User can only update their own profile unless they're admin
        if (!reqUser.getEmail().equals(updateRequest.getEmail()) && !reqUser.hasRole("ADMIN")) {
            throw new RuntimeException("You can only update your own profile");
        }

        // Find the user to update
        User userToUpdate = userRepository.findByEmail(updateRequest.getEmail());
        if (userToUpdate == null) {
            throw new RuntimeException("User not found with email: " + updateRequest.getEmail());
        }

        // Update user fields
        updateUserFields(userToUpdate, updateRequest, reqUser);

        // Save and return updated user
        return userRepository.save(userToUpdate);
    }

    private void updateUserFields(User userToUpdate, UserUpdateRequest updateRequest, User requestingUser) {
        // Update full name
        if (updateRequest.getFullName() != null && !updateRequest.getFullName().trim().isEmpty()) {
            userToUpdate.setFullName(updateRequest.getFullName().trim());
        }

        // Update email
        if (updateRequest.getEmail() != null && !updateRequest.getEmail().trim().isEmpty()) {
            userToUpdate.setEmail(updateRequest.getEmail().toLowerCase().trim());
        }

        // Update password if provided
        if (updateRequest.getPassword() != null && !updateRequest.getPassword().trim().isEmpty()) {
            userToUpdate.setPassword(passwordEncoder.encode(updateRequest.getPassword()));
        }

        // Update phone number
        if (updateRequest.getPhoneNumber() != null) {
            userToUpdate.setPhoneNumber(updateRequest.getPhoneNumber().trim());
        }

        // Update username
        if (updateRequest.getUsername() != null) {
            userToUpdate.setUsername(updateRequest.getUsername().trim());
        }

        // Update website
        if (updateRequest.getWebsite() != null) {
            userToUpdate.setWebsite(updateRequest.getWebsite().trim());
        }

        // Update location
        if (updateRequest.getLocation() != null) {
            userToUpdate.setLocation(updateRequest.getLocation().trim());
        }

        // Update bio
        if (updateRequest.getBio() != null) {
            userToUpdate.setBio(updateRequest.getBio().trim());
        }

        // Update first name
        if (updateRequest.getFirstName() != null && !updateRequest.getFirstName().trim().isEmpty()) {
            userToUpdate.setFirstName(updateRequest.getFirstName().trim());
        }

        // Update last name
        if (updateRequest.getLastName() != null && !updateRequest.getLastName().trim().isEmpty()) {
            userToUpdate.setLastName(updateRequest.getLastName().trim());
        }

        // Update gender
        if (updateRequest.getGender() != null && !updateRequest.getGender().trim().isEmpty()) {
            userToUpdate.setGender(updateRequest.getGender().toUpperCase().trim());
        }

        // Update roles if provided and user is admin
        if (updateRequest.getRoleNames() != null && requestingUser.hasRole("ADMIN")) {
            updateUserRoles(userToUpdate, updateRequest.getRoleNames());
        }

        // Update timestamp
        userToUpdate.setUpdatedAt(LocalDateTime.now());
    }

    private void updateUserRoles(User user, List<String> roleNames) {
        Set<String> newRoles = new HashSet<>();

        for (String roleName : roleNames) {
            String normalizedRoleName = roleName.toUpperCase().trim();
            if (!normalizedRoleName.startsWith("ROLE_")) {
                normalizedRoleName = "ROLE_" + normalizedRoleName;
            }

            if (roleRepository.findByName(normalizedRoleName).isPresent()) {
                newRoles.add(normalizedRoleName);
            } else {
                throw new RuntimeException("Role not found: " + roleName);
            }
        }

        if (!newRoles.isEmpty()) {
            user.setRoles(newRoles);
        }
    }

    @Override
    public void deleteUser(Long userId) throws AccessDeniedException {
        Optional<User> user=userRepository.findById(userId);
        if(user.isEmpty())
        {
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
}
