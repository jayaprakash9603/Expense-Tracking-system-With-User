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
@Table(name = "event_donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDonation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String donorName;

    private String donorContact;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate donationDate;

    @Column(nullable = false)
    private String paymentMethod;

    private String transactionId;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private Integer userId;

    @CreationTimestamp
    private LocalDateTime createdAt;
}