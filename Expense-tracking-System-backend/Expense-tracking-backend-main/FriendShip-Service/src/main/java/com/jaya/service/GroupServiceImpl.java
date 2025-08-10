package com.jaya.service;

import com.jaya.dto.*;
import com.jaya.mapper.GroupMapper;
import com.jaya.models.*;
import com.jaya.repository.GroupInvitationRepository;
import com.jaya.repository.GroupRepository;
import com.jaya.util.ServiceHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMapper groupMapper;

    @Autowired
    private ServiceHelper helper;

    @Autowired
    private GroupInvitationRepository groupInvitationRepository;

    @Autowired
    private FriendshipService friendshipService;

    @Override
    @Transactional
    public GroupResponseDTO createGroup(GroupRequestDTO groupRequestDTO) throws Exception {
        // Validate creator
        UserDto creator = helper.validateUser(groupRequestDTO.getCreatedBy());

        // Check if group name already exists for this user
        if (groupRepository.existsByNameAndCreatedBy(groupRequestDTO.getName(), groupRequestDTO.getCreatedBy())) {
            throw new RuntimeException("Group with this name already exists for this user");
        }

        // Validate and filter member IDs to only include friends
        List<Integer> validMemberIds = new ArrayList<>();
        if (groupRequestDTO.getMemberIds() != null && !groupRequestDTO.getMemberIds().isEmpty()) {
            validMemberIds = validateAndFilterFriends(groupRequestDTO.getCreatedBy(), groupRequestDTO.getMemberIds());
        }

    // Create group entity
    Group group = groupMapper.toEntity(groupRequestDTO);
    group.setMemberIds(validMemberIds);
    // Set avatar from DTO, or default if not provided
    if (groupRequestDTO.getAvatar() == null || groupRequestDTO.getAvatar().trim().isEmpty()) {
        group.setAvatar("👥");
    } else {
        group.setAvatar(groupRequestDTO.getAvatar());
    }

        // Add creator as a member with ADMIN role if not already included
        if (!group.getMemberIds().contains(group.getCreatedBy())) {
            group.getMemberIds().add(group.getCreatedBy());
        }

        // Set roles for members
        for (Integer memberId : validMemberIds) {
            GroupRole role = GroupRole.MEMBER; // Default role
            if (groupRequestDTO.getMemberRoles() != null && groupRequestDTO.getMemberRoles().containsKey(memberId)) {
                role = groupRequestDTO.getMemberRoles().get(memberId);
            }
            group.addMember(memberId, role, groupRequestDTO.getCreatedBy());
        }

        Group savedGroup = groupRepository.save(group);
        return groupMapper.toResponseDTO(savedGroup, groupRequestDTO.getCreatedBy());
    }

    @Override
    public Optional<GroupResponseDTO> getGroupById(Integer id, Integer userId) throws Exception {
        Optional<Group> groupOpt = groupRepository.findById(id);
        if (groupOpt.isEmpty()) {
            return Optional.empty();
        }

        Group group = groupOpt.get();

        // Check if user has access to this group
        if (!group.getMemberIds().contains(userId) && !group.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Access denied: User is not a member of this group");
        }

        return Optional.of(groupMapper.toResponseDTO(group, userId));
    }

    @Override
    public GroupResponseDTO getGroupById(Integer id) throws Exception {
        Group group=groupRepository.findById(id).orElseThrow(()->new Exception("group not found"));
        return groupMapper.toResponseDTO(group);
    }

    @Override
    @Transactional
    public GroupResponseDTO updateGroup(Integer id, GroupUpdateDTO groupUpdateDTO, Integer userId) throws Exception {
        Optional<Group> existingGroup = groupRepository.findById(id);
        if (existingGroup.isEmpty()) {
            throw new RuntimeException("Group not found with ID: " + id);
        }

        Group groupToUpdate = existingGroup.get();

        // Check if user has permission to edit group settings
        if (!groupToUpdate.hasPermission(userId, "edit_settings")) {
            throw new RuntimeException("You don't have permission to edit this group");
        }

        groupMapper.updateEntityFromDTO(groupToUpdate, groupUpdateDTO);
        Group updatedGroup = groupRepository.save(groupToUpdate);
        return groupMapper.toResponseDTO(updatedGroup, userId);
    }

    @Override
    @Transactional
    public void deleteGroup(Integer id, Integer userId) throws Exception {
        Optional<Group> existingGroup = groupRepository.findById(id);
        if (existingGroup.isEmpty()) {
            throw new RuntimeException("Group not found with ID: " + id);
        }

        Group group = existingGroup.get();

        // Check if user has permission to delete group
        if (!group.hasPermission(userId, "delete_group")) {
            throw new RuntimeException("You don't have permission to delete this group");
        }

        groupRepository.delete(group);
    }

    @Override
    @Transactional
    public GroupResponseDTO addMemberToGroup(Integer groupId, Integer userId, Integer requesterId) throws Exception {
        return addMemberToGroupWithRole(groupId, userId, GroupRole.MEMBER, requesterId);
    }

    @Override
    @Transactional
    public GroupResponseDTO addMemberToGroupWithRole(Integer groupId, Integer userId, GroupRole role, Integer requesterId) throws Exception {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found with ID: " + groupId);
        }

        Group group = groupOpt.get();

        // Check if requester has permission to manage members
        if (!group.hasPermission(requesterId, "manage_members")) {
            throw new RuntimeException("You don't have permission to add members to this group");
        }

        // Validate that the user to be added is a friend of the requester
        if (!isFriend(requesterId, userId)) {
            throw new RuntimeException("Can only add friends to the group");
        }

        // Check if user is already a member
        if (group.getMemberIds().contains(userId)) {
            throw new RuntimeException("User is already a member of this group");
        }

        group.addMember(userId, role, requesterId);
        Group updatedGroup = groupRepository.save(group);
        return groupMapper.toResponseDTO(updatedGroup, requesterId);
    }

    @Override
    @Transactional
    public GroupResponseDTO removeMemberFromGroup(Integer groupId, Integer userId, Integer requesterId) throws Exception {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found with ID: " + groupId);
        }

        Group group = groupOpt.get();

        // Check permissions: user can remove themselves, or requester must have manage_members permission
        if (!userId.equals(requesterId) && !group.hasPermission(requesterId, "manage_members")) {
            throw new RuntimeException("You don't have permission to remove members from this group");
        }

        // Cannot remove the creator
        if (userId.equals(group.getCreatedBy())) {
            throw new RuntimeException("Cannot remove the group creator");
        }

        // Check if user is a member
        if (!group.getMemberIds().contains(userId)) {
            throw new RuntimeException("User is not a member of this group");
        }

        group.removeMember(userId);
        Group updatedGroup = groupRepository.save(group);
        return groupMapper.toResponseDTO(updatedGroup, requesterId);
    }

    @Override
    @Transactional
    public GroupResponseDTO changeUserRole(Integer groupId, Integer userId, GroupRole newRole, Integer requesterId) throws Exception {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found with ID: " + groupId);
        }

        Group group = groupOpt.get();

        // Check if requester has permission to change roles
        GroupRole requesterRole = group.getUserRole(requesterId);
        if (newRole == GroupRole.ADMIN && !requesterRole.canPromoteMembers()) {
            throw new RuntimeException("You don't have permission to promote members to admin");
        }

        GroupRole currentUserRole = group.getUserRole(userId);
        if (currentUserRole == GroupRole.ADMIN && !requesterRole.canDemoteMembers()) {
            throw new RuntimeException("You don't have permission to demote admin members");
        }

        // Cannot change creator's role
        if (userId.equals(group.getCreatedBy())) {
            throw new RuntimeException("Cannot change the creator's role");
        }

        // Check if user is a member
        if (!group.getMemberIds().contains(userId)) {
            throw new RuntimeException("User is not a member of this group");
        }

        group.setUserRole(userId, newRole);
        Group updatedGroup = groupRepository.save(group);
        return groupMapper.toResponseDTO(updatedGroup, requesterId);
    }

    @Override
    public GroupRole getUserRoleInGroup(Integer groupId, Integer userId) throws Exception {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found with ID: " + groupId);
        }

        Group group = groupOpt.get();
        return group.getUserRole(userId);
    }

    @Override
    public boolean hasPermissionInGroup(Integer groupId, Integer userId, String permission) throws Exception {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            return false;
        }

        Group group = groupOpt.get();
        return group.hasPermission(userId, permission);
    }

    @Override
    public List<GroupResponseDTO> getAllUserGroups(Integer userId) throws Exception {
        helper.validateUser(userId);

        List<Group> groups = groupRepository.findAllUserGroups(userId);
        return groups.stream()
                .map(group -> {
                    try {
                        return groupMapper.toResponseDTO(group, userId);
                    } catch (Exception e) {
                        throw new RuntimeException("Error mapping group: " + e.getMessage());
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<GroupResponseDTO> getGroupsCreatedByUser(Integer userId) throws Exception {
        helper.validateUser(userId);

        List<Group> groups = groupRepository.findByCreatedBy(userId);
        return groups.stream()
                .map(group -> {
                    try {
                        return groupMapper.toResponseDTO(group, userId);
                    } catch (Exception e) {
                        throw new RuntimeException("Error mapping group: " + e.getMessage());
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public List<GroupResponseDTO> getGroupsWhereUserIsMember(Integer userId) throws Exception {
        helper.validateUser(userId);

        List<Group> groups = groupRepository.findGroupsByMemberId(userId);
        return groups.stream()
                .map(group -> {
                    try {
                        return groupMapper.toResponseDTO(group, userId);
                    } catch (Exception e) {
                        throw new RuntimeException("Error mapping group: " + e.getMessage());
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public boolean isUserMemberOfGroup(Integer groupId, Integer userId) throws Exception {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            return false;
        }

        Group group = groupOpt.get();
        return group.getMemberIds().contains(userId);
    }

    @Override
    public boolean isUserOwnerOfGroup(Integer groupId, Integer userId) throws Exception {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            return false;
        }

        Group group = groupOpt.get();
        return group.getCreatedBy().equals(userId);
    }

    @Override
    public List<GroupMemberDTO> getGroupMembers(Integer groupId, Integer userId) throws Exception {
        Optional<Group> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found with ID: " + groupId);
        }

        Group group = groupOpt.get();

        // Check if user has access to this group
        if (!group.getMemberIds().contains(userId) && !group.getCreatedBy().equals(userId)) {
            throw new RuntimeException("Access denied: User is not a member of this group");
        }

        GroupResponseDTO groupResponse = groupMapper.toResponseDTO(group, userId);
        return groupResponse.getMembers();
    }

    // ... existing helper methods remain the same ...

    /**
     * Validates and filters member IDs to only include friends of the creator
     */
    private List<Integer> validateAndFilterFriends(Integer creatorId, List<Integer> memberIds) throws Exception {
        List<Integer> validMemberIds = new ArrayList<>();

        for (Integer memberId : memberIds) {
            // Skip the creator (they will be added automatically)
            if (memberId.equals(creatorId)) {
                continue;
            }

            // Validate that the user exists
            try {
                helper.validateUser(memberId);
            } catch (Exception e) {
                System.err.println("Invalid user ID " + memberId + ": " + e.getMessage());
                continue;
            }

            // Check if they are friends
            if (isFriend(creatorId, memberId)) {
                validMemberIds.add(memberId);
            } else {
                System.err.println("User " + memberId + " is not a friend of creator " + creatorId + ", skipping");
            }
        }

        return validMemberIds;
    }

    /**
     * Checks if two users are friends
     */
    private boolean isFriend(Integer userId1, Integer userId2) throws Exception {
        try {
            Friendship friendship = friendshipService.getFriendship(userId1, userId2);
            return friendship != null && friendship.getStatus() == FriendshipStatus.ACCEPTED;
        } catch (Exception e) {
            System.err.println("Error checking friendship between " + userId1 + " and " + userId2 + ": " + e.getMessage());
            return false;
        }
    }



    @Override
    public Map<String, Object> getGroupStatistics(Integer groupId, Integer userId) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!isUserMemberOfGroup(groupId, userId)) {
            throw new RuntimeException("Access denied: User is not a member of this group");
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalMembers", group.getMemberIds() != null ? group.getMemberIds().size() : 0);
        stats.put("createdDate", group.getCreatedAt());
        stats.put("lastUpdated", group.getUpdatedAt());

        // Role distribution
        Map<String, Long> roleDistribution = new HashMap<>();
        if (group.getMemberRoles() != null) {
            roleDistribution = group.getMemberRoles().values().stream()
                    .collect(Collectors.groupingBy(
                            role -> role.getDisplayName(),
                            Collectors.counting()
                    ));
        }
        stats.put("roleDistribution", roleDistribution);

        // Recent activity count (last 30 days)
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        long recentJoins = group.getMemberJoinedDates() != null ?
                group.getMemberJoinedDates().values().stream()
                        .filter(date -> date.isAfter(thirtyDaysAgo))
                        .count() : 0;
        stats.put("recentJoins", recentJoins);

        return stats;
    }

    @Override
    public List<Map<String, Object>> getGroupActivity(Integer groupId, Integer userId, int page, int size) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!isUserMemberOfGroup(groupId, userId)) {
            throw new RuntimeException("Access denied: User is not a member of this group");
        }

        List<Map<String, Object>> activities = new ArrayList<>();

        // Add member join activities
        if (group.getMemberJoinedDates() != null && group.getMemberAddedBy() != null) {
            for (Map.Entry<Integer, LocalDateTime> entry : group.getMemberJoinedDates().entrySet()) {
                Integer memberId = entry.getKey();
                LocalDateTime joinDate = entry.getValue();
                Integer addedBy = group.getMemberAddedBy().get(memberId);

                try {
                    UserDto member = helper.validateUser(memberId);
                    UserDto adder = helper.validateUser(addedBy);

                    Map<String, Object> activity = new HashMap<>();
                    activity.put("type", "MEMBER_JOINED");
                    activity.put("timestamp", joinDate);
                    activity.put("description", member.getFirstName() + " " + member.getLastName() + " joined the group");
                    activity.put("actor", adder.getFirstName() + " " + adder.getLastName());
                    activity.put("actorId", addedBy);
                    activity.put("targetUser", member.getFirstName() + " " + member.getLastName());
                    activity.put("targetUserId", memberId);

                    activities.add(activity);
                } catch (Exception e) {
                    // Skip if user not found
                }
            }
        }

        // Sort by timestamp descending
        activities.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("timestamp");
            LocalDateTime timeB = (LocalDateTime) b.get("timestamp");
            return timeB.compareTo(timeA);
        });

        // Apply pagination
        int start = page * size;
        int end = Math.min(start + size, activities.size());

        return start < activities.size() ? activities.subList(start, end) : new ArrayList<>();
    }

    @Override
    public List<GroupResponseDTO> searchGroups(String query, Integer userId, int page, int size) throws Exception {
        helper.validateUser(userId);

        List<Group> allGroups = groupRepository.findAll();

        List<Group> filteredGroups = allGroups.stream()
                .filter(group -> group.getMemberIds() != null && group.getMemberIds().contains(userId))
                .filter(group ->
                        group.getName().toLowerCase().contains(query.toLowerCase()) ||
                                (group.getDescription() != null && group.getDescription().toLowerCase().contains(query.toLowerCase()))
                )
                .skip(page * size)
                .limit(size)
                .collect(Collectors.toList());

        return filteredGroups.stream()
                .map(group -> {
                    try {
                        return groupMapper.toResponseDTO(group);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toList());
    }

//    @Override
//    public Map<String, Object> inviteUserToGroup(Integer groupId, Integer inviteeId, GroupRole role, Integer inviterId) throws Exception {
//        Group group = groupRepository.findById(groupId)
//                .orElseThrow(() -> new RuntimeException("Group not found"));
//
//        if (!hasPermissionInGroup(groupId, inviterId, "manage_members")) {
//            throw new RuntimeException("Access denied: Insufficient permissions to invite members");
//        }
//
//        UserDto invitee = helper.validateUser(inviteeId);
//        UserDto inviter = helper.validateUser(inviterId);
//
//        if (group.getMemberIds() != null && group.getMemberIds().contains(inviteeId)) {
//            throw new RuntimeException("User is already a member of this group");
//        }
//
//        // For now, directly add the user (in a real system, you'd create an invitation record)
//        group.addMember(inviteeId, role, inviterId);
//        groupRepository.save(group);
//
//        Map<String, Object> result = new HashMap<>();
//        result.put("message", "User invited successfully");
//        result.put("invitee", invitee.getFirstName() + " " + invitee.getLastName());
//        result.put("role", role);
//        result.put("inviter", inviter.getFirstName() + " " + inviter.getLastName());
//
//        return result;
//    }

//    @Override
//    public List<Map<String, Object>> getPendingInvitations(Integer userId) throws Exception {
//        helper.validateUser(userId);
//
//        // In a real implementation, you'd have an invitations table
//        // For now, return empty list
//        return new ArrayList<>();
//    }

//    @Override
//    public Map<String, Object> respondToInvitation(Integer invitationId, Integer userId, boolean accept) throws Exception {
//        helper.validateUser(userId);
//
//        // In a real implementation, you'd handle invitation responses
//        Map<String, Object> result = new HashMap<>();
//        result.put("message", accept ? "Invitation accepted" : "Invitation declined");
//        result.put("accepted", accept);
//
//        return result;
//    }

    @Override
    public List<GroupMemberDTO> getMembersByRole(Integer groupId, GroupRole role, Integer userId) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!isUserMemberOfGroup(groupId, userId)) {
            throw new RuntimeException("Access denied: User is not a member of this group");
        }

        List<GroupMemberDTO> members = new ArrayList<>();

        if (group.getMemberRoles() != null) {
            for (Map.Entry<Integer, GroupRole> entry : group.getMemberRoles().entrySet()) {
                if (entry.getValue() == role) {
                    Integer memberId = entry.getKey();
                    try {
                        UserDto user = helper.validateUser(memberId);
                        GroupMemberDTO memberDTO = new GroupMemberDTO();
                        memberDTO.setUserId(memberId);
                        memberDTO.setUsername(user.getEmail());
                        memberDTO.setFirstName(user.getFirstName());
                        memberDTO.setLastName(user.getLastName());
                        memberDTO.setEmail(user.getEmail());
                        memberDTO.setRole(role);
                        memberDTO.setJoinedAt(group.getMemberJoinedDate(memberId));
                        memberDTO.setAddedBy(group.getMemberAddedBy(memberId));

                        members.add(memberDTO);
                    } catch (Exception e) {
                        // Skip if user not found
                    }
                }
            }
        }

        return members;
    }

    @Override
    public List<GroupMemberDTO> getRecentMembers(Integer groupId, Integer userId, int limit) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!isUserMemberOfGroup(groupId, userId)) {
            throw new RuntimeException("Access denied: User is not a member of this group");
        }

        List<GroupMemberDTO> allMembers = getGroupMembers(groupId, userId);

        return allMembers.stream()
                .sorted((a, b) -> {
                    if (a.getJoinedAt() == null && b.getJoinedAt() == null) return 0;
                    if (a.getJoinedAt() == null) return 1;
                    if (b.getJoinedAt() == null) return -1;
                    return b.getJoinedAt().compareTo(a.getJoinedAt());
                })
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> leaveGroup(Integer groupId, Integer userId) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!isUserMemberOfGroup(groupId, userId)) {
            throw new RuntimeException("User is not a member of this group");
        }

        if (group.getCreatedBy().equals(userId)) {
            // Check if there are other admins
            long adminCount = group.getMemberRoles() != null ?
                    group.getMemberRoles().values().stream()
                            .filter(role -> role == GroupRole.ADMIN)
                            .count() : 0;

            if (adminCount <= 1) {
                throw new RuntimeException("Cannot leave group: You are the only admin. Please assign another admin first or delete the group.");
            }
        }

        group.removeMember(userId);
        groupRepository.save(group);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Successfully left the group");
        result.put("groupId", groupId);
        result.put("userId", userId);

        return result;
    }

    @Override
    public GroupResponseDTO updateGroupSettings(Integer groupId, GroupSettingsDTO settings, Integer userId) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!hasPermissionInGroup(groupId, userId, "edit_settings")) {
            throw new RuntimeException("Access denied: Insufficient permissions to update group settings");
        }

        // In a real implementation, you'd have a settings entity or additional fields in Group
        // For now, just update the group's basic info
        group.setUpdatedAt(LocalDateTime.now());
        groupRepository.save(group);

        return groupMapper.toResponseDTO(group);
    }

    @Override
    public Map<String, Object> getGroupSettings(Integer groupId, Integer userId) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!isUserMemberOfGroup(groupId, userId)) {
            throw new RuntimeException("Access denied: User is not a member of this group");
        }

        Map<String, Object> settings = new HashMap<>();
        settings.put("allowMemberInvites", true);
        settings.put("requireApprovalForExpenses", false);
        settings.put("allowExpenseEditing", true);
        settings.put("maxMembers", 50);
        settings.put("currency", "USD");
        settings.put("timezone", "UTC");
        settings.put("notificationsEnabled", true);

        return settings;
    }


    @Override
    public GroupResponseDTO duplicateGroup(Integer groupId, GroupDuplicateRequestDTO duplicateRequest, Integer userId) throws Exception {
        Group originalGroup = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!hasPermissionInGroup(groupId, userId, "edit_settings")) {
            throw new RuntimeException("Access denied: Insufficient permissions to duplicate group");
        }

        Group newGroup = new Group();
        newGroup.setName(duplicateRequest.getNewGroupName());
        newGroup.setDescription(duplicateRequest.getNewGroupDescription());
        newGroup.setCreatedBy(userId);
        newGroup.setCreatedAt(LocalDateTime.now());
        newGroup.setUpdatedAt(LocalDateTime.now());

        if (duplicateRequest.getIncludeMembers() && originalGroup.getMemberIds() != null && !originalGroup.getMemberIds().isEmpty()) {
            // Include members from original group
            newGroup.setMemberIds(new ArrayList<>(originalGroup.getMemberIds()));
            newGroup.setMemberRoles(originalGroup.getMemberRoles() != null ?
                    new HashMap<>(originalGroup.getMemberRoles()) : new HashMap<>());
            newGroup.setMemberJoinedDates(new HashMap<>());
            newGroup.setMemberAddedBy(new HashMap<>());

            // Reset join dates and added by for the new group
            LocalDateTime now = LocalDateTime.now();
            for (Integer memberId : newGroup.getMemberIds()) {
                newGroup.getMemberJoinedDates().put(memberId, now);
                newGroup.getMemberAddedBy().put(memberId, userId);
            }
        } else {
            // Only include the creator
            newGroup.setMemberIds(new ArrayList<>(List.of(userId)));
            newGroup.setMemberRoles(new HashMap<>(Map.of(userId, GroupRole.ADMIN)));
            newGroup.setMemberJoinedDates(new HashMap<>(Map.of(userId, LocalDateTime.now())));
            newGroup.setMemberAddedBy(new HashMap<>(Map.of(userId, userId)));
        }

        Group savedGroup = groupRepository.save(newGroup);
        return groupMapper.toResponseDTO(savedGroup);
    }

    @Override
    public Map<String, Object> archiveGroup(Integer groupId, Integer userId) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!hasPermissionInGroup(groupId, userId, "edit_settings")) {
            throw new RuntimeException("Access denied: Insufficient permissions to archive group");
        }

        // In a real implementation, you'd add an 'archived' field to the Group entity
        // For now, just update the description to indicate it's archived
        group.setDescription("[ARCHIVED] " + (group.getDescription() != null ? group.getDescription() : ""));
        group.setUpdatedAt(LocalDateTime.now());
        groupRepository.save(group);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Group archived successfully");
        result.put("groupId", groupId);
        result.put("archivedAt", LocalDateTime.now());

        return result;
    }

    @Override
    public Map<String, Object> restoreGroup(Integer groupId, Integer userId) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!hasPermissionInGroup(groupId, userId, "edit_settings")) {
            throw new RuntimeException("Access denied: Insufficient permissions to restore group");
        }

        // Remove [ARCHIVED] prefix from description
        if (group.getDescription() != null && group.getDescription().startsWith("[ARCHIVED] ")) {
            group.setDescription(group.getDescription().substring(11));
        }
        group.setUpdatedAt(LocalDateTime.now());
        groupRepository.save(group);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Group restored successfully");
        result.put("groupId", groupId);
        result.put("restoredAt", LocalDateTime.now());

        return result;
    }

    @Override
    public List<GroupResponseDTO> getArchivedGroups(Integer userId) throws Exception {
        helper.validateUser(userId);

        List<Group> allGroups = groupRepository.findAll();

        return allGroups.stream()
                .filter(group -> group.getMemberIds() != null && group.getMemberIds().contains(userId))
                .filter(group -> group.getDescription() != null && group.getDescription().startsWith("[ARCHIVED]"))
                .map(group -> {
                    try {
                        return groupMapper.toResponseDTO(group);
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> exportGroupData(Integer groupId, Integer userId, String format) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!isUserMemberOfGroup(groupId, userId)) {
            throw new RuntimeException("Access denied: User is not a member of this group");
        }

        Map<String, Object> exportData = new HashMap<>();
        exportData.put("group", groupMapper.toResponseDTO(group));
        exportData.put("members", getGroupMembers(groupId, userId));
        exportData.put("statistics", getGroupStatistics(groupId, userId));
        exportData.put("exportedAt", LocalDateTime.now());
        exportData.put("exportedBy", userId);
        exportData.put("format", format);

        return exportData;
    }


    @Override
    public List<Map<String, Object>> getGroupRecommendations(Integer userId, int limit) throws Exception {
        helper.validateUser(userId);

        List<Map<String, Object>> recommendations = new ArrayList<>();

        try {
            // Get user's friends
            List<Friendship> userFriendships = friendshipService.getUserFriendships(userId);

            // Get all groups the user is NOT a member of
            List<Group> allGroups = groupRepository.findAll();
            List<Group> userGroups = groupRepository.findAllUserGroups(userId);
            Set<Integer> userGroupIds = userGroups.stream()
                    .map(Group::getId)
                    .collect(Collectors.toSet());

            // Find groups created by friends that user is not a member of
            for (Friendship friendship : userFriendships) {
                try {
                    Integer friendId = friendship.getRequesterId().equals(userId)
                            ? friendship.getRecipientId()
                            : friendship.getRequesterId();

                    // Get groups created by this friend
                    List<Group> friendGroups = groupRepository.findByCreatedBy(friendId);

                    for (Group group : friendGroups) {
                        // Skip if user is already a member of this group
                        if (userGroupIds.contains(group.getId())) {
                            continue;
                        }

                        // Skip if group has no members (safety check)
                        if (group.getMemberIds() == null || group.getMemberIds().isEmpty()) {
                            continue;
                        }

                        UserDto friend = helper.validateUser(friendId);

                        Map<String, Object> recommendation = new HashMap<>();
                        recommendation.put("groupId", group.getId());
                        recommendation.put("groupName", group.getName());
                        recommendation.put("groupDescription", group.getDescription());
                        recommendation.put("createdBy", friendId);
                        recommendation.put("creatorName", friend.getFirstName() + " " + friend.getLastName());
                        recommendation.put("creatorEmail", friend.getEmail());
                        recommendation.put("memberCount", group.getMemberIds().size());
                        recommendation.put("createdAt", group.getCreatedAt());
                        recommendation.put("reason", "Created by your friend " + friend.getFirstName());
                        recommendation.put("avatar", group.getAvatar());

                        // Calculate mutual friends in this group
                        int mutualFriendsCount = 0;
                        List<String> mutualFriendsNames = new ArrayList<>();

                        for (Integer memberId : group.getMemberIds()) {
                            if (!memberId.equals(friendId) && !memberId.equals(userId)) {
                                // Check if this member is also user's friend
                                boolean isMutualFriend = userFriendships.stream()
                                        .anyMatch(f ->
                                                (f.getRequesterId().equals(userId) && f.getRecipientId().equals(memberId)) ||
                                                        (f.getRecipientId().equals(userId) && f.getRequesterId().equals(memberId))
                                        );

                                if (isMutualFriend) {
                                    mutualFriendsCount++;
                                    try {
                                        UserDto mutualFriend = helper.validateUser(memberId);
                                        mutualFriendsNames.add(mutualFriend.getFirstName() + " " + mutualFriend.getLastName());
                                    } catch (Exception e) {
                                        // Skip if user not found
                                    }
                                }
                            }
                        }

                        recommendation.put("mutualFriendsCount", mutualFriendsCount);
                        recommendation.put("mutualFriends", mutualFriendsNames);

                        // Add relevance score (higher is better)
                        int relevanceScore = mutualFriendsCount * 10 + group.getMemberIds().size();
                        recommendation.put("relevanceScore", relevanceScore);

                        recommendations.add(recommendation);
                    }
                } catch (Exception e) {
                    // Log and skip this friend
                    System.err.println("Error processing friend's groups for recommendations: " + e.getMessage());
                }
            }

            // Sort by relevance score (descending) and then by creation date (newest first)
            recommendations.sort((a, b) -> {
                Integer scoreA = (Integer) a.get("relevanceScore");
                Integer scoreB = (Integer) b.get("relevanceScore");

                if (!scoreA.equals(scoreB)) {
                    return scoreB.compareTo(scoreA); // Higher score first
                }

                // If scores are equal, sort by creation date (newest first)
                LocalDateTime dateA = (LocalDateTime) a.get("createdAt");
                LocalDateTime dateB = (LocalDateTime) b.get("createdAt");
                return dateB.compareTo(dateA);
            });

            // Limit the results
            if (recommendations.size() > limit) {
                recommendations = recommendations.subList(0, limit);
            }

        } catch (Exception e) {
            System.err.println("Error generating group recommendations: " + e.getMessage());
            // Return empty list on error
        }

        return recommendations;
    }

    @Override
    public Map<String, Object> mergeGroups(Integer sourceGroupId, Integer targetGroupId, GroupMergeRequestDTO mergeRequest, Integer userId) throws Exception {
        Group sourceGroup = groupRepository.findById(sourceGroupId)
                .orElseThrow(() -> new RuntimeException("Source group not found"));
        Group targetGroup = groupRepository.findById(targetGroupId)
                .orElseThrow(() -> new RuntimeException("Target group not found"));

        if (!hasPermissionInGroup(sourceGroupId, userId, "delete_group") ||
                !hasPermissionInGroup(targetGroupId, userId, "manage_members")) {
            throw new RuntimeException("Access denied: Insufficient permissions to merge groups");
        }

        // Merge members
        if (sourceGroup.getMemberIds() != null) {
            for (Integer memberId : sourceGroup.getMemberIds()) {
                if (targetGroup.getMemberIds() == null || !targetGroup.getMemberIds().contains(memberId)) {
                    GroupRole role = sourceGroup.getUserRole(memberId);
                    targetGroup.addMember(memberId, role, userId);
                }
            }
        }

        // Update target group details
        targetGroup.setName(mergeRequest.getMergedGroupName());
        targetGroup.setDescription(mergeRequest.getMergedGroupDescription());
        targetGroup.setUpdatedAt(LocalDateTime.now());

        groupRepository.save(targetGroup);

        if (mergeRequest.getDeleteSourceGroup()) {
            groupRepository.delete(sourceGroup);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Groups merged successfully");
        result.put("mergedGroup", groupMapper.toResponseDTO(targetGroup));
        result.put("sourceGroupDeleted", mergeRequest.getDeleteSourceGroup());

        return result;
    }





    @Override
    @Transactional
    public Map<String, Object> inviteUserToGroup(Integer groupId, Integer inviteeId, GroupRole role, Integer inviterId) throws Exception {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new RuntimeException("Group not found"));

        if (!hasPermissionInGroup(groupId, inviterId, "manage_members")) {
            throw new RuntimeException("Access denied: Insufficient permissions to invite members");
        }

        UserDto invitee = helper.validateUser(inviteeId);
        UserDto inviter = helper.validateUser(inviterId);

        // Check if user is already a member
        if (group.getMemberIds() != null && group.getMemberIds().contains(inviteeId)) {
            throw new RuntimeException("User is already a member of this group");
        }

        // Check if there's already a pending invitation
        Optional<GroupInvitation> existingInvitation = groupInvitationRepository
                .findByGroupIdAndInviteeIdAndStatus(groupId, inviteeId, InvitationStatus.PENDING);

        if (existingInvitation.isPresent()) {
            throw new RuntimeException("There is already a pending invitation for this user");
        }

        // Check if invitee and inviter are friends
        if (!isFriend(inviterId, inviteeId)) {
            throw new RuntimeException("Can only invite friends to the group");
        }

        // Create invitation
        GroupInvitation invitation = new GroupInvitation(groupId, inviterId, inviteeId, role, null);
        groupInvitationRepository.save(invitation);

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Invitation sent successfully");
        result.put("invitationId", invitation.getId());
        result.put("invitee", invitee.getFirstName() + " " + invitee.getLastName());
        result.put("inviteeEmail", invitee.getEmail());
        result.put("role", role.getDisplayName());
        result.put("inviter", inviter.getFirstName() + " " + inviter.getLastName());
        result.put("groupName", group.getName());
        result.put("expiresAt", invitation.getExpiresAt());

        return result;
    }

    @Override
    public List<Map<String, Object>> getPendingInvitations(Integer userId) throws Exception {
        helper.validateUser(userId);

        List<GroupInvitation> invitations = groupInvitationRepository
                .findPendingInvitationsForUser(userId, LocalDateTime.now());

        List<Map<String, Object>> result = new ArrayList<>();

        for (GroupInvitation invitation : invitations) {
            try {
                Group group = groupRepository.findById(invitation.getGroupId()).orElse(null);
                if (group == null) continue;

                UserDto inviter = helper.validateUser(invitation.getInviterId());

                Map<String, Object> invitationData = new HashMap<>();
                invitationData.put("invitationId", invitation.getId());
                invitationData.put("groupId", group.getId());
                invitationData.put("groupName", group.getName());
                invitationData.put("groupDescription", group.getDescription());
                invitationData.put("role", invitation.getRole().getDisplayName());
                invitationData.put("inviter", inviter.getFirstName() + " " + inviter.getLastName());
                invitationData.put("inviterEmail", inviter.getEmail());
                invitationData.put("invitedAt", invitation.getCreatedAt());
                invitationData.put("expiresAt", invitation.getExpiresAt());
                invitationData.put("message", invitation.getMessage());
                invitationData.put("avatar", group.getAvatar());
                invitationData.put("memberCount", group.getMemberIds() != null ? group.getMemberIds().size() : 0);

                result.add(invitationData);
            } catch (Exception e) {
                // Skip if user or group not found
                System.err.println("Error processing invitation: " + e.getMessage());
            }
        }

        return result;
    }

    @Override
    @Transactional
    public Map<String, Object> respondToInvitation(Integer invitationId, Integer userId, boolean accept) throws Exception {
        helper.validateUser(userId);

        GroupInvitation invitation = groupInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        // Verify the invitation is for this user
        if (!invitation.getInviteeId().equals(userId)) {
            throw new RuntimeException("Access denied: This invitation is not for you");
        }

        // Check if invitation is still pending
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("This invitation has already been " + invitation.getStatus().getDisplayName().toLowerCase());
        }

        // Check if invitation has expired
        if (invitation.isExpired()) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            groupInvitationRepository.save(invitation);
            throw new RuntimeException("This invitation has expired");
        }

        Group group = groupRepository.findById(invitation.getGroupId())
                .orElseThrow(() -> new RuntimeException("Group not found"));

        Map<String, Object> result = new HashMap<>();

        if (accept) {
            // Check if user is already a member (edge case)
            if (group.getMemberIds() != null && group.getMemberIds().contains(userId)) {
                throw new RuntimeException("You are already a member of this group");
            }

            // Add user to group
            group.addMember(userId, invitation.getRole(), invitation.getInviterId());
            groupRepository.save(group);

            invitation.setStatus(InvitationStatus.ACCEPTED);
            result.put("message", "Invitation accepted successfully! You are now a member of " + group.getName());
            result.put("groupId", group.getId());
            result.put("role", invitation.getRole().getDisplayName());
        } else {
            invitation.setStatus(InvitationStatus.DECLINED);
            result.put("message", "Invitation declined");
        }

        invitation.setRespondedAt(LocalDateTime.now());
        groupInvitationRepository.save(invitation);

        result.put("invitationId", invitationId);
        result.put("accepted", accept);
        result.put("groupName", group.getName());

        return result;
    }

    // Add this new method to get sent invitations
    public List<Map<String, Object>> getSentInvitations(Integer userId) throws Exception {
        helper.validateUser(userId);

        List<GroupInvitation> invitations = groupInvitationRepository.findSentInvitationsByUser(userId);

        List<Map<String, Object>> result = new ArrayList<>();

        for (GroupInvitation invitation : invitations) {
            try {
                Group group = groupRepository.findById(invitation.getGroupId()).orElse(null);
                if (group == null) continue;

                UserDto invitee = helper.validateUser(invitation.getInviteeId());

                Map<String, Object> invitationData = new HashMap<>();
                invitationData.put("invitationId", invitation.getId());
                invitationData.put("groupId", group.getId());
                invitationData.put("groupName", group.getName());
                invitationData.put("role", invitation.getRole().getDisplayName());
                invitationData.put("invitee", invitee.getFirstName() + " " + invitee.getLastName());
                invitationData.put("inviteeEmail", invitee.getEmail());
                invitationData.put("status", invitation.getStatus().getDisplayName());
                invitationData.put("sentAt", invitation.getCreatedAt());
                invitationData.put("expiresAt", invitation.getExpiresAt());
                invitationData.put("respondedAt", invitation.getRespondedAt());

                result.add(invitationData);
            } catch (Exception e) {
                // Skip if user or group not found
                System.err.println("Error processing sent invitation: " + e.getMessage());
            }
        }

        return result;
    }

    // Add this method to cancel invitations
    @Transactional
    public Map<String, Object> cancelInvitation(Integer invitationId, Integer userId) throws Exception {
        helper.validateUser(userId);

        GroupInvitation invitation = groupInvitationRepository.findById(invitationId)
                .orElseThrow(() -> new RuntimeException("Invitation not found"));

        // Verify the invitation was sent by this user
        if (!invitation.getInviterId().equals(userId)) {
            throw new RuntimeException("Access denied: You can only cancel invitations you sent");
        }

        // Check if invitation is still pending
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new RuntimeException("Cannot cancel invitation: It has already been " + invitation.getStatus().getDisplayName().toLowerCase());
        }

        invitation.setStatus(InvitationStatus.CANCELLED);
        invitation.setRespondedAt(LocalDateTime.now());
        groupInvitationRepository.save(invitation);

        Group group = groupRepository.findById(invitation.getGroupId()).orElse(null);
        String groupName = group != null ? group.getName() : "Unknown Group";

        Map<String, Object> result = new HashMap<>();
        result.put("message", "Invitation cancelled successfully");
        result.put("invitationId", invitationId);
        result.put("groupName", groupName);

        return result;
    }

    // Add this method to clean up expired invitations (can be called by a scheduled task)
    @Transactional
    public void cleanupExpiredInvitations() {
        List<GroupInvitation> expiredInvitations = groupInvitationRepository
                .findExpiredInvitations(LocalDateTime.now());

        for (GroupInvitation invitation : expiredInvitations) {
            invitation.setStatus(InvitationStatus.EXPIRED);
        }

        if (!expiredInvitations.isEmpty()) {
            groupInvitationRepository.saveAll(expiredInvitations);
        }
    }
}