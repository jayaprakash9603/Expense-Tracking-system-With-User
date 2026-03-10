package com.jaya.task.user.service.mapper;

import com.jaya.common.dto.UserDTO;
import com.jaya.task.user.service.modal.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;

class UserMapperTest {

    private UserMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new UserMapper();
    }

    @Nested
    class ToDTO {

        @Test
        void mapsAllFields() {
            User user = new User();
            user.setId(1);
            user.setEmail("test@example.com");
            user.setFirstName("John");
            user.setLastName("Doe");
            user.setRoles(new HashSet<>(Set.of("USER")));
            user.setCurrentMode("USER");
            user.setCreatedAt(LocalDateTime.of(2025, 1, 1, 0, 0));
            user.setUpdatedAt(LocalDateTime.of(2025, 6, 1, 0, 0));

            UserDTO dto = mapper.toDTO(user);

            assertThat(dto.getId()).isEqualTo(1);
            assertThat(dto.getEmail()).isEqualTo("test@example.com");
            assertThat(dto.getFirstName()).isEqualTo("John");
            assertThat(dto.getLastName()).isEqualTo("Doe");
            assertThat(dto.getRoles()).contains("USER");
            assertThat(dto.getCurrentMode()).isEqualTo("USER");
            assertThat(dto.getCreatedAt()).isEqualTo(LocalDateTime.of(2025, 1, 1, 0, 0));
        }

        @Test
        void returnsNullForNullUser() {
            UserDTO dto = mapper.toDTO(null);

            assertThat(dto).isNull();
        }
    }

    @Nested
    class ToEntity {

        @Test
        void mapsBasicFields() {
            UserDTO dto = new UserDTO();
            dto.setId(1);
            dto.setEmail("test@example.com");
            dto.setRoles(new HashSet<>(Set.of("USER")));
            dto.setCurrentMode("USER");
            dto.setCreatedAt(LocalDateTime.of(2025, 1, 1, 0, 0));
            dto.setUpdatedAt(LocalDateTime.of(2025, 6, 1, 0, 0));

            User user = mapper.toEntity(dto);

            assertThat(user.getId()).isEqualTo(1);
            assertThat(user.getEmail()).isEqualTo("test@example.com");
            assertThat(user.getRoles()).contains("USER");
            assertThat(user.getCurrentMode()).isEqualTo("USER");
        }

        @Test
        void returnsNullForNullDto() {
            User user = mapper.toEntity(null);

            assertThat(user).isNull();
        }

        @Test
        void doesNotSetPassword() {
            UserDTO dto = new UserDTO();
            dto.setId(1);
            dto.setEmail("test@example.com");

            User user = mapper.toEntity(dto);

            assertThat(user.getPassword()).isNull();
        }
    }
}
