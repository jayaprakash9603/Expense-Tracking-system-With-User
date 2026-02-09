package com.jaya.dto.cashflow;

import lombok.Data;

@Data
public class CashflowRangeContextDTO {
    private String rangeType;
    private Integer offset;
    private String startDate;
    private String endDate;
    private String label;
    private String flowType;
    private String search;
}
