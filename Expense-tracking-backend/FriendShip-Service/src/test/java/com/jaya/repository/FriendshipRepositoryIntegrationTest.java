package com.jaya.repository;

import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.testutil.FriendShipTestDataFactory;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@EntityScan("com.jaya.models")
@ActiveProfiles("test")
class FriendshipRepositoryIntegrationTest {

    private static final int REPO_USER_1 = 90001;
    private static final int REPO_USER_2 = 90002;
    private static final int REPO_USER_3 = 90003;

    @Autowired
    private FriendshipRepository friendshipRepository;

    @Nested
    @DisplayName("findBidirectional")
    class FindBidirectional {

        @Test
        @DisplayName("shouldFindFriendshipInEitherDirection")
        void shouldFindFriendshipInEitherDirection() {
            Friendship f = Friendship.builder()
                    .requesterId(REPO_USER_1)
                    .recipientId(REPO_USER_2)
                    .status(FriendshipStatus.ACCEPTED)
                    .requesterAccess(AccessLevel.NONE)
                    .recipientAccess(AccessLevel.NONE)
                    .build();
            friendshipRepository.save(f);

            Optional<Friendship> result1 = friendshipRepository.findBidirectional(REPO_USER_1, REPO_USER_2);
            Optional<Friendship> result2 = friendshipRepository.findBidirectional(REPO_USER_2, REPO_USER_1);

            assertThat(result1).isPresent();
            assertThat(result2).isPresent();
            assertThat(result1.get().getId()).isEqualTo(result2.get().getId());
        }

        @Test
        @DisplayName("shouldReturnEmptyWhenNoFriendshipExists")
        void shouldReturnEmptyWhenNoFriendshipExists() {
            Optional<Friendship> result = friendshipRepository.findBidirectional(REPO_USER_1, REPO_USER_3);
            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findByRequesterIdAndRecipientIdAndStatus")
    class FindByRequesterIdAndRecipientIdAndStatus {

        @Test
        @DisplayName("shouldFindByRequesterRecipientAndStatus")
        void shouldFindByRequesterRecipientAndStatus() {
            Friendship f = Friendship.builder()
                    .requesterId(REPO_USER_1)
                    .recipientId(REPO_USER_2)
                    .status(FriendshipStatus.PENDING)
                    .requesterAccess(AccessLevel.NONE)
                    .recipientAccess(AccessLevel.NONE)
                    .build();
            friendshipRepository.save(f);

            Optional<Friendship> result = friendshipRepository.findByRequesterIdAndRecipientIdAndStatus(
                    REPO_USER_1, REPO_USER_2, FriendshipStatus.PENDING);

            assertThat(result).isPresent();
            assertThat(result.get().getStatus()).isEqualTo(FriendshipStatus.PENDING);
        }

        @Test
        @DisplayName("shouldReturnEmptyWhenStatusDoesNotMatch")
        void shouldReturnEmptyWhenStatusDoesNotMatch() {
            Friendship f = Friendship.builder()
                    .requesterId(REPO_USER_1)
                    .recipientId(REPO_USER_2)
                    .status(FriendshipStatus.ACCEPTED)
                    .requesterAccess(AccessLevel.NONE)
                    .recipientAccess(AccessLevel.NONE)
                    .build();
            friendshipRepository.save(f);

            Optional<Friendship> result = friendshipRepository.findByRequesterIdAndRecipientIdAndStatus(
                    REPO_USER_1, REPO_USER_2, FriendshipStatus.PENDING);

            assertThat(result).isEmpty();
        }
    }

    @Nested
    @DisplayName("findFriendshipsForReport")
    class FindFriendshipsForReport {

        @Test
        @DisplayName("shouldReturnFriendshipsForUserWithFilters")
        void shouldReturnFriendshipsForUserWithFilters() {
            Friendship f1 = Friendship.builder()
                    .requesterId(REPO_USER_1)
                    .recipientId(REPO_USER_2)
                    .status(FriendshipStatus.ACCEPTED)
                    .requesterAccess(AccessLevel.NONE)
                    .recipientAccess(AccessLevel.NONE)
                    .build();
            Friendship f2 = Friendship.builder()
                    .requesterId(REPO_USER_3)
                    .recipientId(REPO_USER_1)
                    .status(FriendshipStatus.PENDING)
                    .requesterAccess(AccessLevel.NONE)
                    .recipientAccess(AccessLevel.NONE)
                    .build();
            friendshipRepository.save(f1);
            friendshipRepository.save(f2);

            var page = friendshipRepository.findFriendshipsForReport(
                    REPO_USER_1,
                    null,
                    null,
                    null,
                    PageRequest.of(0, 20));

            assertThat(page.getContent()).hasSize(2);
        }

        @Test
        @DisplayName("shouldFilterByStatus")
        void shouldFilterByStatus() {
            Friendship f1 = Friendship.builder()
                    .requesterId(REPO_USER_1)
                    .recipientId(REPO_USER_2)
                    .status(FriendshipStatus.ACCEPTED)
                    .requesterAccess(AccessLevel.NONE)
                    .recipientAccess(AccessLevel.NONE)
                    .build();
            Friendship f2 = Friendship.builder()
                    .requesterId(REPO_USER_3)
                    .recipientId(REPO_USER_1)
                    .status(FriendshipStatus.PENDING)
                    .requesterAccess(AccessLevel.NONE)
                    .recipientAccess(AccessLevel.NONE)
                    .build();
            friendshipRepository.save(f1);
            friendshipRepository.save(f2);

            var page = friendshipRepository.findFriendshipsForReport(
                    REPO_USER_1,
                    FriendshipStatus.ACCEPTED,
                    null,
                    null,
                    PageRequest.of(0, 20));

            assertThat(page.getContent()).hasSize(1);
            assertThat(page.getContent().get(0).getStatus()).isEqualTo(FriendshipStatus.ACCEPTED);
        }
    }
}
