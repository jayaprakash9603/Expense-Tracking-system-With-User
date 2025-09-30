import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.jaya.task.user.service.service.CustomUserServiceImplementation;
import org.springframework.security.core.userdetails.UserDetails;
import java.lang.reflect.Invocation

//package com.jaya.task.user.service.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.jaya.task.user.service.config.JwtProvider;
//import com.jaya.task.user.service.modal.Role;
//import com.jaya.task.user.service.modal.User;
//import com.jaya.task.user.service.repository.RoleRepository;
//import com.jaya.task.user.service.repository.UserRepository;
//import com.jaya.task.user.service.request.LoginRequest;
//import com.jaya.task.user.service.request.SignupRequest;
//import com.jaya.task.user.service.service.CustomUserServiceImplementation;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.MockedStatic;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.http.MediaType;
//import org.springframework.security.core.Authentication;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//
//import java.time.LocalDateTime;
//import java.util.*;
//
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@ExtendWith(MockitoExtension.class)
//class AuthControllerTest {
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private RoleRepository roleRepository;
//
//    @Mock
//    private PasswordEncoder passwordEncoder;
//
//    @Mock
//    private CustomUserServiceImplementation customUserService;
//
//    @InjectMocks
//    private AuthController authController;
//
//    private MockMvc mockMvc;
//    private ObjectMapper objectMapper;
//    private User testUser;
//    private Role testRole;
//    private SignupRequest signupRequest;
//    private LoginRequest loginRequest;
//
//    @BeforeEach
//    void setUp() {
//        mockMvc = MockMvcBuilders.standaloneSetup(authController).build();
//        objectMapper = new ObjectMapper();
//
//        testRole = new Role();
//        testRole.setId(1L);
//        testRole.setName("USER");
//        testRole.setDescription("Default user role");
//
//        testUser = new User();
//        testUser.setId(1L);
//        testUser.setEmail("test@example.com");
//        testUser.setFullName("Test User");
//        testUser.setPassword("encodedPassword");
//        testUser.setRoles(Set.of("USER")); // Use role name string, not role object
//        testUser.setCreatedAt(LocalDateTime.now());
//        testUser.setUpdatedAt(LocalDateTime.now());
//
//        signupRequest = new SignupRequest();
//        signupRequest.setEmail("test@example.com");
//        signupRequest.setFullName("Test User");
//        signupRequest.setPassword("password123");
//        signupRequest.setRoles(List.of("USER"));
//
//        loginRequest = new LoginRequest();
//        loginRequest.setEmail("test@example.com");
//        loginRequest.setPassword("password123");
//    }
//
//    @Test
//    void signup_Success_WithExistingRole() throws Exception {
//        // Given
//        when(userRepository.findByEmail(anyString())).thenReturn(null);
//        when(roleRepository.findByName("USER")).thenReturn(Optional.of(testRole));
//        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
//        when(userRepository.save(any(User.class))).thenReturn(testUser);
//
//        UserDetails userDetails = mock(UserDetails.class);
//        when(userDetails.getUsername()).thenReturn("test@example.com");
////        when(userDetails.getAuthorities()).thenReturn(List.of(new SimpleGrantedAuthority("ROLE_USER")));
//        when(customUserService.loadUserByUsername(anyString())).thenReturn(userDetails);
//
//        try (MockedStatic<JwtProvider> jwtProviderMock = mockStatic(JwtProvider.class)) {
//            jwtProviderMock.when(() -> JwtProvider.generateToken(any(Authentication.class)))
//                    .thenReturn("mock-jwt-token");
//
//            // When & Then
//            mockMvc.perform(post("/auth/signup")
//                            .contentType(MediaType.APPLICATION_JSON)
//                            .content(objectMapper.writeValueAsString(signupRequest)))
//                    .andExpect(status().isCreated())
//                    .andExpect(jsonPath("$.status").value(true))
//                    .andExpect(jsonPath("$.message").value("Registration Success"))
//                    .andExpect(jsonPath("$.jwt").value("mock-jwt-token"));
//
//            verify(userRepository).findByEmail("test@example.com");
//            verify(roleRepository).findByName("USER");
//            verify(userRepository).save(any(User.class));
//        }
//    }
//
//    @Test
//    void signup_Success_WithNewRole() throws Exception {
//        // Given
//        when(userRepository.findByEmail(anyString())).thenReturn(null);
//        when(roleRepository.findByName("USER")).thenReturn(Optional.empty());
//        when(roleRepository.save(any(Role.class))).thenReturn(testRole);
//        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
//        when(userRepository.save(any(User.class))).thenReturn(testUser);
//
//        UserDetails userDetails = mock(UserDetails.class);
//        when(userDetails.getUsername()).thenReturn("test@example.com");
////        when(userDetails.getAuthorities()).thenReturn(List.of(new SimpleGrantedAuthority("ROLE_USER")));
//        when(customUserService.loadUserByUsername(anyString())).thenReturn(userDetails);
//
//        try (MockedStatic<JwtProvider> jwtProviderMock = mockStatic(JwtProvider.class)) {
//            jwtProviderMock.when(() -> JwtProvider.generateToken(any(Authentication.class)))
//                    .thenReturn("mock-jwt-token");
//
//            // When & Then
//            mockMvc.perform(post("/auth/signup")
//                            .contentType(MediaType.APPLICATION_JSON)
//                            .content(objectMapper.writeValueAsString(signupRequest)))
//                    .andExpect(status().isCreated())
//                    .andExpect(jsonPath("$.status").value(true))
//                    .andExpect(jsonPath("$.message").value("Registration Success"));
//
//            verify(roleRepository).save(any(Role.class));
//        }
//    }
//
//    @Test
//    void signup_UserAlreadyExists() throws Exception {
//        // Given
//        when(userRepository.findByEmail(anyString())).thenReturn(testUser);
//
//        // When & Then
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signupRequest)))
//                .andExpect(status().isConflict())
//                .andExpect(jsonPath("$.error").value("User already exists with email: test@example.com"));
//
//        verify(userRepository).findByEmail("test@example.com");
//        verify(userRepository, never()).save(any(User.class));
//    }
//
//    @Test
//    void signup_InvalidRole() throws Exception {
//        // Given
//        signupRequest.setRoles(List.of("INVALID_ROLE"));
//        when(userRepository.findByEmail(anyString())).thenReturn(null);
//        when(roleRepository.findByName("INVALID_ROLE")).thenReturn(Optional.empty());
//
//        // When & Then
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signupRequest)))
//                .andExpect(status().isBadRequest())
//                .andExpect(jsonPath("$.error").value("Invalid role: INVALID_ROLE. Only USER and ADMIN roles are allowed during signup."));
//    }
//
//    @Test
//    void signup_NoRolesProvided_DefaultToUser() throws Exception {
//        // Given
//        signupRequest.setRoles(null);
//        when(userRepository.findByEmail(anyString())).thenReturn(null);
//        when(roleRepository.findByName("USER")).thenReturn(Optional.of(testRole));
//        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
//        when(userRepository.save(any(User.class))).thenReturn(testUser);
//
//        UserDetails userDetails = mock(UserDetails.class);
//        when(userDetails.getUsername()).thenReturn("test@example.com");
////        when(userDetails.getAuthorities()).thenReturn(List.of(new SimpleGrantedAuthority("ROLE_USER")));
//        when(customUserService.loadUserByUsername(anyString())).thenReturn(userDetails);
//
//        try (MockedStatic<JwtProvider> jwtProviderMock = mockStatic(JwtProvider.class)) {
//            jwtProviderMock.when(() -> JwtProvider.generateToken(any(Authentication.class)))
//                    .thenReturn("mock-jwt-token");
//
//            // When & Then
//            mockMvc.perform(post("/auth/signup")
//                            .contentType(MediaType.APPLICATION_JSON)
//                            .content(objectMapper.writeValueAsString(signupRequest)))
//                    .andExpect(status().isCreated());
//
//            verify(roleRepository).findByName("USER");
//        }
//    }
//
//    @Test
//    void signin_Success() throws Exception {
//        // Given
//        UserDetails userDetails = mock(UserDetails.class);
//        when(userDetails.getUsername()).thenReturn("test@example.com");
//        when(userDetails.getPassword()).thenReturn("encodedPassword");
////        when(userDetails.getAuthorities()).thenReturn(List.of(new SimpleGrantedAuthority("ROLE_USER")));
//
//        when(customUserService.loadUserByUsername("test@example.com")).thenReturn(userDetails);
//        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
//
//        try (MockedStatic<JwtProvider> jwtProviderMock = mockStatic(JwtProvider.class)) {
//            jwtProviderMock.when(() -> JwtProvider.generateToken(any(Authentication.class)))
//                    .thenReturn("mock-jwt-token");
//
//            // When & Then
//            mockMvc.perform(post("/auth/signin")
//                            .contentType(MediaType.APPLICATION_JSON)
//                            .content(objectMapper.writeValueAsString(loginRequest)))
//                    .andExpect(status().isOk())
//                    .andExpect(jsonPath("$.status").value(true))
//                    .andExpect(jsonPath("$.message").value("Login Success"))
//                    .andExpect(jsonPath("$.jwt").value("mock-jwt-token"));
//        }
//    }
//
//    @Test
//    void signin_InvalidCredentials_UserNotFound() throws Exception {
//        // Given
//        when(customUserService.loadUserByUsername("test@example.com")).thenReturn(null);
//
//        // When & Then
//        mockMvc.perform(post("/auth/signin")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(loginRequest)))
//                .andExpect(status().isInternalServerError());
//    }
//
//    @Test
//    void signin_InvalidCredentials_WrongPassword() throws Exception {
//        // Given
//        UserDetails userDetails = mock(UserDetails.class);
//        when(userDetails.getPassword()).thenReturn("encodedPassword");
//        when(customUserService.loadUserByUsername("test@example.com")).thenReturn(userDetails);
//        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(false);
//
//        // When & Then
//        mockMvc.perform(post("/auth/signin")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(loginRequest)))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    void signup_InternalServerError() throws Exception {
//        // Given
//        when(userRepository.findByEmail(anyString())).thenThrow(new RuntimeException("Database error"));
//
//        // When & Then
//        mockMvc.perform(post("/auth/signup")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(signupRequest)))
//                .andExpect(status().isInternalServerError())
//                .andExpect(jsonPath("$.error").exists());
//    }
//}