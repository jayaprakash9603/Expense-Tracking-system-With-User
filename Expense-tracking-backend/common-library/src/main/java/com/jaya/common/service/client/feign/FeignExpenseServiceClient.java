package com.jaya.common.service.client.feign;

import com.jaya.common.dto.ExpenseDTO;
import com.jaya.common.service.client.IExpenseServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@FeignClient(
    name = "EXPENSE-TRACKING-SYSTEM",
    url = "${EXPENSE_SERVICE_URL:http://localhost:6000}",
    contextId = "commonExpenseServiceClient"
)
@Profile("!monolithic")
public interface FeignExpenseServiceClient extends IExpenseServiceClient {

    @Override
    @PostMapping("/api/expenses/internal/save-single")
    ExpenseDTO save(@RequestBody ExpenseDTO expense);

    @Override
    @GetMapping("/api/expenses/internal/get-by-id")
    ExpenseDTO getExpenseById(@RequestParam("expenseId") Integer expenseId,
                              @RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/expenses/internal/included-in-budgets/{startDate}/{endDate}")
    List<ExpenseDTO> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
            @PathVariable("startDate") LocalDate startDate,
            @PathVariable("endDate") LocalDate endDate,
            @RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/expenses/internal/get-all-expenses-with-bill-service")
    List<ExpenseDTO> getAllExpenses(@RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/expenses/internal/get-all-expenses-sort-with-bill-service")
    List<ExpenseDTO> getAllExpensesWithSort(@RequestParam("userId") Integer userId,
                                            @RequestParam("sort") String sort);

    @Override
    @PostMapping("/api/expenses/internal/get-expenses-by-ids")
    List<ExpenseDTO> getExpensesByIds(@RequestParam("userId") Integer userId,
                                       @RequestBody Set<Integer> expenseIds);
}
