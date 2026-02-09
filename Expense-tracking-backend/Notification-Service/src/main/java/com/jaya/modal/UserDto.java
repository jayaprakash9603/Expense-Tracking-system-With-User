package com.jaya.modal;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDto {

    private Integer id;
    private String username;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String mobile;
    private String location;
    private String bio;
    private String gender;
    private String image;
    private String profileImage;
    private String coverImage;
    private String website;
    private String occupation;
    private String dateOfBirth;
    private boolean emailNotificationsEnabled;
    private boolean smsNotificationsEnabled;
    private String preferredNotificationTime;
    private Set<String> roles;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}