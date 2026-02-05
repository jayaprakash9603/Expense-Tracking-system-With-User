package com.jaya.dto;

import java.time.LocalDateTime;

public class ProgressStatus {
    private String jobId;
    private int total;
    private int processed;
    private int percent;
    private String status;
    private String message;
    private Integer userId;
    private LocalDateTime startedAt;
    private LocalDateTime updatedAt;

    public ProgressStatus() {
    }

    public ProgressStatus(String jobId, int total, Integer userId) {
        this.jobId = jobId;
        this.total = Math.max(total, 0);
        this.userId = userId;
        this.processed = 0;
        this.percent = 0;
        this.status = "INIT";
        this.startedAt = LocalDateTime.now();
        this.updatedAt = this.startedAt;
    }

    public String getJobId() {
        return jobId;
    }

    public void setJobId(String jobId) {
        this.jobId = jobId;
    }

    public int getTotal() {
        return total;
    }

    public void setTotal(int total) {
        this.total = total;
    }

    public int getProcessed() {
        return processed;
    }

    public void setProcessed(int processed) {
        this.processed = processed;
    }

    public int getPercent() {
        return percent;
    }

    public void setPercent(int percent) {
        this.percent = percent;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
