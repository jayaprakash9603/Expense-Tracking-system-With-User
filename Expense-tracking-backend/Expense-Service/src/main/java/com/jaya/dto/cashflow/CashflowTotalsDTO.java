package com.jaya.dto.cashflow;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CashflowTotalsDTO {
    private double inflow;
    private double outflow;
    private double total;
}
