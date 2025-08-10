package com.jaya.dto;

import com.jaya.models.GroupRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupRequestDTO {
    private String name;
    private String description;
    private Integer createdBy;
    private List<Integer> memberIds;
    private Map<Integer, GroupRole> memberRoles; // Optional: specify roles for initial members
    private String avatar;
}