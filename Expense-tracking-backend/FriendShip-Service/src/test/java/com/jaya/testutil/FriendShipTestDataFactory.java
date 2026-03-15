package com.jaya.testutil;

import com.jaya.common.dto.UserDTO;
import com.jaya.dto.GroupRequestDTO;
import com.jaya.dto.share.CreateShareRequest;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.Group;
import com.jaya.models.GroupRole;
import com.jaya.models.SharePermission;
import com.jaya.models.SharedResource;
import com.jaya.models.SharedResource.ResourceRef;
import com.jaya.models.SharedResourceType;
import com.jaya.models.ShareVisibility;

import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class FriendShipTestDataFactory {

    public static final int TEST_USER_ID = 1;
    public static final int FRIEND_USER_ID = 2;
    public static final int THIRD_USER_ID = 3;
    public static final String TEST_JWT = "Bearer test-jwt";

    private FriendShipTestDataFactory() {
    }

    public static UserDTO buildUser(Integer id, String username) {
        return UserDTO.builder()
                .id(id)
                .username(username)
                .email(username + "@example.com")
                .firstName("First")
                .lastName("Last")
                .build();
    }

    public static UserDTO buildRequesterUser() {
        return buildUser(TEST_USER_ID, "requester");
    }

    public static UserDTO buildRecipientUser() {
        return buildUser(FRIEND_USER_ID, "recipient");
    }

    public static UserDTO buildThirdUser() {
        return buildUser(THIRD_USER_ID, "third");
    }

    public static Friendship buildPendingFriendship() {
        return Friendship.builder()
                .id(100)
                .requesterId(TEST_USER_ID)
                .recipientId(FRIEND_USER_ID)
                .status(FriendshipStatus.PENDING)
                .requesterAccess(AccessLevel.NONE)
                .recipientAccess(AccessLevel.NONE)
                .build();
    }

    public static Friendship buildAcceptedFriendship() {
        return Friendship.builder()
                .id(101)
                .requesterId(TEST_USER_ID)
                .recipientId(FRIEND_USER_ID)
                .status(FriendshipStatus.ACCEPTED)
                .requesterAccess(AccessLevel.NONE)
                .recipientAccess(AccessLevel.NONE)
                .build();
    }

    public static Friendship buildBlockedFriendship() {
        return Friendship.builder()
                .id(102)
                .requesterId(TEST_USER_ID)
                .recipientId(FRIEND_USER_ID)
                .status(FriendshipStatus.BLOCKED)
                .requesterAccess(AccessLevel.NONE)
                .recipientAccess(AccessLevel.NONE)
                .build();
    }

    public static Group buildGroup() {
        return buildGroup(1, "Test Group", "Description", TEST_USER_ID,
                Set.of(TEST_USER_ID), Map.of(TEST_USER_ID, GroupRole.ADMIN));
    }

    public static Group buildGroup(Integer id, String name, String description, Integer createdBy,
            Set<Integer> memberIds, Map<Integer, GroupRole> memberRoles) {
        Group group = new Group();
        group.setId(id);
        group.setName(name);
        group.setDescription(description);
        group.setCreatedBy(createdBy);
        group.setMemberIds(memberIds != null ? new HashSet<>(memberIds) : new HashSet<>());
        group.setMemberRoles(memberRoles != null ? new HashMap<>(memberRoles) : new HashMap<>());
        return group;
    }

    public static GroupRequestDTO buildGroupRequestDTO() {
        GroupRequestDTO dto = new GroupRequestDTO();
        dto.setName("Trip Group");
        dto.setDescription("Trip");
        dto.setCreatedBy(TEST_USER_ID);
        dto.setMemberIds(List.of(FRIEND_USER_ID));
        return dto;
    }

    public static CreateShareRequest buildCreateShareRequest() {
        CreateShareRequest.ResourceRefDTO ref = CreateShareRequest.ResourceRefDTO.builder()
                .type("EXPENSE")
                .externalRef("EXP-100")
                .build();
        return CreateShareRequest.builder()
                .resourceType(SharedResourceType.EXPENSE)
                .permission(SharePermission.VIEW)
                .resourceRefs(List.of(ref))
                .build();
    }

    public static SharedResource buildSharedResource() {
        ResourceRef ref = ResourceRef.builder()
                .type("EXPENSE")
                .externalRef("EXP-100")
                .build();
        return SharedResource.builder()
                .id(1L)
                .shareToken("share-token-100")
                .ownerUserId(TEST_USER_ID)
                .resourceType(SharedResourceType.EXPENSE)
                .resourceRefs(List.of(ref))
                .permission(SharePermission.VIEW)
                .isActive(true)
                .visibility(ShareVisibility.LINK_ONLY)
                .allowedUserIds(Collections.emptyList())
                .build();
    }
}
