package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Unified Search Result DTO
 * Represents a single search result from any domain
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {

    /**
     * Unique identifier of the entity
     */
    private String id;

    /**
     * Type of search result: EXPENSE, BUDGET, CATEGORY, BILL, PAYMENT_METHOD,
     * FRIEND
     */
    private SearchResultType type;

    /**
     * Primary display text (e.g., expense name, budget name)
     */
    private String title;

    /**
     * Secondary context text (e.g., "Food • $50.00", "Monthly • Due Jan 15")
     */
    private String subtitle;

    /**
     * Optional icon identifier or emoji
     */
    private String icon;

    /**
     * Optional color for the result (hex or named color)
     */
    private String color;

    /**
     * Additional metadata for the result
     * Can include: amount, date, categoryName, frequency, etc.
     */
    private Map<String, Object> metadata;

    /**
     * Search relevance score (lower is better)
     */
    private Double score;

    /**
     * Enum for search result types
     */
    public enum SearchResultType {
        EXPENSE,
        BUDGET,
        CATEGORY,
        BILL,
        PAYMENT_METHOD,
        FRIEND,
        ACTION,
        REPORT,
        SETTING
    }
}
