package com.jaya.dto.share;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShareWithFriendRequest {

    @NotNull(message = "Friend ID is required")
    private Integer friendId;

    private String message;
}
