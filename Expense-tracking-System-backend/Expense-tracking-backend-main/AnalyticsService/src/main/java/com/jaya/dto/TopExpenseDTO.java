package com.jaya.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TopExpenseDTO {

    private String name;
    private double amount;
    /** ISO date string (yyyy-MM-dd) of the most recent occurrence. */
    private String date;
    /** Number of occurrences of this expense name in the last 30 days. */
    private int count;
}
