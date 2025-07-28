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
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.context.annotation.Import;
//import org.springframework.http.MediaType;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.annotation.DirtiesContext;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.Optional;
//import java.util.Set;
//
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.when;
//import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest
//@ActiveProfiles("test")
//@AutoConfigureMockMvc
//@Transactional
//@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
//@Import(TestTokenConfig.class)
//class UserControllerIntegrationTest {
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
//    @MockBean
//    private UserService userService;
//
//    @Autowired
//    private TestTokenConfig.TestTokenProvider tokenProvider;
//
//    private User testUser;
//    private Role testRole;
//    private UserUpdateRequest updateRequest;
//
//    @BeforeEach
//    void setUp() {
//        // Clean up database - more thorough cleanup
//        try {
//            userRepository.deleteAll();
//            userRepository.flush();
//            roleRepository.deleteAll();
//            roleRepository.flush();
//        } catch (Exception e) {
//            // Ignore cleanup errors
//        }
//
//        // Create test role with existence check
//        testRole = roleRepository.findByName("USER").orElse(null);
//        if (testRole == null) {
//            testRole = new Role();
//            testRole.setName("USER");
//            testRole.setDescription("Default user role");
//            testRole.setCreatedAt(LocalDateTime.now());
//            testRole.setUpdatedAt(LocalDateTime.now());
//            testRole = roleRepository.save(testRole);
//        }
//
//        // Create test user
//        testUser = new User();
//        testUser.setEmail("integration@test.com");
//        testUser.setFullName("Integration Test User");
//        testUser.setPassword("encodedPassword");
//        testUser.setRoles(Set.of(testRole.getName()));
//        testUser.setCreatedAt(LocalDateTime.now());
//        testUser.setUpdatedAt(LocalDateTime.now());
//        testUser = userRepository.save(testUser);
//
//        updateRequest = new UserUpdateRequest();
//        updateRequest.setFullName("Updated Integration User");
//        updateRequest.setEmail("updated-integration@test.com");
//    }
//
//    @Test
//    @WithMockUser(roles = "USER")
//    void getUserProfile_FullIntegration_Success() throws Exception {
//        // Given
//        when(userService.getUserProfile(anyString())).thenReturn(testUser);
//
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserProfileEndpoint())
//                        .header("Authorization", tokenProvider.getUserToken()))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.email").value("integration@test.com"))
//                .andExpect(jsonPath("$.fullName").value("Integration Test User"));
//    }
//
//    @Test
//    @WithMockUser(roles = "USER")
//    void getUserByEmail_FullIntegration_Success() throws Exception {
//        // Given
//        when(userService.getUserByEmail("integration@test.com")).thenReturn(testUser);
//
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserEmailEndpoint())
//                        .header("Authorization", tokenProvider.getUserToken())
//                        .param("email", "integration@test.com"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.email").value("integration@test.com"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getUserById_FullIntegration_Success() throws Exception {
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserByIdEndpoint(testUser.getId()))
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(testUser.getId()))
//                .andExpect(jsonPath("$.email").value("integration@test.com"));
//    }
//
//    @Test
//    @WithMockUser(roles = "USER")
//    void updateUser_FullIntegration_Success() throws Exception {
//        // Given
//        when(userService.getUserProfile(anyString())).thenReturn(testUser);
//
//        User updatedUser = new User();
//        updatedUser.setId(testUser.getId());
//        updatedUser.setEmail("updated-integration@test.com");
//        updatedUser.setFullName("Updated Integration User");
//        updatedUser.setPassword(testUser.getPassword());
//        updatedUser.setRoles(testUser.getRoles());
//        updatedUser.setCreatedAt(testUser.getCreatedAt());
//        updatedUser.setUpdatedAt(LocalDateTime.now());
//
//        when(userService.updateUser(org.mockito.ArgumentMatchers.any(User.class))).thenReturn(updatedUser);
//
//        // When & Then
//        mockMvc.perform(put(tokenProvider.getUserBaseEndpoint())
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getUserToken())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateRequest)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.message").value("User updated successfully"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void addRoleToUser_FullIntegration_Success() throws Exception {
//        // Given - Check if ADMIN role exists, create if not
//        Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
//        if (adminRole == null) {
//            adminRole = new Role();
//            adminRole.setName("ADMIN");
//            adminRole.setDescription("Administrator role");
//            adminRole.setCreatedAt(LocalDateTime.now());
//            adminRole.setUpdatedAt(LocalDateTime.now());
//            adminRole = roleRepository.save(adminRole);
//        }
//
//        // When & Then
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(testUser.getId(), adminRole.getId()))
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.message").value("Role added to user successfully"));
//
//        // Verify role was added
//        User updatedUser = userRepository.findById(testUser.getId()).orElse(null);
//        assert updatedUser != null;
//        assert updatedUser.getRoles().size() == 2;
//        assert updatedUser.getRoles().stream().anyMatch(role -> role.equals("ADMIN"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void removeRoleFromUser_FullIntegration_Success() throws Exception {
//        // Given - Add an additional role first
//        Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
//        if (adminRole == null) {
//            adminRole = new Role();
//            adminRole.setName("ADMIN");
//            adminRole.setDescription("Administrator role");
//            adminRole.setCreatedAt(LocalDateTime.now());
//            adminRole.setUpdatedAt(LocalDateTime.now());
//            adminRole = roleRepository.save(adminRole);
//        }
//
//        testUser.getRoles().add(adminRole);
//        testUser = userRepository.save(testUser);
//
//        // When & Then
//        mockMvc.perform(delete(tokenProvider.getRemoveRoleEndpoint(testUser.getId(), adminRole.getId()))
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.message").value("Role removed from user successfully"));
//
//        // Verify role was removed
//        User updatedUser = userRepository.findById(testUser.getId()).orElse(null);
//        assert updatedUser != null;
//        assert updatedUser.getRoles().stream().noneMatch(role -> role.getName.equals("ADMIN"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void deleteUser_FullIntegration_Success() throws Exception {
//        // When & Then
//        mockMvc.perform(delete(tokenProvider.getDeleteUserEndpoint(testUser.getId()))
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isOk())
//                .andExpect(content().string("User deleted successfully"));
//
//        // Verify user was deleted
//        assert userRepository.findById(testUser.getId()).isEmpty();
//    }
//
//    @Test
//    @WithMockUser(roles = "USER")
//    void addRoleToUser_Forbidden_NonAdminUser() throws Exception {
//        // Given
//        Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
//        if (adminRole == null) {
//            adminRole = new Role();
//            adminRole.setName("ADMIN");
//            adminRole.setDescription("Administrator role");
//            adminRole.setCreatedAt(LocalDateTime.now());
//            adminRole.setUpdatedAt(LocalDateTime.now());
//            adminRole = roleRepository.save(adminRole);
//        }
//
//        // When & Then
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(testUser.getId(), adminRole.getId()))
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getUserToken()))
//                .andExpect(status().isForbidden());
//    }
//
//    @Test
//    @WithMockUser(roles = "USER")
//    void removeRoleFromUser_Forbidden_NonAdminUser() throws Exception {
//        // When & Then
//        mockMvc.perform(delete(tokenProvider.getRemoveRoleEndpoint(testUser.getId(), testRole.getId()))
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getUserToken()))
//                .andExpect(status().isForbidden());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void addRoleToUser_UserNotFound() throws Exception {
//        // Given
//        Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
//        if (adminRole == null) {
//            adminRole = new Role();
//            adminRole.setName("ADMIN");
//            adminRole.setDescription("Administrator role");
//            adminRole.setCreatedAt(LocalDateTime.now());
//            adminRole.setUpdatedAt(LocalDateTime.now());
//            adminRole = roleRepository.save(adminRole);
//        }
//
//        // When & Then
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(999L, adminRole.getId()))
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isNotFound())
//                .andExpect(jsonPath("$.error").value("User not found with Id: 999"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void addRoleToUser_RoleNotFound() throws Exception {
//        // When & Then
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(testUser.getId(), 999L))
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isNotFound())
//                .andExpect(jsonPath("$.error").value("User not found with Id: 999"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void addRoleToUser_RoleAlreadyExists() throws Exception {
//        // When & Then - Try to add the same role that user already has
//        mockMvc.perform(post(tokenProvider.getAddRoleEndpoint(testUser.getId(), testRole.getId()))
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isConflict())
//                .andExpect(jsonPath("$.error").value("User already has role: USER"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void removeRoleFromUser_RoleNotAssigned() throws Exception {
//        // Given
//        Role adminRole = roleRepository.findByName("ADMIN").orElse(null);
//        if (adminRole == null) {
//            adminRole = new Role();
//            adminRole.setName("ADMIN");
//            adminRole.setDescription("Administrator role");
//            adminRole.setCreatedAt(LocalDateTime.now());
//            adminRole.setUpdatedAt(LocalDateTime.now());
//            adminRole = roleRepository.save(adminRole);
//        }
//
//        // When & Then - Try to remove a role that user doesn't have
//        mockMvc.perform(delete(tokenProvider.getRemoveRoleEndpoint(testUser.getId(), adminRole.getId()))
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isConflict())
//                .andExpect(jsonPath("$.error").value("User does not have this role"));
//    }
//
//    @Test
//    void unauthorizedAccess_GetUserProfile() throws Exception {
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserProfileEndpoint())
//                        .header("Authorization", tokenProvider.getUserToken()))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    void unauthorizedAccess_UpdateUser() throws Exception {
//        // When & Then
//        mockMvc.perform(put(tokenProvider.getUserBaseEndpoint())
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getUserToken())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(updateRequest)))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    @WithMockUser(roles = "USER")
//    void getUserByEmail_InvalidEmailFormat() throws Exception {
//        // When & Then
//        mockMvc.perform(get(tokenProvider.getUserEmailEndpoint())
//                        .header("Authorization", tokenProvider.getUserToken())
//                        .param("email", "invalid-email-format"))
//                .andExpect(status().isNotFound());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getUserById_InvalidIdFormat() throws Exception {
//        // When & Then
//        mockMvc.perform(get("/api/user/invalid-id")
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isBadRequest());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void addRoleToUser_InvalidUserIdFormat() throws Exception {
//        // When & Then
//        mockMvc.perform(post("/api/user/invalid-id/roles/" + testRole.getId())
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isBadRequest());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void addRoleToUser_InvalidRoleIdFormat() throws Exception {
//        // When & Then
//        mockMvc.perform(post("/api/user/" + testUser.getId() + "/roles/invalid-id")
//                        .with(csrf())
//                        .header("Authorization", tokenProvider.getAdminToken()))
//                .andExpect(status().isBadRequest());
//    }
//}