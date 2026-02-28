package com.jaya.dto;


import jakarta.validation.constraints.NotEmpty;
import lombok.Data;
import java.util.List;

@Data
public class BulkDeleteRequest {
    @NotEmpty(message = "Chat IDs list cannot be empty")
    private List<Integer> chatIds;
}