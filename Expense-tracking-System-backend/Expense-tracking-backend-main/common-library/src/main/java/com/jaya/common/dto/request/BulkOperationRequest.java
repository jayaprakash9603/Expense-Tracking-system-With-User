package com.jaya.common.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Common bulk operation request.
 * Used for standardized bulk operations across all services.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BulkOperationRequest {

    /**
     * Operation type: CREATE, UPDATE, DELETE
     */
    @NotBlank(message = "Operation type is required")
    private String operation;

    /**
     * List of entity IDs to operate on (for UPDATE/DELETE)
     */
    private List<Integer> ids;

    /**
     * List of entity IDs as strings (alternative)
     */
    private List<String> entityIds;

    /**
     * Data for bulk create/update operations
     */
    private List<Object> data;

    /**
     * Fields to update (for partial updates)
     */
    private List<String> updateFields;

    /**
     * Common update values (applied to all selected entities)
     */
    private Object updateValues;

    /**
     * Whether to continue on error
     */
    @Builder.Default
    private boolean continueOnError = false;

    /**
     * Whether to validate only (dry run)
     */
    @Builder.Default
    private boolean validateOnly = false;

    // ==================== Operation Types ====================

    public static final String OP_CREATE = "CREATE";
    public static final String OP_UPDATE = "UPDATE";
    public static final String OP_DELETE = "DELETE";
    public static final String OP_ARCHIVE = "ARCHIVE";
    public static final String OP_RESTORE = "RESTORE";

    // ==================== Factory Methods ====================

    /**
     * Create a bulk delete request
     */
    public static BulkOperationRequest delete(List<Integer> ids) {
        return BulkOperationRequest.builder()
                .operation(OP_DELETE)
                .ids(ids)
                .build();
    }

    /**
     * Create a bulk update request
     */
    public static BulkOperationRequest update(List<Integer> ids, Object updateValues) {
        return BulkOperationRequest.builder()
                .operation(OP_UPDATE)
                .ids(ids)
                .updateValues(updateValues)
                .build();
    }

    /**
     * Create a bulk create request
     */
    public static BulkOperationRequest create(List<Object> data) {
        return BulkOperationRequest.builder()
                .operation(OP_CREATE)
                .data(data)
                .build();
    }

    /**
     * Check if this is a create operation
     */
    public boolean isCreate() {
        return OP_CREATE.equalsIgnoreCase(operation);
    }

    /**
     * Check if this is an update operation
     */
    public boolean isUpdate() {
        return OP_UPDATE.equalsIgnoreCase(operation);
    }

    /**
     * Check if this is a delete operation
     */
    public boolean isDelete() {
        return OP_DELETE.equalsIgnoreCase(operation);
    }
}
