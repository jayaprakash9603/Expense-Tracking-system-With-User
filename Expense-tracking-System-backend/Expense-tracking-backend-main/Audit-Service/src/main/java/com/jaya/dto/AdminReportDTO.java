package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReportDTO {
    private Long id;
    private String name;
    private String type;
    private String dateRange;
    private String format;
    private String status;
    private String size;
    private String downloadUrl;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Long generatedBy;
    private String generatedByUsername;
}
