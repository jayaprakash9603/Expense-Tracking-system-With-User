package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

/**
 * Common Category DTO used across all microservices.
 * Contains category information for inter-service communication.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;

    private String name;

    private String description;

    private String type; // e.g., "income", "expense", "transfer"

    @Builder.Default
    private boolean isGlobal = false;

    private String icon;

    private String color;

    private Integer userId;

    @Builder.Default
    private Map<Integer, Set<Integer>> expenseIds = new HashMap<>();

    @Builder.Default
    private Set<Integer> userIds = new HashSet<>();

    @Builder.Default
    private Set<Integer> editUserIds = new HashSet<>();

    private long expenseCount;

    private Double totalAmount;

    // ==================== Category Types ====================

    public static final String TYPE_INCOME = "income";
    public static final String TYPE_EXPENSE = "expense";
    public static final String TYPE_TRANSFER = "transfer";

    // ==================== Factory Methods ====================

    /**
     * Constructor for JPA projection queries
     */
    public CategoryDTO(Integer id, String name, String description, String type,
            boolean isGlobal, String icon, String color, Integer userId) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.type = type;
        this.isGlobal = isGlobal;
        this.icon = icon;
        this.color = color;
        this.userId = userId;
        this.expenseIds = new HashMap<>();
        this.userIds = new HashSet<>();
        this.editUserIds = new HashSet<>();
    }

    /**
     * Create a minimal CategoryDTO
     */
    public static CategoryDTO minimal(Integer id, String name) {
        return CategoryDTO.builder()
                .id(id)
                .name(name)
                .build();
    }

    /**
     * Create CategoryDTO with basic info
     */
    public static CategoryDTO basic(Integer id, String name, String type, String icon, String color) {
        return CategoryDTO.builder()
                .id(id)
                .name(name)
                .type(type)
                .icon(icon)
                .color(color)
                .build();
    }

    /**
     * Create a global CategoryDTO
     */
    public static CategoryDTO global(Integer id, String name, String type, String icon, String color) {
        return CategoryDTO.builder()
                .id(id)
                .name(name)
                .type(type)
                .icon(icon)
                .color(color)
                .isGlobal(true)
                .build();
    }

    /**
     * Create a user-specific CategoryDTO
     */
    public static CategoryDTO forUser(Integer id, String name, String type, Integer userId) {
        return CategoryDTO.builder()
                .id(id)
                .name(name)
                .type(type)
                .userId(userId)
                .isGlobal(false)
                .build();
    }
}
