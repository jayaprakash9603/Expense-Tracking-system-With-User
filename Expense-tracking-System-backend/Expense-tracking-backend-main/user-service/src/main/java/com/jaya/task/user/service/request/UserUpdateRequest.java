package com.jaya.task.user.service.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class UserUpdateRequest {

    private Long id;

    @NotBlank(message = "Full name is mandatory")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Full name should only contain letters and spaces")
    private String fullName;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    // Optional: Allow password update
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    // Role names as strings
    @Size(max = 10, message = "User cannot have more than 10 roles")
    private List<String> roleNames;
}