package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TopExpenseNamesRequest {
    private Integer topN = 500;
    private Integer targetId;
}
