package com.jaya.task.user.service.service;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.exceptions.UserAlreadyExistsException;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.SignupRequest;
import com.jaya.task.user.service.request.UserUpdateRequest;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplementationTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EntityManager entityManager;

    @InjectMocks
    private UserServiceImplementation userService;

    private User testUser;
    private Role userRole;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setEmail("test@example.com");
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setFullName("John Doe");
        testUser.setPassword("encoded_password");
        testUser.setRoles(new HashSet<>(Set.of("USER")));
        testUser.setCurrentMode("USER");
        testUser.setCreatedAt(LocalDateTime.now());
        testUser.setUpdatedAt(LocalDateTime.now());

        userRole = new Role("USER", "Default user role");
        userRole.setId(1);
    }

    @Nested
    class GetUserProfile {

        @Test
        void returnsUserWhenValidJwt() {
            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("Bearer token"))
                        .thenReturn("test@example.com");
                when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

                User result = userService.getUserProfile("Bearer token");

                assertThat(result).isNotNull();
                assertThat(result.getEmail()).isEqualTo("test@example.com");
            }
        }

        @Test
        void setsDefaultModeWhenCurrentModeIsNull() {
            testUser.setCurrentMode(null);
            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("test@example.com");
                when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);
                when(userRepository.save(any(User.class))).thenReturn(testUser);

                User result = userService.getUserProfile("token");

                assertThat(result.getCurrentMode()).isEqualTo("USER");
                verify(userRepository).save(any(User.class));
            }
        }

        @Test
        void setsDefaultModeWhenCurrentModeIsEmpty() {
            testUser.setCurrentMode("  ");
            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("test@example.com");
                when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);
                when(userRepository.save(any(User.class))).thenReturn(testUser);

                userService.getUserProfile("token");

                verify(userRepository).save(any(User.class));
            }
        }

        @Test
        void returnsNullWhenUserNotFound() {
            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("unknown@example.com");
                when(userRepository.findByEmail("unknown@example.com")).thenReturn(null);

                User result = userService.getUserProfile("token");

                assertThat(result).isNull();
            }
        }
    }

    @Nested
    class GetAllUsers {

        @Test
        void returnsAllUsers() {
            List<User> users = List.of(testUser);
            when(userRepository.findAll()).thenReturn(users);

            List<User> result = userService.getAllUsers();

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getEmail()).isEqualTo("test@example.com");
        }

        @Test
        void returnsEmptyListWhenNoUsers() {
            when(userRepository.findAll()).thenReturn(List.of());

            List<User> result = userService.getAllUsers();

            assertThat(result).isEmpty();
        }
    }

    @Nested
    class GetUserByEmail {

        @Test
        void returnsUserWhenFound() {
            when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

            User result = userService.getUserByEmail("test@example.com");

            assertThat(result).isNotNull();
            assertThat(result.getEmail()).isEqualTo("test@example.com");
        }

        @Test
        void returnsNullWhenNotFound() {
            when(userRepository.findByEmail("unknown@example.com")).thenReturn(null);

            User result = userService.getUserByEmail("unknown@example.com");

            assertThat(result).isNull();
        }
    }

    @Nested
    class UpdateUserProfile {

        @Test
        void updatesOwnProfile() {
            UserUpdateRequest request = new UserUpdateRequest();
            request.setFullName("Updated Name");

            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("test@example.com");
                when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);
                when(userRepository.save(any(User.class))).thenReturn(testUser);

                User result = userService.updateUserProfile("token", request);

                assertThat(result).isNotNull();
                verify(userRepository).save(any(User.class));
            }
        }

        @Test
        void throwsWhenUserNotFound() {
            UserUpdateRequest request = new UserUpdateRequest();

            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("unknown@example.com");
                when(userRepository.findByEmail("unknown@example.com")).thenReturn(null);

                assertThatThrownBy(() -> userService.updateUserProfile("token", request))
                        .isInstanceOf(RuntimeException.class)
                        .hasMessageContaining("User not found");
            }
        }

        @Test
        void adminCanUpdateOtherUserProfile() {
            User adminUser = new User();
            adminUser.setId(2);
            adminUser.setEmail("admin@example.com");
            adminUser.setRoles(new HashSet<>(Set.of("ADMIN")));
            adminUser.setCurrentMode("ADMIN");

            UserUpdateRequest request = new UserUpdateRequest();
            request.setEmail("test@example.com");
            request.setFullName("Admin Updated");

            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("admin-token"))
                        .thenReturn("admin@example.com");
                when(userRepository.findByEmail("admin@example.com")).thenReturn(adminUser);
                when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);
                when(userRepository.save(any(User.class))).thenReturn(testUser);

                User result = userService.updateUserProfile("admin-token", request);

                assertThat(result).isNotNull();
            }
        }

        @Test
        void nonAdminCannotUpdateOtherProfile() {
            UserUpdateRequest request = new UserUpdateRequest();
            request.setEmail("other@example.com");

            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("test@example.com");
                when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

                assertThatThrownBy(() -> userService.updateUserProfile("token", request))
                        .isInstanceOf(RuntimeException.class);
            }
        }

        @Test
        void updatesRolesWhenAdminAndRolesProvided() {
            User adminUser = new User();
            adminUser.setId(2);
            adminUser.setEmail("admin@example.com");
            adminUser.setRoles(new HashSet<>(Set.of("ADMIN")));

            UserUpdateRequest request = new UserUpdateRequest();
            request.setRoleNames(List.of("USER", "ADMIN"));

            when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(userRole));
            Role adminRole = new Role("ROLE_ADMIN", "Admin");
            when(roleRepository.findByName("ROLE_ADMIN")).thenReturn(Optional.of(adminRole));

            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("admin-token"))
                        .thenReturn("admin@example.com");
                when(userRepository.findByEmail("admin@example.com")).thenReturn(adminUser);
                when(userRepository.save(any(User.class))).thenReturn(adminUser);

                userService.updateUserProfile("admin-token", request);

                verify(userRepository).save(any(User.class));
            }
        }
    }

    @Nested
    class DeleteUser {

        @Test
        void deletesExistingUser() throws Exception {
            when(userRepository.findById(1)).thenReturn(Optional.of(testUser));

            userService.deleteUser(1);

            verify(userRepository).deleteById(1);
        }

        @Test
        void throwsWhenUserNotFound() {
            when(userRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.deleteUser(99))
                    .isInstanceOf(UsernameNotFoundException.class);
        }
    }

    @Nested
    class CheckEmailAvailability {

        @Test
        void returnsTrueWhenEmailNotTaken() {
            when(userRepository.existsByEmail("new@example.com")).thenReturn(false);

            assertThat(userService.checkEmailAvailability("new@example.com")).isTrue();
        }

        @Test
        void returnsFalseWhenEmailTaken() {
            when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

            assertThat(userService.checkEmailAvailability("test@example.com")).isFalse();
        }
    }

    @Nested
    class Signup {

        @Test
        void createsNewUserSuccessfully() {
            SignupRequest request = new SignupRequest();
            request.setEmail("new@example.com");
            request.setFirstName("Jane");
            request.setLastName("Doe");
            request.setPassword("password123");

            when(userRepository.findByEmail("new@example.com")).thenReturn(null);
            when(passwordEncoder.encode("password123")).thenReturn("encoded");
            when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(10);
                return u;
            });
            when(roleRepository.save(any(Role.class))).thenAnswer(inv -> inv.getArgument(0));

            User result = userService.signup(request);

            assertThat(result).isNotNull();
            assertThat(result.getEmail()).isEqualTo("new@example.com");
            assertThat(result.getFullName()).isEqualTo("Jane Doe");
            verify(userRepository).save(any(User.class));
        }

        @Test
        void throwsWhenEmailAlreadyExists() {
            SignupRequest request = new SignupRequest();
            request.setEmail("test@example.com");
            request.setFirstName("John");
            request.setLastName("Doe");
            request.setPassword("password");

            when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

            assertThatThrownBy(() -> userService.signup(request))
                    .isInstanceOf(UserAlreadyExistsException.class);
        }

        @Test
        void throwsWhenRequestIsNull() {
            assertThatThrownBy(() -> userService.signup(null))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("null");
        }

        @Test
        void throwsWhenEmailIsMissing() {
            SignupRequest request = new SignupRequest();
            request.setFirstName("John");
            request.setLastName("Doe");
            request.setPassword("password");

            assertThatThrownBy(() -> userService.signup(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Email");
        }

        @Test
        void throwsWhenPasswordIsMissing() {
            SignupRequest request = new SignupRequest();
            request.setEmail("new@example.com");
            request.setFirstName("John");
            request.setLastName("Doe");

            assertThatThrownBy(() -> userService.signup(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("Password");
        }

        @Test
        void assignsDefaultUserRoleWhenNoRolesSpecified() {
            SignupRequest request = new SignupRequest();
            request.setEmail("new@example.com");
            request.setFirstName("Jane");
            request.setLastName("Doe");
            request.setPassword("password");

            when(userRepository.findByEmail("new@example.com")).thenReturn(null);
            when(passwordEncoder.encode("password")).thenReturn("encoded");
            when(roleRepository.findByName("USER")).thenReturn(Optional.of(userRole));
            when(userRepository.save(any(User.class))).thenAnswer(inv -> {
                User u = inv.getArgument(0);
                u.setId(10);
                return u;
            });
            when(roleRepository.save(any(Role.class))).thenAnswer(inv -> inv.getArgument(0));

            User result = userService.signup(request);

            assertThat(result.getRoles()).contains("USER");
        }

        @Test
        void throwsForInvalidRoleDuringSignup() {
            SignupRequest request = new SignupRequest();
            request.setEmail("new@example.com");
            request.setFirstName("Jane");
            request.setLastName("Doe");
            request.setPassword("password");
            request.setRoles(Set.of("SUPERADMIN"));

            when(userRepository.findByEmail("new@example.com")).thenReturn(null);
            when(passwordEncoder.encode("password")).thenReturn("encoded");

            assertThatThrownBy(() -> userService.signup(request))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("Invalid role");
        }
    }

    @Nested
    class SwitchUserMode {

        @Test
        void switchesToAdminModeForAdminUser() {
            testUser.setRoles(new HashSet<>(Set.of("ADMIN")));

            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("test@example.com");
                when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);
                when(userRepository.updateCurrentMode(eq(1), eq("ADMIN"), any(LocalDateTime.class)))
                        .thenReturn(1);

                User result = userService.switchUserMode("token", "ADMIN");

                assertThat(result.getCurrentMode()).isEqualTo("ADMIN");
            }
        }

        @Test
        void throwsWhenNonAdminTriesAdminMode() {
            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("test@example.com");
                when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

                assertThatThrownBy(() -> userService.switchUserMode("token", "ADMIN"))
                        .isInstanceOf(RuntimeException.class)
                        .hasMessageContaining("ADMIN role");
            }
        }

        @Test
        void throwsForInvalidMode() {
            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("test@example.com");
                when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

                assertThatThrownBy(() -> userService.switchUserMode("token", "SUPERUSER"))
                        .isInstanceOf(IllegalArgumentException.class);
            }
        }

        @Test
        void throwsWhenUserNotFound() {
            try (MockedStatic<JwtProvider> jwt = mockStatic(JwtProvider.class)) {
                jwt.when(() -> JwtProvider.getEmailFromJwt("token"))
                        .thenReturn("unknown@example.com");
                when(userRepository.findByEmail("unknown@example.com")).thenReturn(null);

                assertThatThrownBy(() -> userService.switchUserMode("token", "USER"))
                        .isInstanceOf(RuntimeException.class);
            }
        }
    }

    @Nested
    class UpdatePassword {

        @Test
        void encodesAndSavesNewPassword() {
            when(passwordEncoder.encode("newpassword")).thenReturn("encoded_new");
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            userService.updatePassword(testUser, "newpassword");

            verify(passwordEncoder).encode("newpassword");
            verify(userRepository).save(testUser);
        }
    }

    @Nested
    class FindByEmail {

        @Test
        void delegatesToRepository() {
            when(userRepository.findByEmail("test@example.com")).thenReturn(testUser);

            User result = userService.findByEmail("test@example.com");

            assertThat(result).isEqualTo(testUser);
        }
    }
}
