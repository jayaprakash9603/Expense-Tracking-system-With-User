package com.jaya.task.user.service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.UserUpdateRequest;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UserControllerTest {

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

    private User testUser;
    private String userToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();

        roleRepository.save(new Role("USER", "Default"));
        roleRepository.save(new Role("ADMIN", "Admin"));

        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        testUser = new User();
        testUser.setEmail("uctest@example.com");
        testUser.setFullName("Test User");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setPassword(encoder.encode("password"));
        testUser.setRoles(new HashSet<>(Set.of("USER")));
        testUser.setCurrentMode("USER");
        testUser = userRepository.save(testUser);

        userToken = generateToken(testUser.getEmail(), "ROLE_USER");
    }

    @Nested
    class GetProfile {

        @Test
        void returnsProfile() throws Exception {
            mockMvc.perform(get("/api/user/profile")
                            .header("Authorization", "Bearer " + userToken))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("uctest@example.com"));
        }
    }

    @Nested
    class GetAllUsers {

        @Test
        void returnsAllUsers() throws Exception {
            mockMvc.perform(get("/api/user/all"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$").isArray())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(1))));
        }
    }

    @Nested
    class UpdateUser {

        @Test
        void updatesUser() throws Exception {
            UserUpdateRequest request = new UserUpdateRequest();
            request.setFullName("Updated Name");

            mockMvc.perform(put("/api/user")
                            .header("Authorization", "Bearer " + userToken)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value("User updated successfully"));
        }
    }

    @Nested
    class SwitchMode {

        @Test
        void rejectsInvalidMode() throws Exception {
            mockMvc.perform(put("/api/user/switch-mode")
                            .header("Authorization", "Bearer " + userToken)
                            .param("mode", "INVALID"))
                    .andExpect(status().isBadRequest());
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
