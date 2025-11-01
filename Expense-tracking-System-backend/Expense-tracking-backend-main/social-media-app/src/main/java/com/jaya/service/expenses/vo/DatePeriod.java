package com.jaya.service.expenses.vo;

import lombok.Value;
import java.time.LocalDate;

/**
 * Immutable Value Object representing a date period
 * Following Value Object pattern - immutable, equals by value
 */
@Value
public class DatePeriod {
    LocalDate startDate;
    LocalDate endDate;

    /**
     * Validates that start date is before or equal to end date
     */
    public void validate() {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }

    /**
     * Check if a date falls within this period
     */
    public boolean contains(LocalDate date) {
        if (date == null)
            return false;
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    /**
     * Get the number of days in this period
     */
    public long getDays() {
        return java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    /**
     * Create a DatePeriod for current month
     */
    public static DatePeriod currentMonth() {
        LocalDate now = LocalDate.now();
        return new DatePeriod(
                now.withDayOfMonth(1),
                now.withDayOfMonth(now.lengthOfMonth()));
    }

    /**
     * Create a DatePeriod for last month
     */
    public static DatePeriod lastMonth() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        return new DatePeriod(
                lastMonth.withDayOfMonth(1),
                lastMonth.withDayOfMonth(lastMonth.lengthOfMonth()));
    }

    /**
     * Create a DatePeriod for current week
     */
    public static DatePeriod currentWeek() {
        LocalDate now = LocalDate.now();
        LocalDate startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1);
        return new DatePeriod(startOfWeek, startOfWeek.plusDays(6));
    }

    /**
     * Create a DatePeriod for specific month
     */
    public static DatePeriod forMonth(int year, int month) {
        LocalDate date = LocalDate.of(year, month, 1);
        return new DatePeriod(
                date,
                date.withDayOfMonth(date.lengthOfMonth()));
    }

    /**
     * Create a DatePeriod for entire year
     */
    public static DatePeriod forYear(int year) {
        return new DatePeriod(
                LocalDate.of(year, 1, 1),
                LocalDate.of(year, 12, 31));
    }
}
