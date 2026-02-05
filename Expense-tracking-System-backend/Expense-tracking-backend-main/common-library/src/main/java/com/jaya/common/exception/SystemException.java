package com.jaya.common.exception;

import com.jaya.common.error.ErrorCode;





public class SystemException extends BaseException {

    private static final long serialVersionUID = 1L;

    public SystemException(ErrorCode errorCode) {
        super(errorCode);
    }

    public SystemException(ErrorCode errorCode, String details) {
        super(errorCode, details);
    }

    public SystemException(ErrorCode errorCode, Throwable cause) {
        super(errorCode, cause);
    }

    public SystemException(ErrorCode errorCode, String details, Throwable cause) {
        super(errorCode, details, cause);
    }

    
    public static SystemException internalError(Throwable cause) {
        return new SystemException(ErrorCode.SYSTEM_INTERNAL_ERROR, cause);
    }

    public static SystemException internalError(String details) {
        return new SystemException(ErrorCode.SYSTEM_INTERNAL_ERROR, details);
    }

    public static SystemException serviceUnavailable(String serviceName) {
        return new SystemException(ErrorCode.SYSTEM_SERVICE_UNAVAILABLE,
                "Service unavailable: " + serviceName);
    }

    public static SystemException badGateway(String downstreamService) {
        return new SystemException(ErrorCode.SYSTEM_BAD_GATEWAY,
                "Downstream service error: " + downstreamService);
    }

    public static SystemException timeout(String operation) {
        return new SystemException(ErrorCode.SYSTEM_TIMEOUT,
                "Timeout during: " + operation);
    }

    public static SystemException databaseError(Throwable cause) {
        return new SystemException(ErrorCode.SYSTEM_DATABASE_ERROR, cause);
    }

    public static SystemException configurationError(String details) {
        return new SystemException(ErrorCode.SYSTEM_CONFIGURATION_ERROR, details);
    }
}
