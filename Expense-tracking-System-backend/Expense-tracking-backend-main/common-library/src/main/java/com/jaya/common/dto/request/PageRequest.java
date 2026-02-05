package com.jaya.common.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PageRequest {

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

    

    


    public static PageRequest defaults() {
        return PageRequest.builder().build();
    }

    


    public static PageRequest of(int page, int size) {
        return PageRequest.builder()
                .page(page)
                .size(size)
                .build();
    }

    


    public static PageRequest of(int page, int size, String sortBy, String sortDirection) {
        return PageRequest.builder()
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortDirection(sortDirection)
                .build();
    }

    


    public org.springframework.data.domain.PageRequest toSpringPageRequest() {
        if (sortBy != null && !sortBy.isBlank()) {
            org.springframework.data.domain.Sort.Direction direction = "ASC".equalsIgnoreCase(sortDirection)
                    ? org.springframework.data.domain.Sort.Direction.ASC
                    : org.springframework.data.domain.Sort.Direction.DESC;
            return org.springframework.data.domain.PageRequest.of(page, size,
                    org.springframework.data.domain.Sort.by(direction, sortBy));
        }
        return org.springframework.data.domain.PageRequest.of(page, size);
    }

    


    public boolean isAscending() {
        return "ASC".equalsIgnoreCase(sortDirection);
    }
}
