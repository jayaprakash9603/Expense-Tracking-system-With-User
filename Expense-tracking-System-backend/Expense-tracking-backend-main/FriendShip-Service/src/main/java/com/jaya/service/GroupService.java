package com.jaya.service;

import com.jaya.dto.*;
import com.jaya.models.Group;
import com.jaya.models.GroupRole;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface GroupService {

    // Existing methods
    GroupResponseDTO createGroup(GroupRequestDTO groupRequestDTO) throws Exception;
    Optional<GroupResponseDTO> getGroupById(Integer id, Integer userId) throws Exception;

    GroupResponseDTO getGroupById(Integer id) throws Exception;
    List<GroupResponseDTO> getAllUserGroups(Integer userId) throws Exception;
    List<GroupResponseDTO> getGroupsCreatedByUser(Integer userId) throws Exception;
    List<GroupResponseDTO> getGroupsWhereUserIsMember(Integer userId) throws Exception;
    GroupResponseDTO updateGroup(Integer id, GroupUpdateDTO groupUpdateDTO, Integer userId) throws Exception;
    void deleteGroup(Integer id, Integer userId) throws Exception;
    GroupResponseDTO addMemberToGroup(Integer groupId, Integer userId, Integer requesterId) throws Exception;
    GroupResponseDTO removeMemberFromGroup(Integer groupId, Integer userId, Integer requesterId) throws Exception;
    boolean isUserMemberOfGroup(Integer groupId, Integer userId) throws Exception;
    boolean isUserOwnerOfGroup(Integer groupId, Integer userId) throws Exception;
    List<GroupMemberDTO> getGroupMembers(Integer groupId, Integer userId) throws Exception;

    // New role-based methods
    GroupResponseDTO addMemberToGroupWithRole(Integer groupId, Integer userId, GroupRole role, Integer requesterId) throws Exception;
    GroupResponseDTO changeUserRole(Integer groupId, Integer userId, GroupRole newRole, Integer requesterId) throws Exception;
    GroupRole getUserRoleInGroup(Integer groupId, Integer userId) throws Exception;
    boolean hasPermissionInGroup(Integer groupId, Integer userId, String permission) throws Exception;




    // Group Statistics and Analytics
    Map<String, Object> getGroupStatistics(Integer groupId, Integer userId) throws Exception;

    List<Map<String, Object>> getGroupActivity(Integer groupId, Integer userId, int page, int size) throws Exception;

    // Search Groups
    List<GroupResponseDTO> searchGroups(String query, Integer userId, int page, int size) throws Exception;

    // Group Invitations
    Map<String, Object> inviteUserToGroup(Integer groupId, Integer inviteeId, GroupRole role, Integer inviterId) throws Exception;

    List<Map<String, Object>> getPendingInvitations(Integer userId) throws Exception;

    Map<String, Object> respondToInvitation(Integer invitationId, Integer userId, boolean accept) throws Exception;

    // Member Management Advanced
    List<GroupMemberDTO> getMembersByRole(Integer groupId, GroupRole role, Integer userId) throws Exception;

    List<GroupMemberDTO> getRecentMembers(Integer groupId, Integer userId, int limit) throws Exception;

    Map<String, Object> leaveGroup(Integer groupId, Integer userId) throws Exception;

    // Group Settings and Configuration
    GroupResponseDTO updateGroupSettings(Integer groupId, GroupSettingsDTO settings, Integer userId) throws Exception;

    Map<String, Object> getGroupSettings(Integer groupId, Integer userId) throws Exception;

    // Group Templates and Duplication
    GroupResponseDTO duplicateGroup(Integer groupId, GroupDuplicateRequestDTO duplicateRequest, Integer userId) throws Exception;

    // Group Archive/Restore
    Map<String, Object> archiveGroup(Integer groupId, Integer userId) throws Exception;

    Map<String, Object> restoreGroup(Integer groupId, Integer userId) throws Exception;

    List<GroupResponseDTO> getArchivedGroups(Integer userId) throws Exception;

    // Group Export/Import
    Map<String, Object> exportGroupData(Integer groupId, Integer userId, String format) throws Exception;

    // Group Recommendations
    List<Map<String, Object>> getGroupRecommendations(Integer userId, int limit) throws Exception;

    // Group Merge
    Map<String, Object> mergeGroups(Integer sourceGroupId, Integer targetGroupId, GroupMergeRequestDTO mergeRequest, Integer userId) throws Exception;



    // Add these methods to the interface
    List<Map<String, Object>> getSentInvitations(Integer userId) throws Exception;

    Map<String, Object> cancelInvitation(Integer invitationId, Integer userId) throws Exception;

    void cleanupExpiredInvitations();
}