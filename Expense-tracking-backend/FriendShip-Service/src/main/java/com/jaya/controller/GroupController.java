
package com.jaya.controller;

import com.jaya.dto.*;
import com.jaya.models.GroupRole;
import com.jaya.models.UserDto;
import com.jaya.service.GroupService;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createGroup(
            @RequestHeader("Authorization") String jwt,
            @RequestBody GroupRequestDTO groupRequestDTO) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            groupRequestDTO.setCreatedBy(user.getId());

            GroupResponseDTO createdGroup = groupService.createGroup(groupRequestDTO);
            return new ResponseEntity<>(createdGroup, HttpStatus.CREATED);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGroupById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            Optional<GroupResponseDTO> group = groupService.getGroupById(id, user.getId());

            if (group.isPresent()) {
                return ResponseEntity.ok(group.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/get-group-by-id")
    public Optional<GroupResponseDTO> getGroupByIdwithService(
            @RequestParam Integer id, @RequestParam Integer userId) throws Exception {
        return groupService.getGroupById(id, userId);

    }

    @GetMapping
    public ResponseEntity<?> getAllUserGroups(@RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<GroupResponseDTO> groups = groupService.getAllUserGroups(user.getId());
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/created")
    public ResponseEntity<?> getGroupsCreatedByUser(@RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<GroupResponseDTO> groups = groupService.getGroupsCreatedByUser(user.getId());
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/member")
    public ResponseEntity<?> getGroupsWhereUserIsMember(@RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<GroupResponseDTO> groups = groupService.getGroupsWhereUserIsMember(user.getId());
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestBody GroupUpdateDTO groupUpdateDTO) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            GroupResponseDTO updatedGroup = groupService.updateGroup(id, groupUpdateDTO, user.getId());
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            groupService.deleteGroup(id, user.getId());
            return ResponseEntity.ok(Map.of("message", "Group deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/members/{userId}")
    public ResponseEntity<?> addMemberToGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @PathVariable Integer userId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            GroupResponseDTO updatedGroup = groupService.addMemberToGroup(groupId, userId, user.getId());
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/members/{userId}/role")
    public ResponseEntity<?> addMemberToGroupWithRole(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @PathVariable Integer userId,
            @RequestBody RoleChangeRequestDTO roleRequest) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            GroupResponseDTO updatedGroup = groupService.addMemberToGroupWithRole(
                    groupId, userId, roleRequest.getNewRole(), user.getId());
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    public ResponseEntity<?> removeMemberFromGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @PathVariable Integer userId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            GroupResponseDTO updatedGroup = groupService.removeMemberFromGroup(groupId, userId, user.getId());
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{groupId}/members/{userId}/role")
    public ResponseEntity<?> changeUserRole(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @PathVariable Integer userId,
            @RequestBody RoleChangeRequestDTO roleRequest) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            GroupResponseDTO updatedGroup = groupService.changeUserRole(
                    groupId, userId, roleRequest.getNewRole(), user.getId());
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/members")
    public ResponseEntity<?> getGroupMembers(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<GroupMemberDTO> members = groupService.getGroupMembers(groupId, user.getId());
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/role")
    public ResponseEntity<?> getUserRoleInGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            GroupRole role = groupService.getUserRoleInGroup(groupId, user.getId());
            return ResponseEntity.ok(Map.of("role", role));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/permissions")
    public ResponseEntity<?> getUserPermissions(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            Map<String, Boolean> permissions = Map.of(
                    "canDeleteGroup", groupService.hasPermissionInGroup(groupId, user.getId(), "delete_group"),
                    "canEditSettings", groupService.hasPermissionInGroup(groupId, user.getId(), "edit_settings"),
                    "canManageMembers", groupService.hasPermissionInGroup(groupId, user.getId(), "manage_members"),
                    "canManageExpenses", groupService.hasPermissionInGroup(groupId, user.getId(), "manage_expenses"),
                    "canAddExpenses", groupService.hasPermissionInGroup(groupId, user.getId(), "add_expenses"),
                    "canEditExpenses", groupService.hasPermissionInGroup(groupId, user.getId(), "edit_expenses"),
                    "canDeleteExpenses", groupService.hasPermissionInGroup(groupId, user.getId(), "delete_expenses"),
                    "canViewExpenses", groupService.hasPermissionInGroup(groupId, user.getId(), "view_expenses"),
                    "canPromoteMembers", groupService.hasPermissionInGroup(groupId, user.getId(), "promote_members"),
                    "canDemoteMembers", groupService.hasPermissionInGroup(groupId, user.getId(), "demote_members"));
            return ResponseEntity.ok(permissions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/check-permission/{permission}")
    public ResponseEntity<?> checkSpecificPermission(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @PathVariable String permission) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            boolean hasPermission = groupService.hasPermissionInGroup(groupId, user.getId(), permission);
            return ResponseEntity.ok(Map.of("hasPermission", hasPermission));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/is-member")
    public ResponseEntity<?> isUserMemberOfGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            boolean isMember = groupService.isUserMemberOfGroup(groupId, user.getId());
            return ResponseEntity.ok(Map.of("isMember", isMember));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/is-owner")
    public ResponseEntity<?> isUserOwnerOfGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            boolean isOwner = groupService.isUserOwnerOfGroup(groupId, user.getId());
            return ResponseEntity.ok(Map.of("isOwner", isOwner));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/members/bulk-add")
    public ResponseEntity<?> bulkAddMembers(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @RequestBody List<RoleChangeRequestDTO> memberRequests) {
        try {
            UserDto user = userService.getuserProfile(jwt);

            for (RoleChangeRequestDTO request : memberRequests) {
                try {
                    groupService.addMemberToGroupWithRole(
                            groupId, request.getUserId(), request.getNewRole(), user.getId());
                } catch (Exception e) {
                    System.err.println("Failed to add member " + request.getUserId() + ": " + e.getMessage());
                }
            }

            Optional<GroupResponseDTO> updatedGroup = groupService.getGroupById(groupId, user.getId());
            return ResponseEntity.ok(updatedGroup.orElse(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{groupId}/members/bulk-remove")
    public ResponseEntity<?> bulkRemoveMembers(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @RequestBody List<Integer> userIds) {
        try {
            UserDto user = userService.getuserProfile(jwt);

            for (Integer userId : userIds) {
                try {
                    groupService.removeMemberFromGroup(groupId, userId, user.getId());
                } catch (Exception e) {
                    System.err.println("Failed to remove member " + userId + ": " + e.getMessage());
                }
            }

            Optional<GroupResponseDTO> updatedGroup = groupService.getGroupById(groupId, user.getId());
            return ResponseEntity.ok(updatedGroup.orElse(null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/roles")
    public ResponseEntity<?> getAvailableRoles() {
        try {
            Map<String, Object> roles = Map.of(
                    "ADMIN", Map.of(
                            "name", GroupRole.ADMIN.getDisplayName(),
                            "description", GroupRole.ADMIN.getDescription(),
                            "permissions", Map.of(
                                    "canDeleteGroup", GroupRole.ADMIN.canDeleteGroup(),
                                    "canEditGroupSettings", GroupRole.ADMIN.canEditGroupSettings(),
                                    "canManageMembers", GroupRole.ADMIN.canManageMembers(),
                                    "canManageExpenses", GroupRole.ADMIN.canManageExpenses(),
                                    "canPromoteMembers", GroupRole.ADMIN.canPromoteMembers())),
                    "MODERATOR", Map.of(
                            "name", GroupRole.MODERATOR.getDisplayName(),
                            "description", GroupRole.MODERATOR.getDescription(),
                            "permissions", Map.of(
                                    "canDeleteGroup", GroupRole.MODERATOR.canDeleteGroup(),
                                    "canEditGroupSettings", GroupRole.MODERATOR.canEditGroupSettings(),
                                    "canManageMembers", GroupRole.MODERATOR.canManageMembers(),
                                    "canManageExpenses", GroupRole.MODERATOR.canManageExpenses(),
                                    "canPromoteMembers", GroupRole.MODERATOR.canPromoteMembers())),
                    "MEMBER", Map.of(
                            "name", GroupRole.MEMBER.getDisplayName(),
                            "description", GroupRole.MEMBER.getDescription(),
                            "permissions", Map.of(
                                    "canDeleteGroup", GroupRole.MEMBER.canDeleteGroup(),
                                    "canEditGroupSettings", GroupRole.MEMBER.canEditGroupSettings(),
                                    "canManageMembers", GroupRole.MEMBER.canManageMembers(),
                                    "canManageExpenses", GroupRole.MEMBER.canManageExpenses(),
                                    "canPromoteMembers", GroupRole.MEMBER.canPromoteMembers())),
                    "VIEWER", Map.of(
                            "name", GroupRole.VIEWER.getDisplayName(),
                            "description", GroupRole.VIEWER.getDescription(),
                            "permissions", Map.of(
                                    "canDeleteGroup", GroupRole.VIEWER.canDeleteGroup(),
                                    "canEditGroupSettings", GroupRole.VIEWER.canEditGroupSettings(),
                                    "canManageMembers", GroupRole.VIEWER.canManageMembers(),
                                    "canManageExpenses", GroupRole.VIEWER.canManageExpenses(),
                                    "canPromoteMembers", GroupRole.VIEWER.canPromoteMembers())));
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/stats")
    public ResponseEntity<?> getGroupStatistics(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            Map<String, Object> stats = groupService.getGroupStatistics(groupId, user.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/activity")
    public ResponseEntity<?> getGroupActivity(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<Map<String, Object>> activities = groupService.getGroupActivity(groupId, user.getId(), page, size);
            return ResponseEntity.ok(activities);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchGroups(
            @RequestHeader("Authorization") String jwt,
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<GroupResponseDTO> groups = groupService.searchGroups(query, user.getId(), page, size);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/invite")
    public ResponseEntity<?> inviteUserToGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @RequestBody GroupInviteRequestDTO inviteRequest) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        Map<String, Object> result = groupService.inviteUserToGroup(
                groupId,
                inviteRequest.getUserId(),
                inviteRequest.getRole(),
                user.getId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/invitations/pending")
    public ResponseEntity<List<Map<String, Object>>> getPendingInvitations(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        List<Map<String, Object>> invitations = groupService.getPendingInvitations(user.getId());
        return ResponseEntity.ok(invitations);
    }

    @GetMapping("/invitations/sent")
    public ResponseEntity<List<Map<String, Object>>> getSentInvitations(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        List<Map<String, Object>> invitations = groupService.getSentInvitations(user.getId());
        return ResponseEntity.ok(invitations);
    }

    @PutMapping("/invitations/{invitationId}/respond")
    public ResponseEntity<?> respondToInvitation(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer invitationId,
            @RequestParam boolean accept) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        Map<String, Object> result = groupService.respondToInvitation(invitationId, user.getId(), accept);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{groupId}/members/by-role/{role}")
    public ResponseEntity<?> getMembersByRole(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @PathVariable GroupRole role) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<GroupMemberDTO> members = groupService.getMembersByRole(groupId, role, user.getId());
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/members/recent")
    public ResponseEntity<?> getRecentMembers(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<GroupMemberDTO> members = groupService.getRecentMembers(groupId, user.getId(), limit);
            return ResponseEntity.ok(members);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            Map<String, Object> result = groupService.leaveGroup(groupId, user.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/invitations/{invitationId}/cancel")
    public ResponseEntity<?> cancelInvitation(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer invitationId) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        Map<String, Object> result = groupService.cancelInvitation(invitationId, user.getId());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{groupId}/settings")
    public ResponseEntity<?> updateGroupSettings(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @RequestBody GroupSettingsDTO settings) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            GroupResponseDTO updatedGroup = groupService.updateGroupSettings(groupId, settings, user.getId());
            return ResponseEntity.ok(updatedGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/settings")
    public ResponseEntity<?> getGroupSettings(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            Map<String, Object> settings = groupService.getGroupSettings(groupId, user.getId());
            return ResponseEntity.ok(settings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{groupId}/duplicate")
    public ResponseEntity<?> duplicateGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @RequestBody GroupDuplicateRequestDTO duplicateRequest) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            GroupResponseDTO newGroup = groupService.duplicateGroup(groupId, duplicateRequest, user.getId());
            return ResponseEntity.ok(newGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{groupId}/archive")
    public ResponseEntity<?> archiveGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            Map<String, Object> result = groupService.archiveGroup(groupId, user.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{groupId}/restore")
    public ResponseEntity<?> restoreGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            Map<String, Object> result = groupService.restoreGroup(groupId, user.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/archived")
    public ResponseEntity<?> getArchivedGroups(
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<GroupResponseDTO> groups = groupService.getArchivedGroups(user.getId());
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/export")
    public ResponseEntity<?> exportGroupData(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId,
            @RequestParam(defaultValue = "json") String format) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            Map<String, Object> exportData = groupService.exportGroupData(groupId, user.getId(), format);
            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/recommendations")
    public ResponseEntity<?> getGroupRecommendations(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "5") int limit) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<Map<String, Object>> recommendations = groupService.getGroupRecommendations(user.getId(), limit);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{sourceGroupId}/merge/{targetGroupId}")
    public ResponseEntity<?> mergeGroups(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer sourceGroupId,
            @PathVariable Integer targetGroupId,
            @RequestBody GroupMergeRequestDTO mergeRequest) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            Map<String, Object> result = groupService.mergeGroups(sourceGroupId, targetGroupId, mergeRequest,
                    user.getId());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/friends-not-in-group")
    public ResponseEntity<?> getFriendsNotInGroup(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            List<UserDto> friendsNotInGroup = groupService.getFriendsNotInGroup(user.getId(), groupId);
            return ResponseEntity.ok(friendsNotInGroup);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{groupId}/invitations/sent")
    public ResponseEntity<List<Map<String, Object>>> getSentInvitationsByGroupId(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer groupId) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        List<Map<String, Object>> invitations = groupService.getSentInvitationsByGroupId(groupId, user.getId());
        return ResponseEntity.ok(invitations);
    }

    @PutMapping("/invitations/{invitationId}/cancel")
    public ResponseEntity<?> cancelInvitationStatusOnly(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer invitationId) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        groupService.updateInvitationStatusToCancelled(invitationId);
        return ResponseEntity.ok(Map.of("message", "Invitation status updated to CANCELLED"));
    }

}
