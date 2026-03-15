package com.jaya.task.user.service.service;

import com.jaya.task.user.service.dto.*;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminAnalyticsServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private AdminAnalyticsService adminAnalyticsService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(adminAnalyticsService, "expenseServiceUrl", "http://localhost:6000");
        ReflectionTestUtils.setField(adminAnalyticsService, "auditServiceUrl", "http://localhost:6004");
    }

    @Nested
    class GetAnalyticsOverview {

        @Test
        void returnsOverviewWithUserStats() {
            when(userRepository.count()).thenReturn(100L);
            when(userRepository.countByUpdatedAtAfter(any(LocalDateTime.class))).thenReturn(80L);
            when(userRepository.countByCreatedAtAfter(any(LocalDateTime.class))).thenReturn(10L);
            when(userRepository.countByCreatedAtBetween(any(), any())).thenReturn(8L);
            when(restTemplate.getForObject(anyString(), eq(AdminAnalyticsService.ExpenseStatsDTO.class)))
                    .thenThrow(new RestClientException("Service unavailable"));

            AdminAnalyticsOverviewDTO result = adminAnalyticsService.getAnalyticsOverview("7d");

            assertThat(result).isNotNull();
            assertThat(result.getTotalUsers()).isEqualTo(100L);
            assertThat(result.getActiveUsers()).isEqualTo(80L);
            assertThat(result.getTimeRange()).isEqualTo("7d");
        }

        @Test
        void handlesAllTimeRanges() {
            when(userRepository.count()).thenReturn(50L);
            when(userRepository.countByUpdatedAtAfter(any())).thenReturn(30L);
            when(userRepository.countByCreatedAtAfter(any())).thenReturn(5L);
            when(userRepository.countByCreatedAtBetween(any(), any())).thenReturn(3L);
            when(userRepository.countByUpdatedAtBetween(any(), any())).thenReturn(20L);
            when(restTemplate.getForObject(anyString(), eq(AdminAnalyticsService.ExpenseStatsDTO.class)))
                    .thenThrow(new RestClientException("unavailable"));

            for (String range : List.of("24h", "7d", "30d", "90d", "1y")) {
                AdminAnalyticsOverviewDTO result = adminAnalyticsService.getAnalyticsOverview(range);
                assertThat(result).isNotNull();
                assertThat(result.getTimeRange()).isEqualTo(range);
            }
        }
    }

    @Nested
    class GetTopCategories {

        @Test
        void fetchesFromExpenseService() {
            TopCategoryDTO[] categories = { TopCategoryDTO.builder().name("Food").count(100).build() };
            when(restTemplate.getForObject(anyString(), eq(TopCategoryDTO[].class)))
                    .thenReturn(categories);

            List<TopCategoryDTO> result = adminAnalyticsService.getTopCategories("7d", 5);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getName()).isEqualTo("Food");
        }

        @Test
        void fallsBackToSampleDataOnFailure() {
            when(restTemplate.getForObject(anyString(), eq(TopCategoryDTO[].class)))
                    .thenThrow(new RestClientException("Service down"));

            List<TopCategoryDTO> result = adminAnalyticsService.getTopCategories("7d", 5);

            assertThat(result).isNotEmpty();
            assertThat(result.size()).isLessThanOrEqualTo(5);
        }
    }

    @Nested
    class GetRecentActivity {

        @Test
        void includesUserRegistrationActivity() {
            when(userRepository.countByCreatedAtAfter(any())).thenReturn(5L);
            when(restTemplate.getForObject(anyString(), eq(AdminAnalyticsService.AuditStatsDTO.class)))
                    .thenThrow(new RestClientException("down"));

            List<RecentActivityDTO> result = adminAnalyticsService.getRecentActivity(24);

            assertThat(result).isNotEmpty();
            assertThat(result).anyMatch(a -> "USER_REGISTRATION".equals(a.getType()));
        }

        @Test
        void includesAuditDataWhenAvailable() {
            when(userRepository.countByCreatedAtAfter(any())).thenReturn(3L);

            AdminAnalyticsService.AuditStatsDTO stats = new AdminAnalyticsService.AuditStatsDTO();
            stats.setExpenseCreated(10L);
            stats.setBudgetCreated(5L);
            stats.setCategoryAdded(2L);
            when(restTemplate.getForObject(anyString(), eq(AdminAnalyticsService.AuditStatsDTO.class)))
                    .thenReturn(stats);

            List<RecentActivityDTO> result = adminAnalyticsService.getRecentActivity(24);

            assertThat(result).hasSizeGreaterThanOrEqualTo(3);
        }
    }

    @Nested
    class GetTopUsers {

        @Test
        void fetchesFromExpenseService() {
            TopUserDTO[] topUsers = {
                    TopUserDTO.builder().userId(1).name("John").build()
            };
            when(restTemplate.getForObject(anyString(), eq(TopUserDTO[].class)))
                    .thenReturn(topUsers);

            List<TopUserDTO> result = adminAnalyticsService.getTopUsers("7d", 10);

            assertThat(result).hasSize(1);
        }

        @Test
        void fallsBackToDbUsersOnFailure() {
            when(restTemplate.getForObject(anyString(), eq(TopUserDTO[].class)))
                    .thenThrow(new RestClientException("down"));

            User user = new User();
            user.setId(1);
            user.setFullName("Test User");
            user.setEmail("test@example.com");
            Page<User> page = new PageImpl<>(List.of(user));
            when(userRepository.findAll(any(Pageable.class))).thenReturn(page);

            List<TopUserDTO> result = adminAnalyticsService.getTopUsers("7d", 10);

            assertThat(result).hasSize(1);
        }
    }

    @Nested
    class GetUserStats {

        @Test
        void calculatesStatsCorrectly() {
            when(userRepository.count()).thenReturn(100L);
            when(userRepository.countByCreatedAtAfter(any())).thenReturn(10L, 5L);
            when(userRepository.countByCreatedAtBetween(any(), any())).thenReturn(8L);
            when(userRepository.countByUpdatedAtAfter(any())).thenReturn(75L);

            User user1 = new User();
            user1.setRoles(new HashSet<>(Set.of("USER")));
            User user2 = new User();
            user2.setRoles(new HashSet<>(Set.of("USER", "ADMIN")));
            when(userRepository.findAllWithRoles()).thenReturn(List.of(user1, user2));

            UserStatsDTO result = adminAnalyticsService.getUserStats();

            assertThat(result.getTotal()).isEqualTo(100L);
            assertThat(result.getActive()).isEqualTo(75L);
            assertThat(result.getByRole()).containsKey("USER");
        }
    }
}
