package com.jaya.models;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class CreditPaidSummary {
	 private BigDecimal gain = BigDecimal.ZERO;
	    private BigDecimal loss = BigDecimal.ZERO;
	    private BigDecimal difference = BigDecimal.ZERO;
	 // Method to calculate the difference based on gain and loss
	    public void calculateDifference() {
	        this.difference = gain.add(loss).setScale(2, BigDecimal.ROUND_HALF_UP);
	    }
}
