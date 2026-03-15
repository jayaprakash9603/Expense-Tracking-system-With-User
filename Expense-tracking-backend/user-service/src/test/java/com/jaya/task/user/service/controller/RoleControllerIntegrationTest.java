package com.jaya.task.user.service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.RoleRequest;
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
class RoleControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

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
        admin.setEmail("admin@test.com");
        admin.setFullName("Admin");
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setPassword(encoder.encode("password"));
        admin.setRoles(Set.of("USER", "ADMIN"));
        admin.setCurrentMode("ADMIN");
        userRepository.save(admin);

        User regularUser = new User();
        regularUser.setEmail("user@test.com");
        regularUser.setFullName("Regular User");
        regularUser.setFirstName("Regular");
        regularUser.setLastName("User");
        regularUser.setPassword(encoder.encode("password"));
        regularUser.setRoles(Set.of("USER"));
        regularUser.setCurrentMode("USER");
        userRepository.save(regularUser);

        adminToken = generateToken("admin@test.com", "ROLE_USER", "ROLE_ADMIN");
        userToken = generateToken("user@test.com", "ROLE_USER");
    }

    @Nested
    class CreateRole {

        @Test
        void adminCreatesRoleSuccessfully() throws Exception {
            RoleRequest request = new RoleRequest();
            request.setName("MODERATOR");
            request.setDescription("Moderator role");

            mockMvc.perform(post("/api/roles")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("MODERATOR"));
        }

        @Test
        void duplicateRoleReturnsConflict() throws Exception {
            RoleRequest request = new RoleRequest();
            request.setName("USER");
            request.setDescription("Already exists");

            mockMvc.perform(post("/api/roles")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }

        @Test
        void nonAdminCannotCreateRole() throws Exception {
            RoleRequest request = new RoleRequest();
            request.setName("NEWROLE");
            request.setDescription("desc");

            mockMvc.perform(post("/api/roles")
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().is5xxServerError());
        }
    }

    @Nested
    class GetAllRoles {

        @Test
        void adminGetsAllRoles() throws Exception {
            mockMvc.perform(get("/api/roles")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
        }

        @Test
        void nonAdminCannotGetRoles() throws Exception {
            mockMvc.perform(get("/api/roles")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().is5xxServerError());
        }
    }

    @Nested
    class GetRoleById {

        @Test
        void adminGetsRoleById() throws Exception {
            Role role = roleRepository.findByName("USER").orElseThrow();

            mockMvc.perform(get("/api/roles/" + role.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("USER"));
        }

        @Test
        void returnsNotFoundForNonexistentRole() throws Exception {
            mockMvc.perform(get("/api/roles/9999")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class GetRoleByName {

        @Test
        void findsRoleByName() throws Exception {
            mockMvc.perform(get("/api/roles/name/ADMIN")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("ADMIN"));
        }

        @Test
        void returnsNotFoundForUnknownName() throws Exception {
            mockMvc.perform(get("/api/roles/name/SUPERADMIN")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class UpdateRole {

        @Test
        void adminUpdatesRole() throws Exception {
            Role role = roleRepository.findByName("USER").orElseThrow();

            RoleRequest request = new RoleRequest();
            request.setName("USER");
            request.setDescription("Updated description");

            mockMvc.perform(put("/api/roles/" + role.getId())
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }

    @Nested
    class DeleteRole {

        @Test
        void adminDeletesRole() throws Exception {
            Role toDelete = roleRepository.save(new Role("TEMP", "Temporary"));

            mockMvc.perform(delete("/api/roles/" + toDelete.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNoContent());
        }

        @Test
        void deleteNonexistentRoleReturnsNotFound() throws Exception {
            mockMvc.perform(delete("/api/roles/9999")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNotFound());
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
