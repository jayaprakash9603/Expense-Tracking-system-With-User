package com.jaya.dto;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
    
    
    private String currentStage;        
    private int budgetsProcessed;       
    private int expensesProcessed;      
    private Double itemsPerSecond;      
    private Long elapsedSeconds;        
    private Long estimatedSecondsRemaining; 
    private List<String> recentItems;   
    private int successCount;           
    private int failureCount;           
    private int currentBatch;           
    private int totalBatches;           

    public ProgressStatus() {
        this.recentItems = new ArrayList<>();
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
        this.currentStage = "Initializing";
        this.budgetsProcessed = 0;
        this.expensesProcessed = 0;
        this.recentItems = new ArrayList<>();
        this.successCount = 0;
        this.failureCount = 0;
        this.currentBatch = 0;
        this.totalBatches = 0;
    }
    
    
    public void updateMetrics() {
        if (this.startedAt != null) {
            Duration elapsed = Duration.between(this.startedAt, LocalDateTime.now());
            this.elapsedSeconds = elapsed.getSeconds();
            
            if (this.elapsedSeconds > 0 && this.processed > 0) {
                this.itemsPerSecond = (double) this.processed / this.elapsedSeconds;
                
                if (this.itemsPerSecond > 0) {
                    int remaining = this.total - this.processed;
                    this.estimatedSecondsRemaining = (long) (remaining / this.itemsPerSecond);
                }
            }
        }
    }

    public String getJobId() { return jobId; }
    public void setJobId(String jobId) { this.jobId = jobId; }

    public int getTotal() { return total; }
    public void setTotal(int total) { this.total = total; }

    public int getProcessed() { return processed; }
    public void setProcessed(int processed) { this.processed = processed; }

    public int getPercent() { return percent; }
    public void setPercent(int percent) { this.percent = percent; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public LocalDateTime getStartedAt() { return startedAt; }
    public void setStartedAt(LocalDateTime startedAt) { this.startedAt = startedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    
    public String getCurrentStage() { return currentStage; }
    public void setCurrentStage(String currentStage) { this.currentStage = currentStage; }
    
    public int getBudgetsProcessed() { return budgetsProcessed; }
    public void setBudgetsProcessed(int budgetsProcessed) { this.budgetsProcessed = budgetsProcessed; }
    
    public int getExpensesProcessed() { return expensesProcessed; }
    public void setExpensesProcessed(int expensesProcessed) { this.expensesProcessed = expensesProcessed; }
    
    public Double getItemsPerSecond() { return itemsPerSecond; }
    public void setItemsPerSecond(Double itemsPerSecond) { this.itemsPerSecond = itemsPerSecond; }
    
    public Long getElapsedSeconds() { return elapsedSeconds; }
    public void setElapsedSeconds(Long elapsedSeconds) { this.elapsedSeconds = elapsedSeconds; }
    
    public Long getEstimatedSecondsRemaining() { return estimatedSecondsRemaining; }
    public void setEstimatedSecondsRemaining(Long estimatedSecondsRemaining) { 
        this.estimatedSecondsRemaining = estimatedSecondsRemaining; 
    }
    
    public List<String> getRecentItems() { return recentItems; }
    public void setRecentItems(List<String> recentItems) { this.recentItems = recentItems; }
    
    public int getSuccessCount() { return successCount; }
    public void setSuccessCount(int successCount) { this.successCount = successCount; }
    
    public int getFailureCount() { return failureCount; }
    public void setFailureCount(int failureCount) { this.failureCount = failureCount; }
    
    public int getCurrentBatch() { return currentBatch; }
    public void setCurrentBatch(int currentBatch) { this.currentBatch = currentBatch; }
    
    public int getTotalBatches() { return totalBatches; }
    public void setTotalBatches(int totalBatches) { this.totalBatches = totalBatches; }
}
