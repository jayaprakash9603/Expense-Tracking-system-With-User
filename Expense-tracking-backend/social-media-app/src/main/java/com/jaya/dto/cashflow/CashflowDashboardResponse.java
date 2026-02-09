package com.jaya.dto.cashflow;

import com.jaya.dto.ExpenseDTO;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
public class CashflowDashboardResponse {
    private List<ExpenseDTO> rawExpenses = new ArrayList<>();
    private List<CashflowChartBucketDTO> chartData = new ArrayList<>();
    private List<CashflowCardDTO> cardData = new ArrayList<>();
    private CashflowTotalsDTO totals = new CashflowTotalsDTO();
    private CashflowRangeContextDTO rangeContext;
    private String xKey;
}
