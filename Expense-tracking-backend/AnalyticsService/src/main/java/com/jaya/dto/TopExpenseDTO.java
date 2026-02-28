package com.jaya.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class TopExpenseDTO {

    private String name;
    private double amount;
    private String date;
    private int count;
}
