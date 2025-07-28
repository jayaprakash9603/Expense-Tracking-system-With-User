package com.jaya.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
    private String image;
    private boolean emailNotificationsEnabled;
    private boolean smsNotificationsEnabled;
    private String preferredNotificationTime;
}