package com.jaya.mapper;

import com.jaya.dto.*;
import com.jaya.models.Group;
import com.jaya.models.GroupRole;
import com.jaya.common.dto.UserDTO;
import com.jaya.util.ServiceHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class GroupMapper {

    @Autowired
    private ServiceHelper helper;

    public Group toEntity(GroupRequestDTO dto) {
        Group group = new Group();
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setCreatedBy(dto.getCreatedBy());
        group.setMemberIds(dto.getMemberIds() != null ? new HashSet<>(dto.getMemberIds()) : new HashSet<>());
        group.setMemberRoles(new HashMap<>());
        group.setMemberJoinedDates(new HashMap<>());
        group.setMemberAddedBy(new HashMap<>());
        return group;
    }

    public GroupResponseDTO toResponseDTO(Group group, Integer currentUserId) throws Exception {
        GroupResponseDTO dto = new GroupResponseDTO();
        dto.setId(group.getId());
        dto.setName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setCreatedBy(group.getCreatedBy());
        dto.setCreatedAt(group.getCreatedAt());
        dto.setUpdatedAt(group.getUpdatedAt());
        dto.setMemberIds(group.getMemberIds() != null ? new ArrayList<>(group.getMemberIds()) : new ArrayList<>());
        dto.setTotalMembers(group.getMemberIds() != null ? group.getMemberIds().size() : 0);

        dto.setAvatar(group.getAvatar());

        try {
            UserDTO creator = helper.validateUser(group.getCreatedBy());
            dto.setCreatedByUsername(creator.getUsername());
        } catch (Exception e) {
            dto.setCreatedByUsername("Unknown");
        }

        dto.setCurrentUserRole(group.getUserRole(currentUserId));
        dto.setCurrentUserPermissions(getCurrentUserPermissions(group, currentUserId));

        dto.setMembers(getDetailedMembers(group));

        dto.setRoleCount(getRoleCount(group));

        return dto;
    }

    public GroupResponseDTO toResponseDTO(Group group) throws Exception {
        return toResponseDTO(group, group.getCreatedBy());
    }

    public void updateEntityFromDTO(Group group, GroupUpdateDTO dto) {
        if (dto.getName() != null) {
            group.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            group.setDescription(dto.getDescription());
        }
    }

    private List<GroupMemberDTO> getDetailedMembers(Group group) {
        if (group.getMemberIds() == null) {
            return new ArrayList<>();
        }

        return group.getMemberIds().stream()
                .map(memberId -> {
                    try {
                        UserDTO user = helper.validateUser(memberId);
                        GroupMemberDTO memberDTO = new GroupMemberDTO();
                        memberDTO.setUserId(memberId);
                        memberDTO.setUsername(user.getUsername());
                        memberDTO.setFirstName(user.getFirstName());
                        memberDTO.setLastName(user.getLastName());
                        memberDTO.setEmail(user.getEmail());
                        memberDTO.setImage(user.getImage());
                        memberDTO.setRole(group.getUserRole(memberId));
                        memberDTO.setJoinedAt(group.getMemberJoinedDate(memberId));
                        memberDTO.setAddedBy(group.getMemberAddedBy(memberId));

                        Integer addedBy = group.getMemberAddedBy(memberId);
                        if (addedBy != null) {
                            try {
                                UserDTO adder = helper.validateUser(addedBy);
                                memberDTO.setAddedByUsername(adder.getUsername());
                            } catch (Exception e) {
                                memberDTO.setAddedByUsername("Unknown");
                            }
                        }

                        return memberDTO;
                    } catch (Exception e) {
                        return new GroupMemberDTO(
                                memberId,
                                group.getUserRole(memberId),
                                group.getMemberJoinedDate(memberId),
                                group.getMemberAddedBy(memberId));
                    }
                })
                .collect(Collectors.toList());
    }

    private Map<String, Integer> getRoleCount(Group group) {
        Map<String, Integer> roleCount = new HashMap<>();

        if (group.getMemberRoles() != null) {
            for (GroupRole role : GroupRole.values()) {
                roleCount.put(role.name(), 0);
            }

            group.getMemberRoles().values().forEach(role -> roleCount.merge(role.name(), 1, Integer::sum));
        }

        return roleCount;
    }

    private Map<String, Boolean> getCurrentUserPermissions(Group group, Integer userId) {
        Map<String, Boolean> permissions = new HashMap<>();

        permissions.put("canDeleteGroup", group.hasPermission(userId, "delete_group"));
        permissions.put("canEditSettings", group.hasPermission(userId, "edit_settings"));
        permissions.put("canManageMembers", group.hasPermission(userId, "manage_members"));
        permissions.put("canManageExpenses", group.hasPermission(userId, "manage_expenses"));
        permissions.put("canAddExpenses", group.hasPermission(userId, "add_expenses"));
        permissions.put("canEditExpenses", group.hasPermission(userId, "edit_expenses"));
        permissions.put("canDeleteExpenses", group.hasPermission(userId, "delete_expenses"));
        permissions.put("canViewExpenses", group.hasPermission(userId, "view_expenses"));
        permissions.put("canPromoteMembers", group.hasPermission(userId, "promote_members"));
        permissions.put("canDemoteMembers", group.hasPermission(userId, "demote_members"));

        return permissions;
    }
}