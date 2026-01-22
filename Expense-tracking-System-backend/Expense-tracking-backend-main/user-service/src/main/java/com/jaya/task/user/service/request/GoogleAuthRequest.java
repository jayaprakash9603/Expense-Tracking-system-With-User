package com.jaya.task.user.service.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for Google OAuth2 authentication.
 * Contains user information from Google OAuth response.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    private String credential; // Access token (optional, for verification)

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String name; // Full name from Google
    private String givenName; // First name
    private String familyName; // Last name
    private String picture; // Profile picture URL
    private String sub; // Google's unique user ID

    // Additional fields from Google People API
    private String gender; // Gender (male, female, other)
    private String birthday; // Birthday in format YYYY-MM-DD or MM-DD
    private String phoneNumber; // Phone number if available
    private String locale; // User's locale (e.g., "en", "en-US")
}
