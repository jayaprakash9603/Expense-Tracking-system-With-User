package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupDuplicateRequestDTO {
    private String newGroupName;
    private String newGroupDescription;
    private Boolean includeMembers;
    private Boolean includeSettings;
}