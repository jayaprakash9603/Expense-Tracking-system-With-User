
package com.jaya.service;

import com.jaya.dto.ExpenseDTO;
import com.jaya.common.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@FeignClient(name = "EXPENSE-TRACKING-SYSTEM", url = "${EXPENSE_SERVICE_URL:http://localhost:6000}", contextId = "budgetExpenseClient")
public interface ExpenseClient {

    @PostMapping("/api/expenses/save-single")
    ExpenseDTO save(@RequestBody ExpenseDTO expense);

    @GetMapping("/api/expenses/get-by-id")
    ExpenseDTO getExpenseById(@RequestParam Integer expenseId, @RequestParam Integer userId);

    @GetMapping("/api/expenses/included-in-budgets/{startDate}/{endDate}")
    List<ExpenseDTO> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam Integer userId);

    @PostMapping("/api/expenses/get-expenses-by-ids")
    List<ExpenseDTO> getExpensesByIds(@RequestParam Integer userId, @RequestBody Set<Integer> expenseIds);

    @PostMapping("/api/expenses/add-expense-with-bill-service")
    ExpenseDTO addExpense(@RequestBody ExpenseDTO expense, @RequestParam Integer userId) throws Exception;

    @PostMapping("/api/expenses/update-expense-with-bill-service")
    ExpenseDTO updateExpenseWithBillService(@RequestParam Integer expenseId, @RequestBody ExpenseDTO expense,
            @RequestParam Integer userId) throws Exception;

    @DeleteMapping("/api/expenses/delete-expenses-with-bill-service")
    void deleteExpensesByIdsWithBillService(@RequestParam List<Integer> expenseIds, @RequestParam Integer userId)
            throws Exception;

    @GetMapping("/api/expenses/get-all-expenses-with-bill-service")
    List<ExpenseDTO> getAllExpenses(@RequestParam Integer userId);

    @GetMapping("/get-all-expenses-sort-with-bill-service")
    List<ExpenseDTO> getAllExpensesWithSort(@RequestParam Integer userId, @RequestParam String sort);
}