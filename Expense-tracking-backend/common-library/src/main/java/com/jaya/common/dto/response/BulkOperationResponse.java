package com.jaya.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BulkOperationResponse {

    


    private int totalCount;

    


    private int successCount;

    


    private int failedCount;

    


    private int skippedCount;

    


    private boolean success;

    


    private String message;

    


    @Builder.Default
    private List<ItemResult> results = new ArrayList<>();

    


    @Builder.Default
    private List<ItemError> errors = new ArrayList<>();

    

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

    


    public void addSuccess(String id, int index, Object data) {
        this.results.add(ItemResult.builder()
                .id(id)
                .index(index)
                .success(true)
                .data(data)
                .build());
        this.successCount++;
    }

    


    public void addError(String id, int index, String errorCode, String message) {
        this.errors.add(ItemError.builder()
                .id(id)
                .index(index)
                .errorCode(errorCode)
                .message(message)
                .build());
        this.failedCount++;
    }

    


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
