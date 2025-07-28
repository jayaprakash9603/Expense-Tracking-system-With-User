//package com.jaya.task.user.service.controller;
//
//import com.jaya.task.user.service.modal.User;
//import com.jaya.task.user.service.service.UserService;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.security.test.context.support.WithMockUser;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.setup.MockMvcBuilders;
//
//import java.util.Arrays;
//import java.util.List;
//
//import static org.mockito.ArgumentMatchers.anyString;
//import static org.mockito.Mockito.when;
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@ExtendWith(MockitoExtension.class)
//class AdminControllerTest {
//
//    @Mock
//    private UserService userService;
//
//    @InjectMocks
//    private AdminController adminController;
//
//    private MockMvc mockMvc;
//    private User testUser1;
//    private User testUser2;
//
//    String mockToken = "Bearer eyJhbGciOiJIUzM4NCJ9.eyJpYXQiOjE3NTA1ODUxOTMsImV4cCI6MTc1MDY3MTU5MywiZW1haWwiOiJqYXlhQGdtYWlsLmNvbSIsImF1dGhvcml0aWVzIjoiUk9MRV9VU0VSIn0.shxJnKx8oVW_5jCiA1n9QGNm6i3GbK5Q8vLPGwyWuhoNP3HYJzyJIJhyAtoUvp5U";
//    @BeforeEach
//    void setUp() {
//        mockMvc = MockMvcBuilders.standaloneSetup(adminController).build();
//
//        testUser1 = new User();
//        testUser1.setId(1L);
//        testUser1.setEmail("user1@example.com");
//        testUser1.setFullName("User One");
//
//        testUser2 = new User();
//        testUser2.setId(2L);
//        testUser2.setEmail("user2@example.com");
//        testUser2.setFullName("User Two");
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getAllUsers_Success() throws Exception {
//        // Given
//        List<User> users = Arrays.asList(testUser1, testUser2);
//        when(userService.getAllUsers()).thenReturn(users);
//
//        // When & Then
//        mockMvc.perform(get("/api/admin/users")
//                        .header("Authorization", mockToken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$").isArray())
//                .andExpect(jsonPath("$.length()").value(2))
//                .andExpect(jsonPath("$[0].email").value("user1@example.com"))
//                .andExpect(jsonPath("$[1].email").value("user2@example.com"));
//    }
//
//    @Test
//    @WithMockUser(roles = "USER")
//    void getAllUsers_Forbidden_NonAdminUser() throws Exception {
//        // When & Then
//        mockMvc.perform(get("/api/admin/users")
//                        .header("Authorization", mockToken))
//                .andExpect(status().isForbidden());
//    }
//
//    @Test
//    void getAllUsers_Unauthorized() throws Exception {
//        // When & Then
//        mockMvc.perform(get("/api/admin/users"))
//                .andExpect(status().isUnauthorized());
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getAllUsers_EmptyList() throws Exception {
//        // Given
//        when(userService.getAllUsers()).thenReturn(Arrays.asList());
//
//        // When & Then
//        mockMvc.perform(get("/api/admin/users")
//                        .header("Authorization", mockToken))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$").isArray())
//                .andExpect(jsonPath("$.length()").value(0));
//    }
//
//    @Test
//    @WithMockUser(roles = "ADMIN")
//    void getAllUsers_ServiceException() throws Exception {
//        // Given
//        when(userService.getAllUsers()).thenThrow(new RuntimeException("Service error"));
//
//        // When & Then
//        mockMvc.perform(get("/api/admin/users")
//                        .header("Authorization", mockToken))
//                .andExpect(status().isInternalServerError());
//    }
//}