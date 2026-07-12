package com.jaya.common.deletion;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PurgeUserResult {

    public enum Status { SUCCEEDED, FAILED, SKIPPED }

    private String sagaId;
    private String idempotencyKey;
    private Integer userId;
    private String service;
    private Status status;
    private String errorCode;
    private String errorMessage;
    private Instant completedAt;
    private int attempt;
}
