//package com.jaya.task.user.service.controller;
//
//import com.jaya.task.user.service.modal.Role;
//import com.jaya.task.user.service.modal.User;
//import com.jaya.task.user.service.repository.RoleRepository;
//import com.jaya.task.user.service.repository.UserRepository;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.transaction.annotation.Transactional;
//
//import java.time.LocalDateTime;
//import java.util.HashSet;
//import java.util.Set;
//
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest
//@ActiveProfiles("test")
//@AutoConfigureMockMvc
//@Transactional
//class AdminControllerIntegrationTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private RoleRepository roleRepository;
//
//    String mockToken = "Bearer eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE3NTA1NzY0NTksImV4cCI6MTc1MDY2Mjg1OSwiZW1haWwiOiJqYXlhQGdtYWlsLmNvbSIsImF1dGhvcml0aWVzIjoiUk9MRV9BRE1JTiJ9.VCMJDo5sbrY7IliTu60AFGetgd5L6yPvIV-Tco8RIN9XLSz2pE0eBDAzwaIT6Y_O";
//
//    private User testUser1;
//    private User testUser2;
//    private Role userRole;
//    private Role adminRole;
//
//    @BeforeEach
//    void setUp() {
//        // Clean up database
//        userRepository.deleteAll();
//        roleRepository.deleteAll();
//
//        // Create test roles
//        userRole = new Role();
//        userRole.setName("USER");
//        userRole.setDescription("Default user role");
//        userRole.setCreatedAt(LocalDateTime.now());
//        userRole.setUpdatedAt(LocalDateTime.now());
//        userRole = roleRepository.save(userRole);
//
//        adminRole = new Role();
//        adminRole.setName("ADMIN");
//        adminRole.setDescription("Administrator role");
//        adminRole.setCreatedAt(LocalDateTime.now());
//        adminRole.setUpdatedAt(LocalDateTime.now());
//        adminRole = roleRepository.save(adminRole);
//
//        // Create test users with role names (String), not role objects
//        testUser1 = new User();
//        testUser1.setEmail("user1@integration.com");
//        testUser1.setFullName("Integration User One");
//        testUser1.setPassword("encodedPassword1");
//        testUser1.setRoles(Set.of("USER")); // Use role name string
//        testUser1.setCreatedAt(LocalDateTime.now());
//        testUser1.setUpdatedAt(LocalDateTime.now());
//        testUser1 = userRepository.save(testUser1);
//
//        // Update the role's users set with the user's ID
//        if (userRole.getUsers() == null) {
//            userRole.setUsers(new HashSet<>());
//        }
//        userRole.getUsers().add(testUser1.getId().intValue());
//        roleRepository.save(userRole);
//
//        testUser2 = new User();
//        testUser2.setEmail("admin@integration.com");
//        testUser2.setFullName("Integration Admin User");
//        testUser2.setPassword("encodedPassword2");
//        testUser2.setRoles(Set.of("ADMIN")); // Use role name string
//        testUser2.setCreatedAt(LocalDateTime.now());
//        testUser2.setUpdatedAt(LocalDateTime.now());
//        testUser2 = userRepository.save(testUser2);
//
//        // Update the role's users set with the user's ID
//        if (adminRole.getUsers() == null) {
//            adminRole.setUsers(new HashSet<>());
//        }
//        adminRole.getUsers().add(testUser2.getId().intValue());
//        roleRepository.save(adminRole);
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getAllUsers_FullIntegration_Success() throws Exception {
//        // When & Then
//        mockMvc.perform(get("/api/admin/all")
//                        .header("Authorization", mockToken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$").isArray())
//                .andExpect(jsonPath("$.length()").value(2))
//                .andExpect(jsonPath("$[0].email").exists())
//                .andExpect(jsonPath("$[1].email").exists());
//    }
//
//    @Test
//    @WithMockUser(roles = "USER")
//    void getAllUsers_Forbidden_NonAdminUser() throws Exception {
//        // When & Then
//        mockMvc.perform(get("/api/admin/all")
//                        .header("Authorization", mockToken))
//                .andExpect(status().isForbidden());
//    }
//
//    @Test
//    void getAllUsers_Unauthorized_NoAuthentication() throws Exception {
//        // When & Then
//        mockMvc.perform(get("/api/admin/all"))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getAllUsers_VerifyUserData() throws Exception {
//        // When & Then
//        mockMvc.perform(get("/api/admin/all")
//                        .header("Authorization", mockToken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$[?(@.email == 'user1@integration.com')].fullName").value("Integration User One"))
//                .andExpect(jsonPath("$[?(@.email == 'admin@integration.com')].fullName").value("Integration Admin User"));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getAllUsers_VerifyRolesIncluded() throws Exception {
//        // When & Then
//        mockMvc.perform(get("/api/admin/all")
//                        .header("Authorization", mockToken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$[0].roles").exists())
//                .andExpect(jsonPath("$[1].roles").exists())
//                .andExpect(jsonPath("$[?(@.email == 'user1@integration.com')].roles[0]").value("USER"))
//                .andExpect(jsonPath("$[?(@.email == 'admin@integration.com')].roles[0]").value("ADMIN"));
//    }
//}