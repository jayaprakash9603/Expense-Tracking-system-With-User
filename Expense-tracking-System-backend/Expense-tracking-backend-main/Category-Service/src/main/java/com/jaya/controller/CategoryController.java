package com.jaya.controller;

import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Category;
import com.jaya.models.User;
import com.jaya.service.*;
import com.jaya.kafka.service.UnifiedActivityService;
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
    private FriendShipService friendshipService;

    @Autowired
    private CategoryEventProducer categoryEventProducer;

    @Autowired
    private UnifiedActivityService unifiedActivityService;

    private User getTargetUserWithPermissionCheck(Integer targetId, User reqUser, boolean needWriteAccess)
            throws Exception {
        if (targetId == null)
            return reqUser;
        User targetUser = userService.getUserProfileById(targetId);
        System.out.println("DEBUG: targetId=" + targetId + ", targetUser=" + targetUser);
        if (targetUser == null)
            throw new RuntimeException("Target user not found");
        boolean hasAccess = needWriteAccess ? friendshipService.canUserModifyExpenses(targetId, reqUser.getId())
                : friendshipService.canUserAccessExpenses(targetId, reqUser.getId());
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
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            Category created = categoryService.create(category, targetUser.getId());

            // Send unified event (handles both own action and friend activity)
            unifiedActivityService.sendCategoryCreatedEvent(created, reqUser, targetUser);

            return new ResponseEntity<>(created, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating category: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            Category category = categoryService.getById(id, targetUser.getId());
            if (category == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(category);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching category: " + e.getMessage());
        }
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<?> getCategoryByName(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String name,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Category> categories = categoryService.getByName(name, targetUser.getId());
            if (categories == null)
                return ResponseEntity.notFound().build();
            return ResponseEntity.ok(categories);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching categories: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<Category> categories = categoryService.getAll(targetUser.getId());
            if (categories.isEmpty())
                return ResponseEntity.noContent().build();
            return ResponseEntity.ok(categories);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching categories: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestBody Category category,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);

            // Get old category for audit tracking
            Category oldCategory = categoryService.getById(id, targetUser.getId());

            // Pass the requesting user to check for admin mode
            // If reqUser is in admin mode and editing their own categories (no targetId),
            // they can directly edit global categories
            User userForUpdate = (targetId == null) ? reqUser : targetUser;
            Category updated = categoryService.update(id, category, userForUpdate);

            // Send unified event (handles both own action and friend activity)
            unifiedActivityService.sendCategoryUpdatedEvent(updated, oldCategory, reqUser, targetUser);

            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating category: " + e.getMessage());
        }
    }

    /**
     * Admin-only PATCH endpoint for partial update of global categories.
     * User must have ADMIN role AND be in ADMIN mode.
     * Updates are reflected for all users.
     * 
     * Allowed fields: name, description, type, icon, color
     */
    @PatchMapping("/admin/global/{id}")
    public ResponseEntity<?> adminUpdateGlobalCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestBody Category category) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");

            // Get old category for audit tracking
            Category oldCategory = categoryService.getById(id, reqUser.getId());

            Category updated = categoryService.adminUpdateGlobalCategory(id, category, reqUser);

            // Send unified event for admin action
            unifiedActivityService.sendCategoryUpdatedEvent(updated, oldCategory, reqUser, reqUser);

            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            String errorMessage = e.getMessage();
            if (errorMessage != null && errorMessage.contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorMessage);
            }
            if (errorMessage != null && errorMessage.contains("not found")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorMessage);
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Error updating global category: " + errorMessage);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            // Get category name before deletion for notification
            Category category = categoryService.getById(id, targetUser.getId());
            String categoryName = category != null ? category.getName() : null;
            categoryService.delete(id, targetUser.getId());

            // Send unified event (handles both own action and friend activity)
            unifiedActivityService.sendCategoryDeletedEvent(id, categoryName, reqUser, targetUser);

            return new ResponseEntity<>("Category is deleted", HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting category: " + e.getMessage());
        }
    }

    @PostMapping("/bulk")
    public ResponseEntity<?> createMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            List<Category> createdCategories = categoryService.createMultiple(categories, targetUser.getId());

            // Send unified event for bulk categories creation
            unifiedActivityService.sendBulkCategoriesCreatedEvent(createdCategories, reqUser, targetUser);

            return new ResponseEntity<>(createdCategories, HttpStatus.CREATED);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error creating categories: " + e.getMessage());
        }
    }

    @PutMapping("/bulk")
    public ResponseEntity<?> updateMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            // Pass the requesting user to check for admin role
            // If reqUser has admin role and editing their own categories (no targetId),
            // they can directly edit global categories
            User userForUpdate = (targetId == null) ? reqUser : targetUser;
            List<Category> updatedCategories = categoryService.updateMultiple(categories, userForUpdate);

            // Send appropriate notification based on who performed the action
            unifiedActivityService.sendMultipleCategoriesUpdatedEvent(updatedCategories, reqUser, targetUser);
            return ResponseEntity.ok(updatedCategories);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating categories: " + e.getMessage());
        }
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<?> deleteMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Integer> categoryIds,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            int count = categoryIds != null ? categoryIds.size() : 0;
            categoryService.deleteMultiple(categoryIds, targetUser.getId());

            // Send appropriate notification based on who performed the action
            unifiedActivityService.sendMultipleCategoriesDeletedEvent(count, reqUser, targetUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting categories: " + e.getMessage());
        }
    }

    @DeleteMapping("/all/global")
    public ResponseEntity<?> deleteAllGlobalCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(name = "global", defaultValue = "true") boolean global,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            categoryService.deleteAllGlobal(targetUser.getId(), global);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting global categories: " + e.getMessage());
        }
    }

    @DeleteMapping("")
    public ResponseEntity<?> deleteAllCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
            // Get count before deletion for notification
            List<Category> categories = categoryService.getAll(targetUser.getId());
            int count = categories != null ? categories.size() : 0;
            categoryService.deleteAllUserCategories(targetUser.getId());

            // Send appropriate notification based on who performed the action
            unifiedActivityService.sendAllCategoriesDeletedEvent(count, reqUser, targetUser);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error deleting all categories: " + e.getMessage());
        }
    }

    @GetMapping("/uncategorized")
    public ResponseEntity<?> getUncategorizedExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
            List<ExpenseDTO> uncategorizedExpenses = categoryService.getOthersAndUncategorizedExpenses(targetUser);
            return ResponseEntity.ok(uncategorizedExpenses);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching uncategorized expenses: " + e.getMessage());
        }
    }

    @GetMapping("/{categoryId}/filtered-expenses")
    public ResponseEntity<?> getFilteredExpensesWithCategoryFlag(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer categoryId,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

            // Always sort by date descending, no paging
            List<ExpenseDTO> allExpenses = categoryService.getAllExpensesWithCategoryFlag(
                    targetUser.getId(), categoryId);
            return ResponseEntity.ok(allExpenses);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid request: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching filtered expenses: " + e.getMessage());
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
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer targetId) {
        try {
            User reqUser = userService.getuserProfile(jwt);
            if (reqUser == null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

            String effectiveSortDir = sortDir != null ? sortDir.toLowerCase() : "desc";
            if (!effectiveSortDir.equals("asc") && !effectiveSortDir.equals("desc"))
                effectiveSortDir = "desc";
            String effectiveSortBy = sortBy != null ? sortBy : "date";

            List<ExpenseDTO> orderedExpenses = categoryService.getAllUserExpensesOrderedByCategoryFlag(
                    targetUser.getId(), categoryId, page, size, effectiveSortBy, effectiveSortDir);

            // Apply date filtering if startDate and endDate are provided
            if (startDate != null && endDate != null) {
                java.time.LocalDate start = java.time.LocalDate.parse(startDate);
                java.time.LocalDate end = java.time.LocalDate.parse(endDate);
                orderedExpenses = orderedExpenses.stream()
                        .filter(e -> e.isIncludeInBudget()) // Only include expenses in this category
                        .filter(e -> {
                            if (e.getDate() == null)
                                return false;
                            java.time.LocalDate expenseDate = e.getDate();
                            return !expenseDate.isBefore(start) && !expenseDate.isAfter(end);
                        })
                        .collect(java.util.stream.Collectors.toList());
            } else {
                // If no date filter, still only return expenses in this category
                orderedExpenses = orderedExpenses.stream()
                        .filter(e -> e.isIncludeInBudget())
                        .collect(java.util.stream.Collectors.toList());
            }

            return ResponseEntity.ok(orderedExpenses);
        } catch (RuntimeException e) {
            return handleTargetUserException(e);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error fetching expenses: " + e.getMessage());
        }
    }

    private String validateAndNormalizeSortField(String sortBy) {
        if (sortBy == null || sortBy.isEmpty())
            return "date";
        if (sortBy.equals("id") || sortBy.equals("date") || sortBy.equals("categoryId"))
            return sortBy;
        if (sortBy.equals("expenseName") || sortBy.equals("amount") ||
                sortBy.equals("type") || sortBy.equals("paymentMethod") ||
                sortBy.equals("netAmount") || sortBy.equals("comments") ||
                sortBy.equals("creditDue"))
            return "expense." + sortBy;
        if (sortBy.startsWith("expense.")) {
            String nestedField = sortBy.substring("expense.".length());
            if (nestedField.equals("expenseName") || nestedField.equals("amount") ||
                    nestedField.equals("type") || nestedField.equals("paymentMethod") ||
                    nestedField.equals("netAmount") || nestedField.equals("comments") ||
                    nestedField.equals("creditDue"))
                return sortBy;
        }
        return "date";
    }

    @GetMapping("/get-by-id-with-service")
    public Category getById(@RequestParam Integer categoryId, @RequestParam Integer userId) throws Exception {
        return categoryService.getById(categoryId, userId);
    }

    @GetMapping("/get-by-name-with-service")
    public List<Category> getByName(@RequestParam String categoryName, @RequestParam Integer userId) throws Exception {
        return categoryService.getByName(categoryName, userId);
    }

    @PostMapping("/create-category-with-service")
    public Category createCateogoryWithService(@RequestBody Category category, @RequestParam Integer userId)
            throws Exception {
        return categoryService.create(category, userId);
    }

    @PostMapping("/save")
    public Category save(@RequestBody Category category) throws Exception {
        return categoryService.save(category);
    }

    @GetMapping("/get-all-for-users")
    public List<Category> getAllForUser(@RequestParam Integer userId) throws Exception {
        return categoryService.getAllForUser(userId);
    }
}