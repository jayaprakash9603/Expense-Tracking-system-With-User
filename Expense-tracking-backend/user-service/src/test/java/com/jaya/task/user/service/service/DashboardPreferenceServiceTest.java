package com.jaya.task.user.service.service;

import com.jaya.task.user.service.dto.DashboardPreferenceDTO;
import com.jaya.task.user.service.modal.DashboardPreference;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.DashboardPreferenceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardPreferenceServiceTest {

    @Mock
    private DashboardPreferenceRepository dashboardPreferenceRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private DashboardPreferenceService dashboardPreferenceService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1);
        testUser.setEmail("test@example.com");
        testUser.setRoles(new HashSet<>(Set.of("USER")));
        testUser.setCurrentMode("USER");
    }

    @Nested
    class GetUserDashboardPreference {

        @Test
        void returnsSavedPreferenceWhenExists() {
            DashboardPreference pref = new DashboardPreference();
            pref.setId(1L);
            pref.setUserId(1);
            pref.setLayoutConfig("[{\"id\":\"metrics\"}]");
            pref.setCreatedAt(LocalDateTime.now());
            pref.setUpdatedAt(LocalDateTime.now());

            when(userService.getUserProfile("jwt")).thenReturn(testUser);
            when(dashboardPreferenceRepository.findByUserId(1)).thenReturn(Optional.of(pref));

            DashboardPreferenceDTO result = dashboardPreferenceService.getUserDashboardPreference("jwt");

            assertThat(result.getUserId()).isEqualTo(1);
            assertThat(result.getLayoutConfig()).contains("metrics");
        }

        @Test
        void returnsDefaultWhenNoPreferenceExists() {
            when(userService.getUserProfile("jwt")).thenReturn(testUser);
            when(dashboardPreferenceRepository.findByUserId(1)).thenReturn(Optional.empty());

            DashboardPreferenceDTO result = dashboardPreferenceService.getUserDashboardPreference("jwt");

            assertThat(result.getUserId()).isEqualTo(1);
            assertThat(result.getLayoutConfig()).contains("metrics");
        }
    }

    @Nested
    class SaveDashboardPreference {

        @Test
        void savesNewPreference() {
            String config = "[{\"id\":\"custom\"}]";

            when(userService.getUserProfile("jwt")).thenReturn(testUser);
            when(dashboardPreferenceRepository.findByUserId(1)).thenReturn(Optional.empty());
            when(dashboardPreferenceRepository.save(any(DashboardPreference.class)))
                    .thenAnswer(inv -> {
                        DashboardPreference p = inv.getArgument(0);
                        p.setId(1L);
                        p.setCreatedAt(LocalDateTime.now());
                        p.setUpdatedAt(LocalDateTime.now());
                        return p;
                    });

            DashboardPreferenceDTO result = dashboardPreferenceService.saveDashboardPreference("jwt", config);

            assertThat(result.getLayoutConfig()).isEqualTo(config);
            verify(dashboardPreferenceRepository).save(any(DashboardPreference.class));
        }

        @Test
        void updatesExistingPreference() {
            DashboardPreference existing = new DashboardPreference();
            existing.setId(1L);
            existing.setUserId(1);
            existing.setLayoutConfig("[{\"id\":\"old\"}]");

            when(userService.getUserProfile("jwt")).thenReturn(testUser);
            when(dashboardPreferenceRepository.findByUserId(1)).thenReturn(Optional.of(existing));
            when(dashboardPreferenceRepository.save(any(DashboardPreference.class)))
                    .thenAnswer(inv -> {
                        DashboardPreference p = inv.getArgument(0);
                        p.setUpdatedAt(LocalDateTime.now());
                        return p;
                    });

            DashboardPreferenceDTO result = dashboardPreferenceService
                    .saveDashboardPreference("jwt", "[{\"id\":\"new\"}]");

            assertThat(result.getLayoutConfig()).isEqualTo("[{\"id\":\"new\"}]");
        }
    }

    @Nested
    class ResetDashboardPreference {

        @Test
        void deletesPreferenceForUser() {
            when(userService.getUserProfile("jwt")).thenReturn(testUser);

            dashboardPreferenceService.resetDashboardPreference("jwt");

            verify(dashboardPreferenceRepository).deleteByUserId(1);
        }
    }
}
