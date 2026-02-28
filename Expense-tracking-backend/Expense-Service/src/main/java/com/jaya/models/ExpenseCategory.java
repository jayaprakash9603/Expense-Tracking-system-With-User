package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "expense_categories")
public class ExpenseCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String description;

    private String type; 
    private boolean isGlobal = false;

    private String icon = "";
    private String color = "";


    @Column(name = "category_user_id")
    private Integer userId = 0;

    @ElementCollection
    @CollectionTable(name = "category_expense_ids", joinColumns = @JoinColumn(name = "category_id"))
    @MapKeyColumn(name = "expense_key")
    @Lob
    @Column(name = "expense_value", columnDefinition = "LONGBLOB") 
    private Map<Integer, Set<Integer>> expenseIds = new HashMap<>();

    @ElementCollection
    @CollectionTable(name = "category_user_ids", joinColumns = @JoinColumn(name = "category_id"))
    @Column(name = "user_id", columnDefinition = "LONGBLOB")
    private Set<Integer> userIds = new HashSet<>();

    @ElementCollection
    @CollectionTable(
            name = "category_edit_user_ids",
            joinColumns = @JoinColumn(name = "category_id")
    )
    @Column(name = "edit_user_id", columnDefinition = "LONGBLOB")
    private Set<Integer> editUserIds = new HashSet<>();


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
}

