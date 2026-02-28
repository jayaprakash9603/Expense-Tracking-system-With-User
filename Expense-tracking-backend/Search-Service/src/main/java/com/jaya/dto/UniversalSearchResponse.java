package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UniversalSearchResponse {

    


    private String query;

    


    private int totalResults;

    


    @Builder.Default
    private List<SearchResultDTO> expenses = new ArrayList<>();

    


    @Builder.Default
    private List<SearchResultDTO> budgets = new ArrayList<>();

    


    @Builder.Default
    private List<SearchResultDTO> categories = new ArrayList<>();

    


    @Builder.Default
    private List<SearchResultDTO> bills = new ArrayList<>();

    


    @Builder.Default
    private List<SearchResultDTO> paymentMethods = new ArrayList<>();

    


    @Builder.Default
    private List<SearchResultDTO> friends = new ArrayList<>();

    


    private long executionTimeMs;

    


    public void calculateTotalResults() {
        this.totalResults = (expenses != null ? expenses.size() : 0) +
                (budgets != null ? budgets.size() : 0) +
                (categories != null ? categories.size() : 0) +
                (bills != null ? bills.size() : 0) +
                (paymentMethods != null ? paymentMethods.size() : 0) +
                (friends != null ? friends.size() : 0);
    }
}
