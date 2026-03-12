package com.jaya.service;

import com.jaya.common.dto.UserDTO;
import com.jaya.kafka.service.UnifiedActivityService;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.repository.FriendshipRepository;
import com.jaya.util.FriendshipServiceHelper;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.testutil.FriendShipTestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FriendshipServiceImplTest {

    @Mock
    private FriendshipRepository friendshipRepository;

    @Mock
    private FriendshipServiceHelper helper;

    @Mock
    private IUserServiceClient userClient;

    @Mock
    private UnifiedActivityService unifiedActivityService;

    @InjectMocks
    private FriendshipServiceImpl service;

    @Test
    void sendFriendRequest_shouldThrowWhenRequesterAndRecipientSame() throws Exception {
        assertThatThrownBy(() -> service.sendFriendRequest(
                FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("yourself");

        verify(friendshipRepository, never()).save(any());
    }

    @Test
    void sendFriendRequest_shouldThrowWhenFriendRequestAlreadyExists() throws Exception {
        UserDTO requester = FriendShipTestDataFactory.buildRequesterUser();
        UserDTO recipient = FriendShipTestDataFactory.buildRecipientUser();
        Friendship existing = FriendShipTestDataFactory.buildPendingFriendship();

        when(helper.validateUser(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(requester);
        when(helper.validateUser(FriendShipTestDataFactory.FRIEND_USER_ID)).thenReturn(recipient);
        when(friendshipRepository.findByRequesterIdAndRecipientId(requester.getId(), recipient.getId()))
                .thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> service.sendFriendRequest(
                FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");

        verify(friendshipRepository, never()).save(any());
    }

    @Test
    void sendFriendRequest_shouldCreatePendingFriendRequestWhenValid() throws Exception {
        UserDTO requester = FriendShipTestDataFactory.buildRequesterUser();
        UserDTO recipient = FriendShipTestDataFactory.buildRecipientUser();
        Friendship saved = FriendShipTestDataFactory.buildPendingFriendship();

        when(helper.validateUser(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(requester);
        when(helper.validateUser(FriendShipTestDataFactory.FRIEND_USER_ID)).thenReturn(recipient);
        when(friendshipRepository.findByRequesterIdAndRecipientId(requester.getId(), recipient.getId()))
                .thenReturn(Optional.empty());
        when(friendshipRepository.findByRequesterIdAndRecipientId(recipient.getId(), requester.getId()))
                .thenReturn(Optional.empty());
        when(friendshipRepository.save(any(Friendship.class))).thenReturn(saved);

        Friendship result = service.sendFriendRequest(
                FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID);

        assertThat(result).isNotNull();
        assertThat(result.getStatus()).isEqualTo(FriendshipStatus.PENDING);
        verify(friendshipRepository).save(any(Friendship.class));
    }

    @Test
    void respondToRequest_shouldThrowWhenRequestNotFound() {
        when(friendshipRepository.findById(999)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.respondToRequest(999, FriendShipTestDataFactory.FRIEND_USER_ID, true))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void respondToRequest_shouldThrowWhenResponderIsNotRecipient() {
        Friendship pending = FriendShipTestDataFactory.buildPendingFriendship();
        when(friendshipRepository.findById(pending.getId())).thenReturn(Optional.of(pending));

        assertThatThrownBy(() -> service.respondToRequest(pending.getId(),
                FriendShipTestDataFactory.THIRD_USER_ID, true))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Only the recipient");
    }

    @Test
    void respondToRequest_shouldAcceptPendingRequestWhenResponderIsRecipient() throws Exception {
        Friendship pending = FriendShipTestDataFactory.buildPendingFriendship();
        Friendship accepted = FriendShipTestDataFactory.buildAcceptedFriendship();
        UserDTO requester = FriendShipTestDataFactory.buildRequesterUser();
        UserDTO recipient = FriendShipTestDataFactory.buildRecipientUser();

        when(friendshipRepository.findById(pending.getId())).thenReturn(Optional.of(pending));
        when(helper.validateUser(anyInt())).thenReturn(requester).thenReturn(recipient);
        when(friendshipRepository.save(any(Friendship.class))).thenAnswer(inv -> {
            Friendship f = inv.getArgument(0);
            f.setStatus(FriendshipStatus.ACCEPTED);
            return f;
        });

        Friendship result = service.respondToRequest(pending.getId(),
                FriendShipTestDataFactory.FRIEND_USER_ID, true);

        assertThat(result.getStatus()).isEqualTo(FriendshipStatus.ACCEPTED);
        verify(friendshipRepository).save(any(Friendship.class));
    }

    @Test
    void blockUser_shouldBlockExistingFriendship() throws Exception {
        UserDTO blocker = FriendShipTestDataFactory.buildRequesterUser();
        UserDTO blocked = FriendShipTestDataFactory.buildRecipientUser();
        Friendship existing = FriendShipTestDataFactory.buildAcceptedFriendship();

        when(helper.validateUser(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(blocker);
        when(helper.validateUser(FriendShipTestDataFactory.FRIEND_USER_ID)).thenReturn(blocked);
        when(friendshipRepository.findByRequesterIdAndRecipientId(blocker.getId(), blocked.getId()))
                .thenReturn(Optional.of(existing));
        when(friendshipRepository.save(any(Friendship.class))).thenAnswer(inv -> inv.getArgument(0));

        service.blockUser(FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID);

        assertThat(existing.getStatus()).isEqualTo(FriendshipStatus.BLOCKED);
        verify(friendshipRepository).save(existing);
    }

    @Test
    void blockUser_shouldCreateBlockedFriendshipWhenNoneExists() throws Exception {
        UserDTO blocker = FriendShipTestDataFactory.buildRequesterUser();
        UserDTO blocked = FriendShipTestDataFactory.buildRecipientUser();

        when(helper.validateUser(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(blocker);
        when(helper.validateUser(FriendShipTestDataFactory.FRIEND_USER_ID)).thenReturn(blocked);
        when(friendshipRepository.findByRequesterIdAndRecipientId(blocker.getId(), blocked.getId()))
                .thenReturn(Optional.empty());
        when(friendshipRepository.findByRequesterIdAndRecipientId(blocked.getId(), blocker.getId()))
                .thenReturn(Optional.empty());
        when(friendshipRepository.save(any(Friendship.class))).thenAnswer(inv -> inv.getArgument(0));

        service.blockUser(FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID);

        verify(friendshipRepository).save(any(Friendship.class));
    }

    @Test
    void unblockUser_shouldThrowWhenUnblockHasNoBlockedRelationship() throws Exception {
        UserDTO unblocker = FriendShipTestDataFactory.buildRequesterUser();
        UserDTO unblocked = FriendShipTestDataFactory.buildRecipientUser();

        when(helper.validateUser(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(unblocker);
        when(helper.validateUser(FriendShipTestDataFactory.FRIEND_USER_ID)).thenReturn(unblocked);
        when(friendshipRepository.findByRequesterIdAndRecipientIdAndStatus(
                unblocker.getId(), unblocked.getId(), FriendshipStatus.BLOCKED)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.unblockUser(
                FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("No blocking relationship");
    }

    @Test
    void setAccessLevel_shouldSetAccessLevelForRequesterPerspective() throws Exception {
        Friendship accepted = FriendShipTestDataFactory.buildAcceptedFriendship();
        UserDTO changer = FriendShipTestDataFactory.buildRequesterUser();
        UserDTO target = FriendShipTestDataFactory.buildRecipientUser();

        when(friendshipRepository.findById(accepted.getId())).thenReturn(Optional.of(accepted));
        when(helper.validateUser(FriendShipTestDataFactory.TEST_USER_ID)).thenReturn(changer);
        when(helper.validateUser(FriendShipTestDataFactory.FRIEND_USER_ID)).thenReturn(target);
        when(friendshipRepository.save(any(Friendship.class))).thenAnswer(inv -> inv.getArgument(0));

        Friendship result = service.setAccessLevel(accepted.getId(),
                FriendShipTestDataFactory.TEST_USER_ID, AccessLevel.READ);

        assertThat(result.getRecipientAccess()).isEqualTo(AccessLevel.READ);
        verify(friendshipRepository).save(any(Friendship.class));
    }

    @Test
    void setAccessLevel_shouldThrowWhenFriendshipNotAccepted() {
        Friendship pending = FriendShipTestDataFactory.buildPendingFriendship();
        when(friendshipRepository.findById(pending.getId())).thenReturn(Optional.of(pending));

        assertThatThrownBy(() -> service.setAccessLevel(pending.getId(),
                FriendShipTestDataFactory.TEST_USER_ID, AccessLevel.READ))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("non-accepted");
    }
}
