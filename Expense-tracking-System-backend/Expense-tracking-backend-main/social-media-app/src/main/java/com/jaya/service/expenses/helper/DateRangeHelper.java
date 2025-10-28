package com.jaya.service.expenses.helper;

import com.jaya.models.Expense;
import com.jaya.service.expenses.constants.ExpenseConstants;
import com.jaya.service.expenses.vo.DatePeriod;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Helper class for date-range based filtering and operations
 * Follows DRY principle - centralized date logic
 */
@Component
public class DateRangeHelper {

    /**
     * Filter expenses by date range
     */
    public List<Expense> filterByDateRange(List<Expense> expenses, DatePeriod period) {
        if (expenses == null || period == null) {
            return expenses;
        }

        return expenses.stream()
                .filter(expense -> expense.getDate() != null)
                .filter(expense -> period.contains(expense.getDate()))
                .collect(Collectors.toList());
    }

    /**
     * Filter expenses for current month
     */
    public List<Expense> filterByCurrentMonth(List<Expense> expenses) {
        return filterByDateRange(expenses, DatePeriod.currentMonth());
    }

    /**
     * Filter expenses for last month
     */
    public List<Expense> filterByLastMonth(List<Expense> expenses) {
        return filterByDateRange(expenses, DatePeriod.lastMonth());
    }

    /**
     * Filter expenses for specific month and year
     */
    public List<Expense> filterByMonth(List<Expense> expenses, int year, int month) {
        return filterByDateRange(expenses, DatePeriod.forMonth(year, month));
    }

    /**
     * Filter expenses for current week
     */
    public List<Expense> filterByCurrentWeek(List<Expense> expenses) {
        return filterByDateRange(expenses, DatePeriod.currentWeek());
    }

    /**
     * Filter expenses for today
     */
    public List<Expense> filterByToday(List<Expense> expenses) {
        LocalDate today = LocalDate.now();
        return expenses.stream()
                .filter(expense -> expense.getDate() != null)
                .filter(expense -> expense.getDate().equals(today))
                .collect(Collectors.toList());
    }

    /**
     * Get date period for a specific range type
     */
    public DatePeriod getDatePeriodByType(String rangeType, int offset) {
        LocalDate now = LocalDate.now();

        switch (rangeType.toLowerCase()) {
            case ExpenseConstants.PERIOD_DAY:
                LocalDate day = now.minusDays(offset);
                return new DatePeriod(day, day);

            case ExpenseConstants.PERIOD_WEEK:
                LocalDate startOfWeek = now.minusWeeks(offset);
                startOfWeek = startOfWeek.minusDays(startOfWeek.getDayOfWeek().getValue() - 1);
                return new DatePeriod(startOfWeek, startOfWeek.plusDays(6));

            case ExpenseConstants.PERIOD_MONTH:
                YearMonth month = YearMonth.now().minusMonths(offset);
                return DatePeriod.forMonth(month.getYear(), month.getMonthValue());

            case ExpenseConstants.PERIOD_YEAR:
                int year = now.getYear() - offset;
                return DatePeriod.forYear(year);

            default:
                return DatePeriod.currentMonth();
        }
    }

    /**
     * Check if two date ranges overlap
     */
    public boolean doPeriodsOverlap(DatePeriod period1, DatePeriod period2) {
        return !period1.getEndDate().isBefore(period2.getStartDate()) &&
                !period2.getEndDate().isBefore(period1.getStartDate());
    }

    /**
     * Get the month name for a given month number
     */
    public String getMonthName(int month) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }
        return ExpenseConstants.MONTH_NAMES[month - 1];
    }

    /**
     * Get the month label (short form) for a given month number
     */
    public String getMonthLabel(int month) {
        if (month < 1 || month > 12) {
            throw new IllegalArgumentException("Month must be between 1 and 12");
        }
        return ExpenseConstants.MONTH_LABELS[month - 1];
    }
}
