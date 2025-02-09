package com.jaya.models;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer expenseId;
    private String actionType;
    private String details;
    private LocalDateTime timestamp;
    
    
    @ElementCollection
    @OneToOne(mappedBy = "auditExpense", cascade = CascadeType.ALL)
    private CommonLog commonLog;
}