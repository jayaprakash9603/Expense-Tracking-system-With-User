package com.jaya.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Unified API response wrapper for all successful responses.
 * Provides consistent response structure across all microservices.
 *
 * @param <T> The type of data being returned
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /**
     * Indicates if the request was successful
     */
    private boolean success;

    /**
     * The response data payload
     */
    private T data;

    /**
     * Human-readable message describing the result
     */
    private String message;

    /**
     * Optional error code for client-side handling
     */
    private String errorCode;

    /**
     * Timestamp of the response
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * HTTP status code
     */
    private int status;

    /**
     * Request path (useful for debugging)
     */
    private String path;

    /**
     * Pagination information for list responses
     */
    private PaginationInfo pagination;

    // ==================== Factory Methods ====================

    /**
     * Create a successful response with data
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message("Success")
                .status(200)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response with data and custom message
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .status(200)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response with message only (no data)
     */
    public static <T> ApiResponse<T> success(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .status(200)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response for list data
     */
    public static <T> ApiResponse<List<T>> successList(List<T> data) {
        return ApiResponse.<List<T>>builder()
                .success(true)
                .data(data)
                .message("Success")
                .status(200)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response for list data with message
     */
    public static <T> ApiResponse<List<T>> successList(List<T> data, String message) {
        return ApiResponse.<List<T>>builder()
                .success(true)
                .data(data)
                .message(message)
                .status(200)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response for paginated list data
     */
    public static <T> ApiResponse<List<T>> successList(List<T> data, String message,
            int page, int size, long totalElements, int totalPages) {
        return ApiResponse.<List<T>>builder()
                .success(true)
                .message(message)
                .data(data)
                .pagination(PaginationInfo.builder()
                        .page(page)
                        .size(size)
                        .totalElements(totalElements)
                        .totalPages(totalPages)
                        .hasNext(page < totalPages - 1)
                        .hasPrevious(page > 0)
                        .build())
                .status(200)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response with data, message, and status
     */
    public static <T> ApiResponse<T> success(T data, String message, int status) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response for created resources (201)
     */
    public static <T> ApiResponse<T> created(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .message(message)
                .status(201)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response with no data (e.g., for DELETE operations)
     */
    public static <T> ApiResponse<T> noContent(String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .status(204)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create an error response
     */
    public static <T> ApiResponse<T> error(String message, String errorCode, int status) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a not found error response
     */
    public static <T> ApiResponse<T> notFound(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("NOT_FOUND")
                .status(404)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a bad request error response
     */
    public static <T> ApiResponse<T> badRequest(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("BAD_REQUEST")
                .status(400)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create an unauthorized error response
     */
    public static <T> ApiResponse<T> unauthorized(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("UNAUTHORIZED")
                .status(401)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a forbidden error response
     */
    public static <T> ApiResponse<T> forbidden(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("FORBIDDEN")
                .status(403)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Pagination information for list responses
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaginationInfo {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean hasNext;
        private boolean hasPrevious;
    }
}
