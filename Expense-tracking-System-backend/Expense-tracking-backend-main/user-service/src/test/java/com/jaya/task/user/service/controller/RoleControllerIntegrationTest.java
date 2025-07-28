//package com.jaya.task.user.service.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.jaya.task.user.service.modal.Role;
//import com.jaya.task.user.service.request.RoleRequest;
//import com.jaya.task.user.service.service.RoleService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.boot.test.mock.mockito.MockBean;
//import org.springframework.http.MediaType;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.context.ActiveProfiles;
//import org.springframework.test.web.servlet.MockMvc;
//
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.*;
//import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest
//@ActiveProfiles("test")
//@AutoConfigureMockMvc
//class RoleControllerIntegrationTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @MockBean
//    private RoleService roleService;
//
//    String mocktoken="eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE3NTA1NzY0NTksImV4cCI6MTc1MDY2Mjg1OSwiZW1haWwiOiJqYXlhQGdtYWlsLmNvbSIsImF1dGhvcml0aWVzIjoiUk9MRV9BRE1JTiJ9.VCMJDo5sbrY7IliTu60AFGetgd5L6yPvIV-Tco8RIN9XLSz2pE0eBDAzwaIT6Y_O";
//
//    String mockUserToken="eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE3NTA1NzcyNTQsImV4cCI6MTc1MDY2MzY1NCwiZW1haWwiOiJwcmFrYXNoQGdtYWlsLmNvbSIsImF1dGhvcml0aWVzIjoiUk9MRV9VU0VSIn0.xI7LQ8wlWngxtwSKJKr9Fy4_wDVz7xaMk3CVOK98lFvvrw_0Mv8yA3wlB-QA1dV5";
//
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    private Role testRole;
//    private RoleRequest testRoleRequest;
//
//    @BeforeEach
//    void setUp() {
//        testRole = new Role();
//        testRole.setId(1L);
//        testRole.setName("ADMIN");
//        testRole.setDescription("Administrator role");
//
//        testRoleRequest = new RoleRequest();
//        testRoleRequest.setName("admin");
//        testRoleRequest.setDescription("Administrator role");
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void createRole_FullIntegration_Success() throws Exception {
//        // Given
//        when(roleService.createRole(any(Role.class))).thenReturn(testRole);
//
//        // When & Then
//        mockMvc.perform(post("/api/roles")
//                        .with(csrf())
//                        .header("Authorization", "Bearer "+mocktoken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(testRoleRequest)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.id").value(1L))
//                .andExpect(jsonPath("$.name").value("ADMIN"))
//                .andExpect(jsonPath("$.description").value("Administrator role"));
//
//        verify(roleService).createRole(any(Role.class));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getAllRoles_FullIntegration_Success() throws Exception {
//        // Given
//        Role userRole = new Role();
//        userRole.setId(2L);
//        userRole.setName("USER");
//        userRole.setDescription("Regular user role");
//
//        List<Role> roles = Arrays.asList(testRole, userRole);
//        when(roleService.getAllRoles()).thenReturn(roles);
//
//        // When & Then
//        mockMvc.perform(get("/api/roles")
//                        .header("Authorization", "Bearer "+mocktoken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.length()").value(2))
//                .andExpect(jsonPath("$[0].id").value(1L))
//                .andExpect(jsonPath("$[0].name").value("ADMIN"))
//                .andExpect(jsonPath("$[1].id").value(2L))
//                .andExpect(jsonPath("$[1].name").value("USER"));
//
//        verify(roleService).getAllRoles();
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void createRole_DuplicateRole_Conflict() throws Exception {
//        // Given
//        when(roleService.createRole(any(Role.class)))
//                .thenThrow(new RuntimeException("Role with name ADMIN already exists"));
//
//        // When & Then
//        mockMvc.perform(post("/api/roles")
//                        .with(csrf())
//                        .header("Authorization", "Bearer "+mocktoken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(testRoleRequest)))
//                .andExpect(status().isConflict())
//                .andExpect(jsonPath("$.error").value("Role with name ADMIN already exists"));
//
//        verify(roleService).createRole(any(Role.class));
//    }
//
//    @Test
//    void unauthorizedAccess_CreateRole() throws Exception {
//        // Test create endpoint without authentication
//        mockMvc.perform(post("/api/roles")
//                        .with(csrf())
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(testRoleRequest)))
//                .andExpect(status().isUnauthorized());
//
//        verify(roleService, never()).createRole(any(Role.class));
//    }
//
//    @Test
//    @WithMockUser(roles = "USER")
//    void forbiddenAccess_CreateRole_NonAdminUser() throws Exception {
//        // Test create endpoint with non-admin user
//        mockMvc.perform(post("/api/roles")
//                        .with(csrf())
//                        .header("Authorization", "Bearer "+mockUserToken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(testRoleRequest)))
//                .andExpect(status().isForbidden());
//
//        verify(roleService, never()).createRole(any(Role.class));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void deleteRole_Success() throws Exception {
//        // Given
//        doNothing().when(roleService).deleteRole(1L);
//
//        // When & Then
//        mockMvc.perform(delete("/api/roles/1")
//                        .with(csrf())
//                        .header("Authorization", "Bearer "+mocktoken))
//                .andExpect(status().isNoContent())
//                .andExpect(content().string("Role deleted successfully"));
//
//        verify(roleService).deleteRole(1L);
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void deleteRole_NotFound() throws Exception {
//        // Given
//        doThrow(new RuntimeException("Role with id 999 not found"))
//                .when(roleService).deleteRole(999L);
//
//        // When & Then
//        mockMvc.perform(delete("/api/roles/999")
//                        .with(csrf())
//                        .header("Authorization", "Bearer "+mocktoken))
//                .andExpect(status().isNotFound())
//                .andExpect(content().string("Role not found"));
//
//        verify(roleService).deleteRole(999L);
//    }
//}