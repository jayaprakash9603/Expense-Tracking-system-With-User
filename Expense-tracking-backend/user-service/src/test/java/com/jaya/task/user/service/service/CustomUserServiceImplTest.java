package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CustomUserServiceImplementation customUserService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setEmail("test@example.com");
        testUser.setPassword("encoded_password");
        testUser.setRoles(new HashSet<>(Set.of("USER", "ADMIN")));
    }

    @Test
    void loadsUserWithMultipleRoles() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

        UserDetails details = customUserService.loadUserByUsername("test@example.com");

        assertThat(details.getUsername()).isEqualTo("test@example.com");
        assertThat(details.getPassword()).isEqualTo("encoded_password");
        assertThat(details.getAuthorities()).hasSizeGreaterThanOrEqualTo(2);
    }

    @Test
    void loadsUserWithNoRolesAssignsDefaultUserRole() {
        testUser.setRoles(new HashSet<>());
        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

        UserDetails details = customUserService.loadUserByUsername("test@example.com");

        assertThat(details.getAuthorities())
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_USER"));
    }

    @Test
    void loadsUserWithNullRolesAssignsDefaultUserRole() {
        testUser.setRoles(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

        UserDetails details = customUserService.loadUserByUsername("test@example.com");

        assertThat(details.getAuthorities())
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_USER"));
    }

    @Test
    void throwsWhenUserNotFound() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(null);

        assertThatThrownBy(() -> customUserService.loadUserByUsername("unknown@example.com"))
                .isInstanceOf(UsernameNotFoundException.class);
    }

    @Test
    void handlesNullPassword() {
        testUser.setPassword(null);
        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

        UserDetails details = customUserService.loadUserByUsername("test@example.com");

        assertThat(details.getPassword()).isEmpty();
    }

    @Test
    void normalizesRoleNamesWithPrefix() {
        testUser.setRoles(new HashSet<>(Set.of("user")));
        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

        UserDetails details = customUserService.loadUserByUsername("test@example.com");

        assertThat(details.getAuthorities())
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_USER"));
    }

    @Test
    void doesNotDuplicateRolePrefix() {
        testUser.setRoles(new HashSet<>(Set.of("ROLE_ADMIN")));
        when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

        UserDetails details = customUserService.loadUserByUsername("test@example.com");

        assertThat(details.getAuthorities())
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }
}
