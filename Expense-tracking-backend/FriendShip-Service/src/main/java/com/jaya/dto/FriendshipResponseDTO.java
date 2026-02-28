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
            if (requester.getId().equals(userId)) {
                return requesterAccess;
            } else {
                return recipientAccess;
            }
        } else {
            if (requester.getId().equals(userId)) {
                return recipientAccess;
            } else {
                return requesterAccess;
            }
        }
    }

    public AccessLevel getTheirAccessLevel(Integer userId) {
        if (directionSwapped) {
            if (requester.getId().equals(userId)) {
                return recipientAccess;
            } else {
                return requesterAccess;
            }
        } else {
            if (requester.getId().equals(userId)) {
                return requesterAccess;
            } else {
                return recipientAccess;
            }
        }
    }
}