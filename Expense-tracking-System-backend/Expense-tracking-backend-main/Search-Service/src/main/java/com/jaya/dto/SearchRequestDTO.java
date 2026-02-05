package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequestDTO {

    


    private String query;

    


    @Builder.Default
    private Integer limit = 5;

    


    private LocalDate startDate;

    


    private LocalDate endDate;

    


    private Double minAmount;

    


    private Double maxAmount;

    


    private Integer categoryId;

    



    private String sections;

    


    private Integer targetId;
}
