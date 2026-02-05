package com.jaya.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ChatRequest {

    private Integer recipientId;

    private Integer groupId;

    @NotBlank(message = "Content cannot be empty")
    private String content;
}