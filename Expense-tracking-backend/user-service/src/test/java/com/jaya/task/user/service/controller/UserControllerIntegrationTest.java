package com.jaya.task.user.service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.SignupRequest;
import com.jaya.task.user.service.request.UserUpdateRequest;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.client.RestTemplate;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerIntegrationTest {

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

    private String userToken;
    private String adminToken;
    private User testUser;
    private User adminUser;

    @BeforeEach
    void setUp() throws Exception {
        userRepository.deleteAll();
        roleRepository.deleteAll();

        Role userRole = roleRepository.save(new Role("USER", "Default user role"));
        Role adminRole = roleRepository.save(new Role("ADMIN", "Administrator role"));

        testUser = createUserDirectly("user@example.com", "password", Set.of("USER"));
        userToken = generateTokenForUser(testUser.getEmail(), "ROLE_USER");

        adminUser = createUserDirectly("admin@example.com", "password", Set.of("USER", "ADMIN"));
        adminToken = generateTokenForUser(adminUser.getEmail(), "ROLE_USER", "ROLE_ADMIN");
    }

    @Nested
    class GetProfile {

        @Test
        void returnsProfileForAuthenticatedUser() throws Exception {
            mockMvc.perform(get("/api/user/profile")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("user@example.com"));
        }

        @Test
        void rejectsUnauthenticatedRequest() throws Exception {
            mockMvc.perform(get("/api/user/profile"))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    class GetAllUsers {

        @Test
        void returnsListOfUsers() throws Exception {
            mockMvc.perform(get("/api/user/all"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
        }
    }

    @Nested
    class GetUserById {

        @Test
        void userCanAccessOwnProfile() throws Exception {
            mockMvc.perform(get("/api/user/" + testUser.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk());
        }

        @Test
        void adminCanAccessAnyProfile() throws Exception {
            mockMvc.perform(get("/api/user/" + testUser.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk());
        }

        @Test
        void userCannotAccessOtherProfile() throws Exception {
            mockMvc.perform(get("/api/user/" + adminUser.getId())
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    class UpdateUser {

        @Test
        void updatesOwnProfile() throws Exception {
            UserUpdateRequest updateRequest = new UserUpdateRequest();
            updateRequest.setFullName("Updated Name");
            updateRequest.setBio("New bio");

            mockMvc.perform(put("/api/user")
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(updateRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("User updated successfully"));
        }
    }

    @Nested
    class DeleteUser {

        @Test
        void userCanDeleteOwnAccount() throws Exception {
            User toDelete = createUserDirectly("deleteme@example.com", "pass", Set.of("USER"));
            String token = generateTokenForUser(toDelete.getEmail(), "ROLE_USER");

            mockMvc.perform(delete("/api/user/" + toDelete.getId())
                            .header("Authorization", "Bearer " + token))
                    .andExpect(status().isOk())
                    .andExpect(content().string(containsString("deleted")));
        }

        @Test
        void adminCanDeleteAnyUser() throws Exception {
            User toDelete = createUserDirectly("admindelete@example.com", "pass", Set.of("USER"));

            mockMvc.perform(delete("/api/user/" + toDelete.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk());
        }

        @Test
        void returnsNotFoundForNonexistentUser() throws Exception {
            mockMvc.perform(delete("/api/user/9999")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class SwitchMode {

        @Test
        void adminCanSwitchToAdminMode() throws Exception {
            mockMvc.perform(put("/api/user/switch-mode")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("mode", "ADMIN"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.currentMode").value("ADMIN"));
        }

        @Test
        void nonAdminCannotSwitchToAdminMode() throws Exception {
            mockMvc.perform(put("/api/user/switch-mode")
                            .header("Authorization", "Bearer " + userToken)
                            .param("mode", "ADMIN"))
                    .andExpect(status().is5xxServerError());
        }

        @Test
        void rejectsInvalidMode() throws Exception {
            mockMvc.perform(put("/api/user/switch-mode")
                            .header("Authorization", "Bearer " + adminToken)
                            .param("mode", "SUPERUSER"))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class AddRoleToUser {

        @Test
        void returnsConflictWhenUserAlreadyHasRole() throws Exception {
            Role userRole = roleRepository.findByName("USER").orElseThrow();

            mockMvc.perform(post("/api/user/" + testUser.getId() + "/roles/" + userRole.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    class RemoveRoleFromUser {

        @Test
        void preventRemovingLastRole() throws Exception {
            Role userRole = roleRepository.findByName("USER").orElseThrow();

            mockMvc.perform(delete("/api/user/" + testUser.getId() + "/roles/" + userRole.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    class GetUserByEmail {

        @Test
        void returnsUserWhenFound() throws Exception {
            mockMvc.perform(get("/api/user/email")
                            .header("Authorization", "Bearer " + userToken)
                            .param("email", "user@example.com"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("user@example.com"));
        }

        @Test
        void returnsNotFoundForUnknownEmail() throws Exception {
            mockMvc.perform(get("/api/user/email")
                            .header("Authorization", "Bearer " + userToken)
                            .param("email", "unknown@example.com"))
                    .andExpect(status().isNotFound());
        }
    }

    private User createUserDirectly(String email, String password, Set<String> roles) {
        org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder encoder =
                new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();

        User user = new User();
        user.setEmail(email);
        user.setFullName("Test User");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPassword(encoder.encode(password));
        user.setRoles(roles);
        user.setCurrentMode("USER");
        return userRepository.save(user);
    }

    private String generateTokenForUser(String email, String... roles) {
        List<SimpleGrantedAuthority> authorities = Arrays.stream(roles)
                .map(SimpleGrantedAuthority::new)
                .toList();
        var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
        return JwtProvider.generateToken(auth);
    }
}
