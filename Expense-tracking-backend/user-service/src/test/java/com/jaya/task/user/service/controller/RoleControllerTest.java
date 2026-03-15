package com.jaya.task.user.service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.RoleRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoleControllerTest {

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

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();

        roleRepository.save(new Role("USER", "Default"));
        roleRepository.save(new Role("ADMIN", "Admin"));

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User admin = new User();
        admin.setEmail("roletest-admin@test.com");
        admin.setFullName("Admin");
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setPassword(encoder.encode("password"));
        admin.setRoles(Set.of("USER", "ADMIN"));
        admin.setCurrentMode("ADMIN");
        userRepository.save(admin);

        adminToken = generateToken("roletest-admin@test.com", "ROLE_USER", "ROLE_ADMIN");
    }

    @Nested
    class CreateRole {

        @Test
        void createsRoleSuccessfully() throws Exception {
            RoleRequest request = new RoleRequest();
            request.setName("MODERATOR");
            request.setDescription("Mod role");

            mockMvc.perform(post("/api/roles")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.name").value("MODERATOR"));
        }

        @Test
        void returnsConflictOnDuplicate() throws Exception {
            RoleRequest request = new RoleRequest();
            request.setName("USER");
            request.setDescription("Already exists");

            mockMvc.perform(post("/api/roles")
                            .header("Authorization", "Bearer " + adminToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isConflict());
        }
    }

    @Nested
    class GetAllRoles {

        @Test
        void returnsAllRoles() throws Exception {
            mockMvc.perform(get("/api/roles")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray());
        }
    }

    @Nested
    class GetRoleById {

        @Test
        void returnsRoleWhenFound() throws Exception {
            Role role = roleRepository.findByName("USER").orElseThrow();

            mockMvc.perform(get("/api/roles/" + role.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("USER"));
        }

        @Test
        void returnsNotFoundWhenMissing() throws Exception {
            mockMvc.perform(get("/api/roles/9999")
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class DeleteRole {

        @Test
        void deletesSuccessfully() throws Exception {
            Role toDelete = roleRepository.save(new Role("TEMP", "Temp role"));

            mockMvc.perform(delete("/api/roles/" + toDelete.getId())
                            .header("Authorization", "Bearer " + adminToken))
                    .andExpect(status().isNoContent());
        }

        @Test
        void returnsNotFoundForMissing() throws Exception {
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
