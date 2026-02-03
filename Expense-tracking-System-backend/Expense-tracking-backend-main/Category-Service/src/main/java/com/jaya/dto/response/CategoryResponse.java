package com.jaya.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryResponse {

    private Integer id;
    private String name;
    private String description;
    private String type;
    private boolean isGlobal;
    private String icon;
    private String color;
    private Integer userId;

    private Map<Integer, Set<Integer>> expenseIds;

    private Set<Integer> userIds;

    private Set<Integer> editUserIds;

    private Integer expenseCount;
}
