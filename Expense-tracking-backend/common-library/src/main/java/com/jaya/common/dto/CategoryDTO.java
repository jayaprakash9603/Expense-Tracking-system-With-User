package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Data
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;

    private String name;

    private String description;

    private String type;

    private boolean isGlobal = false;

    private String icon;

    private String color;

    private Integer userId;

    private Map<Integer, Set<Integer>> expenseIds = new HashMap<>();

    private Set<Integer> userIds = new HashSet<>();

    private Set<Integer> editUserIds = new HashSet<>();

    private long expenseCount;

    private Double totalAmount;

    public static final String TYPE_INCOME = "income";
    public static final String TYPE_EXPENSE = "expense";
    public static final String TYPE_TRANSFER = "transfer";

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

    public static CategoryDTO minimal(Integer id, String name) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(id);
        dto.setName(name);
        return dto;
    }

    public static CategoryDTO basic(Integer id, String name, String type, String icon, String color) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setType(type);
        dto.setIcon(icon);
        dto.setColor(color);
        return dto;
    }

    public static CategoryDTO global(Integer id, String name, String type, String icon, String color) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setType(type);
        dto.setIcon(icon);
        dto.setColor(color);
        dto.setGlobal(true);
        return dto;
    }

    public static CategoryDTO forUser(Integer id, String name, String type, Integer userId) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(id);
        dto.setName(name);
        dto.setType(type);
        dto.setUserId(userId);
        dto.setGlobal(false);
        return dto;
    }
}
