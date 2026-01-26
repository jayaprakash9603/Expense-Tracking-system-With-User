package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for top users by expense activity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopUserDTO {
    private Integer userId;
    private String name;
    private String email;
    private String avatar;
    private long expenseCount;
    private double totalAmount;
    private String rank;
}
