package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.request.LoginRequest;
import com.jaya.task.user.service.request.SignupRequest;
import com.jaya.task.user.service.response.AuthResponse;
import com.jaya.task.user.service.service.CustomUserServiceImplementation;
import com.jaya.task.user.service.exceptions.UserAlreadyExistsException;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomUserServiceImplementation customUserService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@Valid @RequestBody SignupRequest signupRequest) {
        try {
            // Add null-safe validation before processing
            if (signupRequest.getEmail() == null || signupRequest.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email is required"));
            }

            if (signupRequest.getFullName() == null || signupRequest.getFullName().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Full name is required"));
            }

            if (signupRequest.getPassword() == null || signupRequest.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Password is required"));
            }

            User isUserExist = userRepository.findByEmail(signupRequest.getEmail().trim());
            if (isUserExist != null) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "User already exists with email: " + signupRequest.getEmail()));
            }

            User newUser = new User();
            newUser.setEmail(signupRequest.getEmail().toLowerCase().trim());
            newUser.setFullName(signupRequest.getFullName().trim());
            newUser.setPassword(passwordEncoder.encode(signupRequest.getPassword()));

            // ... rest of your existing code remains the same
            Set<String> userRoles = new HashSet<>();
            Set<Role> rolesToUpdate = new HashSet<>();

            if (signupRequest.getRoles() != null && !signupRequest.getRoles().isEmpty()) {
                for (String roleName : signupRequest.getRoles()) {
                    String normalizedRoleName = roleName.toUpperCase().trim();
                    Optional<Role> existingRole = roleRepository.findByName(normalizedRoleName);
                    Role role;
                    if (existingRole.isPresent()) {
                        role = existingRole.get();
                    } else if (normalizedRoleName.equals("USER") || normalizedRoleName.equals("ADMIN")) {
                        role = roleRepository.save(new Role(normalizedRoleName, "Auto-created role"));
                    } else {
                        return ResponseEntity.badRequest()
                                .body(Map.of("error", "Invalid role: " + roleName + ". Only USER and ADMIN roles are allowed during signup."));
                    }
                    userRoles.add(role.getName());
                    rolesToUpdate.add(role);
                }
            } else {
                Role role;
                Optional<Role> userRole = roleRepository.findByName("USER");
                if (userRole.isPresent()) {
                    role = userRole.get();
                    System.out.println("Added default USER role");
                } else {
                    role = roleRepository.save(new Role("USER", "Default user role"));
                    System.out.println("Created and added default USER role");
                }
                userRoles.add(role.getName());
                rolesToUpdate.add(role);
            }

            newUser.setRoles(userRoles);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setUpdatedAt(LocalDateTime.now());

            User savedUser = userRepository.save(newUser);

            // Update each role's users set with the new user's ID
            for (Role role : rolesToUpdate) {
                if (role.getUsers() == null) {
                    role.setUsers(new HashSet<>());
                }
                role.getUsers().add(savedUser.getId().intValue());
                roleRepository.save(role);
            }

            UserDetails userDetails = customUserService.loadUserByUsername(savedUser.getEmail());
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails.getUsername(),
                    null,
                    userDetails.getAuthorities()
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = JwtProvider.generateToken(authentication);

            AuthResponse authResponse = new AuthResponse();
            authResponse.setStatus(true);
            authResponse.setMessage("Registration Success");
            authResponse.setJwt(token);

            return new ResponseEntity<>(authResponse, HttpStatus.CREATED);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }
    @PostMapping("/signin")
    public ResponseEntity<AuthResponse> signin(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getEmail();
        String password = loginRequest.getPassword();

        Authentication authentication = authenticate(username, password);
        SecurityContextHolder.getContext().setAuthentication(authentication);


        String token = JwtProvider.generateToken(authentication);

        AuthResponse authResponse = new AuthResponse();
        authResponse.setStatus(true);
        authResponse.setMessage("Login Success");
        authResponse.setJwt(token);

        return new ResponseEntity<>(authResponse, HttpStatus.OK);
    }

    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = customUserService.loadUserByUsername(username);

        if (userDetails == null) {
            throw new BadCredentialsException("Invalid username or password");
        }

        if (!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid username or password");
        }

        return new UsernamePasswordAuthenticationToken(
                userDetails.getUsername(),
                null,
                userDetails.getAuthorities()
        );


    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(@RequestHeader("Authorization") String jwt) {
        try {
            // Extract email from current JWT
            String email = JwtProvider.getEmailFromJwt(jwt);

            // Load fresh user details from database
            UserDetails userDetails = customUserService.loadUserByUsername(email);

            // Create new authentication with updated authorities
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails.getUsername(),
                    null,
                    userDetails.getAuthorities()
            );

            // Generate new token with updated roles
            String newToken = JwtProvider.generateToken(authentication);

            AuthResponse authResponse = new AuthResponse();
            authResponse.setStatus(true);
            authResponse.setMessage("Token refreshed successfully");
            authResponse.setJwt(newToken);

            return ResponseEntity.ok(authResponse);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to refresh token: " + e.getMessage()));
        }
    }


    @GetMapping("/{userId}")
    public User findUserById(@PathVariable("userId") Integer id) throws Exception
    {
        Optional<User> userOptional = userRepository.findById(Long.valueOf(id));
        if (userOptional.isPresent()) {
            return userOptional.get();
        } else {
            throw new Exception("User not found with id: " + id);
        }
    }
}