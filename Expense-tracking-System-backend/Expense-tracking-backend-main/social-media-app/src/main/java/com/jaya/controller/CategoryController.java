package com.jaya.controller;

import com.jaya.models.Category;
import com.jaya.models.Expense;
import com.jaya.models.User;
import com.jaya.service.CategoryService;
import com.jaya.service.ExpenseService;
import com.jaya.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {
    @Autowired
    private CategoryService categoryService;

    @Autowired
    private UserService userService;


    @Autowired
    private ExpenseService expenseService;
    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestHeader("Authorization") String jwt, @RequestBody Category category) {
        User user = userService.findUserByJwt(jwt);
        Category created = categoryService.create(category, user);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@RequestHeader("Authorization") String jwt, @PathVariable Integer id) throws Exception {
        User user = userService.findUserByJwt(jwt);
        Category category = categoryService.getById(id, user);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(category);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<Category>> getCategoryByName(@RequestHeader("Authorization") String jwt, @PathVariable String name) throws Exception {
        User user = userService.findUserByJwt(jwt);
        List<Category> categories = categoryService.getByName(name,user);
        if (categories == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(categories);
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserByJwt(jwt);
        List<Category> categories = categoryService.getAll(user);
        if (categories.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(@RequestHeader("Authorization") String jwt, @PathVariable Integer id, @RequestBody Category category) throws Exception {
        User user = userService.findUserByJwt(jwt);
        Category updated = categoryService.update(id, category, user);
    //        if (updated == null) {
    //            return ResponseEntity.notFound().build();
    //        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(@RequestHeader("Authorization") String jwt, @PathVariable Integer id) throws Exception {
        User user = userService.findUserByJwt(jwt);
        categoryService.delete(id, user);
        return new ResponseEntity<>("Category is deleted", HttpStatus.NO_CONTENT);
    }





    @PostMapping("/bulk")
    public ResponseEntity<List<Category>> createMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories) {
        User user = userService.findUserByJwt(jwt);
        List<Category> createdCategories = categoryService.createMultiple(categories, user);
        return new ResponseEntity<>(createdCategories, HttpStatus.CREATED);
    }

    // Update multiple categories
    @PutMapping("/bulk")
    public ResponseEntity<List<Category>> updateMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories) {
        User user = userService.findUserByJwt(jwt);
        List<Category> updatedCategories = categoryService.updateMultiple(categories, user);
        return ResponseEntity.ok(updatedCategories);
    }

    // Delete multiple categories
    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Integer> categoryIds) {
        User user = userService.findUserByJwt(jwt);
        categoryService.deleteMultiple(categoryIds, user);
        return ResponseEntity.noContent().build();
    }


    @DeleteMapping("/all/global")
    public ResponseEntity<Void> deleteAllGlobalCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(name = "global", defaultValue = "true") boolean global) {
        User user = userService.findUserByJwt(jwt);
        categoryService.deleteAllGlobal(user, global);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all")
    public ResponseEntity<Void> deleteAllCategories(
            @RequestHeader("Authorization") String jwt) {
        User user = userService.findUserByJwt(jwt);
        categoryService.deleteAllUserCategories(user);
        return ResponseEntity.noContent().build();
    }

    // In CategoryController.java or ExpenseController.java
    @GetMapping("/uncategorized")
    public ResponseEntity<List<Expense>> getUncategorizedExpenses(@RequestHeader("Authorization") String jwt) {
        User user = userService.findUserByJwt(jwt);
        List<Expense> uncategorizedExpenses = categoryService.getOthersAndUncategorizedExpenses(user);
        return ResponseEntity.ok(uncategorizedExpenses);
    }


    @GetMapping("/{categoryId}/filtered-expenses")
    public ResponseEntity<List<Expense>> getFilteredExpensesWithCategoryFlag(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer categoryId,
            @RequestParam(required = false) String rangeType,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) String flowType,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "10") Integer size,
            @RequestParam(required = false, defaultValue = "date") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir) throws Exception {

        User user = userService.findUserByJwt(jwt);

        // Validate sort direction
        String effectiveSortDir = sortDir != null ? sortDir.toLowerCase() : "desc";
        if (!effectiveSortDir.equals("asc") && !effectiveSortDir.equals("desc")) {
            effectiveSortDir = "desc"; // Default to descending if invalid
        }

        // Validate and normalize sortBy field
        String effectiveSortBy = validateAndNormalizeSortField(sortBy);

        // Check if filtering parameters were explicitly provided
        boolean noFiltersProvided = rangeType == null && offset == null && flowType == null;

        // If no filters were provided, get all expenses with pagination and sorting
        if (noFiltersProvided) {
            List<Expense> allExpenses = categoryService.getAllExpensesWithCategoryFlag(
                    user.getId(),
                    categoryId,
                    page,
                    size,
                    effectiveSortBy,
                    effectiveSortDir
            );
            return ResponseEntity.ok(allExpenses);
        }

        // Otherwise, apply the filters with defaults
        String effectiveRangeType = rangeType != null ? rangeType : "month";
        int effectiveOffset = offset != null ? offset : 0;
        String effectiveFlowType = flowType != null ? flowType : "all";

        List<Expense> filteredExpenses = categoryService.getAllExpensesWithCategoryFlag(
                user.getId(),
                categoryId,
                effectiveRangeType,
                effectiveOffset,
                effectiveFlowType,
                page,
                size,
                effectiveSortBy,
                effectiveSortDir
        );

        return ResponseEntity.ok(filteredExpenses);
    }

    private String validateAndNormalizeSortField(String sortBy) {
        if (sortBy == null || sortBy.isEmpty()) {
            return "date"; // Default to date
        }

        // Direct fields in Expense entity
        if (sortBy.equals("id") || sortBy.equals("date") || sortBy.equals("categoryId")) {
            return sortBy;
        }

        // Fields in the nested ExpenseDetails entity
        if (sortBy.equals("expenseName") || sortBy.equals("amount") ||
                sortBy.equals("type") || sortBy.equals("paymentMethod") ||
                sortBy.equals("netAmount") || sortBy.equals("comments") ||
                sortBy.equals("creditDue")) {
            return "expense." + sortBy;
        }

        // Handle special cases with dot notation already included
        if (sortBy.startsWith("expense.")) {
            String nestedField = sortBy.substring("expense.".length());
            if (nestedField.equals("expenseName") || nestedField.equals("amount") ||
                    nestedField.equals("type") || nestedField.equals("paymentMethod") ||
                    nestedField.equals("netAmount") || nestedField.equals("comments") ||
                    nestedField.equals("creditDue")) {
                return sortBy;
            }
        }

        // If not a valid field, default to date
        return "date";
    }



    @GetMapping("/{categoryId}/expenses")
    public ResponseEntity<List<Expense>> getExpensesByCategoryId(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer categoryId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "1000") Integer size,
            @RequestParam(required = false, defaultValue = "date") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir) throws Exception {

        User user = userService.findUserByJwt(jwt);

        // Validate sort direction
        String effectiveSortDir = sortDir != null ? sortDir.toLowerCase() : "desc";
        if (!effectiveSortDir.equals("asc") && !effectiveSortDir.equals("desc")) {
            effectiveSortDir = "desc"; // Default to descending if invalid
        }

        // Validate and normalize sortBy field
        String effectiveSortBy = sortBy != null ? sortBy : "date";

        // Get all user expenses ordered by category flag (first those in the category, then the rest)
        List<Expense> orderedExpenses = categoryService.getAllUserExpensesOrderedByCategoryFlag(
                user.getId(),
                categoryId,
                page,
                size,
                effectiveSortBy,
                effectiveSortDir
        );

        return ResponseEntity.ok(orderedExpenses);
    }
}