package com.jaya.dto;

import lombok.Data;

@Data
public class ExpenseDTO {
    private Integer id;
    private String date;
    private ExpenseDetailsDTO expense;
    
    

    @Override
    public String toString() {
        return "ExpenseDTO{" +
                "id=" + id +
                ", date='" + date + '\'' +
                ", expense=" + expense +
                '}';
    }
}