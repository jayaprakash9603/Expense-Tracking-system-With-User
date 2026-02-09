	package com.jaya.models;
	
	import java.math.BigDecimal;
	import java.time.LocalDate;
	import java.util.Map;
	
	import lombok.Data;
	
	@Data
	public class DailySummary {
	    private LocalDate date;
	    private BigDecimal totalAmount;
	    private Map<String, BigDecimal> categoryBreakdown;
	    private BigDecimal balanceRemaining;
	    private BigDecimal currentMonthCreditDue;
	    private CashSummary cash;
	    private CreditDueSummary creditDueSummary;
	    private CreditPaidSummary creditPaidSummary;
	    private BigDecimal creditPaid;
	    private BigDecimal creditDue;
	    private String creditDueMessage;
	
	    
	}
	
