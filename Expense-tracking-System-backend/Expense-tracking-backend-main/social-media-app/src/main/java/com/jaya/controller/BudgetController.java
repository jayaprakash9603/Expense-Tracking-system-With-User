package com.jaya.controller;

import com.jaya.dto.BudgetReport;
import com.jaya.exceptions.UserException;
import com.jaya.models.Budget;
import com.jaya.models.Expense;
import com.jaya.models.User;
import com.jaya.service.BudgetService;
import com.jaya.service.ExpenseService;
import com.jaya.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.w3c.dom.stylesheets.LinkStyle;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    @Autowired
    private BudgetService budgetService;

    @Autowired
    private UserService userService;


    @Autowired
    private ExpenseService expenseService;

    @PostMapping("")
    public ResponseEntity<Budget> createBudget(@RequestBody @Valid Budget budget, @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserByJwt(jwt);
        return new ResponseEntity<>(budgetService.createBudget(budget, user.getId()), HttpStatus.CREATED);
    }

    @PutMapping("/{budgetId}")
    public ResponseEntity<Budget> editBudget(@PathVariable Integer budgetId, @RequestBody @Valid Budget budget, @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByJwt(jwt);
        return new ResponseEntity<>(budgetService.editBudget(budgetId, budget, user.getId()), HttpStatus.OK);
    }

    @DeleteMapping("/{budgetId}")
    public ResponseEntity<String> deleteBudget(@PathVariable Integer budgetId, @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserByJwt(jwt);
        budgetService.deleteBudget(budgetId, user.getId());
        return new ResponseEntity<>("Budget is deleted successfully", HttpStatus.NO_CONTENT);
    }

    @DeleteMapping("/delete-all")
    public ResponseEntity<String> deleteAllBudget( @RequestHeader("Authorization") String jwt) throws UserException {
        User user = userService.findUserByJwt(jwt);
        budgetService.deleteAllBudget(user.getId());
        return new ResponseEntity<>("All budgets deleted successfully", HttpStatus.NO_CONTENT);
    }

    @GetMapping("/{budgetId}")
    public ResponseEntity<Budget> getBudgetById(@RequestHeader("Authorization") String jwt, @PathVariable Integer budgetId) throws Exception {
        User user = userService.findUserByJwt(jwt);
        return new ResponseEntity<>(budgetService.getBudgetById(budgetId, user.getId()), HttpStatus.OK);
    }

    @GetMapping("")
    public ResponseEntity<List<Budget>> getAllBudgetsForUser(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByJwt(jwt);
        return new ResponseEntity<>(budgetService.getAllBudgetForUser(user.getId()), HttpStatus.OK);
    }

    @GetMapping("/{budgetId}/expenses")
    public ResponseEntity<List<Expense>> getExpensesWithinBudgetDates(@RequestHeader("Authorization") String jwt, @PathVariable Integer budgetId) throws Exception {
        User user = userService.findUserByJwt(jwt);
        List<Expense> expenses = budgetService.getExpensesForUserWithinBudgetDates(user.getId(), budgetId);
        return ResponseEntity.ok(expenses);
    }

    @GetMapping("/report/{budgetId}")
    public ResponseEntity<BudgetReport> getBudgetReport(@RequestHeader("Authorization") String jwt, @PathVariable Integer budgetId) throws Exception {
        User user = userService.findUserByJwt(jwt);
        BudgetReport budgetReport = budgetService.calculateBudgetReport(user.getId(), budgetId);
        return new ResponseEntity<>(budgetReport, HttpStatus.OK);
    }

    @GetMapping("/reports")
    public ResponseEntity<List<BudgetReport>> getAllBudgetReportsForUser(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByJwt(jwt);
        List<BudgetReport> budgetReports = budgetService.getAllBudgetReportsForUser(user.getId());
        return new ResponseEntity<>(budgetReports, HttpStatus.OK);
    }



    @GetMapping("/filter-by-date")
    public ResponseEntity<List<Budget>> getBudgetsByDate(
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestHeader("Authorization") String jwt) throws Exception {

        User reqUser=userService.findUserByJwt(jwt);
        List<Budget> budgets = budgetService.getBudgetsByDate(date, reqUser.getId());
        return ResponseEntity.ok(budgets);
    }


    @GetMapping("/expenses")
    public ResponseEntity<List<Budget>> getBudgetsForExpense(
            @RequestParam Integer expenseId,
            @RequestParam String date, // <-- Added date param
            @RequestHeader("Authorization") String jwt) throws Exception {

        User user = userService.findUserByJwt(jwt);
        LocalDate expenseDate = LocalDate.parse(date);

        List<Budget> budgets = budgetService.getBudgetsByExpenseId(expenseId, user.getId(), expenseDate);
        return ResponseEntity.ok(budgets);
    }



}
