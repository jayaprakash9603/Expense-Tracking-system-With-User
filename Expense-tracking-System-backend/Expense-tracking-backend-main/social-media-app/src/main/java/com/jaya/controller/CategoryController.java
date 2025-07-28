package com.jaya.controller;

import com.jaya.dto.User;
import com.jaya.models.Category;
import com.jaya.models.Expense;
import com.jaya.service.*;
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

    @Autowired
    private FriendshipService friendshipService;

    @Autowired
    private CategoryEventProducer categoryEventProducer;

    private User getTargetUserWithPermissionCheck(Integer targetId, User reqUser, boolean needWriteAccess) throws Exception {
        if (targetId == null) return reqUser;
        User targetUser = userService.findUserById(targetId);
        System.out.println("DEBUG: targetId=" + targetId + ", targetUser=" + targetUser);
        if (targetUser == null) throw new RuntimeException("Target user not found");
        boolean hasAccess = needWriteAccess ?
                friendshipService.canUserModifyExpenses(targetId, reqUser.getId()) :
                friendshipService.canUserAccessExpenses(targetId, reqUser.getId());
        System.out.println("DEBUG: hasAccess=" + hasAccess);
        if (!hasAccess) {
            String action = needWriteAccess ? "modify" : "access";
            throw new RuntimeException("You don't have permission to " + action + " this user's categories");
        }
        return targetUser;
    }

    private ResponseEntity<?> handleTargetUserException(RuntimeException e) {
        if (e.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Target user not found");
        } else if (e.getMessage().contains("permission")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createCategory(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Category category,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            Category created = categoryService.create(category, targetUser.getId());
            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating category: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            Category category = categoryService.getById(id, targetUser.getId());
            if (category == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching category: " + e.getMessage());
        }
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<?> getCategoryByName(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String name,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Category> categories = categoryService.getByName(name, targetUser.getId());
            if (categories == null) return ResponseEntity.notFound().build();
            return ResponseEntity.ok(categories);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching categories: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Category> categories = categoryService.getAll(targetUser.getId());
            if (categories.isEmpty()) return ResponseEntity.noContent().build();
            return ResponseEntity.ok(categories);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching categories: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestBody Category category,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            Category updated = categoryService.update(id, category, targetUser.getId());
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating category: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            categoryService.delete(id, targetUser.getId());
            return new ResponseEntity<>("Category is deleted", HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting category: " + e.getMessage());
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> createMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            List<Category> createdCategories = categoryService.createMultiple(categories, targetUser.getId());
            return new ResponseEntity<>(createdCategories, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error creating categories: " + e.getMessage());
        }
    }

    @PutMapping("/bulk")
    public ResponseEntity<?> updateMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            List<Category> updatedCategories = categoryService.updateMultiple(categories, targetUser.getId());
            return ResponseEntity.ok(updatedCategories);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error updating categories: " + e.getMessage());
        }
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<?> deleteMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Integer> categoryIds,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            categoryService.deleteMultiple(categoryIds, targetUser.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting categories: " + e.getMessage());
        }
    }

    @DeleteMapping("/all/global")
    public ResponseEntity<?> deleteAllGlobalCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(name = "global", defaultValue = "true") boolean global,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            categoryService.deleteAllGlobal(targetUser.getId(), global);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting global categories: " + e.getMessage());
        }
    }

    @DeleteMapping("")
    public ResponseEntity<?> deleteAllCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            categoryService.deleteAllUserCategories(targetUser.getId());
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error deleting all categories: " + e.getMessage());
        }
    }

    @GetMapping("/uncategorized")
    public ResponseEntity<?> getUncategorizedExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Expense> uncategorizedExpenses = categoryService.getOthersAndUncategorizedExpenses(targetUser);
            return ResponseEntity.ok(uncategorizedExpenses);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching uncategorized expenses: " + e.getMessage());
        }
    }



    @GetMapping("/{categoryId}/filtered-expenses")
    public ResponseEntity<?> getFilteredExpensesWithCategoryFlag(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer categoryId,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

            // Always sort by date descending, no paging
            List<Expense> allExpenses = categoryService.getAllExpensesWithCategoryFlag(
                    targetUser.getId(), categoryId);
            return ResponseEntity.ok(allExpenses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching filtered expenses: " + e.getMessage());
        }
    }

    @GetMapping("/{categoryId}/expenses")
    public ResponseEntity<?> getExpensesByCategoryId(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer categoryId,
            @RequestParam(required = false, defaultValue = "0") Integer page,
            @RequestParam(required = false, defaultValue = "1000") Integer size,
            @RequestParam(required = false, defaultValue = "date") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.findUserByJwt(jwt);
            if (reqUser == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

            String effectiveSortDir = sortDir != null ? sortDir.toLowerCase() : "desc";
            if (!effectiveSortDir.equals("asc") && !effectiveSortDir.equals("desc")) effectiveSortDir = "desc";
            String effectiveSortBy = sortBy != null ? sortBy : "date";

            List<Expense> orderedExpenses = categoryService.getAllUserExpensesOrderedByCategoryFlag(
                    targetUser.getId(), categoryId, page, size, effectiveSortBy, effectiveSortDir);
            return ResponseEntity.ok(orderedExpenses);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching expenses: " + e.getMessage());
        }
    }

    private String validateAndNormalizeSortField(String sortBy) {
        if (sortBy == null || sortBy.isEmpty()) return "date";
        if (sortBy.equals("id") || sortBy.equals("date") || sortBy.equals("categoryId")) return sortBy;
        if (sortBy.equals("expenseName") || sortBy.equals("amount") ||
                sortBy.equals("type") || sortBy.equals("paymentMethod") ||
                sortBy.equals("netAmount") || sortBy.equals("comments") ||
                sortBy.equals("creditDue")) return "expense." + sortBy;
        if (sortBy.startsWith("expense.")) {
            String nestedField = sortBy.substring("expense.".length());
            if (nestedField.equals("expenseName") || nestedField.equals("amount") ||
                    nestedField.equals("type") || nestedField.equals("paymentMethod") ||
                    nestedField.equals("netAmount") || nestedField.equals("comments") ||
                    nestedField.equals("creditDue")) return sortBy;
        }
        return "date";
    }
}