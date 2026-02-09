package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupMergeRequestDTO {
    private String mergedGroupName;
    private String mergedGroupDescription;
    private Boolean deleteSourceGroup;
    private String conflictResolution;
}