
package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExpenseDetailsDTO {

    private Integer id;
    private String expenseName;
    private Object amount;
    private String type;
    private String paymentMethod;
    private Object netAmount;
    private String comments;
    private Object creditDue;

    @JsonIgnore
    public double getAmountAsDouble() {
        if (amount instanceof Number) {
            return ((Number) amount).doubleValue();
        }
        return 0.0;
    }

    @JsonIgnore
    public double getNetAmountAsDouble() {
        if (netAmount instanceof Number) {
            return ((Number) netAmount).doubleValue();
        }
        return 0.0;
    }

    @JsonIgnore
    public double getCreditDueAsDouble() {
        if (creditDue instanceof Number) {
            return ((Number) creditDue).doubleValue();
        }
        return 0.0;
    }

    @Override
    public String toString() {
        return "ExpenseDetailsDTO{" +
                "id=" + id +
                ", expenseName='" + expenseName + '\'' +
                ", amount=" + amount +
                ", type='" + type + '\'' +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", netAmount=" + netAmount +
                ", comments='" + comments + '\'' +
                ", creditDue=" + creditDue +
                '}';
    }
}