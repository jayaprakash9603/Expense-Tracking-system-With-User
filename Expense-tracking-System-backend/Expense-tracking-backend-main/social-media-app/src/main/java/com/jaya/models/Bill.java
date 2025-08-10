//package com.jaya.models;
//
//
//import com.fasterxml.jackson.annotation.JsonFormat;
//import com.fasterxml.jackson.annotation.JsonIgnore;
//import com.fasterxml.jackson.databind.annotation.JsonSerialize;
//import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateSerializer;
//import jakarta.persistence.*;
//import lombok.*;
//
//import java.time.LocalDate;
//import java.util.ArrayList;
//import java.util.HashSet;
//import java.util.List;
//import java.util.Set;
//
//@Entity
//@Data
//@AllArgsConstructor
//@NoArgsConstructor
//@EqualsAndHashCode
//@ToString
//@Builder
//public class Bill {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.AUTO)
//    private Integer id;
//
//    private String name;
//    private String description;
//    private double amount;
//    private String paymentMethod;
//    private String type;
//    private double creditDue;
//    @JsonFormat(pattern = "yyyy-MM-dd")
//    @JsonSerialize(using = LocalDateSerializer.class)
//    private LocalDate date;
//    private double netAmount;
//
//
//
//
//    @Column(name = "bill_userid")
//    private Integer userId = 0;
//
//
//
//    @ElementCollection
//    @CollectionTable(name = "bill_detailed_expenses", joinColumns = @JoinColumn(name = "bill_id"))
//    @Builder.Default
//    private List<DetailedExpenses>expenses=new ArrayList<>();
//
//
//    @Column(nullable = false)
//    private boolean includeInBudget = false;
//
//    @Column(name = "budget_ids", columnDefinition = "LONGBLOB")
//    private Set<Integer> budgetIds = new HashSet<>();
//
//    private Integer categoryId = 0;
//
//    private Integer expenseId = 0;
//
//}
//
