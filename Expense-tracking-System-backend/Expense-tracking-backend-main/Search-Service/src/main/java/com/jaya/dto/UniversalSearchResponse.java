package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * Universal Search Response DTO
 * Contains grouped search results from all domains
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversalSearchResponse {

    /**
     * The original search query
     */
    private String query;

    /**
     * Total number of results across all sections
     */
    private int totalResults;

    /**
     * Expense search results
     */
    @Builder.Default
    private List<SearchResultDTO> expenses = new ArrayList<>();

    /**
     * Budget search results
     */
    @Builder.Default
    private List<SearchResultDTO> budgets = new ArrayList<>();

    /**
     * Category search results
     */
    @Builder.Default
    private List<SearchResultDTO> categories = new ArrayList<>();

    /**
     * Bill search results
     */
    @Builder.Default
    private List<SearchResultDTO> bills = new ArrayList<>();

    /**
     * Payment method search results
     */
    @Builder.Default
    private List<SearchResultDTO> paymentMethods = new ArrayList<>();

    /**
     * Friend search results
     */
    @Builder.Default
    private List<SearchResultDTO> friends = new ArrayList<>();

    /**
     * Search execution time in milliseconds
     */
    private long executionTimeMs;

    /**
     * Calculate total results
     */
    public void calculateTotalResults() {
        this.totalResults = (expenses != null ? expenses.size() : 0) +
                (budgets != null ? budgets.size() : 0) +
                (categories != null ? categories.size() : 0) +
                (bills != null ? bills.size() : 0) +
                (paymentMethods != null ? paymentMethods.size() : 0) +
                (friends != null ? friends.size() : 0);
    }
}
