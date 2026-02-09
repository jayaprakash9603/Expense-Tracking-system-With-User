
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

    

    public static UserSummaryDTO fromUser(com.jaya.dto.User user) {
        if (user == null) return null;
        return new UserSummaryDTO(
                Math.toIntExact(user.getId()),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getImage()
        );
    }
}