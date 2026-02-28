package com.jaya.common.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class BulkOperationRequest {

    


    @NotBlank(message = "Operation type is required")
    private String operation;

    


    private List<Integer> ids;

    


    private List<String> entityIds;

    


    private List<Object> data;

    


    private List<String> updateFields;

    


    private Object updateValues;

    


    @Builder.Default
    private boolean continueOnError = false;

    


    @Builder.Default
    private boolean validateOnly = false;

    

    public static final String OP_CREATE = "CREATE";
    public static final String OP_UPDATE = "UPDATE";
    public static final String OP_DELETE = "DELETE";
    public static final String OP_ARCHIVE = "ARCHIVE";
    public static final String OP_RESTORE = "RESTORE";

    

    


    public static BulkOperationRequest delete(List<Integer> ids) {
        return BulkOperationRequest.builder()
                .operation(OP_DELETE)
                .ids(ids)
                .build();
    }

    


    public static BulkOperationRequest update(List<Integer> ids, Object updateValues) {
        return BulkOperationRequest.builder()
                .operation(OP_UPDATE)
                .ids(ids)
                .updateValues(updateValues)
                .build();
    }

    


    public static BulkOperationRequest create(List<Object> data) {
        return BulkOperationRequest.builder()
                .operation(OP_CREATE)
                .data(data)
                .build();
    }

    


    public boolean isCreate() {
        return OP_CREATE.equalsIgnoreCase(operation);
    }

    


    public boolean isUpdate() {
        return OP_UPDATE.equalsIgnoreCase(operation);
    }

    


    public boolean isDelete() {
        return OP_DELETE.equalsIgnoreCase(operation);
    }
}
