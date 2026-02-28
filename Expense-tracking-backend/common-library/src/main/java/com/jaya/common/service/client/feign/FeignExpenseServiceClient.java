package com.jaya.common.service.client.feign;

import com.jaya.common.dto.ExpenseDTO;
import com.jaya.common.service.client.IExpenseServiceClient;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Feign client implementation for Expense Service.
 * Active only in microservices mode (when 'monolithic' profile is NOT active).
 */
@FeignClient(
    name = "EXPENSE-TRACKING-SYSTEM",
    url = "${EXPENSE_SERVICE_URL:http://localhost:6000}",
    contextId = "commonExpenseServiceClient"
)
@Profile("!monolithic")
public interface FeignExpenseServiceClient extends IExpenseServiceClient {

    @Override
    @PostMapping("/api/expense/save")
    ExpenseDTO save(@RequestBody ExpenseDTO expense);

    @Override
    @GetMapping("/api/expense/get")
    ExpenseDTO getExpenseById(@RequestParam("expenseId") Integer expenseId, 
                              @RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/expense/date-range/{startDate}/{endDate}")
    List<ExpenseDTO> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
            @PathVariable("startDate") LocalDate startDate,
            @PathVariable("endDate") LocalDate endDate,
            @RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/expense/all")
    List<ExpenseDTO> getAllExpenses(@RequestParam("userId") Integer userId);

    @Override
    @GetMapping("/api/expense/all/sorted")
    List<ExpenseDTO> getAllExpensesWithSort(@RequestParam("userId") Integer userId,
                                            @RequestParam("sort") String sort);

    @Override
    @PostMapping("/api/expense/by-ids")
    List<ExpenseDTO> getExpensesByIds(@RequestParam("userId") Integer userId,
                                       @RequestBody Set<Integer> expenseIds);
}
