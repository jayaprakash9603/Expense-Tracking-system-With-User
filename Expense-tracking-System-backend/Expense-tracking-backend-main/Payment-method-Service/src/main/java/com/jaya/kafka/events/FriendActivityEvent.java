package com.jaya.kafka.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.deser.LocalDateTimeDeserializer;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Event DTO for tracking friend activities in Payment Method Service.
 * Used when a friend performs payment method actions on behalf of another user.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendActivityEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * The user whose data was affected (the owner)
     */
    private Integer targetUserId;

    /**
     * The friend who performed the action
     */
    private Integer actorUserId;

    /**
     * Name of the actor (friend) for display purposes
     */
    private String actorUserName;

    /**
     * The service where the action was performed
     */
    private String sourceService;

    /**
     * The type of entity affected
     */
    private String entityType;

    /**
     * The ID of the affected entity
     */
    private Integer entityId;

    /**
     * The action performed (CREATE, UPDATE, DELETE)
     */
    private String action;

    /**
     * Description of the activity for display
     */
    private String description;

    /**
     * Amount involved (if applicable)
     */
    private Double amount;

    /**
     * Additional metadata as JSON string
     */
    private String metadata;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    /**
     * Whether this activity has been read by the target user
     */
    private Boolean isRead;

    /**
     * Source service constants - must match consumer's values
     */
    public static class SourceService {
        public static final String EXPENSE = "EXPENSE";
        public static final String BUDGET = "BUDGET";
        public static final String CATEGORY = "CATEGORY";
        public static final String PAYMENT = "PAYMENT";
        public static final String BILL = "BILL";

        private SourceService() {
        }
    }

    /**
     * Entity type constants
     */
    public static class EntityType {
        public static final String EXPENSE = "EXPENSE";
        public static final String BUDGET = "BUDGET";
        public static final String CATEGORY = "CATEGORY";
        public static final String PAYMENT_METHOD = "PAYMENT_METHOD";
        public static final String BILL = "BILL";

        private EntityType() {
        }
    }

    /**
     * Action constants
     */
    public static class Action {
        public static final String CREATE = "CREATE";
        public static final String UPDATE = "UPDATE";
        public static final String DELETE = "DELETE";

        private Action() {
        }
    }
}
