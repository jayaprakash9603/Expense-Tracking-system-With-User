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
import java.util.Map;





@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FriendActivityEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer targetUserId;
    private Integer actorUserId;
    private String actorUserName;
    private UserInfo actorUser;
    private UserInfo targetUser;
    private String sourceService;
    private String entityType;
    private Integer entityId;
    private String action;
    private String description;
    private Double amount;
    private String metadata;
    private Map<String, Object> entityPayload;
    private Map<String, Object> previousEntityState;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    private Boolean isRead;
    private String actorIpAddress;
    private String actorUserAgent;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserInfo implements Serializable {
        private static final long serialVersionUID = 1L;
        private Integer id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String image;
        private String coverImage;
        private String phoneNumber;
        private String location;
        private String bio;

        public String getDisplayName() {
            if (fullName != null && !fullName.trim().isEmpty())
                return fullName;
            if (firstName != null && lastName != null)
                return firstName + " " + lastName;
            if (firstName != null)
                return firstName;
            if (username != null && !username.trim().isEmpty())
                return username;
            return email;
        }
    }

    public static class SourceService {
        public static final String EXPENSE = "EXPENSE";
        public static final String BUDGET = "BUDGET";
        public static final String CATEGORY = "CATEGORY";
        public static final String PAYMENT = "PAYMENT";
        public static final String BILL = "BILL";

        private SourceService() {
        }
    }

    public static class EntityType {
        public static final String EXPENSE = "EXPENSE";
        public static final String BUDGET = "BUDGET";
        public static final String CATEGORY = "CATEGORY";
        public static final String PAYMENT_METHOD = "PAYMENT_METHOD";
        public static final String BILL = "BILL";

        private EntityType() {
        }
    }

    public static class Action {
        public static final String CREATE = "CREATE";
        public static final String UPDATE = "UPDATE";
        public static final String DELETE = "DELETE";

        private Action() {
        }
    }
}
