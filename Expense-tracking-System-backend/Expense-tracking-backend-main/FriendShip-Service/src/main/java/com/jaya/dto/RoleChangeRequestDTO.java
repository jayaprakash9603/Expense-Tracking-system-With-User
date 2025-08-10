package com.jaya.dto;

import com.jaya.models.GroupRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleChangeRequestDTO {
    private Integer userId;
    private GroupRole newRole;
}