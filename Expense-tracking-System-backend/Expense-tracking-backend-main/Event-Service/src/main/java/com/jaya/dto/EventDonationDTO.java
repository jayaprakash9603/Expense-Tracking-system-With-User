package com.jaya.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDonationDTO {

    private Integer id;
    private Integer eventId;
    private String donorName;
    private String donorContact;
    private BigDecimal amount;
    private LocalDate donationDate;
    private String paymentMethod;
    private String transactionId;
    private String notes;
    private Integer userId;
}