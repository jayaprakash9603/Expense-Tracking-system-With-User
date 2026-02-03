package com.jaya.controller;

import com.jaya.common.exception.AccessDeniedException;
import com.jaya.common.exception.AuthenticationException;
import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.dto.CategorySearchDTO;
import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Category;
import com.jaya.models.User;
import com.jaya.service.*;
import com.jaya.kafka.service.UnifiedActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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

    private User getTargetUserWithPermissionCheck(Integer targetId, User reqUser, boolean needWriteAccess) {
        if (targetId == null)
            return reqUser;
        User targetUser = userService.getUserProfileById(targetId);
        if (targetUser == null)
            throw ResourceNotFoundException.userNotFound(targetId);
        boolean hasAccess = needWriteAccess ? friendshipService.canUserModifyExpenses(targetId, reqUser.getId())
                : friendshipService.canUserAccessExpenses(targetId, reqUser.getId());
        if (!hasAccess) {
            String action = needWriteAccess ? "modify" : "access";
            throw new AccessDeniedException("You don't have permission to " + action + " this user's categories");
        }
        return targetUser;
    }

    private User validateUserFromJwt(String jwt) {
        User user = userService.getuserProfile(jwt);
        if (user == null) {
            throw AuthenticationException.invalidToken();
        }
        return user;
    }

    @PostMapping
    public ResponseEntity<Category> createCategory(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Category category,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        Category created = categoryService.create(category, targetUser.getId());
        unifiedActivityService.sendCategoryCreatedEvent(created, reqUser, targetUser);

        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        Category category = categoryService.getById(id, targetUser.getId());
        return ResponseEntity.ok(category);
    }

    @GetMapping("/name/{name}")
    public ResponseEntity<List<Category>> getCategoryByName(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String name,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<Category> categories = categoryService.getByName(name, targetUser.getId());
        return ResponseEntity.ok(categories);
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<Category> categories = categoryService.getAll(targetUser.getId());
        if (categories.isEmpty())
            return ResponseEntity.noContent().build();
        return ResponseEntity.ok(categories);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestBody Category category,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        Category oldCategory = categoryService.getById(id, targetUser.getId());
        User userForUpdate = (targetId == null) ? reqUser : targetUser;
        Category updated = categoryService.update(id, category, userForUpdate);
        unifiedActivityService.sendCategoryUpdatedEvent(updated, oldCategory, reqUser, targetUser);

        return ResponseEntity.ok(updated);
    }

    
    @PatchMapping("/admin/global/{id}")
    public ResponseEntity<Category> adminUpdateGlobalCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestBody Category category) {
        User reqUser = validateUserFromJwt(jwt);
        Category oldCategory = categoryService.getById(id, reqUser.getId());

        Category updated = categoryService.adminUpdateGlobalCategory(id, category, reqUser);
        unifiedActivityService.sendCategoryUpdatedEvent(updated, oldCategory, reqUser, reqUser);

        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        Category category = categoryService.getById(id, targetUser.getId());
        String categoryName = category.getName();
        categoryService.delete(id, targetUser.getId());
        unifiedActivityService.sendCategoryDeletedEvent(id, categoryName, reqUser, targetUser);

        return new ResponseEntity<>("Category is deleted", HttpStatus.NO_CONTENT);
    }

    @PostMapping("/bulk")
    public ResponseEntity<List<Category>> createMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        List<Category> createdCategories = categoryService.createMultiple(categories, targetUser.getId());
        unifiedActivityService.sendBulkCategoriesCreatedEvent(createdCategories, reqUser, targetUser);

        return new ResponseEntity<>(createdCategories, HttpStatus.CREATED);
    }

    @PutMapping("/bulk")
    public ResponseEntity<List<Category>> updateMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        User userForUpdate = (targetId == null) ? reqUser : targetUser;
        List<Category> updatedCategories = categoryService.updateMultiple(categories, userForUpdate);
        unifiedActivityService.sendMultipleCategoriesUpdatedEvent(updatedCategories, reqUser, targetUser);
        return ResponseEntity.ok(updatedCategories);
    }

    @DeleteMapping("/bulk")
    public ResponseEntity<Void> deleteMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Integer> categoryIds,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        int count = categoryIds != null ? categoryIds.size() : 0;
        categoryService.deleteMultiple(categoryIds, targetUser.getId());
        unifiedActivityService.sendMultipleCategoriesDeletedEvent(count, reqUser, targetUser);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/all/global")
    public ResponseEntity<Void> deleteAllGlobalCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(name = "global", defaultValue = "true") boolean global,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        categoryService.deleteAllGlobal(targetUser.getId(), global);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("")
    public ResponseEntity<Void> deleteAllCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        List<Category> categories = categoryService.getAll(targetUser.getId());
        int count = categories != null ? categories.size() : 0;
        categoryService.deleteAllUserCategories(targetUser.getId());
        unifiedActivityService.sendAllCategoriesDeletedEvent(count, reqUser, targetUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/uncategorized")
    public ResponseEntity<List<ExpenseDTO>> getUncategorizedExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<ExpenseDTO> uncategorizedExpenses = categoryService.getOthersAndUncategorizedExpenses(targetUser);
        return ResponseEntity.ok(uncategorizedExpenses);
    }

    @GetMapping("/{categoryId}/filtered-expenses")
    public ResponseEntity<List<ExpenseDTO>> getFilteredExpensesWithCategoryFlag(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer categoryId,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        List<ExpenseDTO> allExpenses = categoryService.getAllExpensesWithCategoryFlag(
                targetUser.getId(), categoryId);
        return ResponseEntity.ok(allExpenses);
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
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

        String effectiveSortDir = sortDir != null ? sortDir.toLowerCase() : "desc";
        if (!effectiveSortDir.equals("asc") && !effectiveSortDir.equals("desc"))
            effectiveSortDir = "desc";
        String effectiveSortBy = sortBy != null ? sortBy : "date";

        List<ExpenseDTO> orderedExpenses = categoryService.getAllUserExpensesOrderedByCategoryFlag(
                targetUser.getId(), categoryId, page, size, effectiveSortBy, effectiveSortDir);
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
                    .collect(Collectors.toList());
        } else {
            orderedExpenses = orderedExpenses.stream()
                    .filter(e -> e.isIncludeInBudget())
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(orderedExpenses);
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
    public Category getById(@RequestParam Integer categoryId, @RequestParam Integer userId) {
        return categoryService.getById(categoryId, userId);
    }

    @GetMapping("/get-by-name-with-service")
    public List<Category> getByName(@RequestParam String categoryName, @RequestParam Integer userId) {
        return categoryService.getByName(categoryName, userId);
    }

    @PostMapping("/create-category-with-service")
    public Category createCateogoryWithService(@RequestBody Category category, @RequestParam Integer userId) {
        return categoryService.create(category, userId);
    }

    @PostMapping("/save")
    public Category save(@RequestBody Category category) {
        return categoryService.save(category);
    }

    @GetMapping("/get-all-for-users")
    public List<Category> getAllForUser(@RequestParam Integer userId) {
        return categoryService.getAllForUser(userId);
    }

    
    @GetMapping("/search")
    public ResponseEntity<List<CategorySearchDTO>> searchCategories(
            @RequestParam String query,
            @RequestParam(defaultValue = "20") int limit,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        return ResponseEntity.ok(categoryService.searchCategories(targetUser.getId(), query, limit));
    }
}
