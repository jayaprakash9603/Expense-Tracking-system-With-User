package com.jaya.dto.events;

import com.fasterxml.jackson.annotation.JsonAlias;
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
import java.time.LocalDateTime;
import java.util.Map;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class FriendEventDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    private Integer friendshipId;
    private Integer userId;

    private Integer actorId;
    private String actorName;
    private String actorEmail;

    @JsonAlias("friendId")
    private Integer friendId;

    @JsonAlias("friendName")
    private String friendName;

    @JsonAlias("friendEmail")
    private String friendEmail;

    @JsonAlias("friendProfileImage")
    private String friendProfileImage;

    private String action;
    private Integer requesterId;
    private Integer recipientId;
    private String friendshipStatus;

    private String requesterAccess;
    private String recipientAccess;
    private String oldAccessLevel;
    private String newAccessLevel;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    private LocalDateTime timestamp;

    private Object metadata;

    @SuppressWarnings("unchecked")
    public Map<String, Object> getMetadataAsMap() {
        if (metadata instanceof Map) {
            return (Map<String, Object>) metadata;
        }
        return null;
    }

    public String getMetadataAsString() {
        if (metadata instanceof String) {
            return (String) metadata;
        }
        return null;
    }

    public Integer getActorOrFriendId() {
        return actorId != null ? actorId : friendId;
    }

    public String getActorOrFriendName() {
        return actorName != null ? actorName : friendName;
    }

    public String getActorOrFriendEmail() {
        return actorEmail != null ? actorEmail : friendEmail;
    }
}
