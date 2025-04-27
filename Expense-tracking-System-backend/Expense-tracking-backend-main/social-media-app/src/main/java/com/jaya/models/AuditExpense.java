package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    @ManyToOne
    @JsonIgnore
    private User user;
    private Integer userAuditIndex; // This is your per-user serial number
    private Integer expenseAuditIndex; // This is your per-expense serial number



}