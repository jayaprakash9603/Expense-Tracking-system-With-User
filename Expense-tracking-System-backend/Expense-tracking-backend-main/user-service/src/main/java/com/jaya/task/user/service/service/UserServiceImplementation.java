package com.jaya.task.user.service.service;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
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
import java.util.List;
import java.util.Optional;


@Service
public class UserServiceImplementation implements UserService{

    @Autowired
    private UserRepository userRepository;

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

    @Override
    public User updateUser(User user) {
        User updatedUser = userRepository.findByEmail(user.getEmail());
        if (updatedUser == null) {
            throw new UsernameNotFoundException("User not Found");
        }

        if (user.getFullName() != null && !user.getFullName().equals(updatedUser.getFullName())) {
            updatedUser.setFullName(user.getFullName());
        }

        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            updatedUser.setRoles(user.getRoles());
        }

        if (user.getPassword() != null && !user.getPassword().equals(updatedUser.getPassword())) {
            updatedUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        updatedUser.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(updatedUser);
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


}
