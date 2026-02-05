package com.jaya.service.expenses.vo;

import lombok.Value;
import java.time.LocalDate;





@Value
public class DatePeriod {
    LocalDate startDate;
    LocalDate endDate;

    


    public void validate() {
        if (startDate != null && endDate != null && startDate.isAfter(endDate)) {
            throw new IllegalArgumentException("Start date cannot be after end date");
        }
    }

    


    public boolean contains(LocalDate date) {
        if (date == null)
            return false;
        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    


    public long getDays() {
        return java.time.temporal.ChronoUnit.DAYS.between(startDate, endDate) + 1;
    }

    


    public static DatePeriod currentMonth() {
        LocalDate now = LocalDate.now();
        return new DatePeriod(
                now.withDayOfMonth(1),
                now.withDayOfMonth(now.lengthOfMonth()));
    }

    


    public static DatePeriod lastMonth() {
        LocalDate lastMonth = LocalDate.now().minusMonths(1);
        return new DatePeriod(
                lastMonth.withDayOfMonth(1),
                lastMonth.withDayOfMonth(lastMonth.lengthOfMonth()));
    }

    


    public static DatePeriod currentWeek() {
        LocalDate now = LocalDate.now();
        LocalDate startOfWeek = now.minusDays(now.getDayOfWeek().getValue() - 1);
        return new DatePeriod(startOfWeek, startOfWeek.plusDays(6));
    }

    


    public static DatePeriod forMonth(int year, int month) {
        LocalDate date = LocalDate.of(year, month, 1);
        return new DatePeriod(
                date,
                date.withDayOfMonth(date.lengthOfMonth()));
    }

    


    public static DatePeriod forYear(int year) {
        return new DatePeriod(
                LocalDate.of(year, 1, 1),
                LocalDate.of(year, 12, 31));
    }
}
