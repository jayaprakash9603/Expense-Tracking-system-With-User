package com.jaya.controller;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.dto.ExpenseDTO;
import com.jaya.common.dto.request.CreateCategoryRequest;
import com.jaya.common.dto.request.UpdateCategoryRequest;
import com.jaya.common.dto.response.ApiResponse;
import com.jaya.common.exception.AccessDeniedException;
import com.jaya.common.exception.AuthenticationException;
import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.constant.CategoryConstants;
import com.jaya.models.Category;
import com.jaya.models.User;
import com.jaya.service.*;
import com.jaya.kafka.service.UnifiedActivityService;
import com.jaya.util.mapper.CategoryMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Category Management", description = "APIs for managing expense categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final UserService userService;
    private final FriendShipService friendshipService;
    private final UnifiedActivityService unifiedActivityService;
    private final CategoryMapper categoryMapper;

    private User validateUserFromJwt(String jwt) {
        User user = userService.getuserProfile(jwt);
        if (user == null) {
            log.warn("Failed to authenticate user from JWT");
            throw AuthenticationException.invalidToken();
        }
        log.debug("Authenticated user: id={}, email={}", user.getId(), user.getEmail());
        return user;
    }

    private User getTargetUserWithPermissionCheck(Integer targetId, User reqUser, boolean needWriteAccess) {
        if (targetId == null) {
            return reqUser;
        }

        User targetUser = userService.getUserProfileById(targetId);
        if (targetUser == null) {
            log.warn("Target user not found: targetId={}", targetId);
            throw ResourceNotFoundException.userNotFound(targetId);
        }

        boolean hasAccess = needWriteAccess
                ? friendshipService.canUserModifyExpenses(targetId, reqUser.getId())
                : friendshipService.canUserAccessExpenses(targetId, reqUser.getId());

        if (!hasAccess) {
            String action = needWriteAccess ? "modify" : "access";
            log.warn("Permission denied: userId={}, targetId={}, action={}", reqUser.getId(), targetId, action);
            throw new AccessDeniedException("You don't have permission to " + action + " this user's categories");
        }

        log.debug("Permission granted: userId={}, targetId={}, writeAccess={}",
                reqUser.getId(), targetId, needWriteAccess);
        return targetUser;
    }

    @PostMapping
    @Operation(summary = "Create a new category", description = "Creates a new category for the user or target user")
    public ResponseEntity<ApiResponse<CategoryDTO>> createCategory(
            @RequestHeader("Authorization") String jwt,
            @Valid @RequestBody CreateCategoryRequest request,
            @Parameter(description = "Target user ID for friend expense management") @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);

        log.info("Creating category: name={}, userId={}, isGlobal={}",
                request.getName(), targetUser.getId(), request.isGlobal());

        // Convert request to entity
        Category categoryToCreate = categoryMapper.toEntity(request, targetUser.getId());
        Category created = categoryService.create(categoryToCreate, targetUser.getId());

        // Send activity event
        unifiedActivityService.sendCategoryCreatedEvent(created, reqUser, targetUser);

        CategoryDTO response = categoryMapper.toResponse(created);
        log.info("Category created: id={}, name={}", created.getId(), created.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, CategoryConstants.MSG_CATEGORY_CREATED));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID", description = "Retrieves a specific category by its ID")
    public ResponseEntity<ApiResponse<CategoryDTO>> getCategoryById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

        log.debug("Getting category: id={}, userId={}", id, targetUser.getId());

        Category category = categoryService.getById(id, targetUser.getId());
        CategoryDTO response = categoryMapper.toResponse(category);

        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get categories by name", description = "Retrieves categories matching the given name")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getCategoryByName(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String name,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

        log.debug("Getting categories by name: name={}, userId={}", name, targetUser.getId());

        List<Category> categories = categoryService.getByName(name, targetUser.getId());
        List<CategoryDTO> responses = categoryMapper.toResponseList(categories);

        return ResponseEntity.ok(ApiResponse.successList(responses));
    }

    @GetMapping
    @Operation(summary = "Get all categories", description = "Retrieves all categories for the user")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> getAllCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

        log.debug("Getting all categories for user: userId={}", targetUser.getId());

        List<Category> categories = categoryService.getAll(targetUser.getId());

        if (categories.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.successList(List.of(), "No categories found"));
        }

        List<CategoryDTO> responses = categoryMapper.toResponseList(categories);
        return ResponseEntity.ok(ApiResponse.successList(responses));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category", description = "Updates an existing category")
    public ResponseEntity<ApiResponse<CategoryDTO>> updateCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @Valid @RequestBody UpdateCategoryRequest request,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);

        log.info("Updating category: id={}, userId={}", id, targetUser.getId());

        Category oldCategory = categoryService.getById(id, targetUser.getId());
        User userForUpdate = (targetId == null) ? reqUser : targetUser;

        // Convert request to entity for update
        Category categoryUpdate = categoryMapper.toEntityForUpdate(request, targetUser.getId());
        Category updated = categoryService.update(id, categoryUpdate, userForUpdate);

        // Send activity event
        unifiedActivityService.sendCategoryUpdatedEvent(updated, oldCategory, reqUser, targetUser);

        CategoryDTO response = categoryMapper.toResponse(updated);
        log.info("Category updated: id={}, name={}", updated.getId(), updated.getName());

        return ResponseEntity.ok(ApiResponse.success(response, CategoryConstants.MSG_CATEGORY_UPDATED));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a category", description = "Deletes a category and reassigns expenses to 'Others'")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);

        log.info("Deleting category: id={}, userId={}", id, targetUser.getId());

        Category category = categoryService.getById(id, targetUser.getId());
        String categoryName = category.getName();

        categoryService.delete(id, targetUser.getId());

        // Send activity event
        unifiedActivityService.sendCategoryDeletedEvent(id, categoryName, reqUser, targetUser);

        log.info("Category deleted: id={}, name={}", id, categoryName);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null, CategoryConstants.MSG_CATEGORY_DELETED));
    }

    // ========================
    // Bulk Operations
    // ========================

    @PostMapping("/bulk")
    @Operation(summary = "Create multiple categories", description = "Creates multiple categories in a single request")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> createMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @Valid @RequestBody List<CreateCategoryRequest> requests,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);

        log.info("Creating {} categories for user: userId={}", requests.size(), targetUser.getId());

        final Integer userId = targetUser.getId();
        List<Category> categoriesToCreate = requests.stream()
                .map(req -> categoryMapper.toEntity(req, userId))
                .collect(Collectors.toList());

        List<Category> createdCategories = categoryService.createMultiple(categoriesToCreate, targetUser.getId());

        // Send activity event
        unifiedActivityService.sendBulkCategoriesCreatedEvent(createdCategories, reqUser, targetUser);

        List<CategoryDTO> responses = categoryMapper.toResponseList(createdCategories);
        log.info("Created {} categories", createdCategories.size());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.successList(responses, "Created " + createdCategories.size() + " categories"));
    }

    @PutMapping("/bulk")
    @Operation(summary = "Update multiple categories", description = "Updates multiple categories in a single request")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> updateMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Category> categories,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);
        User userForUpdate = (targetId == null) ? reqUser : targetUser;

        log.info("Updating {} categories for user: userId={}", categories.size(), targetUser.getId());

        List<Category> updatedCategories = categoryService.updateMultiple(categories, userForUpdate);

        // Send activity event
        unifiedActivityService.sendMultipleCategoriesUpdatedEvent(updatedCategories, reqUser, targetUser);

        List<CategoryDTO> responses = categoryMapper.toResponseList(updatedCategories);
        log.info("Updated {} categories", updatedCategories.size());

        return ResponseEntity
                .ok(ApiResponse.successList(responses, "Updated " + updatedCategories.size() + " categories"));
    }

    @DeleteMapping("/bulk")
    @Operation(summary = "Delete multiple categories", description = "Deletes multiple categories by their IDs")
    public ResponseEntity<ApiResponse<Void>> deleteMultipleCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<Integer> categoryIds,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);

        int count = categoryIds != null ? categoryIds.size() : 0;
        log.info("Deleting {} categories for user: userId={}", count, targetUser.getId());

        categoryService.deleteMultiple(categoryIds, targetUser.getId());

        // Send activity event
        unifiedActivityService.sendMultipleCategoriesDeletedEvent(count, reqUser, targetUser);

        log.info("Deleted {} categories", count);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null, "Deleted " + count + " categories"));
    }

    @DeleteMapping("/all/global")
    @Operation(summary = "Delete all global categories", description = "Removes user's association with global categories")
    public ResponseEntity<ApiResponse<Void>> deleteAllGlobalCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(name = "global", defaultValue = "true") boolean global,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);

        log.info("Deleting all global categories for user: userId={}", targetUser.getId());

        categoryService.deleteAllGlobal(targetUser.getId(), global);

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null, "Global categories removed"));
    }

    @DeleteMapping("")
    @Operation(summary = "Delete all categories", description = "Deletes all user categories")
    public ResponseEntity<ApiResponse<Void>> deleteAllCategories(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, true);

        List<Category> categories = categoryService.getAll(targetUser.getId());
        int count = categories != null ? categories.size() : 0;

        log.info("Deleting all {} categories for user: userId={}", count, targetUser.getId());

        categoryService.deleteAllUserCategories(targetUser.getId());

        // Send activity event
        unifiedActivityService.sendAllCategoriesDeletedEvent(count, reqUser, targetUser);

        log.info("Deleted all {} categories for user: userId={}", count, targetUser.getId());

        return ResponseEntity
                .status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null, "Deleted " + count + " categories"));
    }

    // ========================
    // Admin Operations
    // ========================

    @PatchMapping("/admin/global/{id}")
    @Operation(summary = "Admin update global category", description = "Allows admin to update a global category")
    public ResponseEntity<ApiResponse<CategoryDTO>> adminUpdateGlobalCategory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer id,
            @Valid @RequestBody UpdateCategoryRequest request) {

        User reqUser = validateUserFromJwt(jwt);

        log.info("Admin updating global category: id={}, adminId={}", id, reqUser.getId());

        Category oldCategory = categoryService.getById(id, reqUser.getId());
        Category categoryUpdate = categoryMapper.toEntityForUpdate(request, reqUser.getId());
        Category updated = categoryService.adminUpdateGlobalCategory(id, categoryUpdate, reqUser);

        // Send activity event
        unifiedActivityService.sendCategoryUpdatedEvent(updated, oldCategory, reqUser, reqUser);

        CategoryDTO response = categoryMapper.toResponse(updated);
        log.info("Admin updated global category: id={}", id);

        return ResponseEntity.ok(ApiResponse.success(response, "Global category updated"));
    }

    // ========================
    // Category-Expense Operations
    // ========================

    @GetMapping("/uncategorized")
    @Operation(summary = "Get uncategorized expenses", description = "Retrieves expenses in the 'Others' category")
    public ResponseEntity<ApiResponse<List<ExpenseDTO>>> getUncategorizedExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

        log.debug("Getting uncategorized expenses for user: userId={}", targetUser.getId());

        List<ExpenseDTO> uncategorizedExpenses = categoryService.getOthersAndUncategorizedExpenses(targetUser);

        return ResponseEntity.ok(ApiResponse.successList(uncategorizedExpenses));
    }

    @GetMapping("/{categoryId}/filtered-expenses")
    @Operation(summary = "Get filtered expenses with category flag", description = "Retrieves all expenses with a flag indicating if they belong to the specified category")
    public ResponseEntity<ApiResponse<List<ExpenseDTO>>> getFilteredExpensesWithCategoryFlag(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer categoryId,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

        log.debug("Getting filtered expenses for category: categoryId={}, userId={}",
                categoryId, targetUser.getId());

        List<ExpenseDTO> allExpenses = categoryService.getAllExpensesWithCategoryFlag(
                targetUser.getId(), categoryId);

        return ResponseEntity.ok(ApiResponse.successList(allExpenses));
    }

    @GetMapping("/{categoryId}/expenses")
    @Operation(summary = "Get expenses by category", description = "Retrieves expenses belonging to a specific category with pagination and filtering")
    public ResponseEntity<ApiResponse<List<ExpenseDTO>>> getExpensesByCategoryId(
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

        log.debug("Getting expenses for category: categoryId={}, userId={}, page={}, size={}",
                categoryId, targetUser.getId(), page, size);

        // Normalize sort parameters
        String effectiveSortDir = normalizeOrdering(sortDir);
        String effectiveSortBy = validateAndNormalizeSortField(sortBy);

        List<ExpenseDTO> orderedExpenses = categoryService.getAllUserExpensesOrderedByCategoryFlag(
                targetUser.getId(), categoryId, page, size, effectiveSortBy, effectiveSortDir);

        // Apply date filtering if provided
        orderedExpenses = filterExpensesByDateAndCategory(orderedExpenses, startDate, endDate);

        return ResponseEntity.ok(ApiResponse.successList(orderedExpenses));
    }

    // ========================
    // Search Operations
    // ========================

    @GetMapping("/search")
    @Operation(summary = "Search categories", description = "Searches categories by name or description")
    public ResponseEntity<ApiResponse<List<CategoryDTO>>> searchCategories(
            @RequestParam String query,
            @RequestParam(defaultValue = "20") int limit,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {

        User reqUser = validateUserFromJwt(jwt);
        User targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);

        log.debug("Searching categories: query={}, userId={}, limit={}", query, targetUser.getId(), limit);

        List<CategoryDTO> results = categoryService.searchCategories(targetUser.getId(), query, limit);

        return ResponseEntity.ok(ApiResponse.successList(results));
    }

    // ========================
    // Internal Service Endpoints (for inter-service communication)
    // ========================

    @GetMapping("/get-by-id-with-service")
    @Operation(summary = "Internal: Get category by ID", description = "Internal endpoint for inter-service communication")
    public CategoryDTO getById(
            @RequestParam Integer categoryId,
            @RequestParam Integer userId) {
        Category category = categoryService.getById(categoryId, userId);
        return categoryMapper.toResponse(category);
    }

    @GetMapping("/get-by-name-with-service")
    @Operation(summary = "Internal: Get categories by name", description = "Internal endpoint for inter-service communication")
    public List<CategoryDTO> getByName(
            @RequestParam String categoryName,
            @RequestParam Integer userId) {
        List<Category> categories = categoryService.getByName(categoryName, userId);
        return categoryMapper.toResponseList(categories);
    }

    @PostMapping("/create-category-with-service")
    @Operation(summary = "Internal: Create category", description = "Internal endpoint for inter-service communication")
    public CategoryDTO createCategoryWithService(
            @RequestBody Category category,
            @RequestParam Integer userId) {
        Category created = categoryService.create(category, userId);
        return categoryMapper.toResponse(created);
    }

    @PostMapping("/save")
    @Operation(summary = "Internal: Save category", description = "Internal endpoint for inter-service communication")
    public CategoryDTO save(@RequestBody Category category) {
        Category saved = categoryService.save(category);
        return categoryMapper.toResponse(saved);
    }

    @GetMapping("/get-all-for-users")
    @Operation(summary = "Internal: Get all categories for user", description = "Internal endpoint for inter-service communication")
    public List<CategoryDTO> getAllForUser(@RequestParam Integer userId) {
        List<Category> categories = categoryService.getAllForUser(userId);
        return categoryMapper.toResponseList(categories);
    }

    // ========================
    // Private Helper Methods
    // ========================

    /**
     * Normalizes sort direction to 'asc' or 'desc'.
     */
    private String normalizeOrdering(String sortDir) {
        if (sortDir == null) {
            return CategoryConstants.DEFAULT_SORT_DIR;
        }
        String normalized = sortDir.toLowerCase();
        return (normalized.equals("asc") || normalized.equals("desc"))
                ? normalized
                : CategoryConstants.DEFAULT_SORT_DIR;
    }

    /**
     * Validates and normalizes sort field for expense queries.
     */
    private String validateAndNormalizeSortField(String sortBy) {
        if (sortBy == null || sortBy.isEmpty()) {
            return CategoryConstants.DEFAULT_SORT_FIELD;
        }

        // Direct fields
        if (sortBy.equals("id") || sortBy.equals("date") || sortBy.equals("categoryId")) {
            return sortBy;
        }

        // Expense nested fields
        List<String> expenseFields = List.of(
                "expenseName", "amount", "type", "paymentMethod",
                "netAmount", "comments", "creditDue");

        if (expenseFields.contains(sortBy)) {
            return "expense." + sortBy;
        }

        if (sortBy.startsWith("expense.")) {
            String nestedField = sortBy.substring("expense.".length());
            if (expenseFields.contains(nestedField)) {
                return sortBy;
            }
        }

        return CategoryConstants.DEFAULT_SORT_FIELD;
    }

    /**
     * Filters expenses by date range and category membership.
     */
    private List<ExpenseDTO> filterExpensesByDateAndCategory(
            List<ExpenseDTO> expenses,
            String startDate,
            String endDate) {

        return expenses.stream()
                .filter(ExpenseDTO::isIncludeInBudget) // Only include expenses in this category
                .filter(e -> {
                    if (startDate == null || endDate == null || e.getExpenseDate() == null) {
                        return true;
                    }
                    LocalDate start = LocalDate.parse(startDate);
                    LocalDate end = LocalDate.parse(endDate);
                    LocalDate expenseDate = e.getExpenseDate();
                    return !expenseDate.isBefore(start) && !expenseDate.isAfter(end);
                })
                .collect(Collectors.toList());
    }
}
