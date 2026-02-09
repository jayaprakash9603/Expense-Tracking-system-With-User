package com.jaya.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "expense_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer reportId;

    @Column(nullable = false)
    private Integer expenseId;
    
    private String expenseName;  
    private String comments; 
    private String generatedTime;

    @Column(nullable = false)
    private LocalDate generatedDate;  

    private double totalAmount;  
    private String reportDetails;  

    
}
