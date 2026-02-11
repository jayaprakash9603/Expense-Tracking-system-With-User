package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Set;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;

    private String username;

    private String email;

    private String firstName;

    private String lastName;

    private String fullName;

    private String phoneNumber;

    private String mobile;

    private String location;

    private String bio;

    private String gender;

    @JsonProperty("profileImage")
    private String image;

    private String coverImage;

    private String authProvider;

    private boolean emailNotificationsEnabled;

    private boolean smsNotificationsEnabled;

    private String preferredNotificationTime;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private boolean active;

    private Set<String> roles;

    private String currentMode;

    public boolean hasAdminRole() {
        return roles != null && (roles.contains("ADMIN") || roles.contains("ROLE_ADMIN"));
    }

    public boolean isInAdminMode() {
        return "ADMIN".equalsIgnoreCase(currentMode);
    }

    public String getProfileImage() {
        return image;
    }

    

    


    public static UserDTO minimal(Integer id, String email) {
        return UserDTO.builder()
                .id(id)
                .email(email)
                .build();
    }

    


    public static UserDTO basic(Integer id, String email, String firstName, String lastName) {
        return UserDTO.builder()
                .id(id)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .fullName(firstName + " " + lastName)
                .build();
    }

    


    public String getDisplayName() {
        if (fullName != null && !fullName.isBlank()) {
            return fullName;
        }
        StringBuilder name = new StringBuilder();
        if (firstName != null) {
            name.append(firstName);
        }
        if (lastName != null) {
            if (name.length() > 0) {
                name.append(" ");
            }
            name.append(lastName);
        }
        return name.length() > 0 ? name.toString() : email;
    }
}
