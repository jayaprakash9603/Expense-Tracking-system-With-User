package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserDto {

    private Integer id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String location;
    private String bio;
    private String gender;

    @JsonProperty("profileImage")
    private String image;

    private String coverImage;
    private boolean emailNotificationsEnabled;
    private boolean smsNotificationsEnabled;
    private String preferredNotificationTime;
}