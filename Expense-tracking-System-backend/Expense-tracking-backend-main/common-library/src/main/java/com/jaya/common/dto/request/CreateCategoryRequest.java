package com.jaya.common.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.Map;
import java.util.Set;

/**
 * Request DTO for creating a new category.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CreateCategoryRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank(message = "Category name is required")
    @Size(min = 1, max = 100, message = "Category name must be between 1 and 100 characters")
    private String name;

    @Size(max = 500, message = "Description cannot exceed 500 characters")
    private String description;

    @NotBlank(message = "Category type is required")
    private String type;

    @Builder.Default
    private boolean isGlobal = false;

    @Size(max = 50, message = "Icon name cannot exceed 50 characters")
    private String icon;

    @Size(max = 20, message = "Color code cannot exceed 20 characters")
    private String color;

    private Map<Integer, Set<Integer>> expenseIds;
}
