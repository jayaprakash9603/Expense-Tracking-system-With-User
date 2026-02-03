package com.jaya.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class UpdateCategoryRequest {

    @Size(min = 1, max = 100, message = "Category name must be between 1 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    private String type;

    @Size(max = 50, message = "Icon name cannot exceed 50 characters")
    private String icon;

    @Size(max = 20, message = "Color code cannot exceed 20 characters")
    private String color;

    private Map<Integer, Set<Integer>> expenseIds;
}
