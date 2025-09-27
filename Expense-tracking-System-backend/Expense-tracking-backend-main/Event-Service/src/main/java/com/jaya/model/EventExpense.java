package com.jaya.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String expenseName;

    @Column(length = 500)
    private String description;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate expenseDate;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String paymentMethod;

    private String vendor;

    private String receiptNumber;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    private Integer userId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}