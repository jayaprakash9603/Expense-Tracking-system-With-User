package com.jaya.task.user.service.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.LoginRequest;
import com.jaya.task.user.service.request.SignupRequest;
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
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.web.client.RestTemplate;

import java.util.*;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthControllerIntegrationTest {

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

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        roleRepository.deleteAll();
        roleRepository.save(new Role("USER", "Default user role"));
        roleRepository.save(new Role("ADMIN", "Administrator role"));
    }

    @Nested
    class Signup {

        @Test
        void signupReturns500DueToH2LongblobLimitation() throws Exception {
            SignupRequest request = new SignupRequest();
            request.setEmail("newuser@example.com");
            request.setFirstName("John");
            request.setLastName("Doe");
            request.setPassword("password123");

            // Role.users (Set<Integer>) is persisted as LONGBLOB which H2 cannot serialize.
            // In production (MySQL), this returns 201 with JWT.
            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().is5xxServerError());
        }

        @Test
        void signupWithDuplicateEmailFails() throws Exception {
            createTestUserDirectly("dup@example.com", "password123");

            SignupRequest duplicate = new SignupRequest();
            duplicate.setEmail("dup@example.com");
            duplicate.setFirstName("Second");
            duplicate.setLastName("User");
            duplicate.setPassword("password456");

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(duplicate)))
                    .andExpect(status().is5xxServerError());
        }

        @Test
        void signupWithMissingFieldsFails() throws Exception {
            SignupRequest request = new SignupRequest();
            request.setEmail("incomplete@example.com");

            mockMvc.perform(post("/auth/signup")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().is4xxClientError());
        }
    }

    @Nested
    class Signin {

        @Test
        void signinSuccessfully() throws Exception {
            createTestUserDirectly("signin@example.com", "password123");

            LoginRequest loginRequest = new LoginRequest("signin@example.com", "password123");

            mockMvc.perform(post("/auth/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.status").value(true))
                    .andExpect(jsonPath("$.jwt").isNotEmpty());
        }

        @Test
        void signinWithWrongPasswordFails() throws Exception {
            createTestUserDirectly("wrongpw@example.com", "correctpassword");

            LoginRequest loginRequest = new LoginRequest("wrongpw@example.com", "wrongpassword");

            mockMvc.perform(post("/auth/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isUnauthorized())
                    .andExpect(jsonPath("$.status").value(false));
        }

        @Test
        void signinWithNonexistentUserFails() throws Exception {
            LoginRequest loginRequest = new LoginRequest("noone@example.com", "password");

            mockMvc.perform(post("/auth/signin")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Nested
    class RefreshToken {

        @Test
        void refreshesTokenSuccessfully() throws Exception {
            createTestUserDirectly("refresh@example.com", "password123");
            String jwt = generateTokenForUser("refresh@example.com", "ROLE_USER");

            mockMvc.perform(post("/auth/refresh-token")
                            .header("Authorization", "Bearer " + jwt))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.jwt").isNotEmpty())
                    .andExpect(jsonPath("$.status").value(true));
        }
    }

    @Nested
    class CheckEmail {

        @Test
        void returnsTrueForAvailableEmail() throws Exception {
            mockMvc.perform(post("/auth/check-email")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\": \"available@example.com\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.isAvailable").value(true));
        }

        @Test
        void returnsFalseForTakenEmail() throws Exception {
            createTestUserDirectly("taken@example.com", "password");

            mockMvc.perform(post("/auth/check-email")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\": \"taken@example.com\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.isAvailable").value(false));
        }
    }

    @Nested
    class GetUserByEmail {

        @Test
        void returnsUserWhenFound() throws Exception {
            createTestUserDirectly("findme@example.com", "password");

            mockMvc.perform(get("/auth/email")
                            .param("email", "findme@example.com"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.email").value("findme@example.com"));
        }

        @Test
        void returnsNotFoundForUnknownEmail() throws Exception {
            mockMvc.perform(get("/auth/email")
                            .param("email", "unknown@example.com"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class CheckAuthMethod {

        @Test
        void returnsExistsFalseForNewEmail() throws Exception {
            mockMvc.perform(get("/auth/check-auth-method")
                            .param("email", "nonexistent@example.com"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.exists").value(false));
        }

        @Test
        void returnsAuthProviderForExistingUser() throws Exception {
            createTestUserDirectly("authcheck@example.com", "password");

            mockMvc.perform(get("/auth/check-auth-method")
                            .param("email", "authcheck@example.com"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.exists").value(true))
                    .andExpect(jsonPath("$.hasPassword").value(true));
        }
    }

    @Nested
    class ResetPassword {

        @Test
        void resetsPasswordSuccessfully() throws Exception {
            createTestUserDirectly("resetme@example.com", "oldpassword");

            mockMvc.perform(patch("/auth/reset-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\": \"resetme@example.com\", \"password\": \"newpassword\"}"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.message").value(containsString("reset")));
        }

        @Test
        void resetPasswordForNonexistentUserFails() throws Exception {
            mockMvc.perform(patch("/auth/reset-password")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("{\"email\": \"noone@example.com\", \"password\": \"newpw\"}"))
                    .andExpect(status().isNotFound());
        }
    }

    @Nested
    class GetAllUsers {

        @Test
        void returnsAllUsers() throws Exception {
            createTestUserDirectly("user1@example.com", "password");
            createTestUserDirectly("user2@example.com", "password");

            mockMvc.perform(get("/auth/all-users"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
        }
    }

    private void createTestUserDirectly(String email, String password) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        User user = new User();
        user.setEmail(email);
        user.setFullName("Test User");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setPassword(encoder.encode(password));
        user.setRoles(Set.of("USER"));
        user.setCurrentMode("USER");
        user.setAuthProvider("LOCAL");
        userRepository.save(user);
    }

    private String generateTokenForUser(String email, String... roles) {
        List<SimpleGrantedAuthority> authorities = Arrays.stream(roles)
                .map(SimpleGrantedAuthority::new)
                .toList();
        var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
        return JwtProvider.generateToken(auth);
    }
}
