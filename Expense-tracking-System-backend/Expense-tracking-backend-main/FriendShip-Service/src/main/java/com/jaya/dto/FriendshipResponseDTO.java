// File: com.jaya.dto.FriendshipResponseDTO.java
package com.jaya.dto;

import com.jaya.models.AccessLevel;
import com.jaya.models.FriendshipStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FriendshipResponseDTO {
    private Integer id;
    private UserSummaryDTO requester;
    private UserSummaryDTO recipient;
    private FriendshipStatus status;
    private AccessLevel requesterAccess;
    private AccessLevel recipientAccess;
    private boolean directionSwapped;

    // Constructor without directionSwapped for backward compatibility
    public FriendshipResponseDTO(Integer id, UserSummaryDTO requester, UserSummaryDTO recipient,
                                 FriendshipStatus status, AccessLevel requesterAccess, AccessLevel recipientAccess) {
        this.id = id;
        this.requester = requester;
        this.recipient = recipient;
        this.status = status;
        this.requesterAccess = requesterAccess;
        this.recipientAccess = recipientAccess;
        this.directionSwapped = false;
    }

    // Helper methods for the controller
    public UserSummaryDTO getCurrentUser(Integer userId) {
        if (requester.getId().equals(userId)) {
            return requester;
        } else {
            return recipient;
        }
    }

    public UserSummaryDTO getOtherUser(Integer userId) {
        if (requester.getId().equals(userId)) {
            return recipient;
        } else {
            return requester;
        }
    }

    public AccessLevel getMyAccessLevel(Integer userId) {
        if (directionSwapped) {
            // If direction was swapped, the access levels were also swapped
            if (requester.getId().equals(userId)) {
                return requesterAccess;
            } else {
                return recipientAccess;
            }
        } else {
            // Normal case
            if (requester.getId().equals(userId)) {
                return recipientAccess; // My access to recipient's data
            } else {
                return requesterAccess; // My access to requester's data
            }
        }
    }

    public AccessLevel getTheirAccessLevel(Integer userId) {
        if (directionSwapped) {
            // If direction was swapped, the access levels were also swapped
            if (requester.getId().equals(userId)) {
                return recipientAccess;
            } else {
                return requesterAccess;
            }
        } else {
            // Normal case
            if (requester.getId().equals(userId)) {
                return requesterAccess; // Their access to my data
            } else {
                return recipientAccess; // Their access to my data
            }
        }
    }
}