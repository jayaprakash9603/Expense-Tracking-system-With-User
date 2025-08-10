package com.jaya.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatRequest {

    private Integer recipientId; // Null for group chats

    private Integer groupId; // Null for one-to-one chats

    @NotBlank(message = "Content cannot be empty")
    private String content;
}