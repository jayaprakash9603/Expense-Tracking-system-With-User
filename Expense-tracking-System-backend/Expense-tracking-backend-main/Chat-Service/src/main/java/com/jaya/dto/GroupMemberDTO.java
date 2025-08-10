package com.jaya.dto;

import com.jaya.models.GroupRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMemberDTO {
    private Integer userId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String image;
    private GroupRole role;
    private LocalDateTime joinedAt;
    private Integer addedBy;
    private String addedByUsername;

    // Constructor without user details
    public GroupMemberDTO(Integer userId, GroupRole role, LocalDateTime joinedAt, Integer addedBy) {
        this.userId = userId;
        this.role = role;
        this.joinedAt = joinedAt;
        this.addedBy = addedBy;
    }
}