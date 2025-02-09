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
    
    private String expenseName;  // New field for expense name
    private String comments; 
    private String generatedTime;

    @Column(nullable = false)
    private LocalDate generatedDate;  // The date the report was generated

    private double totalAmount;  // The total amount of expenses in the report
    private String reportDetails;  // Additional details of the report

    // Any other fields you want in the report, such as category-wise breakdown
}
