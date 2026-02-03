package com.jaya.service;

import com.jaya.dto.ExpenseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@FeignClient(name = "EXPENSE-TRACKING-SYSTEM", url = "${EXPENSE_SERVICE_URL:http://localhost:6000}")
public interface ExpenseService {

    @PostMapping("/api/expenses/save-single")
    ExpenseDTO save(@RequestBody ExpenseDTO expense);

    @GetMapping("/api/expenses/get-by-id")
    ExpenseDTO getExpenseById(@RequestParam Integer expenseId, @RequestParam Integer userId);
    @GetMapping("/api/expenses/included-in-budgets/{startDate}/{endDate}")
    List<ExpenseDTO> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Integer userId);

    @GetMapping("/api/expenses/get-all-expenses-with-bill-service")
    List<ExpenseDTO> getAllExpenses(@RequestParam Integer userId);

    @GetMapping("/get-all-expenses-sort-with-bill-service")
    List<ExpenseDTO> getAllExpensesWithSort(@RequestParam Integer userId, @RequestParam String sort);

    @PostMapping("/api/expenses/get-expenses-by-ids")
    List<ExpenseDTO> getExpensesByIds(@RequestParam Integer userId, @RequestBody Set<Integer> expenseIds);
}
