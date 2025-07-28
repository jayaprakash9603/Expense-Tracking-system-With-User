//package com.jaya.task.user.service.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.jaya.task.user.service.modal.Role;
//import com.jaya.task.user.service.modal.User;
//import com.jaya.task.user.service.repository.RoleRepository;
//import com.jaya.task.user.service.repository.UserRepository;
//import com.jaya.task.user.service.request.LoginRequest;
//import com.jaya.task.user.service.request.SignupRequest;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.http.MediaType;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.util.List;
//
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest
//@ActiveProfiles("test")
//@AutoConfigureMockMvc
//@Transactional
//class AuthControllerIntegrationTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private RoleRepository roleRepository;
//
//    private SignupRequest signupRequest;
//    private LoginRequest loginRequest;
//    private Role userRole;
//
//    @BeforeEach
//    void setUp() {
//        // Clean up database
//        userRepository.deleteAll();
//        roleRepository.deleteAll();
//
//        // Create test role
//        userRole = new Role();
//        userRole.setName("USER");
//        userRole.setDescription("Default user role");
//        roleRepository.save(userRole);
//
//        signupRequest = new SignupRequest();
//        signupRequest.setEmail("integration@test.com");
//        signupRequest.setFullName("Integration Test User");
//        signupRequest.setPassword("password123");
//        signupRequest.setRoles(List.of("USER"));
//
//        loginRequest = new LoginRequest();
//        loginRequest.setEmail("integration@test.com");
//        loginRequest.setPassword("password123");
//    }
//
//    @Test
//    void signup_FullIntegration_Success() throws Exception {
//        // When & Then
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signupRequest)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.status").value(true))
//                .andExpect(jsonPath("$.message").value("Registration Success"))
//                .andExpect(jsonPath("$.jwt").exists());
//
//        // Verify user was created in database
//        User savedUser = userRepository.findByEmail("integration@test.com");
//        assert savedUser != null;
//        assert savedUser.getFullName().equals("Integration Test User");
//        assert !savedUser.getRoles().isEmpty();
//    }
//
//    @Test
//    void signup_DuplicateUser_Conflict() throws Exception {
//        // Given - First signup
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signupRequest)))
//                .andExpect(status().isCreated());
//
//        // When & Then - Second signup with same email
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signupRequest)))
//                .andExpect(status().isConflict())
//                .andExpect(jsonPath("$.error").value("User already exists with email: integration@test.com"));
//    }
//
//    @Test
//    void signin_FullIntegration_Success() throws Exception {
//        // Given - Create user first
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signupRequest)))
//                .andExpect(status().isCreated());
//
//        // When & Then - Sign in
//        mockMvc.perform(post("/auth/signin")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(loginRequest)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.status").value(true))
//                .andExpect(jsonPath("$.message").value("Login Success"))
//                .andExpect(jsonPath("$.jwt").exists());
//    }
//
//    @Test
//    void signin_InvalidCredentials() throws Exception {
//        // Given
//        loginRequest.setEmail("nonexistent@test.com");
//
//        // When & Then
//        mockMvc.perform(post("/auth/signin")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(loginRequest)))
//                .andExpect(status().isInternalServerError());
//    }
//
//    @Test
//    void signup_WithAdminRole_Success() throws Exception {
//        // Given
//        Role adminRole = new Role();
//        adminRole.setName("ADMIN");
//        adminRole.setDescription("Administrator role");
//        roleRepository.save(adminRole);
//
//        signupRequest.setRoles(List.of("ADMIN"));
//
//        // When & Then
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signupRequest)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.status").value(true));
//
//        // Verify user has admin role
//        User savedUser = userRepository.findByEmail("integration@test.com");
//        assert savedUser.getRoles().contains("ADMIN");
//    }
//
//    @Test
//    void signup_InvalidRoleValidation() throws Exception {
//        // Given
//        signupRequest.setRoles(List.of("INVALID_ROLE"));
//
//        // When & Then
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signupRequest)))
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.error").value("Invalid role: INVALID_ROLE. Only USER and ADMIN roles are allowed during signup."));
//    }
//}