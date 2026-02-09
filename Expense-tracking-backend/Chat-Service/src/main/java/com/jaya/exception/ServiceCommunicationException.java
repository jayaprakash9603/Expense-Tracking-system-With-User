package com.jaya.exception;

public class ServiceCommunicationException extends RuntimeException {
    private final String serviceName;
    private final int statusCode;

    public ServiceCommunicationException(String message, String serviceName, int statusCode) {
        super(message);
        this.serviceName = serviceName;
        this.statusCode = statusCode;
    }

    public ServiceCommunicationException(String message, String serviceName, int statusCode, Throwable cause) {
        super(message, cause);
        this.serviceName = serviceName;
        this.statusCode = statusCode;
    }

    public String getServiceName() {
        return serviceName;
    }

    public int getStatusCode() {
        return statusCode;
    }
}