package com.jaya.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MarkSeenRequest {
    private UUID storyId;
    private Integer userId;
    private LocalDateTime seenAt;
}
