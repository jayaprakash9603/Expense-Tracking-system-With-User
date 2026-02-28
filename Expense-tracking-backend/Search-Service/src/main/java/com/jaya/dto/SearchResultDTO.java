package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {

    


    private String id;

    



    private SearchResultType type;

    


    private String title;

    


    private String subtitle;

    


    private String icon;

    


    private String color;

    



    private Map<String, Object> metadata;

    


    private Double score;

    


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
