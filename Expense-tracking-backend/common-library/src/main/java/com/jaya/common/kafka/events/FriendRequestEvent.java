package com.jaya.common.kafka.events;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
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
import java.util.UUID;





@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FriendRequestEvent implements Serializable {

    private static final long serialVersionUID = 1L;

    


    @Builder.Default
    private String eventId = UUID.randomUUID().toString();

    


    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    @JsonDeserialize(using = LocalDateTimeDeserializer.class)
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    



    private String eventType;

    


    private Long requestId;

    


    private Integer senderId;
    private String senderUsername;
    private String senderEmail;
    private String senderFullName;
    private String senderImage;

    


    private Integer receiverId;
    private String receiverUsername;
    private String receiverEmail;
    private String receiverFullName;
    private String receiverImage;

    


    private String message;

    


    private String status;

    


    @Builder.Default
    private String sourceService = "FRIENDSHIP-SERVICE";

    
    public static class EventType {
        public static final String FRIEND_REQUEST_SENT = "FRIEND_REQUEST_SENT";
        public static final String FRIEND_REQUEST_ACCEPTED = "FRIEND_REQUEST_ACCEPTED";
        public static final String FRIEND_REQUEST_REJECTED = "FRIEND_REQUEST_REJECTED";
        public static final String FRIEND_REMOVED = "FRIEND_REMOVED";

        private EventType() {
        }
    }

    
    public static class Status {
        public static final String PENDING = "PENDING";
        public static final String ACCEPTED = "ACCEPTED";
        public static final String REJECTED = "REJECTED";

        private Status() {
        }
    }
}
