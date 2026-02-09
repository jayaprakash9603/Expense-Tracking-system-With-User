package com.jaya.mapper;

import com.jaya.dto.BillRequestDTO;
import com.jaya.dto.BillResponseDTO;
import com.jaya.dto.DetailedExpensesDTO;
import com.jaya.models.Bill;
import com.jaya.models.DetailedExpenses;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

public class BillMapper {

    public static Bill toEntity(BillRequestDTO dto, Integer defaultUserId) {
        if (dto == null)
            return null;
        Bill bill = new Bill();
        bill.setId(dto.getId());
        bill.setName(dto.getName());
        bill.setDescription(dto.getDescription());
        bill.setAmount(dto.getAmount());
        bill.setPaymentMethod(dto.getPaymentMethod());
        bill.setType(dto.getType());
        bill.setCreditDue(dto.getCreditDue());
        bill.setDate(dto.getDate());
        bill.setNetAmount(dto.getNetAmount());
        bill.setUserId(dto.getUserId() != null ? dto.getUserId() : defaultUserId);
        bill.setIncludeInBudget(dto.isIncludeInBudget());
        bill.setBudgetIds(dto.getBudgetIds());
        bill.setCategoryId(dto.getCategoryId());
        bill.setExpenseId(dto.getExpenseId());
        bill.setCategory(dto.getCategory() != null ? dto.getCategory() : "Others");

        if (dto.getExpenses() != null) {
            List<DetailedExpenses> list = dto.getExpenses().stream().map(d -> {
                DetailedExpenses de = new DetailedExpenses();
                de.setItemName(d.getItemName());
                de.setQuantity(d.getQuantity());
                de.setUnitPrice(d.getUnitPrice());
                de.setTotalPrice(d.getTotalPrice());
                de.setComments(d.getComments());
                return de;
            }).collect(Collectors.toList());
            bill.setExpenses(list);
        } else {
            bill.setExpenses(new ArrayList<>());
        }

        return bill;
    }

    public static BillResponseDTO toDto(Bill bill) {
        if (bill == null)
            return null;
        List<DetailedExpensesDTO> details = Collections.emptyList();
        if (bill.getExpenses() != null) {
            details = bill.getExpenses().stream()
                    .map(e -> new DetailedExpensesDTO(e.getItemName(), e.getQuantity(), e.getUnitPrice(),
                            e.getTotalPrice(), e.getComments()))
                    .collect(Collectors.toList());
        }

        return new BillResponseDTO(
                bill.getId(),
                bill.getName(),
                bill.getDescription(),
                bill.getAmount(),
                bill.getPaymentMethod(),
                bill.getType(),
                bill.getCreditDue(),
                bill.getDate(),
                bill.getNetAmount(),
                bill.getUserId(),
                bill.getCategory(),
                details,
                bill.isIncludeInBudget(),
                bill.getBudgetIds(),
                bill.getCategoryId(),
                bill.getExpenseId());
    }
}
