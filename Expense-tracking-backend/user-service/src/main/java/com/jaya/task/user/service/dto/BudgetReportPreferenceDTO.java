package com.jaya.task.user.service.dto;

import java.time.LocalDateTime;





public class BudgetReportPreferenceDTO {

    private Long id;
    private Integer userId;
    private String layoutConfig;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public BudgetReportPreferenceDTO() {
    }

    public BudgetReportPreferenceDTO(Long id, Integer userId, String layoutConfig,
            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.layoutConfig = layoutConfig;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getLayoutConfig() {
        return layoutConfig;
    }

    public void setLayoutConfig(String layoutConfig) {
        this.layoutConfig = layoutConfig;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
