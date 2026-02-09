package com.jaya.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String eventName;

    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EventStatus status = EventStatus.PLANNING;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private Integer userId;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalBudget = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalExpenses = BigDecimal.ZERO;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal totalDonations = BigDecimal.ZERO;

    @Column(precision = 15, scale = 2)
    private BigDecimal remainingBudget = BigDecimal.ZERO;

    private String location;

    private Integer expectedGuests;

    @Column(length = 2000)
    private String notes;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventExpense> eventExpenses;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventDonation> eventDonations;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventBudget> eventBudgets;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public enum EventType {
        WEDDING, BIRTHDAY, ANNIVERSARY, GANAPATHI_CHAVITHI, DIWALI,
        CHRISTMAS, NEW_YEAR, GRADUATION, BABY_SHOWER, HOUSEWARMING,
        CORPORATE_EVENT, CONFERENCE, PARTY, FESTIVAL, OTHER
    }

    public enum EventStatus {
        PLANNING, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED
    }
}