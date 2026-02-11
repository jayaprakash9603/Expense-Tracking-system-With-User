package com.jaya.dto;

import com.jaya.common.dto.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryDTO {
    private Integer id;
    private String firstName;
    private String lastName;
    private String email;
    private String profilePicture;

    public static UserSummaryDTO fromUser(UserDTO user) {
        UserSummaryDTO dto = new UserSummaryDTO();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setProfilePicture(user.getImage());
        return dto;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}