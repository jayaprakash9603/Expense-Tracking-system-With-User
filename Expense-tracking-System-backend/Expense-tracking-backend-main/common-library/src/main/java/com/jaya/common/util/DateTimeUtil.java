package com.jaya.common.util;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;

/**
 * Utility class for date and time operations.
 */
public final class DateTimeUtil {

    private DateTimeUtil() {
        // Private constructor to prevent instantiation
    }

    private static final DateTimeFormatter ISO_DATE_TIME_FORMATTER = DateTimeFormatter
            .ofPattern(CommonConstants.DateFormats.ISO_DATE_TIME);
    private static final DateTimeFormatter ISO_DATE_FORMATTER = DateTimeFormatter
            .ofPattern(CommonConstants.DateFormats.ISO_DATE);
    private static final DateTimeFormatter DISPLAY_DATE_FORMATTER = DateTimeFormatter
            .ofPattern(CommonConstants.DateFormats.DISPLAY_DATE);
    private static final DateTimeFormatter DISPLAY_DATE_TIME_FORMATTER = DateTimeFormatter
            .ofPattern(CommonConstants.DateFormats.DISPLAY_DATE_TIME);

    // ========================================
    // CURRENT DATE/TIME METHODS
    // ========================================

    /**
     * Get current LocalDateTime in UTC.
     */
    public static LocalDateTime nowUtc() {
        return LocalDateTime.now(ZoneOffset.UTC);
    }

    /**
     * Get current LocalDateTime in system default timezone.
     */
    public static LocalDateTime now() {
        return LocalDateTime.now();
    }

    /**
     * Get current LocalDate.
     */
    public static LocalDate today() {
        return LocalDate.now();
    }

    /**
     * Get start of today (00:00:00).
     */
    public static LocalDateTime startOfToday() {
        return LocalDate.now().atStartOfDay();
    }

    /**
     * Get end of today (23:59:59.999999999).
     */
    public static LocalDateTime endOfToday() {
        return LocalDate.now().atTime(LocalTime.MAX);
    }

    // ========================================
    // DATE RANGE METHODS
    // ========================================

    /**
     * Get start of week (Monday).
     */
    public static LocalDateTime startOfWeek() {
        return LocalDate.now()
                .with(DayOfWeek.MONDAY)
                .atStartOfDay();
    }

    /**
     * Get start of month.
     */
    public static LocalDateTime startOfMonth() {
        return LocalDate.now()
                .withDayOfMonth(1)
                .atStartOfDay();
    }

    /**
     * Get end of month.
     */
    public static LocalDateTime endOfMonth() {
        return LocalDate.now()
                .withDayOfMonth(LocalDate.now().lengthOfMonth())
                .atTime(LocalTime.MAX);
    }

    /**
     * Get start of year.
     */
    public static LocalDateTime startOfYear() {
        return LocalDate.now()
                .withDayOfYear(1)
                .atStartOfDay();
    }

    // ========================================
    // FORMATTING METHODS
    // ========================================

    /**
     * Format LocalDateTime to ISO format.
     */
    public static String formatIso(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(ISO_DATE_TIME_FORMATTER) : null;
    }

    /**
     * Format LocalDate to ISO format.
     */
    public static String formatIsoDate(LocalDate date) {
        return date != null ? date.format(ISO_DATE_FORMATTER) : null;
    }

    /**
     * Format LocalDateTime for display.
     */
    public static String formatDisplay(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DISPLAY_DATE_TIME_FORMATTER) : null;
    }

    /**
     * Format LocalDate for display.
     */
    public static String formatDisplayDate(LocalDate date) {
        return date != null ? date.format(DISPLAY_DATE_FORMATTER) : null;
    }

    // ========================================
    // PARSING METHODS
    // ========================================

    /**
     * Parse ISO date-time string to LocalDateTime.
     */
    public static LocalDateTime parseIso(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.isBlank()) {
            return null;
        }
        try {
            return LocalDateTime.parse(dateTimeString, ISO_DATE_TIME_FORMATTER);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    /**
     * Parse ISO date string to LocalDate.
     */
    public static LocalDate parseIsoDate(String dateString) {
        if (dateString == null || dateString.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dateString, ISO_DATE_FORMATTER);
        } catch (DateTimeParseException e) {
            return null;
        }
    }

    // ========================================
    // CALCULATION METHODS
    // ========================================

    /**
     * Calculate days between two dates.
     */
    public static long daysBetween(LocalDate start, LocalDate end) {
        return ChronoUnit.DAYS.between(start, end);
    }

    /**
     * Calculate days between two date-times.
     */
    public static long daysBetween(LocalDateTime start, LocalDateTime end) {
        return ChronoUnit.DAYS.between(start.toLocalDate(), end.toLocalDate());
    }

    /**
     * Check if date is in the past.
     */
    public static boolean isPast(LocalDate date) {
        return date != null && date.isBefore(LocalDate.now());
    }

    /**
     * Check if date-time is in the past.
     */
    public static boolean isPast(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isBefore(LocalDateTime.now());
    }

    /**
     * Check if date is in the future.
     */
    public static boolean isFuture(LocalDate date) {
        return date != null && date.isAfter(LocalDate.now());
    }

    /**
     * Check if date-time is in the future.
     */
    public static boolean isFuture(LocalDateTime dateTime) {
        return dateTime != null && dateTime.isAfter(LocalDateTime.now());
    }

    /**
     * Check if date is today.
     */
    public static boolean isToday(LocalDate date) {
        return date != null && date.isEqual(LocalDate.now());
    }

    /**
     * Check if date-time is today.
     */
    public static boolean isToday(LocalDateTime dateTime) {
        return dateTime != null && dateTime.toLocalDate().isEqual(LocalDate.now());
    }

    /**
     * Check if date is within range (inclusive).
     */
    public static boolean isWithinRange(LocalDate date, LocalDate start, LocalDate end) {
        return date != null && !date.isBefore(start) && !date.isAfter(end);
    }

    /**
     * Check if date-time is within range (inclusive).
     */
    public static boolean isWithinRange(LocalDateTime dateTime, LocalDateTime start, LocalDateTime end) {
        return dateTime != null && !dateTime.isBefore(start) && !dateTime.isAfter(end);
    }

    // ========================================
    // RELATIVE TIME METHODS
    // ========================================

    /**
     * Get human-readable relative time (e.g., "2 hours ago", "Yesterday").
     */
    public static String getRelativeTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return "unknown";
        }

        LocalDateTime now = LocalDateTime.now();
        long minutes = ChronoUnit.MINUTES.between(dateTime, now);
        long hours = ChronoUnit.HOURS.between(dateTime, now);
        long days = ChronoUnit.DAYS.between(dateTime, now);

        if (minutes < 0) {
            return "in the future";
        } else if (minutes < 1) {
            return "just now";
        } else if (minutes < 60) {
            return minutes + " minute" + (minutes == 1 ? "" : "s") + " ago";
        } else if (hours < 24) {
            return hours + " hour" + (hours == 1 ? "" : "s") + " ago";
        } else if (days == 1) {
            return "yesterday";
        } else if (days < 7) {
            return days + " days ago";
        } else if (days < 30) {
            long weeks = days / 7;
            return weeks + " week" + (weeks == 1 ? "" : "s") + " ago";
        } else if (days < 365) {
            long months = days / 30;
            return months + " month" + (months == 1 ? "" : "s") + " ago";
        } else {
            long years = days / 365;
            return years + " year" + (years == 1 ? "" : "s") + " ago";
        }
    }
}
