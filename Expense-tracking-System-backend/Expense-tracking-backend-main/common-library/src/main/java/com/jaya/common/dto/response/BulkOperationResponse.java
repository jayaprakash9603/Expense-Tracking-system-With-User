package com.jaya.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Common bulk operation response.
 * Used for standardized bulk operation results across all services.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BulkOperationResponse {

    /**
     * Total number of items processed
     */
    private int totalCount;

    /**
     * Number of successful operations
     */
    private int successCount;

    /**
     * Number of failed operations
     */
    private int failedCount;

    /**
     * Number of skipped operations
     */
    private int skippedCount;

    /**
     * Overall success status
     */
    private boolean success;

    /**
     * Summary message
     */
    private String message;

    /**
     * List of individual results
     */
    @Builder.Default
    private List<ItemResult> results = new ArrayList<>();

    /**
     * List of errors (for failed items)
     */
    @Builder.Default
    private List<ItemError> errors = new ArrayList<>();

    // ==================== Nested Classes ====================

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemResult {
        private String id;
        private int index;
        private boolean success;
        private String message;
        private Object data;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemError {
        private String id;
        private int index;
        private String errorCode;
        private String message;
        private List<String> details;
    }

    // ==================== Factory Methods ====================

    /**
     * Create a fully successful response
     */
    public static BulkOperationResponse allSuccess(int count, String message) {
        return BulkOperationResponse.builder()
                .totalCount(count)
                .successCount(count)
                .failedCount(0)
                .skippedCount(0)
                .success(true)
                .message(message)
                .build();
    }

    /**
     * Create a partially successful response
     */
    public static BulkOperationResponse partial(int total, int success, int failed, List<ItemError> errors) {
        return BulkOperationResponse.builder()
                .totalCount(total)
                .successCount(success)
                .failedCount(failed)
                .skippedCount(0)
                .success(failed == 0)
                .message(String.format("Processed %d items: %d succeeded, %d failed", total, success, failed))
                .errors(errors)
                .build();
    }

    /**
     * Create a fully failed response
     */
    public static BulkOperationResponse allFailed(int count, String message, List<ItemError> errors) {
        return BulkOperationResponse.builder()
                .totalCount(count)
                .successCount(0)
                .failedCount(count)
                .skippedCount(0)
                .success(false)
                .message(message)
                .errors(errors)
                .build();
    }

    /**
     * Add a success result
     */
    public void addSuccess(String id, int index, Object data) {
        this.results.add(ItemResult.builder()
                .id(id)
                .index(index)
                .success(true)
                .data(data)
                .build());
        this.successCount++;
    }

    /**
     * Add an error result
     */
    public void addError(String id, int index, String errorCode, String message) {
        this.errors.add(ItemError.builder()
                .id(id)
                .index(index)
                .errorCode(errorCode)
                .message(message)
                .build());
        this.failedCount++;
    }

    /**
     * Complete and finalize the response - calculates totals and sets status
     */
    public BulkOperationResponse complete() {
        this.totalCount = this.successCount + this.failedCount + this.skippedCount;
        this.success = this.failedCount == 0;
        if (this.message == null) {
            this.message = String.format("Processed %d items: %d succeeded, %d failed, %d skipped",
                    totalCount, successCount, failedCount, skippedCount);
        }
        return this;
    }
}
