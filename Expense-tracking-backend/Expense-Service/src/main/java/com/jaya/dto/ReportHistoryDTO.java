package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;




@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportHistoryDTO {

    private Integer id;
    private String reportName;
    private String reportType;
    private String description;
    private String recipientEmail;
    private String status;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime date;
    private Integer expenseCount;
    private String fileName;
    private String filterCriteria;
    private Integer userId;
    private String userEmail;
}
