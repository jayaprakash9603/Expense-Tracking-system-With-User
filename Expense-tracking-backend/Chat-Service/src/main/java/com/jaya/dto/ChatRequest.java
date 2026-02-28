package com.jaya.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ChatRequest {

    private Integer recipientId;

    private Integer groupId;

    @NotBlank(message = "Content cannot be empty")
    private String content;
    
    private Integer replyToMessageId;
    
    private Integer forwardedFromMessageId;
    
    private List<Integer> forwardToUserIds;
    
    // Client-generated ID for optimistic update matching
    private String tempId;
}