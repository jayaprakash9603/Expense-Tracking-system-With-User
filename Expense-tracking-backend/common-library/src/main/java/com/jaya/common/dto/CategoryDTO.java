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

    private String type; 

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
        return CategoryDTO.builder()
                .id(id)
                .name(name)
                .build();
    }

    


    public static CategoryDTO basic(Integer id, String name, String type, String icon, String color) {
        return CategoryDTO.builder()
                .id(id)
                .name(name)
                .type(type)
                .icon(icon)
                .color(color)
                .build();
    }

    


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

    


    public static CategoryDTO forUser(Integer id, String name, String type, Integer userId) {
        return CategoryDTO.builder()
                .id(id)
                .name(name)
                .type(type)
                .userId(userId)
                .isGlobal(false)
                .build();
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public boolean isGlobal() { return isGlobal; }
    public void setGlobal(boolean isGlobal) { this.isGlobal = isGlobal; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    public Map<Integer, Set<Integer>> getExpenseIds() { return expenseIds; }
    public void setExpenseIds(Map<Integer, Set<Integer>> expenseIds) { this.expenseIds = expenseIds; }
    public Set<Integer> getUserIds() { return userIds; }
    public void setUserIds(Set<Integer> userIds) { this.userIds = userIds; }
    public Set<Integer> getEditUserIds() { return editUserIds; }
    public void setEditUserIds(Set<Integer> editUserIds) { this.editUserIds = editUserIds; }
    public long getExpenseCount() { return expenseCount; }
    public void setExpenseCount(long expenseCount) { this.expenseCount = expenseCount; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
}
