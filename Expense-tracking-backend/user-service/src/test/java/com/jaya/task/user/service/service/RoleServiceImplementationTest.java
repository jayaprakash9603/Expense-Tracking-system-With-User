package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.repository.RoleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoleServiceImplementationTest {

    @Mock
    private RoleRepository roleRepository;

    @InjectMocks
    private RoleServiceImplementation roleService;

    private Role adminRole;
    private Role userRole;

    @BeforeEach
    void setUp() {
        adminRole = new Role("ADMIN", "Administrator");
        adminRole.setId(1);

        userRole = new Role("USER", "Default user role");
        userRole.setId(2);
    }

    @Nested
    class CreateRole {

        @Test
        void createsRoleSuccessfully() {
            Role newRole = new Role("MODERATOR", "Moderator role");
            when(roleRepository.existsByName("MODERATOR")).thenReturn(false);
            when(roleRepository.save(any(Role.class))).thenAnswer(inv -> {
                Role r = inv.getArgument(0);
                r.setId(3);
                return r;
            });

            Role result = roleService.createRole(newRole);

            assertThat(result.getName()).isEqualTo("MODERATOR");
            verify(roleRepository).save(any(Role.class));
        }

        @Test
        void throwsWhenRoleNameAlreadyExists() {
            Role duplicate = new Role("ADMIN", "Duplicate");
            when(roleRepository.existsByName("ADMIN")).thenReturn(true);

            assertThatThrownBy(() -> roleService.createRole(duplicate))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("already exists");
        }

        @Test
        void throwsWhenRoleNameIsBlank() {
            Role blank = new Role("", "No name");

            assertThatThrownBy(() -> roleService.createRole(blank))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("required");
        }

        @Test
        void throwsWhenRoleIsNull() {
            assertThatThrownBy(() -> roleService.createRole(null))
                    .isInstanceOf(RuntimeException.class);
        }
    }

    @Nested
    class GetAllRoles {

        @Test
        void returnsAllRoles() {
            when(roleRepository.findAll()).thenReturn(List.of(adminRole, userRole));

            List<Role> result = roleService.getAllRoles();

            assertThat(result).hasSize(2);
        }
    }

    @Nested
    class GetRoleById {

        @Test
        void returnsRoleWhenFound() {
            when(roleRepository.findById(1)).thenReturn(Optional.of(adminRole));

            Optional<Role> result = roleService.getRoleById(1);

            assertThat(result).isPresent();
            assertThat(result.get().getName()).isEqualTo("ADMIN");
        }

        @Test
        void returnsEmptyWhenNotFound() {
            when(roleRepository.findById(99)).thenReturn(Optional.empty());

            Optional<Role> result = roleService.getRoleById(99);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    class GetRoleByName {

        @Test
        void returnsRoleWhenFound() {
            when(roleRepository.findByName("ADMIN")).thenReturn(Optional.of(adminRole));

            Optional<Role> result = roleService.getRoleByName("ADMIN");

            assertThat(result).isPresent();
        }

        @Test
        void returnsEmptyForBlankName() {
            Optional<Role> result = roleService.getRoleByName("");

            assertThat(result).isEmpty();
        }

        @Test
        void returnsEmptyForNullName() {
            Optional<Role> result = roleService.getRoleByName(null);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    class UpdateRole {

        @Test
        void updatesRoleSuccessfully() {
            Role update = new Role("SUPERADMIN", "Super admin");
            when(roleRepository.findById(1)).thenReturn(Optional.of(adminRole));
            when(roleRepository.findByName("SUPERADMIN")).thenReturn(Optional.empty());
            when(roleRepository.save(any(Role.class))).thenAnswer(inv -> inv.getArgument(0));

            Role result = roleService.updateRole(1, update);

            assertThat(result.getName()).isEqualTo("SUPERADMIN");
        }

        @Test
        void throwsWhenRoleNotFound() {
            when(roleRepository.findById(99)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> roleService.updateRole(99, new Role("X", "X")))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        }

        @Test
        void throwsWhenNewNameConflicts() {
            Role otherRole = new Role("USER", "Existing");
            otherRole.setId(2);

            when(roleRepository.findById(1)).thenReturn(Optional.of(adminRole));
            when(roleRepository.findByName("USER")).thenReturn(Optional.of(otherRole));

            assertThatThrownBy(() -> roleService.updateRole(1, new Role("USER", "conflict")))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("already exists");
        }

        @Test
        void throwsWhenIdIsNull() {
            assertThatThrownBy(() -> roleService.updateRole(null, new Role("X", "X")))
                    .isInstanceOf(RuntimeException.class);
        }

        @Test
        void returnsExistingWhenUpdateIsNull() {
            when(roleRepository.findById(1)).thenReturn(Optional.of(adminRole));

            Role result = roleService.updateRole(1, null);

            assertThat(result.getName()).isEqualTo("ADMIN");
        }
    }

    @Nested
    class DeleteRole {

        @Test
        void deletesExistingRole() {
            when(roleRepository.existsById(1)).thenReturn(true);

            roleService.deleteRole(1);

            verify(roleRepository).deleteById(1);
        }

        @Test
        void throwsWhenRoleNotFound() {
            when(roleRepository.existsById(99)).thenReturn(false);

            assertThatThrownBy(() -> roleService.deleteRole(99))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        }
    }

    @Nested
    class ExistsByName {

        @Test
        void returnsTrueWhenExists() {
            when(roleRepository.existsByName("ADMIN")).thenReturn(true);

            assertThat(roleService.existsByName("ADMIN")).isTrue();
        }

        @Test
        void returnsFalseWhenNotExists() {
            when(roleRepository.existsByName("SUPERADMIN")).thenReturn(false);

            assertThat(roleService.existsByName("SUPERADMIN")).isFalse();
        }

        @Test
        void returnsFalseForBlankName() {
            assertThat(roleService.existsByName("")).isFalse();
        }
    }
}
