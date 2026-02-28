package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;






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

    
    private UserDTO user;

    private UserDTO friend;

    

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_ACCEPTED = "ACCEPTED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_BLOCKED = "BLOCKED";

    

    


    public static FriendshipDTO pendingRequest(Integer userId, Integer friendId) {
        return FriendshipDTO.builder()
                .userId(userId)
                .friendId(friendId)
                .status(STATUS_PENDING)
                .createdAt(LocalDateTime.now())
                .build();
    }

    


    public static FriendshipDTO acceptedFriendship(Long id, Integer userId, Integer friendId) {
        return FriendshipDTO.builder()
                .id(id)
                .userId(userId)
                .friendId(friendId)
                .status(STATUS_ACCEPTED)
                .acceptedAt(LocalDateTime.now())
                .build();
    }

    


    public boolean isPending() {
        return STATUS_PENDING.equals(status);
    }

    


    public boolean isAccepted() {
        return STATUS_ACCEPTED.equals(status);
    }

    


    public boolean isBlocked() {
        return STATUS_BLOCKED.equals(status);
    }
}
