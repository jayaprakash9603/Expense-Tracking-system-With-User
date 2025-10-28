package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class User {


    @Id
    private Integer id;

    @JsonProperty("full_name")
    private String fullName;

    private String email;

    // Password should not be included in DTOs for security
     private String password;

    @JsonProperty("phone_number")
    private String phoneNumber;

    private String username;
    private String website;
    private String location;
    private String bio;

    @JsonProperty("first_name")
    private String firstName;

    @JsonProperty("last_name")
    private String lastName;

    private String gender;
    private String image; // Added for profile image

    private Set<String> roles = new HashSet<>();

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    // Helper methods
    public String getDisplayName() {
        if (fullName != null && !fullName.trim().isEmpty()) {
            return fullName;
        }
        if (firstName != null && lastName != null) {
            return firstName + " " + lastName;
        }
        if (username != null && !username.trim().isEmpty()) {
            return username;
        }
        return email;
    }

    public boolean hasRole(String roleName) {
        if (roleName == null || roles == null) return false;
        final String normalized;
        String temp = roleName.toUpperCase().trim();
        if (!temp.startsWith("ROLE_")) {
            normalized = "ROLE_" + temp;
        } else {
            normalized = temp;
        }
        return roles.stream().anyMatch(r -> r.equalsIgnoreCase(normalized));
    }
}