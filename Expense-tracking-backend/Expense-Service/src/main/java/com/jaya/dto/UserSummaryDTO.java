
package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryDTO {
    private Integer id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String image;

    

    public static UserSummaryDTO fromUser(com.jaya.dto.UserDTO UserDTO) {
        if (UserDTO == null) return null;
        return new UserSummaryDTO(
                Math.toIntExact(UserDTO.getId()),
                UserDTO.getUsername(),
                UserDTO.getEmail(),
                UserDTO.getFirstName(),
                UserDTO.getLastName(),
                UserDTO.getImage()
        );
    }
}