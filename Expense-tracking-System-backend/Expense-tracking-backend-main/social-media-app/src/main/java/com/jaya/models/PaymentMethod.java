package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PaymentMethod {

    @GeneratedValue(strategy = jakarta.persistence.GenerationType.AUTO)
    @Id
    private Integer id;

    @ManyToOne
    @JsonIgnore
    private User user;

    private String name = "";

    private Integer amount = 0;

    private String type = "";

    private boolean isGlobal = false;

    @ElementCollection
    @CollectionTable(name = "payment_method_user_ids", joinColumns = @JoinColumn(name = "payment_method_id"))
    @Column(name = "user_id" , columnDefinition = "LONGBLOB")
    private Set<Integer> userIds = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "payment_method_edit_user_ids", joinColumns = @JoinColumn(name = "payment_method_id"))
    @Column(name = "edit_user_id" , columnDefinition = "LONGBLOB")
    private Set<Integer> editUserIds = new HashSet<>();



    @ElementCollection
    @CollectionTable(name = "payment_method_expense_ids", joinColumns = @JoinColumn(name = "payment_method_id"))
    @Column(name = "expense_id", columnDefinition = "LONGBLOB")
    private Set<Integer> expenseIds = new HashSet<>();
}