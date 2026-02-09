package com.jaya.service;

import com.jaya.exceptions.UserException;
import com.jaya.response.ApiResponse;
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
                        .body(new ApiResponse<>("User not found: " + e.getMessage(), "NOT_FOUND"));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("User error: " + e.getMessage(), "USER_ERROR"));
        } else if (e instanceof NoPermissionException) {
            
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new ApiResponse<>("Permission denied: " + e.getMessage(), "FORBIDDEN"));
        } else if (e instanceof IllegalArgumentException) {
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>("Invalid input: " + e.getMessage(), "INVALID_INPUT"));
        } else {
            
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>("Unexpected error: " + e.getMessage(), "SERVER_ERROR"));
        }
    }
}