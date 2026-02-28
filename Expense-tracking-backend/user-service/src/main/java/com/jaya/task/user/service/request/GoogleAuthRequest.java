package com.jaya.task.user.service.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;





@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthRequest {

    private String credential; 

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String name; 
    private String givenName; 
    private String familyName; 
    private String picture; 
    private String sub; 

    
    private String gender; 
    private String birthday; 
    private String phoneNumber; 
    private String locale; 
}
