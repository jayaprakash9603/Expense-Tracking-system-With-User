package com.jaya.task.user.service.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class UserUpdateRequest {

    private Long id;

    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]*$", message = "Full name should only contain letters and spaces")
    private String fullName;

    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    private String password;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number should be valid")
    private String phoneNumber;

    @Size(max = 50, message = "Username must not exceed 50 characters")
    private String username;

    @Size(max = 255, message = "Website URL must not exceed 255 characters")
    private String website;

    @Size(max = 100, message = "Location must not exceed 100 characters")
    private String location;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    @Size(max = 1000, message = "Profile image URL must not exceed 1000 characters")
    private String profileImage;

    @Size(max = 1000, message = "Cover image URL must not exceed 1000 characters")
    private String coverImage;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Mobile number should be valid")
    private String mobile;

    @Size(max = 100, message = "Occupation must not exceed 100 characters")
    private String occupation;

    private String dateOfBirth;

    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    private String firstName;

    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;

    @Pattern(regexp = "^(MALE|FEMALE|OTHER)$", message = "Gender must be MALE, FEMALE, or OTHER")
    private String gender;

    
    @Size(max = 10, message = "User cannot have more than 10 roles")
    private List<String> roleNames;
}