package com.jaya.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.BatchSize;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "categories")
@NamedEntityGraph(name = "Category.withAllCollections", attributeNodes = {
                @NamedAttributeNode("expenseIds"),
                @NamedAttributeNode("userIds"),
                @NamedAttributeNode("editUserIds")
})
@BatchSize(size = 50)
public class Category {
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

        @Column(name = "edit_count")
        private Integer editCount = 0;

        @Column(name = "is_edited")
        private Boolean isEdited = false;

        @ElementCollection(fetch = FetchType.LAZY)
        @CollectionTable(name = "category_expense_ids", joinColumns = @JoinColumn(name = "category_id"))
        @MapKeyColumn(name = "expense_key")
        @Lob
        @Column(name = "expense_value", columnDefinition = "LONGBLOB")
        @BatchSize(size = 50)
        private Map<Integer, Set<Integer>> expenseIds = new HashMap<>();

        @ElementCollection(fetch = FetchType.LAZY)
        @CollectionTable(name = "category_user_ids", joinColumns = @JoinColumn(name = "category_id"))
        @Column(name = "user_id", columnDefinition = "LONGBLOB")
        @BatchSize(size = 50)
        private Set<Integer> userIds = new HashSet<>();

        @ElementCollection(fetch = FetchType.LAZY)
        @CollectionTable(name = "category_edit_user_ids", joinColumns = @JoinColumn(name = "category_id"))
        @Column(name = "edit_user_id", columnDefinition = "LONGBLOB")
        @BatchSize(size = 50)
        private Set<Integer> editUserIds = new HashSet<>();
}
