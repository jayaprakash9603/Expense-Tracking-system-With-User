package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Search Request DTO
 * Contains search query and optional filters
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequestDTO {

    /**
     * Search query text (required)
     */
    private String query;

    /**
     * Maximum results per section (default: 5)
     */
    @Builder.Default
    private Integer limit = 5;

    /**
     * Filter by start date (optional)
     */
    private LocalDate startDate;

    /**
     * Filter by end date (optional)
     */
    private LocalDate endDate;

    /**
     * Filter by minimum amount (optional)
     */
    private Double minAmount;

    /**
     * Filter by maximum amount (optional)
     */
    private Double maxAmount;

    /**
     * Filter by category ID (optional)
     */
    private Integer categoryId;

    /**
     * Which sections to search (null = all)
     * Comma-separated: "expenses,budgets,categories"
     */
    private String sections;

    /**
     * Target user ID for friend view (optional)
     */
    private Integer targetId;
}
