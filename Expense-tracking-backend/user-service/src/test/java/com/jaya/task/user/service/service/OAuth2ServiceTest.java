package com.jaya.task.user.service.service;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.GoogleAuthRequest;
import com.jaya.task.user.service.response.AuthResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OAuth2ServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private CustomUserServiceImplementation customUserService;

    @InjectMocks
    private OAuth2Service oAuth2Service;

    private GoogleAuthRequest googleRequest;

    @BeforeEach
    void setUp() {
        googleRequest = new GoogleAuthRequest();
        googleRequest.setEmail("google@example.com");
        googleRequest.setName("Google User");
        googleRequest.setGivenName("Google");
        googleRequest.setFamilyName("User");
        googleRequest.setSub("google-sub-123");
        googleRequest.setPicture("https://example.com/photo.jpg");
    }

    @Nested
    class AuthenticateWithGoogle {

        @Test
        void createsNewUserForFirstTimeLogin() {
            when(userRepository.findByEmail("google@example.com")).thenReturn(null);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(1);
                return u;
            });

            UserDetails mockUserDetails = org.springframework.security.core.userdetails.User
                    .withUsername("google@example.com")
                    .password("")
                    .authorities("ROLE_USER")
                    .build();
            when(customUserService.loadUserByUsername("google@example.com")).thenReturn(mockUserDetails);

            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.generateToken(any())).thenReturn("test-jwt-token");

                AuthResponse response = oAuth2Service.authenticateWithGoogle(googleRequest);

                assertThat(response.isStatus()).isTrue();
                assertThat(response.getJwt()).isEqualTo("test-jwt-token");
                verify(userRepository).save(any(User.class));
            }
        }

        @Test
        void linksGoogleToExistingLocalUser() {
            User existingUser = new User();
            existingUser.setId(1);
            existingUser.setEmail("google@example.com");
            existingUser.setAuthProvider("LOCAL");
            existingUser.setRoles(new HashSet<>(Set.of("USER")));

            when(userRepository.findByEmail("google@example.com")).thenReturn(existingUser);
            when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

            UserDetails mockUserDetails = org.springframework.security.core.userdetails.User
                    .withUsername("google@example.com")
                    .password("")
                    .authorities("ROLE_USER")
                    .build();
            when(customUserService.loadUserByUsername("google@example.com")).thenReturn(mockUserDetails);

            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.generateToken(any())).thenReturn("test-jwt");

                AuthResponse response = oAuth2Service.authenticateWithGoogle(googleRequest);

                assertThat(response.isStatus()).isTrue();
                verify(userRepository).save(argThat(u -> "GOOGLE".equals(u.getAuthProvider())));
            }
        }

        @Test
        void returnsExistingGoogleUserWithoutUpdate() {
            User existingGoogleUser = new User();
            existingGoogleUser.setId(1);
            existingGoogleUser.setEmail("google@example.com");
            existingGoogleUser.setAuthProvider("GOOGLE");
            existingGoogleUser.setProviderId("google-sub-123");
            existingGoogleUser.setRoles(new HashSet<>(Set.of("USER")));

            when(userRepository.findByEmail("google@example.com")).thenReturn(existingGoogleUser);

            UserDetails mockUserDetails = org.springframework.security.core.userdetails.User
                    .withUsername("google@example.com")
                    .password("")
                    .authorities("ROLE_USER")
                    .build();
            when(customUserService.loadUserByUsername("google@example.com")).thenReturn(mockUserDetails);

            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.generateToken(any())).thenReturn("test-jwt");

                AuthResponse response = oAuth2Service.authenticateWithGoogle(googleRequest);

                assertThat(response.isStatus()).isTrue();
            }
        }

        @Test
        void returnsFailureWhenEmailIsNull() {
            googleRequest.setEmail(null);

            AuthResponse response = oAuth2Service.authenticateWithGoogle(googleRequest);

            assertThat(response.isStatus()).isFalse();
            assertThat(response.getMessage()).contains("Email");
        }

        @Test
        void returnsFailureWhenEmailIsEmpty() {
            googleRequest.setEmail("");

            AuthResponse response = oAuth2Service.authenticateWithGoogle(googleRequest);

            assertThat(response.isStatus()).isFalse();
        }
    }

    @Nested
    class CanAuthenticateWithGoogle {

        @Test
        void returnsTrueForNewUser() {
            when(userRepository.findByEmail("new@example.com")).thenReturn(null);

            assertThat(oAuth2Service.canAuthenticateWithGoogle("new@example.com")).isTrue();
        }

        @Test
        void returnsTrueForExistingUser() {
            User user = new User();
            user.setEmail("existing@example.com");
            when(userRepository.findByEmail("existing@example.com")).thenReturn(user);

            assertThat(oAuth2Service.canAuthenticateWithGoogle("existing@example.com")).isTrue();
        }
    }
}
