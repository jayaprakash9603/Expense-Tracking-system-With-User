package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GroupSettingsDTO {
    private Boolean allowMemberInvites;
    private Boolean requireApprovalForExpenses;
    private Boolean allowExpenseEditing;
    private Integer maxMembers;
    private String currency;
    private String timezone;
    private Boolean notificationsEnabled;
}