package com.jaya.dto;

import com.jaya.models.GroupRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupResponseDTO {
    private Integer id;
    private String name;
    private String description;
    private Integer createdBy;
    private String createdByUsername;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<Integer> memberIds;
    private List<GroupMemberDTO> members;
    private Integer totalMembers;
    private Map<String, Integer> roleCount;
    private GroupRole currentUserRole; // Role of the requesting user
    private Map<String, Boolean> currentUserPermissions; // Permissions of the requesting user
    private String avatar; // Avatar image URL or base64
    private Integer totalExpenses=0;
}