package com.jaya.service;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.GroupRequestDTO;
import com.jaya.dto.GroupResponseDTO;
import com.jaya.mapper.GroupMapper;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.Group;
import com.jaya.models.GroupRole;
import com.jaya.repository.GroupInvitationRepository;
import com.jaya.repository.GroupRepository;
import com.jaya.util.FriendshipServiceHelper;
import com.jaya.testutil.FriendShipTestDataFactory;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GroupServiceImplTest {

    @Mock
    private GroupRepository groupRepository;

    @Mock
    private GroupMapper groupMapper;

    @Mock
    private FriendshipServiceHelper helper;

    @Mock
    private GroupInvitationRepository groupInvitationRepository;

    @Mock
    private FriendshipService friendshipService;

    @InjectMocks
    private GroupServiceImpl service;

    @Test
    void createGroup_shouldThrowWhenDuplicateGroupNameForCreator() throws Exception {
        GroupRequestDTO dto = FriendShipTestDataFactory.buildGroupRequestDTO();
        UserDTO creator = FriendShipTestDataFactory.buildRequesterUser();

        when(helper.validateUser(dto.getCreatedBy())).thenReturn(creator);
        when(groupRepository.existsByNameAndCreatedBy(dto.getName(), dto.getCreatedBy())).thenReturn(true);

        assertThatThrownBy(() -> service.createGroup(dto))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("already exists");

        verify(groupRepository, never()).save(any());
    }

    @Test
    void createGroup_shouldCreateGroupWithCreatorIncluded() throws Exception {
        GroupRequestDTO dto = FriendShipTestDataFactory.buildGroupRequestDTO();
        UserDTO creator = FriendShipTestDataFactory.buildRequesterUser();
        Group group = FriendShipTestDataFactory.buildGroup();
        GroupResponseDTO responseDTO = new GroupResponseDTO();

        when(helper.validateUser(dto.getCreatedBy())).thenReturn(creator);
        when(groupRepository.existsByNameAndCreatedBy(dto.getName(), dto.getCreatedBy())).thenReturn(false);
        when(friendshipService.getFriendship(FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID))
                .thenReturn(FriendShipTestDataFactory.buildAcceptedFriendship());
        when(groupMapper.toEntity(dto)).thenReturn(group);
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> {
            Group g = inv.getArgument(0);
            g.setId(1);
            return g;
        });
        when(groupMapper.toResponseDTO(any(Group.class), eq(dto.getCreatedBy()))).thenReturn(responseDTO);

        GroupResponseDTO result = service.createGroup(dto);

        assertThat(result).isNotNull();
        verify(groupRepository).save(any(Group.class));
    }

    @Test
    void addMemberToGroupWithRole_shouldThrowWhenRequesterHasNoManagePermission() throws Exception {
        Group group = FriendShipTestDataFactory.buildGroup();
        group.setMemberRoles(java.util.Map.of(FriendShipTestDataFactory.TEST_USER_ID, GroupRole.MEMBER));

        when(groupRepository.findById(1)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> service.addMemberToGroupWithRole(1,
                FriendShipTestDataFactory.THIRD_USER_ID, GroupRole.MEMBER, FriendShipTestDataFactory.TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("permission");
    }

    @Test
    void addMemberToGroupWithRole_shouldThrowWhenTargetIsNotFriend() throws Exception {
        Group group = FriendShipTestDataFactory.buildGroup();

        when(groupRepository.findById(1)).thenReturn(Optional.of(group));
        when(friendshipService.getFriendship(FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.THIRD_USER_ID))
                .thenReturn(null);

        assertThatThrownBy(() -> service.addMemberToGroupWithRole(1,
                FriendShipTestDataFactory.THIRD_USER_ID, GroupRole.MEMBER, FriendShipTestDataFactory.TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("friends");
    }

    @Test
    void addMemberToGroupWithRole_shouldAddMemberWhenAuthorizedAndFriend() throws Exception {
        Group group = FriendShipTestDataFactory.buildGroup();
        GroupResponseDTO responseDTO = new GroupResponseDTO();
        Friendship accepted = FriendShipTestDataFactory.buildAcceptedFriendship();

        when(groupRepository.findById(1)).thenReturn(Optional.of(group));
        when(friendshipService.getFriendship(FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID))
                .thenReturn(accepted);
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));
        when(groupMapper.toResponseDTO(any(Group.class), eq(FriendShipTestDataFactory.TEST_USER_ID)))
                .thenReturn(responseDTO);

        GroupResponseDTO result = service.addMemberToGroupWithRole(1,
                FriendShipTestDataFactory.FRIEND_USER_ID, GroupRole.MEMBER, FriendShipTestDataFactory.TEST_USER_ID);

        assertThat(result).isNotNull();
        verify(groupRepository).save(any(Group.class));
    }

    @Test
    void removeMemberFromGroup_shouldThrowWhenRemovingCreator() throws Exception {
        Group group = FriendShipTestDataFactory.buildGroup();
        group.setMemberIds(new java.util.HashSet<>(Set.of(FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID)));

        when(groupRepository.findById(1)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> service.removeMemberFromGroup(1,
                FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.TEST_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("creator");
    }

    @Test
    void removeMemberFromGroup_shouldRemoveMemberWhenAuthorized() throws Exception {
        Group group = FriendShipTestDataFactory.buildGroup();
        group.setMemberIds(new java.util.HashSet<>(Set.of(FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID)));
        GroupResponseDTO responseDTO = new GroupResponseDTO();

        when(groupRepository.findById(1)).thenReturn(Optional.of(group));
        when(groupRepository.save(any(Group.class))).thenAnswer(inv -> inv.getArgument(0));
        when(groupMapper.toResponseDTO(any(Group.class), eq(FriendShipTestDataFactory.TEST_USER_ID)))
                .thenReturn(responseDTO);

        GroupResponseDTO result = service.removeMemberFromGroup(1,
                FriendShipTestDataFactory.FRIEND_USER_ID, FriendShipTestDataFactory.TEST_USER_ID);

        assertThat(result).isNotNull();
        verify(groupRepository).save(any(Group.class));
    }

    @Test
    void changeUserRole_shouldThrowWhenChangingCreatorRole() throws Exception {
        Group group = FriendShipTestDataFactory.buildGroup(1, "Test", "Desc", FriendShipTestDataFactory.TEST_USER_ID,
                Set.of(FriendShipTestDataFactory.TEST_USER_ID, FriendShipTestDataFactory.FRIEND_USER_ID),
                Map.of(FriendShipTestDataFactory.TEST_USER_ID, GroupRole.ADMIN, FriendShipTestDataFactory.FRIEND_USER_ID, GroupRole.ADMIN));

        when(groupRepository.findById(1)).thenReturn(Optional.of(group));

        assertThatThrownBy(() -> service.changeUserRole(1,
                FriendShipTestDataFactory.TEST_USER_ID, GroupRole.MEMBER, FriendShipTestDataFactory.FRIEND_USER_ID))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("creator");
    }
}
