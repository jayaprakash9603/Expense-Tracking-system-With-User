package com.jaya.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "momentum_insights", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "user_id", "computed_date" })
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MomentumInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "computed_date", nullable = false)
    private LocalDate computedDate;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String tone;

    @Column(nullable = false)
    private String icon;

    @Column(name = "percent_change")
    private Double percentChange;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(name = "insight_key", nullable = false)
    private String insightKey;

    @Column(name = "current_week_spend")
    private Double currentWeekSpend;

    @Column(name = "previous_week_spend")
    private Double previousWeekSpend;

    @Column(name = "current_week_data_days")
    private Integer currentWeekDataDays;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onSave() {
        this.updatedAt = LocalDateTime.now();
    }
}
