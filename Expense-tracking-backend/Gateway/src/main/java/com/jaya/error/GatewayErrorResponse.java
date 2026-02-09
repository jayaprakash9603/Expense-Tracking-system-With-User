package com.jaya.error;

import com.fasterxml.jackson.annotation.JsonFormat;
import java.time.LocalDateTime;

public class GatewayErrorResponse {
    private String error;
    private String message;
    private int status;
    private String path;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;
    private String details;
    private String requestId;

    public GatewayErrorResponse() {
    }

    public GatewayErrorResponse(String error, String message, int status, String path, LocalDateTime timestamp,
            String details, String requestId) {
        this.error = error;
        this.message = message;
        this.status = status;
        this.path = path;
        this.timestamp = timestamp;
        this.details = details;
        this.requestId = requestId;
    }

    public String getError() {
        return error;
    }

    public String getMessage() {
        return message;
    }

    public int getStatus() {
        return status;
    }

    public String getPath() {
        return path;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getDetails() {
        return details;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setError(String error) {
        this.error = error;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }
}