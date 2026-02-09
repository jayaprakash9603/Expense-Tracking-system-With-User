package com.jaya.models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;




@Entity
@Table(name = "report_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReportHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String reportName;

    @Column(nullable = false)
    private String reportType;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String recipientEmail;

    @Column(nullable = false)
    private String status; 

    @Column(length = 2000)
    private String errorMessage;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime date;

    private Integer expenseCount;

    private String fileName;

    @Column(length = 500)
    private String filterCriteria; 

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Transient
    private String userEmail; 

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (date == null) {
            date = LocalDateTime.now();
        }
    }
}
