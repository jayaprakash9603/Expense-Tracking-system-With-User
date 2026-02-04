package com.jaya.dto.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Event DTO for Friend Activity events
 * Represents when a friend performs actions on behalf of another user
 * (e.g., friend creates expense for you, friend updates your category, etc.)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class FriendActivityEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    // Target user who should receive the notification
    private Integer targetUserId;

    // Actor user who performed the action
    private Integer actorUserId;
    private String actorUserName;

    // Actor and Target user details
    private UserInfo actorUser;
    private UserInfo targetUser;

    // Source service that generated the event
    private String sourceService; // EXPENSE, CATEGORY, BUDGET, BILL, PAYMENT_METHOD

    // Entity information
    private String entityType; // EXPENSE, CATEGORY, BUDGET, BILL, PAYMENT_METHOD
    private Integer entityId;

    // Action performed
    private String action; // CREATE, UPDATE, DELETE

    // Human-readable description
    private String description;

    // Amount (for expenses, bills, budgets)
    private BigDecimal amount;

    // Additional metadata
    private String metadata;

    // Entity payload for detailed information
    private Map<String, Object> entityPayload;
    private Map<String, Object> previousEntityState;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    private Boolean isRead;

    /**
     * Nested UserInfo class for actor and target user details
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class UserInfo implements Serializable {
        private static final long serialVersionUID = 1L;

        private Integer id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String image;
        private String phoneNumber;
    }
}
