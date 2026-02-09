package com.jaya.task.user.service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;





@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GoogleUserInfo {

    private String sub; 
    private String email;
    private boolean emailVerified;
    private String name; 
    private String givenName; 
    private String familyName; 
    private String picture; 
    private String locale; 

    
    private String gender; 
    private String birthday; 
    private String phoneNumber; 
}
