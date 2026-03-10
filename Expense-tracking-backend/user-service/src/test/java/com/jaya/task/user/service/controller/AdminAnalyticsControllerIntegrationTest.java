package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import java.util.*;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminAnalyticsControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @MockBean
    private JavaMailSender mailSender;

    @MockBean(name = "restTemplate")
    private RestTemplate restTemplate;

    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();

        roleRepository.save(new Role("USER", "Default user role"));
        roleRepository.save(new Role("ADMIN", "Administrator role"));

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        User admin = new User();
        admin.setEmail("analytics-admin@test.com");
        admin.setFullName("Analytics Admin");
        admin.setFirstName("Analytics");
        admin.setLastName("Admin");
        admin.setPassword(encoder.encode("password"));
        admin.setRoles(Set.of("USER", "ADMIN"));
        admin.setCurrentMode("ADMIN");
        userRepository.save(admin);

        User regular = new User();
        regular.setEmail("analytics-user@test.com");
        regular.setFullName("Analytics User");
        regular.setFirstName("Analytics");
        regular.setLastName("User");
        regular.setPassword(encoder.encode("password"));
        regular.setRoles(Set.of("USER"));
        regular.setCurrentMode("USER");
        userRepository.save(regular);

        adminToken = generateToken("analytics-admin@test.com", "ROLE_USER", "ROLE_ADMIN");
        userToken = generateToken("analytics-user@test.com", "ROLE_USER");
    }

    @Nested
    class GetAnalyticsOverview {

        @Test
        void adminGetsOverview() throws Exception {
            mockMvc.perform(get("/api/admin/analytics/overview")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("timeRange", "7d"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.totalUsers").isNumber())
                    .andExpect(jsonPath("$.timeRange").value("7d"));
        }

        @Test
        void nonAdminDenied() throws Exception {
            mockMvc.perform(get("/api/admin/analytics/overview")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    class GetTopCategories {

        @Test
        void adminGetsTopCategories() throws Exception {
            mockMvc.perform(get("/api/admin/analytics/top-categories")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("timeRange", "7d")
                            .param("limit", "5"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    class GetRecentActivity {

        @Test
        void adminGetsRecentActivity() throws Exception {
            mockMvc.perform(get("/api/admin/analytics/recent-activity")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("hours", "24"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    class GetTopUsers {

        @Test
        void adminGetsTopUsers() throws Exception {
            mockMvc.perform(get("/api/admin/analytics/top-users")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("timeRange", "7d")
                            .param("limit", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    class GetUserStats {

        @Test
        void adminGetsUserStats() throws Exception {
            mockMvc.perform(get("/api/admin/analytics/user-stats")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.total").isNumber());
        }
    }

    @Nested
    class GetDashboardAnalytics {

        @Test
        void adminGetsDashboardAnalytics() throws Exception {
            mockMvc.perform(get("/api/admin/analytics/dashboard")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("timeRange", "7d"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.overview").isNotEmpty())
                    .andExpect(jsonPath("$.userStats").isNotEmpty());
        }

        @Test
        void nonAdminDenied() throws Exception {
            mockMvc.perform(get("/api/admin/analytics/dashboard")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isForbidden());
        }
    }

    private String generateToken(String email, String... roles) {
        List<SimpleGrantedAuthority> authorities = Arrays.stream(roles)
                .map(SimpleGrantedAuthority::new)
                .toList();
        var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
        return JwtProvider.generateToken(auth);
    }
}
