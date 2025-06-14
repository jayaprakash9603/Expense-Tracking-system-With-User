package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "categories")
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String description;

    private String type; // e.g., "income", "expense", "transfer"
    private boolean isGlobal = false;

    private String icon = "";
    private String color = "";

    @ManyToOne
    @JsonIgnore
    private User user;

    @ElementCollection
    @CollectionTable(name = "category_expense_ids", joinColumns = @JoinColumn(name = "category_id"))
    @MapKeyColumn(name = "expense_key")
    @Lob
    @Column(name = "expense_value", columnDefinition = "LONGBLOB") // Changed to LONGBLOB
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


}