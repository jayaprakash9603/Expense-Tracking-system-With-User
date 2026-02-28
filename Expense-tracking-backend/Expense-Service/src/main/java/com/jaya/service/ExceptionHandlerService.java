package com.jaya.service;

import com.jaya.exceptions.UserException;
import com.jaya.common.dto.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import javax.naming.NoPermissionException;

@Service
public class ExceptionHandlerService {

    public <T> ResponseEntity<ApiResponse<T>> handleException(Exception e) {
        if (e instanceof UserException) {
            
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("UserDTO not found: " + e.getMessage(), "NOT_FOUND", HttpStatus.NOT_FOUND.value()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("UserDTO error: " + e.getMessage(), "USER_ERROR", HttpStatus.BAD_REQUEST.value()));
        } else if (e instanceof NoPermissionException) {
            
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Permission denied: " + e.getMessage(), "FORBIDDEN", HttpStatus.FORBIDDEN.value()));
        } else if (e instanceof IllegalArgumentException) {
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid input: " + e.getMessage(), "INVALID_INPUT", HttpStatus.BAD_REQUEST.value()));
        } else {
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Unexpected error: " + e.getMessage(), "SERVER_ERROR", HttpStatus.INTERNAL_SERVER_ERROR.value()));
        }
    }
}
