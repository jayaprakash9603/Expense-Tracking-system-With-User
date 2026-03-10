package com.jaya.task.user.service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
    private User adminUser;
    private User regularUser;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();

        roleRepository.save(new Role("USER", "Default user role"));
        roleRepository.save(new Role("ADMIN", "Administrator role"));

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        adminUser = new User();
        adminUser.setEmail("admin@admin.com");
        adminUser.setFullName("Admin User");
        adminUser.setFirstName("Admin");
        adminUser.setLastName("User");
        adminUser.setPassword(encoder.encode("adminpass"));
        adminUser.setRoles(Set.of("USER", "ADMIN"));
        adminUser.setCurrentMode("ADMIN");
        adminUser = userRepository.save(adminUser);

        regularUser = new User();
        regularUser.setEmail("regular@user.com");
        regularUser.setFullName("Regular User");
        regularUser.setFirstName("Regular");
        regularUser.setLastName("User");
        regularUser.setPassword(encoder.encode("userpass"));
        regularUser.setRoles(Set.of("USER"));
        regularUser.setCurrentMode("USER");
        regularUser = userRepository.save(regularUser);

        adminToken = generateToken("admin@admin.com", "ROLE_USER", "ROLE_ADMIN");
        userToken = generateToken("regular@user.com", "ROLE_USER");
    }

    @Nested
    class GetAllUsers {

        @Test
        void adminGetsAllUsersWithPagination() throws Exception {
            mockMvc.perform(get("/api/admin/users")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("page", "0")
                            .param("size", "10"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.users", hasSize(greaterThanOrEqualTo(2))))
                    .andExpect(jsonPath("$.totalCount").isNumber())
                    .andExpect(jsonPath("$.page").value(0));
        }

        @Test
        void adminSearchesUsers() throws Exception {
            mockMvc.perform(get("/api/admin/users")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("search", "admin"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.users", hasSize(greaterThanOrEqualTo(1))));
        }

        @Test
        void nonAdminCannotGetAdminUsers() throws Exception {
            mockMvc.perform(get("/api/admin/users")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    class GetUserById {

        @Test
        void adminGetsUserById() throws Exception {
            mockMvc.perform(get("/api/admin/users/" + regularUser.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("regular@user.com"));
        }

        @Test
        void returnsNotFoundForNonexistentUser() throws Exception {
            mockMvc.perform(get("/api/admin/users/9999")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class UpdateUserStatus {

        @Test
        void adminUpdatesUserStatus() throws Exception {
            mockMvc.perform(put("/api/admin/users/" + regularUser.getId() + "/status")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"SUSPENDED\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value(containsString("updated")));
        }

        @Test
        void returnsNotFoundForNonexistentUser() throws Exception {
            mockMvc.perform(put("/api/admin/users/9999/status")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"status\": \"SUSPENDED\"}"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class DeleteUser {

        @Test
        void adminDeletesUser() throws Exception {
            User toDelete = new User();
            toDelete.setEmail("todelete@example.com");
            toDelete.setFullName("Delete Me");
            toDelete.setFirstName("Delete");
            toDelete.setLastName("Me");
            toDelete.setPassword(new BCryptPasswordEncoder().encode("pass"));
            toDelete.setRoles(Set.of("USER"));
            toDelete = userRepository.save(toDelete);

            mockMvc.perform(delete("/api/admin/users/" + toDelete.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value(containsString("deleted")));
        }
    }

    @Nested
    class BulkAction {

        @Test
        void adminPerformsBulkDelete() throws Exception {
            User u1 = createUser("bulk1@example.com");
            User u2 = createUser("bulk2@example.com");

            Map<String, Object> request = Map.of(
                    "userIds", List.of(u1.getId(), u2.getId()),
                    "action", "DELETE");

            mockMvc.perform(post("/api/admin/users/bulk-action")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.successCount").value(2));
        }
    }

    @Nested
    class GetUserStats {

        @Test
        void adminGetsUserStats() throws Exception {
            mockMvc.perform(get("/api/admin/users/stats")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.total").isNumber());
        }
    }

    @Nested
    class SearchUsers {

        @Test
        void searchesByName() throws Exception {
            mockMvc.perform(get("/api/admin/users/search")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("query", "Admin"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }

        @Test
        void returnsEmptyForShortQuery() throws Exception {
            mockMvc.perform(get("/api/admin/users/search")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("query", "a"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(0)));
        }
    }

    private User createUser(String email) {
        User u = new User();
        u.setEmail(email);
        u.setFullName("Bulk User");
        u.setFirstName("Bulk");
        u.setLastName("User");
        u.setPassword(new BCryptPasswordEncoder().encode("pass"));
        u.setRoles(Set.of("USER"));
        return userRepository.save(u);
    }

    private String generateToken(String email, String... roles) {
        List<SimpleGrantedAuthority> authorities = Arrays.stream(roles)
                .map(SimpleGrantedAuthority::new)
                .toList();
        var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
        return JwtProvider.generateToken(auth);
    }
}
