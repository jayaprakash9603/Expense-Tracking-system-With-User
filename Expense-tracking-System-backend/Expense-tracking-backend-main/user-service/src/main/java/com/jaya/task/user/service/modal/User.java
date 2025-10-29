package com.jaya.task.user.service.modal;

import com.jaya.task.user.service.converter.SetToStringConverter;
import jakarta.persistence.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "roles")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @NotBlank(message = "Full name is mandatory")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z\\s]+$", message = "Full name should only contain letters and spaces")
    @Column(name = "full_name")
    private String fullName;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Email should be valid")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is mandatory")
    @Size(min = 6, max = 100, message = "Password must be between 6 and 100 characters")
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number should be valid")
    private String phoneNumber;

    private String username;

    private String website;
    private String location;

    @Size(max = 500, message = "Bio must not exceed 500 characters")
    private String bio;

    @Size(max = 1000, message = "Profile image URL must not exceed 1000 characters")
    @Column(name = "profile_image")
    private String profileImage;

    private String mobile;
    private String occupation;

    @Column(name = "date_of_birth")
    private String dateOfBirth;

    @Size(min = 1, max = 50, message = "First name must be between 1 and 50 characters")
    private String firstName;

    @Size(min = 1, max = 50, message = "Last name must be between 1 and 50 characters")
    private String lastName;

    @Pattern(regexp = "^(MALE|FEMALE|OTHER)$", message = "Gender must be MALE, FEMALE, or OTHER")
    private String gender;

    @Convert(converter = SetToStringConverter.class)
    @Column(name = "roles", columnDefinition = "TEXT")
    private Set<String> roles = new HashSet<>();

    @PastOrPresent(message = "Created date cannot be in the future")
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PastOrPresent(message = "Updated date cannot be in the future")
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (roles == null) {
            roles = new HashSet<>();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // In User.java

    public void addRole(String roleName) {
        if (roleName != null) {
            final String normalized;
            String temp = roleName.toUpperCase().trim();
            if (!temp.startsWith("ROLE_")) {
                normalized = "ROLE_" + temp;
            } else {
                normalized = temp;
            }
            roles.add(normalized);
        }
    }

    public boolean hasRole(String roleName) {
        if (roleName == null)
            return false;
        final String normalized;
        String temp = roleName.toUpperCase().trim();
        if (!temp.startsWith("ROLE_")) {
            normalized = "ROLE_" + temp;
        } else {
            normalized = temp;
        }
        return roles.stream().anyMatch(r -> r.equalsIgnoreCase(normalized));
    }

    public void removeRole(String roleName) {
        if (roleName != null) {
            roles.removeIf(r -> r.equalsIgnoreCase(roleName.trim()));
        }
    }

    public boolean isValidForUpdate() {
        return id != null && email != null && !email.trim().isEmpty();
    }
}