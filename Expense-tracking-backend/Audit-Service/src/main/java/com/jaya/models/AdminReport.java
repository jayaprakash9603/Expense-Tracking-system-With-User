package com.jaya.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(name = "date_range")
    private String dateRange;

    @Column(nullable = false)
    private String format;

    @Column(nullable = false)
    private String status;

    private String size;

    @Column(name = "file_path")
    private String filePath;

    @Column(name = "download_url")
    private String downloadUrl;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "generated_by")
    private Long generatedBy;

    @Column(name = "generated_by_username")
    private String generatedByUsername;

    @Column(name = "error_message")
    private String errorMessage;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
    }
}
