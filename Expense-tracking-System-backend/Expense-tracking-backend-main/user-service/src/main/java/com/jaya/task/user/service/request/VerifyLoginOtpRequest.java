package com.jaya.task.user.service.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyLoginOtpRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String otp;
}
