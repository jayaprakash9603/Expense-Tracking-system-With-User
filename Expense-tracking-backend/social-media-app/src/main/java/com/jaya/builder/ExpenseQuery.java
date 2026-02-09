package com.jaya.builder;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
@ToString
public class ExpenseQuery {
    private final Integer userId;
    private final LocalDate startDate;
    private final LocalDate endDate;
    private final String expenseName;
    private final String type;
    private final String paymentMethod;
    private final Double minAmount;
    private final Double maxAmount;
    private final String sortBy;
    private final String sortOrder;
    private final Integer limit;
    private final Integer offset;

    public boolean hasDateRange() {
        return startDate != null && endDate != null;
    }

    public boolean hasAmountRange() {
        return minAmount != null && maxAmount != null;
    }

    public boolean hasFilters() {
        return expenseName != null || type != null || paymentMethod != null ||
                hasDateRange() || hasAmountRange();
    }

    public boolean hasPagination() {
        return limit != null && limit > 0;
    }

    public boolean hasSorting() {
        return sortBy != null && !sortBy.trim().isEmpty();
    }
}