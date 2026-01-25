package com.jaya.task.user.service.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TwoFactorUpdateRequest {

    @NotNull
    private Boolean enabled;
}
