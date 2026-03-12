package com.jaya.repository;

import com.jaya.models.SharedResource;
import com.jaya.models.SharedResourceType;
import com.jaya.models.SharePermission;
import com.jaya.models.ShareVisibility;
import com.jaya.testutil.FriendShipTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EntityScan("com.jaya.models")
@ActiveProfiles("test")
class SharedResourceRepositoryIntegrationTest {

    private static final int REPO_OWNER = 70001;
    private static final String TOKEN_ACTIVE = "token-active-001";
    private static final String TOKEN_INACTIVE = "token-inactive-002";

    @Autowired
    private SharedResourceRepository sharedResourceRepository;

    @Nested
    @DisplayName("findByShareToken")
    class FindByShareToken {

        @Test
        @DisplayName("shouldFindByToken")
        void shouldFindByToken() {
            SharedResource sr = FriendShipTestDataFactory.buildSharedResource();
            sr.setId(null);
            sr.setShareToken(TOKEN_ACTIVE);
            sr.setOwnerUserId(REPO_OWNER);
            sharedResourceRepository.save(sr);

            Optional<SharedResource> result = sharedResourceRepository.findByShareToken(TOKEN_ACTIVE);

            assertThat(result).isPresent();
            assertThat(result.get().getShareToken()).isEqualTo(TOKEN_ACTIVE);
        }

        @Test
        @DisplayName("shouldReturnEmptyWhenTokenNotFound")
        void shouldReturnEmptyWhenTokenNotFound() {
            Optional<SharedResource> result = sharedResourceRepository.findByShareToken("nonexistent");
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findActiveByToken")
    class FindActiveByToken {

        @Test
        @DisplayName("shouldFindActiveShareByToken")
        void shouldFindActiveShareByToken() {
            SharedResource sr = FriendShipTestDataFactory.buildSharedResource();
            sr.setId(null);
            sr.setShareToken(TOKEN_ACTIVE);
            sr.setOwnerUserId(REPO_OWNER);
            sr.setIsActive(true);
            sharedResourceRepository.save(sr);

            Optional<SharedResource> result = sharedResourceRepository.findActiveByToken(TOKEN_ACTIVE);

            assertThat(result).isPresent();
            assertThat(result.get().getIsActive()).isTrue();
        }

        @Test
        @DisplayName("shouldReturnEmptyWhenShareIsInactive")
        void shouldReturnEmptyWhenShareIsInactive() {
            SharedResource sr = FriendShipTestDataFactory.buildSharedResource();
            sr.setId(null);
            sr.setShareToken(TOKEN_INACTIVE);
            sr.setOwnerUserId(REPO_OWNER);
            sr.setIsActive(false);
            sharedResourceRepository.save(sr);

            Optional<SharedResource> result = sharedResourceRepository.findActiveByToken(TOKEN_INACTIVE);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findExpiredActiveShares")
    class FindExpiredActiveShares {

        @Test
        @DisplayName("shouldFindExpiredActiveShares")
        void shouldFindExpiredActiveShares() {
            SharedResource sr = FriendShipTestDataFactory.buildSharedResource();
            sr.setId(null);
            sr.setShareToken("expired-token");
            sr.setOwnerUserId(REPO_OWNER);
            sr.setIsActive(true);
            sr.setExpiresAt(LocalDateTime.now().minusDays(1));
            sharedResourceRepository.save(sr);

            List<SharedResource> result = sharedResourceRepository.findExpiredActiveShares(LocalDateTime.now());

            assertThat(result).hasSize(1);
            assertThat(result.get(0).getShareToken()).isEqualTo("expired-token");
        }

        @Test
        @DisplayName("shouldNotReturnNonExpiredShares")
        void shouldNotReturnNonExpiredShares() {
            SharedResource sr = FriendShipTestDataFactory.buildSharedResource();
            sr.setId(null);
            sr.setShareToken("valid-token");
            sr.setOwnerUserId(REPO_OWNER);
            sr.setIsActive(true);
            sr.setExpiresAt(LocalDateTime.now().plusDays(7));
            sharedResourceRepository.save(sr);

            List<SharedResource> result = sharedResourceRepository.findExpiredActiveShares(LocalDateTime.now());

            assertThat(result).isEmpty();
        }
    }
}
