package com.jaya.task.user.service.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PreferenceSaveRequest {
    @NotBlank(message = "Layout configuration is required")
    private String layoutConfig;
}
