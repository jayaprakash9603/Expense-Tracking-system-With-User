//package com.jaya.task.user.service.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.jaya.task.user.service.config.TestTokenConfig;
//import com.jaya.task.user.service.modal.Role;
//import com.jaya.task.user.service.modal.User;
//import com.jaya.task.user.service.repository.RoleRepository;
//import com.jaya.task.user.service.repository.UserRepository;
//import com.jaya.task.user.service.request.UserUpdateRequest;
//import com.jaya.task.user.service.service.UserService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.context.annotation.Import;
//import org.springframework.http.MediaType;
//import org.springframework.security.access.AccessDeniedException;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//
//import java.time.LocalDateTime;
//import java.util.Optional;
//import java.util.Set;
//
//import static org.mockito.ArgumentMatchers.*;
//import static org.mockito.Mockito.*;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@ExtendWith(MockitoExtension.class)
//@SpringBootTest
//@ActiveProfiles("test")
//@Import(TestTokenConfig.class)
//class UserControllerTest {
//
//    @Mock
//    private UserService userService;
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
//    @InjectMocks
//    private UserController userController;
//
//    private MockMvc mockMvc;
//    private ObjectMapper objectMapper;
//    private User testUser;
//    private Role testRole;
//    private UserUpdateRequest updateRequest;
//    private TestTokenConfig.TestTokenProvider tokenProvider;
//
//    @BeforeEach
//    void setUp() {
//        mockMvc = MockMvcBuilders.standaloneSetup(userController).build();
//        objectMapper = new ObjectMapper();
//
//        // Initialize token provider with test values
//        tokenProvider = new TestTokenConfig.TestTokenProvider(
//                "eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE3NTA1NzY0NTksImV4cCI6MTc1MDY2Mjg1OSwiZW1haWwiOiJqYXlhQGdtYWlsLmNvbSIsImF1dGhvcml0aWVzIjoiUk9MRV9BRE1JTiJ9.VCMJDo5sbrY7IliTu60AFGetgd5L6yPvIV-Tco8RIN9XLSz2pE0eBDAzwaIT6Y_O",
//                "eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE3NTA1NzcyNTQsImV4cCI6MTc1MDY2MzY1NCwiZW1haWwiOiJwcmFrYXNoQGdtYWlsLmNvbSIsImF1dGhvcml0aWVzIjoiUk9MRV9VU0VSIn0.xI7LQ8wlWngxtwSKJKr9Fy4_wDVz7xaMk3CVOK98lFvvrw_0Mv8yA3wlB-QA1dV5",
//                "jaya@gmail.com", "Admin User",
//                "prakash@gmail.com", "Regular User",
//                "/auth/signup", "/auth/signin",
//                "/api/user/profile", "/api/user/email",
//                "/api/user", "/api/admin/users"
//        );
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
//        testUser.setRoles(Set.of(testRole));
//        testUser.setCreatedAt(LocalDateTime.now());
//        testUser.setUpdatedAt(LocalDateTime.now());
//
//        updateRequest = new UserUpdateRequest();
//        updateRequest.setFullName("Updated Name");
//        updateRequest.setEmail("updated@example.com");
//    }
//
//    @Test
//    void getUserProfile_Success() throws Exception {
//        // Given
//        when(userService.getUserProfile(anyString())).thenReturn(testUser);
//
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserProfileEndpoint())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(1L))
//                .andExpect(jsonPath("$.email").value("test@example.com"))
//                .andExpect(jsonPath("$.fullName").value("Test User"));
//
//        verify(userService).getUserProfile(tokenProvider.getAdminToken());
//    }
//
//    @Test
//    void getUserByEmail_Success() throws Exception {
//        // Given
//        when(userService.getUserByEmail("test@example.com")).thenReturn(testUser);
//
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserEmailEndpoint())
//                        .header("Authorization", tokenProvider.getAdminToken())
//                        .param("email", "test@example.com"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.email").value("test@example.com"));
//
//        verify(userService).getUserByEmail("test@example.com");
//    }
//
//    @Test
//    void getUserByEmail_InvalidEmail() throws Exception {
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserEmailEndpoint())
//                        .header("Authorization", tokenProvider.getAdminToken())
//                        .param("email", "invalid-email"))
//                .andExpect(status().isBadRequest());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getUserById_Success_AsAdmin() throws Exception {
//        // Given
//        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
//
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserByIdEndpoint(1L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(1L));
//
//        verify(userRepository).findById(1L);
//    }
//
//    @Test
//    void getUserById_NotFound() throws Exception {
//        // Given
//        when(userRepository.findById(999L)).thenReturn(Optional.empty());
//
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserByIdEndpoint(999L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isNotFound());
//    }
//
//    @Test
//    void updateUser_Success() throws Exception {
//        // Given
//        when(userService.getUserProfile(anyString())).thenReturn(testUser);
//        when(userService.updateUser(any(User.class))).thenReturn(testUser);
//
//        // When & Then
//        mockMvc.perform(put(tokenProvider.getUserBaseEndpoint())
//                        .header("Authorization", tokenProvider.getAdminToken())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateRequest)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.message").value("User updated successfully"));
//
//        verify(userService).updateUser(any(User.class));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void deleteUser_Success_AsAdmin() throws Exception {
//        // Given
//        doNothing().when(userService).deleteUser(1L);
//
//        // When & Then
//        mockMvc.perform(delete(tokenProvider.getDeleteUserEndpoint(1L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isOk())
//                .andExpect(content().string("User deleted successfully"));
//
//        verify(userService).deleteUser(1L);
//    }
//
//    @Test
//    void deleteUser_AccessDenied() throws Exception {
//        // Given
//        doThrow(new AccessDeniedException("Access denied")).when(userService).deleteUser(1L);
//
//        // When & Then
//        mockMvc.perform(delete(tokenProvider.getDeleteUserEndpoint(1L))
//                        .header("Authorization", tokenProvider.getUserToken()))
//                .andExpect(status().isForbidden());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void addRoleToUser_Success() throws Exception {
//        // Given
//        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
//        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));
//        when(userRepository.save(any(User.class))).thenReturn(testUser);
//
//        // When & Then
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(1L, 1L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.message").value("Role added to user successfully"));
//
//        verify(userRepository).save(any(User.class));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void addRoleToUser_UserNotFound() throws Exception {
//        // Given
//        when(userRepository.findById(999L)).thenReturn(Optional.empty());
//
//        // When & Then
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(999L, 1L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isNotFound())
//                .andExpect(jsonPath("$.error").value("User not found"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void addRoleToUser_RoleNotFound() throws Exception {
//        // Given
//        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
//        when(roleRepository.findById(999L)).thenReturn(Optional.empty());
//
//        // When & Then
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(1L, 999L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isNotFound())
//                .andExpect(jsonPath("$.error").value("Role not found"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void removeRoleFromUser_Success() throws Exception {
//        // Given
//        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
//        when(roleRepository.findById(1L)).thenReturn(Optional.of(testRole));
//        when(userRepository.save(any(User.class))).thenReturn(testUser);
//
//        // When & Then
//        mockMvc.perform(delete(tokenProvider.getRemoveRoleEndpoint(1L, 1L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.message").value("Role removed from user successfully"));
//
//        verify(userRepository).save(any(User.class));
//    }
//
//    @Test
//    void getUserById_InvalidId() throws Exception {
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserByIdEndpoint(-1L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isBadRequest());
//    }
//
//    @Test
//    void addRoleToUser_InvalidUserId() throws Exception {
//        // When & Then
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(-1L, 1L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isBadRequest());
//    }
//
//    @Test
//    void addRoleToUser_InvalidRoleId() throws Exception {
//        // When & Then
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(1L, -1L))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isBadRequest());
//    }
//}