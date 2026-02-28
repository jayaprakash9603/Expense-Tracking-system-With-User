package com.jaya.common.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;





@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentMethodDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;

    private String name;

    private String description;

    private String type;

    private String icon;

    private String color;

    private Integer userId;

    @Builder.Default
    private boolean isGlobal = false;

    @Builder.Default
    private boolean isDefault = false;

    @Builder.Default
    private boolean active = true;

    private long transactionCount;

    private Double totalAmount;

    

    public static final String TYPE_CASH = "cash";
    public static final String TYPE_CREDIT_CARD = "credit_card";
    public static final String TYPE_DEBIT_CARD = "debit_card";
    public static final String TYPE_BANK_TRANSFER = "bank_transfer";
    public static final String TYPE_UPI = "upi";
    public static final String TYPE_WALLET = "wallet";
    public static final String TYPE_CHEQUE = "cheque";
    public static final String TYPE_OTHER = "other";

    

    


    public static PaymentMethodDTO minimal(Integer id, String name) {
        return PaymentMethodDTO.builder()
                .id(id)
                .name(name)
                .build();
    }

    


    public static PaymentMethodDTO basic(Integer id, String name, String type, String icon, String color) {
        return PaymentMethodDTO.builder()
                .id(id)
                .name(name)
                .type(type)
                .icon(icon)
                .color(color)
                .build();
    }

    


    public static PaymentMethodDTO global(Integer id, String name, String type) {
        return PaymentMethodDTO.builder()
                .id(id)
                .name(name)
                .type(type)
                .isGlobal(true)
                .build();
    }

    


    public static PaymentMethodDTO forUser(Integer id, String name, String type, Integer userId) {
        return PaymentMethodDTO.builder()
                .id(id)
                .name(name)
                .type(type)
                .userId(userId)
                .isGlobal(false)
                .build();
    }
}
