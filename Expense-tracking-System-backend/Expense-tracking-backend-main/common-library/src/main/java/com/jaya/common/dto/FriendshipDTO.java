package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Common Friendship DTO used across all microservices.
 * Contains friendship/friend request information for inter-service
 * communication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FriendshipDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    private Integer userId;

    private Integer friendId;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime acceptedAt;

    // User details (populated when needed)
    private UserDTO user;

    private UserDTO friend;

    // ==================== Friendship Status Constants ====================

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_ACCEPTED = "ACCEPTED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_BLOCKED = "BLOCKED";

    // ==================== Factory Methods ====================

    /**
     * Create a pending friend request
     */
    public static FriendshipDTO pendingRequest(Integer userId, Integer friendId) {
        return FriendshipDTO.builder()
                .userId(userId)
                .friendId(friendId)
                .status(STATUS_PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    /**
     * Create an accepted friendship
     */
    public static FriendshipDTO acceptedFriendship(Long id, Integer userId, Integer friendId) {
        return FriendshipDTO.builder()
                .id(id)
                .userId(userId)
                .friendId(friendId)
                .status(STATUS_ACCEPTED)
                .acceptedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Check if friendship is pending
     */
    public boolean isPending() {
        return STATUS_PENDING.equals(status);
    }

    /**
     * Check if friendship is accepted
     */
    public boolean isAccepted() {
        return STATUS_ACCEPTED.equals(status);
    }

    /**
     * Check if friendship is blocked
     */
    public boolean isBlocked() {
        return STATUS_BLOCKED.equals(status);
    }
}
