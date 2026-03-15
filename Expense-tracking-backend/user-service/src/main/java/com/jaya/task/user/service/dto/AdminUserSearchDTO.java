package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserSearchDTO {

    private Integer id;
    private String fullName;
    private String email;
    private String profileImage;
    private Set<String> roles;
    private String currentMode;
    private LocalDateTime createdAt;
}
