package com.jaya.dto.share;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for sharing data directly with a friend.
 * This creates a notification for the friend with the share link.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShareWithFriendRequest {

    /**
     * The friend's user ID to share with.
     */
    @NotNull(message = "Friend ID is required")
    private Integer friendId;

    /**
     * Optional personal message to include with the share notification.
     */
    private String message;
}
