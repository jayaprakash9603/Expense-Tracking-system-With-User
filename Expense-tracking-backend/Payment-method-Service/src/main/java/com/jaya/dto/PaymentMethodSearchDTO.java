package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;





@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodSearchDTO {
    private Integer id;
    private String name;
    private String description;
    private String type;
    private Integer amount;
    private boolean isGlobal;
    private String icon;
    private String color;
    private Integer userId;
}
