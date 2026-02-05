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






@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchRequest {

    


    @Size(max = 500, message = "Search query must not exceed 500 characters")
    private String query;

    


    private Map<String, Object> filters;

    


    private String dateFrom;

    


    private String dateTo;

    


    private List<String> fields;

    


    @Builder.Default
    private boolean fuzzyMatch = false;

    


    @Builder.Default
    private boolean matchAll = true;

    

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

    

    


    public static SearchRequest textSearch(String query) {
        SearchRequest request = new SearchRequest();
        request.setQuery(query);
        return request;
    }

    


    public static SearchRequest filtered(Map<String, Object> filters) {
        SearchRequest request = new SearchRequest();
        request.setFilters(filters);
        return request;
    }

    


    public static SearchRequest dateRange(String dateFrom, String dateTo) {
        SearchRequest request = new SearchRequest();
        request.setDateFrom(dateFrom);
        request.setDateTo(dateTo);
        return request;
    }

    


    public boolean hasQuery() {
        return query != null && !query.isBlank();
    }

    


    public boolean hasFilters() {
        return filters != null && !filters.isEmpty();
    }

    


    public boolean hasDateRange() {
        return dateFrom != null || dateTo != null;
    }
}
