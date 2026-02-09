package com.jaya.util;

import com.jaya.dto.ProgressStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class BulkProgressTracker {
    private final Map<String, ProgressStatus> jobs = new ConcurrentHashMap<>();

    public String start(Integer userId, int total, String message) {
        String jobId = UUID.randomUUID().toString();
        ProgressStatus status = new ProgressStatus(jobId, total, userId);
        status.setStatus("IN_PROGRESS");
        status.setMessage(message);
        jobs.put(jobId, status);
        return jobId;
    }

    public void increment(String jobId, int step) {
        ProgressStatus status = jobs.get(jobId);
        if (status == null) return;
        synchronized (status) {
            int processed = Math.min(status.getProcessed() + Math.max(1, step), status.getTotal());
            status.setProcessed(processed);
            status.setPercent(status.getTotal() == 0 ? 100 : (int) Math.floor((processed * 100.0) / status.getTotal()));
            status.setUpdatedAt(LocalDateTime.now());
        }
    }

    public void complete(String jobId, String message) {
        ProgressStatus status = jobs.get(jobId);
        if (status == null) return;
        status.setProcessed(status.getTotal());
        status.setPercent(100);
        status.setStatus("COMPLETED");
        status.setMessage(message);
        status.setUpdatedAt(LocalDateTime.now());
    }

    public void fail(String jobId, String message) {
        ProgressStatus status = jobs.get(jobId);
        if (status == null) return;
        status.setStatus("FAILED");
        status.setMessage(message);
        status.setUpdatedAt(LocalDateTime.now());
    }

    public ProgressStatus get(String jobId) {
        return jobs.get(jobId);
    }

    public void remove(String jobId) {
        jobs.remove(jobId);
    }
}
