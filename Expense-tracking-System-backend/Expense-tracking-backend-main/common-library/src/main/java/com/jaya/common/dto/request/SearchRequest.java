package com.jaya.common.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Common search/filter request parameters.
 * Used for standardized searching across all services.
 * Includes pagination parameters directly instead of inheritance.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchRequest {

    /**
     * Search query string
     */
    @Size(max = 500, message = "Search query must not exceed 500 characters")
    private String query;

    /**
     * Field-specific filters (e.g., {"status": "ACTIVE", "categoryId": 1})
     */
    private Map<String, Object> filters;

    /**
     * Date range start (ISO format)
     */
    private String dateFrom;

    /**
     * Date range end (ISO format)
     */
    private String dateTo;

    /**
     * Fields to include in response
     */
    private List<String> fields;

    /**
     * Enable fuzzy matching for search
     */
    @Builder.Default
    private boolean fuzzyMatch = false;

    /**
     * Match all filters (AND) or any filter (OR)
     */
    @Builder.Default
    private boolean matchAll = true;

    // ==================== Pagination Parameters ====================

    @Min(value = 0, message = "Page number must be non-negative")
    @Builder.Default
    private int page = 0;

    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size must not exceed 100")
    @Builder.Default
    private int size = 20;

    private String sortBy;

    @Builder.Default
    private String sortDirection = "DESC";

    // ==================== Factory Methods ====================

    /**
     * Create a simple text search
     */
    public static SearchRequest textSearch(String query) {
        SearchRequest request = new SearchRequest();
        request.setQuery(query);
        return request;
    }

    /**
     * Create a filtered search
     */
    public static SearchRequest filtered(Map<String, Object> filters) {
        SearchRequest request = new SearchRequest();
        request.setFilters(filters);
        return request;
    }

    /**
     * Create a date range search
     */
    public static SearchRequest dateRange(String dateFrom, String dateTo) {
        SearchRequest request = new SearchRequest();
        request.setDateFrom(dateFrom);
        request.setDateTo(dateTo);
        return request;
    }

    /**
     * Check if there's an active search query
     */
    public boolean hasQuery() {
        return query != null && !query.isBlank();
    }

    /**
     * Check if there are active filters
     */
    public boolean hasFilters() {
        return filters != null && !filters.isEmpty();
    }

    /**
     * Check if there's a date range
     */
    public boolean hasDateRange() {
        return dateFrom != null || dateTo != null;
    }
}
