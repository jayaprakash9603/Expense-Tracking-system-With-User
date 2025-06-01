package com.jaya.models;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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


}
