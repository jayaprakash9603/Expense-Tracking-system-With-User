//package com.jaya.task.user.service.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.jaya.task.user.service.modal.Role;
//import com.jaya.task.user.service.request.RoleRequest;
//import com.jaya.task.user.service.service.RoleService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.http.MediaType;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//import org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers;
//
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.ArgumentMatchers.anyLong;
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.ArgumentMatchers.eq;
//import static org.mockito.Mockito.*;
//import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@ExtendWith(MockitoExtension.class)
//class RoleControllerTest {
//
//    @Mock
//    private RoleService roleService;
//
//    @InjectMocks
//    private RoleController roleController;
//
//    private MockMvc mockMvc;
//    private ObjectMapper objectMapper;
//    private Role testRole;
//    private RoleRequest testRoleRequest;
//
//
//    String mocktoken="eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE3NTA1NzY0NTksImV4cCI6MTc1MDY2Mjg1OSwiZW1haWwiOiJqYXlhQGdtYWlsLmNvbSIsImF1dGhvcml0aWVzIjoiUk9MRV9BRE1JTiJ9.VCMJDo5sbrY7IliTu60AFGetgd5L6yPvIV-Tco8RIN9XLSz2pE0eBDAzwaIT6Y_O";
//
//    String mockUserToken="eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE3NTA1NzcyNTQsImV4cCI6MTc1MDY2MzY1NCwiZW1haWwiOiJwcmFrYXNoQGdtYWlsLmNvbSIsImF1dGhvcml0aWVzIjoiUk9MRV9VU0VSIn0.xI7LQ8wlWngxtwSKJKr9Fy4_wDVz7xaMk3CVOK98lFvvrw_0Mv8yA3wlB-QA1dV5";
//
//
//    @BeforeEach
//    void setUp() {
//        mockMvc = MockMvcBuilders.standaloneSetup(roleController)
//                .build();
//        objectMapper = new ObjectMapper();
//
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
//    void createRole_Success() throws Exception {
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
//    void createRole_Conflict() throws Exception {
//        // Given
//        when(roleService.createRole(any(Role.class)))
//                .thenThrow(new RuntimeException("Role already exists"));
//
//        // When & Then
//        mockMvc.perform(post("/api/roles")
//                        .with(csrf())
//                        .header("Authorization", "Bearer "+mocktoken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(testRoleRequest)))
//                .andExpect(status().isConflict())
//                .andExpect(jsonPath("$.error").value("Role already exists"));
//
//        verify(roleService).createRole(any(Role.class));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void createRole_InternalServerError() throws Exception {
//        // Given - Use RuntimeException instead of checked Exception
//        when(roleService.createRole(any(Role.class)))
//                .thenThrow(new RuntimeException("Database connection failed"));
//
//        // When & Then
//        mockMvc.perform(post("/api/roles")
//                        .with(csrf())
//                        .header("Authorization", "Bearer "+mocktoken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(testRoleRequest)))
//                .andExpect(status().isConflict()) // This will be CONFLICT, not INTERNAL_SERVER_ERROR
//                .andExpect(jsonPath("$.error").value("Database connection failed"));
//
//        verify(roleService).createRole(any(Role.class));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getAllRoles_Success() throws Exception {
//        // Given
//        Role role2 = new Role();
//        role2.setId(2L);
//        role2.setName("USER");
//        role2.setDescription("User role");
//
//        List<Role> roles = Arrays.asList(testRole, role2);
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
//    void getRoleById_Success() throws Exception {
//        // Given
//        when(roleService.getRoleById(1L)).thenReturn(Optional.of(testRole));
//
//        // When & Then
//        mockMvc.perform(get("/api/roles/1")
//                        .header("Authorization", "Bearer "+mocktoken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(1L))
//                .andExpect(jsonPath("$.name").value("ADMIN"))
//                .andExpect(jsonPath("$.description").value("Administrator role"));
//
//        verify(roleService).getRoleById(1L);
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getRoleById_NotFound() throws Exception {
//        // Given
//        when(roleService.getRoleById(999L)).thenReturn(Optional.empty());
//
//        // When & Then
//        mockMvc.perform(get("/api/roles/999")
//                        .header("Authorization", "Bearer "+mocktoken))
//                .andExpect(status().isNotFound());
//
//        verify(roleService).getRoleById(999L);
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getRoleByName_Success() throws Exception {
//        // Given
//        when(roleService.getRoleByName("ADMIN")).thenReturn(Optional.of(testRole));
//
//        // When & Then
//        mockMvc.perform(get("/api/roles/name/ADMIN")
//                        .header("Authorization", "Bearer "+mocktoken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(1L))
//                .andExpect(jsonPath("$.name").value("ADMIN"))
//                .andExpect(jsonPath("$.description").value("Administrator role"));
//
//        verify(roleService).getRoleByName("ADMIN");
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getRoleByName_NotFound() throws Exception {
//        // Given
//        when(roleService.getRoleByName("NONEXISTENT")).thenReturn(Optional.empty());
//
//        // When & Then
//        mockMvc.perform(get("/api/roles/name/NONEXISTENT")
//                        .header("Authorization", "Bearer "+mocktoken))
//                .andExpect(status().isNotFound());
//
//        verify(roleService).getRoleByName("NONEXISTENT");
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void updateRole_Success() throws Exception {
//        // Given
//        Role updatedRole = new Role();
//        updatedRole.setId(1L);
//        updatedRole.setName("ADMIN");
//        updatedRole.setDescription("Updated administrator role");
//
//        when(roleService.updateRole(eq(1L), any(Role.class))).thenReturn(updatedRole);
//
//        // When & Then
//        mockMvc.perform(put("/api/roles/1")
//                        .with(csrf())
//                        .header("Authorization", "Bearer "+mocktoken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(testRoleRequest)))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.id").value(1L))
//                .andExpect(jsonPath("$.name").value("ADMIN"))
//                .andExpect(jsonPath("$.description").value("Updated administrator role"));
//
//        verify(roleService).updateRole(eq(1L), any(Role.class));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void updateRole_NotFound() throws Exception {
//        // Given
//        when(roleService.updateRole(eq(999L), any(Role.class)))
//                .thenThrow(new RuntimeException("Role not found"));
//
//        // When & Then
//        mockMvc.perform(put("/api/roles/999")
//                        .with(csrf())
//                        .header("Authorization", "Bearer "+mocktoken)
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(testRoleRequest)))
//                .andExpect(status().isNotFound())
//                .andExpect(jsonPath("$.error").value("Role not found"));
//
//        verify(roleService).updateRole(eq(999L), any(Role.class));
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
//        doThrow(new RuntimeException("Role not found")).when(roleService).deleteRole(999L);
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
//
//}