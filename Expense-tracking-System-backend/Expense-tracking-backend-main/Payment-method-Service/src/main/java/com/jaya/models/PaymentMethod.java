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
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@NamedEntityGraph(name = "PaymentMethod.withAllCollections", attributeNodes = {
        @NamedAttributeNode("userIds"),
        @NamedAttributeNode("editUserIds"),
        @NamedAttributeNode("expenseIds")
})
@BatchSize(size = 50) // Batch fetch payment methods to reduce queries
public class PaymentMethod {

    @GeneratedValue(strategy = GenerationType.AUTO)
    @Id
    private Integer id;

    @Column(name = "payment_method_user_id")
    private Integer userId;

    private String name = "";

    private Integer amount = 0;
    private String description;

    private String type = "";

    private boolean isGlobal = false;

    private String icon = "";
    private String color = "";

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "payment_method_user_ids", joinColumns = @JoinColumn(name = "payment_method_id"))
    @Column(name = "user_id", columnDefinition = "LONGBLOB")
    @BatchSize(size = 50) // Batch fetch user IDs collection
    private Set<Integer> userIds = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "payment_method_edit_user_ids", joinColumns = @JoinColumn(name = "payment_method_id"))
    @Column(name = "edit_user_id", columnDefinition = "LONGBLOB")
    @BatchSize(size = 50) // Batch fetch edit user IDs collection
    private Set<Integer> editUserIds = new HashSet<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "payment_method_expense_ids", joinColumns = @JoinColumn(name = "payment_method_id"))
    @MapKeyColumn(name = "expense_key")
    @Lob
    @Column(name = "expense_value", columnDefinition = "LONGBLOB")
    @BatchSize(size = 50) // Batch fetch expense IDs collection
    private Map<Integer, Set<Integer>> expenseIds = new HashMap<>();
}