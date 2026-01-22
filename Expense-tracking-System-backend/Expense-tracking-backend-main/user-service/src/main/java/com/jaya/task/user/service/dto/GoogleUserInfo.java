package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO containing user information extracted from Google ID token.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleUserInfo {

    private String sub; // Google's unique user ID
    private String email;
    private boolean emailVerified;
    private String name; // Full name
    private String givenName; // First name
    private String familyName; // Last name
    private String picture; // Profile picture URL
    private String locale;
}
