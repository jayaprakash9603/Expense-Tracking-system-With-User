package com.jaya.service;


import com.jaya.dto.ExpenseDTO;
import com.jaya.models.Category;
import com.jaya.models.User;
import com.jaya.repository.CategoryRepository;
import com.jaya.util.ServiceHelper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;


    @Autowired
    @Lazy
    private ExpenseService expenseService;


    @Autowired
    private ServiceHelper helper;

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    @Autowired
    private CategoryAsyncService categoryAsyncService;

    public Category create(Category category, Integer userId) throws Exception {
        User user = helper.validateUser(userId);
        // Create the initial category
        Category createCategory = new Category();
        if (category.isGlobal()) {
            createCategory.setUserId(0);
        } else {
            createCategory.setUserId(userId);
        }
        createCategory.setDescription(category.getDescription());
        createCategory.setName(category.getName());
        createCategory.setGlobal(category.isGlobal());
        createCategory.setType(category.getType());
        createCategory.setIcon(category.getIcon());
        createCategory.setColor(category.getColor());

        // Initialize collections
        createCategory.setExpenseIds(new HashMap<>());
        createCategory.setUserIds(new HashSet<>());
        createCategory.setEditUserIds(new HashSet<>());

        // Save the category first to generate its ID
        Category initialSavedCategory = categoryRepository.save(createCategory);

        // Fire-and-forget: finalize expense updates and exclusivity in background
        try {
            categoryAsyncService.finalizeCategoryCreateAsync(initialSavedCategory, category, user);
        } catch (Exception e) {
            logger.warn("Failed to dispatch async finalize for category {}: {}", initialSavedCategory.getId(), e.getMessage());
        }

        // Return immediately with the created category; expense mappings will be populated asynchronously
        return initialSavedCategory;
    }

    public Category getById(Integer id, Integer userId) throws Exception {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new Exception("Category not found with ID: " + id));

        logger.debug("Checking access for user {} to category {}", userId, id);



        // Check if user owns the category (for user-specific categories)
        if (category.getUserId() != null && category.getUserId().equals(userId)) {
            logger.debug("User {} owns category {}", userId, id);
            return category;
        }

        // Check if it's a global category that the user can access
        if (category.isGlobal()) {
            boolean inUserIds = category.getUserIds() != null && category.getUserIds().contains(userId);
            boolean inEditUserIds = category.getEditUserIds() != null && category.getEditUserIds().contains(userId);

            logger.debug("Global category - inUserIds: {}, inEditUserIds: {}", inUserIds, inEditUserIds);

            // User can access global category if they haven't "deleted" it and haven't edited it
            if (!inUserIds && !inEditUserIds) {
                logger.debug("User {} can access global category {}", userId, id);
                return category;
            }
        }

        logger.warn("Access denied for user {} to category {}",userId, id);
        throw new Exception("Category not found or access denied");
    }

    public List<Category> getAll(Integer userId) throws Exception {
        // Fetch user-specific categories
        User user=helper.validateUser(userId);
        List<Category> userCategories = categoryRepository.findAllWithDetailsByUserId(user.getId());

        // Fetch global categories where the user is NOT in userIds or editUserIds
        List<Category> globalCategories = categoryRepository.findAllGlobalWithDetails().stream()
                .filter(category ->
                        !category.getUserIds().contains(userId) &&
                                !category.getEditUserIds().contains(userId)
                )
                .collect(Collectors.toList());

        // Combine all categories
        List<Category> allCategories = new ArrayList<>();
        allCategories.addAll(userCategories);
        allCategories.addAll(globalCategories);

        return allCategories;
    }


    public boolean isUserEdited(Integer userId, Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Check if the user has already edited the category
        if (category.isGlobal() && category.getEditUserIds().contains(userId)) {
            return true;
        }
        return false;
    }


    public Category update(Integer id, Category category, Integer userId) throws Exception {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Guard: Global categories can only be edited once per user
        if (existing.isGlobal() && isUserEdited(userId, id)) {
            throw new Exception("You can only edit this global category once.");
        }

        // CASE A: First-time edit of a global category by this user -> clone to user-specific
        if (existing.isGlobal() && !isUserEdited(userId, id)) {
            // Mark user as having edited this global category
            existing.getEditUserIds().add(userId);
            categoryRepository.save(existing);

            // Create a user-specific category seeded from the global + requested edits
            Category userCategory = new Category();
            userCategory.setName(category.getName());
            userCategory.setUserId(userId);
            userCategory.setDescription(category.getDescription());
            userCategory.setIcon(category.getIcon() != null ? category.getIcon() : existing.getIcon());
            userCategory.setType(existing.getType());
            userCategory.setGlobal(false);
            userCategory.setColor(category.getColor());
            userCategory.setExpenseIds(new HashMap<>());
            userCategory.setUserIds(new HashSet<>());
            userCategory.setEditUserIds(new HashSet<>());

            userCategory = categoryRepository.save(userCategory);

            // Determine intended assignments for this user
            Set<Integer> currentGlobalIds = getUserExpenseIds(existing, userId);
            Set<Integer> requestedIds = hasExpenseIdsInRequest(category, userId)
                    ? getRequestedExpenseIdsForUser(category, userId)
                    : new HashSet<>(currentGlobalIds); // preserve if none provided

            // Exclusivity: remove requested from all other categories (exclude source and the new one)
            removeExpenseIdsFromOtherCategories(userId, requestedIds, new HashSet<>(Arrays.asList(existing.getId(), userCategory.getId())));

            // Compute removed vs kept
            Set<Integer> removedIds = new HashSet<>(currentGlobalIds);
            removedIds.removeAll(requestedIds);

            // Detach from global for this user
            if (existing.getExpenseIds() != null && existing.getExpenseIds().containsKey(userId)) {
                existing.getExpenseIds().remove(userId);
                categoryRepository.save(existing);
            }

            // Assign kept/requested to the new user category
            if (!requestedIds.isEmpty()) {
                updateExpenseEntitiesCategory(userId, requestedIds, userCategory.getId(), userCategory.getName());
                setCategoryExpenseIdsForUser(userCategory, userId, requestedIds);
                userCategory = categoryRepository.save(userCategory);
            }

            // Move only removed ones to Others
            if (!removedIds.isEmpty()) {
                assignExpensesToOthersCategory(userId, removedIds);
            }

            return userCategory;
        }

        // CASE B: Non-global category or already user-specific path
        // Apply basic field updates
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        if (category.getColor() != null) existing.setColor(category.getColor());
        if (category.getIcon() != null) existing.setIcon(category.getIcon());

        // If no explicit expenseIds provided -> no change to assignments
        if (!hasExpenseIdsInRequest(category, userId)) {
            return categoryRepository.save(existing);
        }

        // Compute old vs new
        Set<Integer> oldIds = getUserExpenseIds(existing, userId);
        Set<Integer> newIds = getRequestedExpenseIdsForUser(category, userId);

        // Enforce exclusivity: remove newIds from all other categories (exclude current)
        removeExpenseIdsFromOtherCategories(userId, newIds, Collections.singleton(existing.getId()));

        // Update expenses to point to this category
        updateExpenseEntitiesCategory(userId, newIds, existing.getId(), existing.getName());

        // Update the category's expenseIds mapping
        setCategoryExpenseIdsForUser(existing, userId, newIds);

        // Determine removed ones and move them to Others
        Set<Integer> removed = new HashSet<>(oldIds);
        removed.removeAll(newIds);
        if (!removed.isEmpty()) {
            assignExpensesToOthersCategory(userId, removed);
        }

        return categoryRepository.save(existing);
    }

    // Helper method to handle assigning expenses to Others category
    private void assignExpensesToOthersCategory(Integer userId, Set<Integer> expenseIds) throws Exception {
        if (expenseIds.isEmpty()) {
            return;
        }

        // Find or create "Others" category
        Category othersCategory;
        try {
            List<Category> othersList = getByName("Others", userId);
            othersCategory = othersList.get(0);
        } catch (Exception e) {
            Category newOthers = new Category();
            newOthers.setName("Others");
            newOthers.setDescription("Default category for uncategorized expenses");
            newOthers.setUserId(userId);
            newOthers.setGlobal(false);
            newOthers.setExpenseIds(new HashMap<>());
            newOthers.setUserIds(new HashSet<>());
            newOthers.setEditUserIds(new HashSet<>());
            othersCategory = categoryRepository.save(newOthers);
        }

        // Add removed expenses to "Others" category
        Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().getOrDefault(userId, new HashSet<>());
        for (Integer expenseId : expenseIds) {
            ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
            if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                expense.setCategoryId(othersCategory.getId());
                expense.setCategoryName(othersCategory.getName());
                expenseService.save(expense);
                othersExpenseIds.add(expenseId);
                logger.info("Moved expense {} to Others category", expenseId);
            }
        }
        othersCategory.getExpenseIds().put(userId, othersExpenseIds);
        categoryRepository.save(othersCategory);
    }

    private ExpenseService getExpenseService() {
        return expenseService;
    }

    // ===== Helper methods for update() refactor =====

    private boolean hasExpenseIdsInRequest(Category input, Integer userId) {
        return input.getExpenseIds() != null && input.getExpenseIds().containsKey(userId);
    }

    private Set<Integer> getRequestedExpenseIdsForUser(Category input, Integer userId) {
        if (input.getExpenseIds() == null) return new HashSet<>();
        Set<Integer> ids = input.getExpenseIds().get(userId);
        return ids != null ? new HashSet<>(ids) : new HashSet<>();
    }

    private Set<Integer> getUserExpenseIds(Category category, Integer userId) {
        if (category.getExpenseIds() == null) return new HashSet<>();
        Set<Integer> ids = category.getExpenseIds().get(userId);
        return ids != null ? new HashSet<>(ids) : new HashSet<>();
    }

    private void removeExpenseIdsFromOtherCategories(Integer userId, Set<Integer> ids, Set<Integer> excludedCategoryIds) {
        if (ids == null || ids.isEmpty()) return;
        List<Category> all = categoryRepository.findAll();
        for (Category other : all) {
            if (excludedCategoryIds != null && excludedCategoryIds.contains(other.getId())) continue;
            if (other.getExpenseIds() == null || !other.getExpenseIds().containsKey(userId)) continue;
            Set<Integer> otherIds = other.getExpenseIds().get(userId);
            if (otherIds == null || otherIds.isEmpty()) continue;
            boolean modified = otherIds.removeAll(ids);
            if (modified) {
                if (otherIds.isEmpty()) {
                    other.getExpenseIds().remove(userId);
                } else {
                    other.getExpenseIds().put(userId, otherIds);
                }
                categoryRepository.save(other);
                logger.info("Removed expense IDs from category {}: {}", other.getId(), ids);
            }
        }
    }

    private void updateExpenseEntitiesCategory(Integer userId, Set<Integer> expenseIds, Integer targetCategoryId, String targetCategoryName) throws Exception {
        if (expenseIds == null || expenseIds.isEmpty()) return;
        for (Integer expenseId : expenseIds) {
            ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
            if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                expense.setCategoryId(targetCategoryId);
                if (targetCategoryName != null) {
                    expense.setCategoryName(targetCategoryName);
                }
                expenseService.save(expense);
                logger.info("Updated expense {} to category {}", expenseId, targetCategoryId);
            }
        }
    }

    private void setCategoryExpenseIdsForUser(Category category, Integer userId, Set<Integer> expenseIds) {
        if (category.getExpenseIds() == null) category.setExpenseIds(new HashMap<>());
        if (expenseIds == null || expenseIds.isEmpty()) {
            category.getExpenseIds().remove(userId);
        } else {
            category.getExpenseIds().put(userId, new HashSet<>(expenseIds));
        }
    }

    public String delete(Integer id, Integer userId) throws Exception {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new Exception("Category not found"));

        // Only the owner can delete a user-specific category
        if (!existing.isGlobal() && (existing.getUserId() == null || !existing.getUserId().equals(userId))) {
            throw new Exception("You can't delete another user's category");
        }

        // Gather all expense IDs for this user in the category
        Set<Integer> expenseIds = existing.getExpenseIds() != null && existing.getExpenseIds().containsKey(userId)
                ? new HashSet<>(existing.getExpenseIds().get(userId))
                : new HashSet<>();

        List<ExpenseDTO> affectedExpenses = new ArrayList<>();
        for (Integer expenseId : expenseIds) {
            ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);
            if (expense != null) {
                affectedExpenses.add(expense);
            }
        }

        // Remove the user's expense IDs from the category
        if (existing.getExpenseIds() != null) {
            existing.getExpenseIds().remove(userId);
            categoryRepository.save(existing);
        }

        // Delete the category if it's user-specific, or update userIds for global
        if (existing.isGlobal()) {
            existing.getUserIds().add(userId);
            categoryRepository.save(existing);
        } else {
            categoryRepository.delete(existing);
        }

        // Assign all affected expenses to "Others" category
        if (!affectedExpenses.isEmpty()) {
            assignExpensesToOthersCategory(userId, affectedExpenses);
        }

        return "Category Deleted Successfully";
    }

    // Helper method to assign expenses to Others category
    private void assignExpensesToOthersCategory(Integer userId, List<ExpenseDTO> expenses) throws Exception {
        if (expenses.isEmpty()) {
            return;
        }

        // Try to find existing "Others" category or create a new one
        Category othersCategory;
        try {
            othersCategory = getByName("Others", userId).get(0);
        } catch (Exception e) {
            // Create "Others" category if it doesn't exist
            Category newCategory = new Category();
            newCategory.setName("Others");
            newCategory.setDescription("Default category for uncategorized expenses");
            newCategory.setUserId(userId);
            newCategory.setGlobal(false);
            othersCategory = categoryRepository.save(newCategory);
        }

        // Initialize expenseIds map if needed
        if (othersCategory.getExpenseIds() == null) {
            othersCategory.setExpenseIds(new HashMap<>());
        }

        // Process all expenses
        Set<Integer> validExpenseIds = new HashSet<>();
        for (ExpenseDTO expense : expenses) {
            // Set the expense's category to Others
            expense.setCategoryId(othersCategory.getId());
            expenseService.save( expense);

            // Add expense to valid IDs list
            validExpenseIds.add(expense.getId());
        }

        // Only update the Others category if we have valid expense IDs
        if (!validExpenseIds.isEmpty()) {
            // Get existing expense IDs for this user, if any
            Set<Integer> existingIds = othersCategory.getExpenseIds()
                    .getOrDefault(userId, new HashSet<>());

            // Add all new valid IDs
            existingIds.addAll(validExpenseIds);

            // Update the category
            othersCategory.getExpenseIds().put(userId, existingIds);
            categoryRepository.save(othersCategory);
        }
    }

    public String deleteGlobalCategoryById(Integer id, User user) throws Exception {
        Category existing = getById(id, user.getId());
        if (existing != null && existing.isGlobal() && (!existing.getUserIds().contains(user.getId())&& !existing.getEditUserIds().contains(user.getId()))) {
           categoryRepository.deleteById(id);
           return "Category is deleted";
        }
        return "You cant delete this category";
    }


    public List<Category> createMultiple(List<Category> categories, Integer userId) {
        List<Category> createdCategories = new ArrayList<>();
        for (Category category : categories) {
            // Initialize new Category object as in create()
            Category createCategory = new Category();
            if (category.isGlobal()) {
                createCategory.setUserId(0);
            } else {
                createCategory.setUserId(userId);
            }
            createCategory.setDescription(category.getDescription());
            createCategory.setName(category.getName());
            createCategory.setGlobal(category.isGlobal());
            createCategory.setType(category.getType());
            createCategory.setIcon(category.getIcon());
            createCategory.setColor(category.getColor());
            createCategory.setExpenseIds(new HashMap<>());
            createCategory.setUserIds(new HashSet<>());
            createCategory.setEditUserIds(new HashSet<>());

            // Save to generate ID
            Category initialSavedCategory = categoryRepository.save(createCategory);
            final Integer categoryId = initialSavedCategory.getId();

            // Handle expense IDs for this user
            Set<Integer> requestedExpenseIds = new HashSet<>();
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                requestedExpenseIds.addAll(category.getExpenseIds().get(userId));
            }

            Set<Integer> validExpenseIds = new HashSet<>();
            for (Integer expenseId : requestedExpenseIds) {
                ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);
                if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                    validExpenseIds.add(expenseId);
                }
            }

            // Remove these expense IDs from all other categories for this user
            if (!validExpenseIds.isEmpty()) {
                List<Category> allCategories = categoryRepository.findAll().stream()
                        .filter(c -> !c.getId().equals(categoryId) && c.getExpenseIds() != null && c.getExpenseIds().containsKey(userId))
                        .collect(Collectors.toList());
                for (Category otherCategory : allCategories) {
                    Set<Integer> otherExpenseIds = otherCategory.getExpenseIds().get(userId);
                    if (otherExpenseIds != null) {
                        otherExpenseIds.removeAll(validExpenseIds);
                        otherCategory.getExpenseIds().put(userId, otherExpenseIds);
                        categoryRepository.save(otherCategory);
                    }
                }
            }

            // Update the category's expenseIds map for this user and save
            if (!validExpenseIds.isEmpty()) {
                Category finalCategory = categoryRepository.findById(categoryId).orElse(initialSavedCategory);
                finalCategory.getExpenseIds().put(userId, validExpenseIds);
                createdCategories.add(categoryRepository.save(finalCategory));
            } else {
                createdCategories.add(initialSavedCategory);
            }
        }
        return createdCategories;
    }

    // Update multiple categories

    public List<Category> updateMultiple(List<Category> categories,Integer userId) throws Exception {
        List<Category> updatedCategories = new ArrayList<>();
        Map<Integer, List<Category>> expenseToCategories = new HashMap<>();

        // Track all expense IDs that were previously assigned to categories
        Map<Integer, Set<Integer>> previousExpenseIdsByCategory = new HashMap<>();

        // Step 0: Collect all previous expense IDs for each category and build a map of all expenses
        Map<Integer, Integer> previousExpenseToCategoryMap = new HashMap<>();

        // First, get all existing categories to check their current state
        List<Category> existingCategories = categoryRepository.findAll();

        // Build a map of expense ID -> category ID for all existing expenses
        for (Category existingCategory : existingCategories) {
            if (existingCategory.getExpenseIds() != null && existingCategory.getExpenseIds().containsKey(userId)) {
                Set<Integer> expenseIds = existingCategory.getExpenseIds().get(userId);
                if (expenseIds != null) {
                    for (Integer expenseId : expenseIds) {
                        previousExpenseToCategoryMap.put(expenseId, existingCategory.getId());
                    }
                }
            }

            // Also store the previous state of categories being updated
            if (existingCategory.getId() != null) {
                for (Category inputCategory : categories) {
                    if (inputCategory.getId() != null && inputCategory.getId().equals(existingCategory.getId())) {
                        if (existingCategory.getExpenseIds() != null &&
                                existingCategory.getExpenseIds().containsKey(userId)) {
                            previousExpenseIdsByCategory.put(existingCategory.getId(),
                                    new HashSet<>(existingCategory.getExpenseIds().get(userId)));
                        } else {
                            previousExpenseIdsByCategory.put(existingCategory.getId(), new HashSet<>());
                        }
                        break;
                    }
                }
            }
        }

        logger.info("Previous expense to category mapping contains {} entries", previousExpenseToCategoryMap.size());

        // Step 1: Build mapping of expenseId -> categories that want to claim it in the new update
        Map<Integer, List<Integer>> newExpenseToCategoriesMap = new HashMap<>();

        for (Category category : categories) {
            if (category.getExpenseIds() == null) {
                category.setExpenseIds(new HashMap<>());
            }

            Set<Integer> expenseIds = category.getExpenseIds().containsKey(userId)
                    ? new HashSet<>(category.getExpenseIds().get(userId))
                    : new HashSet<>();

            for (Integer expenseId : expenseIds) {
                newExpenseToCategoriesMap.computeIfAbsent(expenseId, k -> new ArrayList<>())
                        .add(category.getId());
            }
        }

        // Step 2: Find duplicate expense IDs (assigned to more than one category in the update)
        Set<Integer> duplicateExpenseIds = newExpenseToCategoriesMap.entrySet().stream()
                .filter(e -> e.getValue().size() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        logger.info("Found {} duplicate expense IDs across categories in the update", duplicateExpenseIds.size());

        // Step 3: Identify expenses that have been moved between categories
        Map<Integer, Integer> movedExpenses = new HashMap<>(); // expenseId -> new categoryId
        Set<Integer> expensesToMoveToOthers = new HashSet<>(duplicateExpenseIds);

        // For each expense in the new assignments
        for (Map.Entry<Integer, List<Integer>> entry : newExpenseToCategoriesMap.entrySet()) {
            Integer expenseId = entry.getKey();
            List<Integer> newCategoryIds = entry.getValue();

            // Skip duplicates as they'll go to Others
            if (duplicateExpenseIds.contains(expenseId)) {
                continue;
            }

            // If this expense was previously assigned to a different category
            Integer previousCategoryId = previousExpenseToCategoryMap.get(expenseId);

            if (previousCategoryId != null && !newCategoryIds.contains(previousCategoryId)) {
                // This expense has been moved from one category to another
                movedExpenses.put(expenseId, newCategoryIds.get(0)); // Use the first (and only) new category
                logger.info("Expense ID {} moved from category {} to {}",
                        expenseId, previousCategoryId, newCategoryIds.get(0));
            }
        }

        // Step 4: Find expenses that were removed from all categories
        Set<Integer> removedExpenseIds = new HashSet<>();

        for (Map.Entry<Integer, Integer> entry : previousExpenseToCategoryMap.entrySet()) {
            Integer expenseId = entry.getKey();

            // If this expense is not in any new category assignments and not already marked as moved
            if (!newExpenseToCategoriesMap.containsKey(expenseId) && !movedExpenses.containsKey(expenseId)) {
                removedExpenseIds.add(expenseId);
                logger.info("Expense ID {} removed from all categories", expenseId);
            }
        }

        // Step 5: Remove duplicates from all input categories
        for (Category category : categories) {
            if (category.getExpenseIds() == null) {
                category.setExpenseIds(new HashMap<>());
            }

            Set<Integer> expenseIds = category.getExpenseIds().containsKey(userId)
                    ? new HashSet<>(category.getExpenseIds().get(userId))
                    : new HashSet<>();

            // Remove all duplicate IDs from this category
            expenseIds.removeAll(duplicateExpenseIds);

            // Remove expenses that have been moved to other categories
            for (Map.Entry<Integer, Integer> entry : movedExpenses.entrySet()) {
                Integer expenseId = entry.getKey();
                Integer newCategoryId = entry.getValue();

                // If this expense has been moved to a different category, remove it from all others
                if (!category.getId().equals(newCategoryId)) {
                    expenseIds.remove(expenseId);
                }
            }

            // Only add the user's expense IDs if there are any
            if (!expenseIds.isEmpty()) {
                category.getExpenseIds().put(userId, expenseIds);
            } else {
                // Remove the user's entry if it exists and would be empty
                category.getExpenseIds().remove(userId);
            }
        }

        // Step 6: Find or create "Others" category for duplicates and completely removed expenses
        Category othersCategory = null;
        expensesToMoveToOthers.addAll(removedExpenseIds);

        if (!expensesToMoveToOthers.isEmpty()) {
            try {
                othersCategory = getByName("Others", userId).get(0);
                logger.info("Found existing Others category with ID: {}", othersCategory.getId());
            } catch (Exception e) {
                // Create "Others" category if it doesn't exist
                Category newCategory = new Category();
                newCategory.setName("Others");
                newCategory.setDescription("Default category for uncategorized expenses");
                newCategory.setUserId(userId);
                newCategory.setGlobal(false);
                newCategory.setExpenseIds(new HashMap<>());
                newCategory.setUserIds(new HashSet<>());
                newCategory.setEditUserIds(new HashSet<>());
                othersCategory = categoryRepository.save(newCategory);
                logger.info("Created new Others category with ID: {}", othersCategory.getId());
            }

            // Initialize the expense IDs collection for this user if needed
            if (othersCategory.getExpenseIds() == null) {
                othersCategory.setExpenseIds(new HashMap<>());
            }

            // Get current expense IDs for this user in Others category
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().containsKey(userId)
                    ? new HashSet<>(othersCategory.getExpenseIds().get(userId))
                    : new HashSet<>();

            // Step 7: Assign all duplicate and removed expenses to Others category
            for (Integer expenseId : expensesToMoveToOthers) {
                ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);
                if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                    // Update the expense to point to Others category
                    expense.setCategoryId(othersCategory.getId());
                    expenseService.save(expense);

                    // Add to Others category's expense list
                    othersExpenseIds.add(expenseId);
                    logger.info("Assigned expense ID {} to Others category", expenseId);
                }
            }

            // Only update Others category with expense IDs if there are any
            if (!othersExpenseIds.isEmpty()) {
                othersCategory.getExpenseIds().put(userId, othersExpenseIds);
                categoryRepository.save(othersCategory);
            }
        }

        // Step 8: Update all categories in the database
        for (Category category : categories) {
            // Skip if this is the Others category we just processed
            if (othersCategory != null && category.getId() != null && category.getId().equals(othersCategory.getId())) {
                updatedCategories.add(othersCategory);
                continue;
            }

            Category existing = categoryRepository.findById(category.getId()).orElse(null);
            if (existing != null) {
                // Update basic properties
                existing.setName(category.getName());
                existing.setDescription(category.getDescription());
                existing.setGlobal(category.isGlobal());
                existing.setIcon(category.getIcon());
                existing.setColor(category.getColor());
                existing.setType(category.getType());

                // Initialize collections if needed
                if (existing.getExpenseIds() == null) {
                    existing.setExpenseIds(new HashMap<>());
                }
                if (existing.getUserIds() == null) {
                    existing.setUserIds(new HashSet<>());
                }
                if (existing.getEditUserIds() == null) {
                    existing.setEditUserIds(new HashSet<>());
                }

                // Get the expense IDs for this user from the input category (already filtered for duplicates)
                Set<Integer> newExpenseIds = category.getExpenseIds().containsKey(userId)
                        ? new HashSet<>(category.getExpenseIds().get(userId))
                        : new HashSet<>();

                // Update each expense to point to this category
                for (Integer expenseId : newExpenseIds) {
                    ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);
                    if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                        expense.setCategoryId(existing.getId());
                        expenseService.save(expense);
                    }
                }

                // Only add the user's expense IDs if there are any
                if (!newExpenseIds.isEmpty()) {
                    existing.getExpenseIds().put(userId, newExpenseIds);
                } else {
                    // Remove the user's entry if it exists and would be empty
                    existing.getExpenseIds().remove(userId);
                }

                // Save and add to result list
                updatedCategories.add(categoryRepository.save(existing));
            }
        }

        return updatedCategories;
    }

    // Delete multiple categories
    public void deleteMultiple(List<Integer> categoryIds, Integer userId) throws Exception {
        if (categoryIds == null || categoryIds.isEmpty()) {
            logger.info("No category IDs provided for deletion");
            return;
        }

        logger.info("Deleting multiple categories: {}", categoryIds);

        // Collect all expenses that need to be reassigned
        List<ExpenseDTO> expensesToReassign = new ArrayList<>();
        List<Category> categoriesToDelete = new ArrayList<>();

        // First pass: collect all affected expenses and categories to delete
        for (Integer id : categoryIds) {
            Category existing = categoryRepository.findById(id).orElse(null);
            if (existing == null) {
                logger.warn("Category with ID {} not found", id);
                continue;
            }

            // Skip "Others" category if it's in the deletion list
            if ("Others".equals(existing.getName())) {
                logger.warn("Skipping deletion of 'Others' category (ID: {})", id);
                continue;
            }

            // For global categories, just remove the user from userIds
            if (existing.isGlobal()) {
                existing.getUserIds().add(userId);
                categoryRepository.save(existing);
                logger.info("Added user {} to userIds of global category {}", userId, id);
                continue;
            }

            // Only process user-specific categories that belong to this user
            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
                logger.warn("Category {} does not belong to user {}", id, userId);
                continue;
            }

            // Collect expenses to reassign
            if (existing.getExpenseIds() != null && existing.getExpenseIds().containsKey(userId)) {
                Set<Integer> expenseIds = existing.getExpenseIds().get(userId);
                if (expenseIds != null && !expenseIds.isEmpty()) {
                    for (Integer expenseId : expenseIds) {
                        ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);
                        if (expense != null) {
                            expensesToReassign.add(expense);
                        }
                    }
                }
            }

            // Mark category for deletion
            categoriesToDelete.add(existing);
        }

        // If there are expenses to reassign, find or create "Others" category
        if (!expensesToReassign.isEmpty()) {
            logger.info("Found {} expenses to reassign to 'Others' category", expensesToReassign.size());

            // Find or create "Others" category
            Category othersCategory;
            try {
                List<Category> othersCategories = getByName("Others", userId);
                if (othersCategories.isEmpty()) {
                    throw new Exception("Others category not found");
                }
                othersCategory = othersCategories.get(0);
                logger.info("Found existing 'Others' category with ID: {}", othersCategory.getId());
            } catch (Exception e) {
                // Create "Others" category if it doesn't exist
                Category newCategory = new Category();
                newCategory.setName("Others");
                newCategory.setDescription("Default category for uncategorized expenses");
                newCategory.setUserId(userId);
                newCategory.setGlobal(false);
                newCategory.setExpenseIds(new HashMap<>());
                newCategory.setUserIds(new HashSet<>());
                newCategory.setEditUserIds(new HashSet<>());
                othersCategory = categoryRepository.save(newCategory);
                logger.info("Created new 'Others' category with ID: {}", othersCategory.getId());
            }

            // Initialize the expense IDs collection for this user if needed
            if (othersCategory.getExpenseIds() == null) {
                othersCategory.setExpenseIds(new HashMap<>());
            }

            // Get current expense IDs for this user in Others category
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().containsKey(userId)
                    ? new HashSet<>(othersCategory.getExpenseIds().get(userId))
                    : new HashSet<>();

            // Reassign all expenses to Others category
            for (ExpenseDTO expense : expensesToReassign) {
                // Update the expense to point to Others category
                expense.setCategoryId(othersCategory.getId());
               expenseService.save(expense);

                // Add to Others category's expense list
                othersExpenseIds.add(expense.getId());
                logger.info("Reassigned expense ID {} to 'Others' category", expense.getId());
            }

            // Update Others category with the new expense IDs
            if (!othersExpenseIds.isEmpty()) {
                othersCategory.getExpenseIds().put(userId, othersExpenseIds);
                categoryRepository.save(othersCategory);
                logger.info("Updated 'Others' category with {} expense IDs", othersExpenseIds.size());
            }
        }

        // Finally, delete all the categories
        for (Category category : categoriesToDelete) {
            categoryRepository.delete(category);
            logger.info("Deleted category with ID: {}", category.getId());
        }

        logger.info("Completed deletion of {} categories", categoriesToDelete.size());
    }


    public void deleteAllGlobal(Integer userId, boolean global) throws Exception {
        logger.info("deleteAllGlobal called with user: {} and global: {}", userId, global);

        List<ExpenseDTO> expensesToReassign = new ArrayList<>();

        if (global) {
            // Handle global categories deletion
            List<Category> globalCategories = categoryRepository.findAllByIsGlobalTrue();
            logger.info("Global categories to delete: {}", globalCategories.size());

            // First collect all expenses that need to be reassigned
            for (Category category : globalCategories) {
                if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                    Set<Integer> expenseIds = category.getExpenseIds().get(userId);
                    if (expenseIds != null && !expenseIds.isEmpty()) {
                        for (Integer expenseId : expenseIds) {
                            ExpenseDTO expense = expenseService.getExpenseById(expenseId,userId);
                            if (expense != null) {
                                expense.setCategoryId(null); // Temporarily set to null
                                expenseService.save( expense);
                                expensesToReassign.add(expense);
                            }
                        }
                    }
                    // Remove this user's expenses from the category
                    category.getExpenseIds().remove(userId);
                    categoryRepository.save(category);
                }

                // Add user to userIds to indicate they've "deleted" this global category
                if (!category.getUserIds().contains(userId)) {
                    category.getUserIds().add(userId);
                    categoryRepository.save(category);
                }
            }

            logger.info("Added user {} to userIds of {} global categories",
                    userId, globalCategories.size());
            logger.info("Found {} expenses to reassign from global categories", expensesToReassign.size());

        } else {
            // Handle user-specific categories deletion
            List<Category> userCategories = categoryRepository.findAllByUserId(userId);
            logger.info("User-specific categories to delete: {}", userCategories.size());

            // First collect all expenses that need to be reassigned
            for (Category category : userCategories) {
                // Skip "Others" category - we'll handle it separately
                if ("Others".equals(category.getName())) {
                    continue;
                }

                if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                    Set<Integer> expenseIds = category.getExpenseIds().get(userId);
                    if (expenseIds != null && !expenseIds.isEmpty()) {
                        for (Integer expenseId : expenseIds) {
                            ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                            if (expense != null) {
                                expense.setCategoryId(null); // Temporarily set to null
                                expenseService.save( expense);
                                expensesToReassign.add(expense);
                            }
                        }
                    }
                }
            }

            // Delete all user categories except "Others"
            List<Category> categoriesToDelete = userCategories.stream()
                    .filter(category -> !"Others".equals(category.getName()))
                    .collect(Collectors.toList());

            categoryRepository.deleteAll(categoriesToDelete);
            logger.info("Deleted {} user-specific categories", categoriesToDelete.size());
            logger.info("Found {} expenses to reassign from user categories", expensesToReassign.size());
        }

        // If there are expenses to reassign, find or create "Others" category
        if (!expensesToReassign.isEmpty()) {
            // Find or create "Others" category
            Category othersCategory;
            try {
                List<Category> othersCategories = getByName("Others", userId);
                if (othersCategories.isEmpty()) {
                    throw new Exception("Others category not found");
                }
                othersCategory = othersCategories.get(0);
                logger.info("Found existing 'Others' category with ID: {}", othersCategory.getId());
            } catch (Exception e) {
                // Create "Others" category if it doesn't exist
                Category newCategory = new Category();
                newCategory.setName("Others");
                newCategory.setDescription("Default category for uncategorized expenses");
                newCategory.setUserId(userId);
                newCategory.setGlobal(false);
                newCategory.setExpenseIds(new HashMap<>());
                newCategory.setUserIds(new HashSet<>());
                newCategory.setEditUserIds(new HashSet<>());
                othersCategory = categoryRepository.save(newCategory);
                logger.info("Created new 'Others' category with ID: {}", othersCategory.getId());
            }

            // Initialize the expense IDs collection for this user if needed
            if (othersCategory.getExpenseIds() == null) {
                othersCategory.setExpenseIds(new HashMap<>());
            }

            // Get current expense IDs for this user in Others category
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().containsKey(userId)
                    ? new HashSet<>(othersCategory.getExpenseIds().get(userId))
                    : new HashSet<>();

            // Reassign all expenses to Others category
            for (ExpenseDTO expense : expensesToReassign) {
                // Update the expense to point to Others category
                expense.setCategoryId(othersCategory.getId());
                expenseService.save( expense);

                // Add to Others category's expense list
                othersExpenseIds.add(expense.getId());
                logger.info("Reassigned expense ID {} to 'Others' category", expense.getId());
            }

            // Update Others category with the new expense IDs
            if (!othersExpenseIds.isEmpty()) {
                othersCategory.getExpenseIds().put(userId, othersExpenseIds);
                categoryRepository.save(othersCategory);
                logger.info("Updated 'Others' category with {} expense IDs", othersExpenseIds.size());
            }
        }
    }

    public void deleteAllUserCategories(Integer userId) throws Exception {
        logger.info("Deleting all user categories for user ID: {}", userId);

        List<Category> userCategories = getAll(userId);
        logger.info("User categories to delete: {}", userCategories.size());
        List<ExpenseDTO> allUserExpenses = new ArrayList<>();

        // Collect all expenses from all categories (including "Others")
        for (Category category : userCategories) {
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                Set<Integer> expenseIds = category.getExpenseIds().get(userId);
                if (expenseIds != null && !expenseIds.isEmpty()) {
                    for (Integer expenseId : expenseIds) {
                        ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                        if (expense != null) {
                            expense.setCategoryId(null);
                            expenseService.save( expense);
                            allUserExpenses.add(expense);
                        }
                    }
                }
            }
        }

        logger.info("Found {} expenses across all user categories", allUserExpenses.size());

        // Update global categories and collect user-specific categories for deletion
        List<Category> filteredCategories = new ArrayList<>();
        for (Category category : userCategories) {
            if (category.isGlobal()) {
                if (category.getUserIds() == null) {
                    category.setUserIds(new HashSet<>());
                }
                category.getUserIds().add(userId);
                categoryRepository.save(category);
                logger.info("Added user {} to userIds of global category {}", userId, category.getId());
            } else {
                filteredCategories.add(category);
            }
        }
        // Delete only user-specific categories
        categoryRepository.deleteAll(filteredCategories);
        logger.info("Deleted {} user-specific categories", filteredCategories.size());

        // Create a new "Others" category for all expenses
        if (!allUserExpenses.isEmpty()) {
            Category newOthersCategory = new Category();
            newOthersCategory.setName("Others");
            newOthersCategory.setDescription("Default category for uncategorized expenses");
            newOthersCategory.setUserId(userId);
            newOthersCategory.setGlobal(false);
            newOthersCategory.setExpenseIds(new HashMap<>());
            newOthersCategory.setUserIds(new HashSet<>());
            newOthersCategory.setEditUserIds(new HashSet<>());

            Category savedOthersCategory = categoryRepository.save(newOthersCategory);
            logger.info("Created new 'Others' category with ID: {}", savedOthersCategory.getId());

            Set<Integer> newOthersExpenseIds = new HashSet<>();
            for (ExpenseDTO expense : allUserExpenses) {
                expense.setCategoryId(savedOthersCategory.getId());
                expenseService.save( expense);
                newOthersExpenseIds.add(expense.getId());
                logger.info("Reassigned expense ID {} to new 'Others' category", expense.getId());
            }

            if (!newOthersExpenseIds.isEmpty()) {
                savedOthersCategory.getExpenseIds().put(userId, newOthersExpenseIds);
                categoryRepository.save(savedOthersCategory);
                logger.info("Updated new 'Others' category with {} expense IDs", newOthersExpenseIds.size());
            }
        } else {
            logger.info("No expenses found to reassign to a new 'Others' category");
        }
    }


    public List<Category> getByName(String name, Integer userId) throws Exception {
        List<Category> categories = getAll(userId);
        if (categories.isEmpty()) {
            throw new Exception("Not found");
        } else {
            System.out.println("Categories found with the name: " + name);
            // Filter categories by name
            List<Category> foundCategories = categories.stream()
                    .filter(category -> category.getName().equals(name))
                    .collect(Collectors.toList());

            if (foundCategories.isEmpty()) {
                throw new Exception("Category with name '" + name + "' not found.");
            }

            return foundCategories;
        }
    }

    public void deleteAll()
    {
        categoryRepository.deleteAll();
    }


    /**
     * Get all categories for a specific user
     * This includes both user-created categories and global categories
     */
    public List<Category> getAllForUser(Integer userId) {
        // Get user's own categories
        List<Category> userCategories = categoryRepository.findByUserId(userId);

        // Get global categories
        List<Category> globalCategories = categoryRepository.findByIsGlobalTrue();

        // Combine both lists, avoiding duplicates
        Set<Integer> userCategoryIds = userCategories.stream()
                .map(Category::getId)
                .collect(Collectors.toSet());

        for (Category globalCategory : globalCategories) {
            if (!userCategoryIds.contains(globalCategory.getId())) {
                userCategories.add(globalCategory);
            }
        }

        return userCategories;
    }



    // In CategoryService.java or ExpenseService.java
    public List<ExpenseDTO> getOthersAndUncategorizedExpenses(User user) throws Exception {
        List<ExpenseDTO> allUserExpenses = expenseService.getAllExpenses(user.getId());
        List<Category> allCategories = categoryRepository.findAll();

        // Find "Others" category for this user
        Category othersCategory = allCategories.stream()
                .filter(cat -> "Others".equalsIgnoreCase(cat.getName()) &&
                        ((cat.getUserId() != null && cat.getUserId().equals(user.getId())) || cat.isGlobal()))
                .findFirst().orElse(null);

        Set<Integer> othersExpenseIds = new HashSet<>();
        if (othersCategory != null && othersCategory.getExpenseIds() != null && othersCategory.getExpenseIds().containsKey(user.getId())) {
            othersExpenseIds.addAll(othersCategory.getExpenseIds().get(user.getId()));
        }

        // Collect all expense IDs assigned to any category for this user
        Set<Integer> categorizedExpenseIds = new HashSet<>();
        for (Category category : allCategories) {
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(user.getId())) {
                categorizedExpenseIds.addAll(category.getExpenseIds().get(user.getId()));
            }
        }

        // Return expenses that are either in "Others" or not in any category
        return allUserExpenses.stream()
                .filter(expense -> othersExpenseIds.contains(expense.getId()) || !categorizedExpenseIds.contains(expense.getId()))
                .collect(Collectors.toList());
    }


    public List<ExpenseDTO> getAllExpensesWithCategoryFlag(Integer userId, Integer categoryId) throws Exception {
        // Get all expenses for the user
        List<ExpenseDTO> allUserExpenses = expenseService.getAllExpenses(userId);

        // Get the category
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));

        // Get the expense IDs for this user in this category
        Set<Integer> categoryExpenseIds = new HashSet<>();
        if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
            categoryExpenseIds = category.getExpenseIds().get(userId);
        }

        // Set includeInBudget flag based on whether the expense is in the category
        for (ExpenseDTO expense : allUserExpenses) {
            expense.setIncludeInBudget(categoryExpenseIds.contains(expense.getId()));
        }

        return allUserExpenses;
    }



    /**
     * Filter expenses by flow type (gain/loss)
     */
    private List<ExpenseDTO> filterByFlowType(List<ExpenseDTO> expenses, String flowType) {
        return expenses.stream()
                .filter(expense -> {
                    if (expense.getExpense() == null) return false;

                    String type = expense.getExpense().getType();
                    if ("gain".equalsIgnoreCase(flowType) || "income".equalsIgnoreCase(flowType)) {
                        return "gain".equalsIgnoreCase(type) || "income".equalsIgnoreCase(type);
                    } else if ("loss".equalsIgnoreCase(flowType) || "expense".equalsIgnoreCase(flowType)) {
                        return "loss".equalsIgnoreCase(type) || "expense".equalsIgnoreCase(type);
                    }
                    return true; // Return all if flowType is not recognized
                })
                .collect(Collectors.toList());
    }

    /**
     * Creates a Sort object based on the specified field and direction
     */
    private Sort createSort(String sortBy, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ?
                Sort.Direction.ASC : Sort.Direction.DESC;

        // If it's a nested field, we'll handle sorting in memory
        if (sortBy.startsWith("expense.")) {
            return Sort.by(direction, "id"); // Default sort for database query
        }

        return Sort.by(direction, sortBy);
    }


    /**
     * Sorts a list of expenses by a nested field in the ExpenseDetails object
     */
    private List<ExpenseDTO> sortExpensesByNestedField(List<ExpenseDTO> expenses, String sortBy, String sortDirection) {
        boolean ascending = sortDirection.equalsIgnoreCase("asc");
        String nestedField = sortBy.substring("expense.".length());

        return expenses.stream()
                .sorted((e1, e2) -> {
                    // Handle null expense details
                    if (e1.getExpense() == null && e2.getExpense() == null) return 0;
                    if (e1.getExpense() == null) return ascending ? -1 : 1;
                    if (e2.getExpense() == null) return ascending ? 1 : -1;

                    // Compare based on the nested field
                    switch (nestedField) {
                        case "expenseName":
                            String name1 = e1.getExpense().getExpenseName();
                            String name2 = e2.getExpense().getExpenseName();
                            if (name1 == null && name2 == null) return 0;
                            if (name1 == null) return ascending ? -1 : 1;
                            if (name2 == null) return ascending ? 1 : -1;
                            int result = name1.compareTo(name2);
                            return ascending ? result : -result;

                        case "amount":
                            Double amount1 = e1.getExpense().getAmount();
                            Double amount2 = e2.getExpense().getAmount();
                            if (amount1 == null && amount2 == null) return 0;
                            if (amount1 == null) return ascending ? -1 : 1;
                            if (amount2 == null) return ascending ? 1 : -1;
                            return ascending ? amount1.compareTo(amount2) : amount2.compareTo(amount1);

                        case "type":
                            String type1 = e1.getExpense().getType();
                            String type2 = e2.getExpense().getType();
                            if (type1 == null && type2 == null) return 0;
                            if (type1 == null) return ascending ? -1 : 1;
                            if (type2 == null) return ascending ? 1 : -1;
                            result = type1.compareTo(type2);
                            return ascending ? result : -result;

                        case "paymentMethod":
                            String method1 = e1.getExpense().getPaymentMethod();
                            String method2 = e2.getExpense().getPaymentMethod();
                            if (method1 == null && method2 == null) return 0;
                            if (method1 == null) return ascending ? -1 : 1;
                            if (method2 == null) return ascending ? 1 : -1;
                            result = method1.compareTo(method2);
                            return ascending ? result : -result;

                        case "netAmount":
                            Double net1 = e1.getExpense().getNetAmount();
                            Double net2 = e2.getExpense().getNetAmount();
                            if (net1 == null && net2 == null) return 0;
                            if (net1 == null) return ascending ? -1 : 1;
                            if (net2 == null) return ascending ? 1 : -1;
                            return ascending ? net1.compareTo(net2) : net2.compareTo(net1);

                        case "comments":
                            String comments1 = e1.getExpense().getComments();
                            String comments2 = e2.getExpense().getComments();
                            if (comments1 == null && comments2 == null) return 0;
                            if (comments1 == null) return ascending ? -1 : 1;
                            if (comments2 == null) return ascending ? 1 : -1;
                            result = comments1.compareTo(comments2);
                            return ascending ? result : -result;

                        default:
                            // Default to sorting by ID
                            return ascending ?
                                    e1.getId().compareTo(e2.getId()) :
                                    e2.getId().compareTo(e1.getId());
                    }
                })
                .collect(Collectors.toList());
    }






    /**
     * Get all user expenses with category flag, ordered by category membership
     * First returns expenses that belong to the category (includeInBudget=true),
     * then returns the remaining expenses (includeInBudget=false)
     *
     * @param userId The ID of the user
     * @param categoryId The ID of the category
     * @param page The page number for pagination
     * @param size The page size for pagination
     * @param sortBy The field to sort by
     * @param sortDirection The sort direction (asc or desc)
     * @return A list of all user expenses with category flag, ordered by category membership
     */
    public List<ExpenseDTO> getAllUserExpensesOrderedByCategoryFlag(
            Integer userId,
            Integer categoryId,
            Integer page,
            Integer size,
            String sortBy,
            String sortDirection) throws Exception {

        // Get the category to verify it exists and get its expense IDs
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));

        // Get the expense IDs for this user in this category
        Set<Integer> categoryExpenseIds = new HashSet<>();
        if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
            categoryExpenseIds = category.getExpenseIds().get(userId);
        }

        // Create Sort object for sorting
        Sort sort = createSort(sortBy, sortDirection);

        // We need to fetch all expenses to reorder them by category membership
        List<ExpenseDTO> allUserExpenses;

        // Handle special case for nested fields in ExpenseDetails
        if (sortBy.startsWith("expense.")) {
            // For nested fields, we need to fetch all and sort in memory
            allUserExpenses = expenseService.getAllExpenses(userId);
            // Sort the list based on the nested field
            allUserExpenses = sortExpensesByNestedField(allUserExpenses, sortBy, sortDirection);
        } else {
            // For direct fields, we can use the repository's sorting
            allUserExpenses = expenseService.getAllExpensesWithSort(userId, sort.toString());
        }

        // Set includeInBudget flag based on whether the expense is in the category
        for (ExpenseDTO expense : allUserExpenses) {
            expense.setIncludeInBudget(categoryExpenseIds.contains(expense.getId()));
        }

        // Separate expenses into two lists: those in the category and those not in the category
        List<ExpenseDTO> inCategoryExpenses = new ArrayList<>();
        List<ExpenseDTO> notInCategoryExpenses = new ArrayList<>();

        for (ExpenseDTO expense : allUserExpenses) {
            if (expense.isIncludeInBudget()) {
                inCategoryExpenses.add(expense);
            } else {
                notInCategoryExpenses.add(expense);
            }
        }

        // Combine the lists: first those in the category, then those not in the category
        List<ExpenseDTO> orderedExpenses = new ArrayList<>(inCategoryExpenses);
        orderedExpenses.addAll(notInCategoryExpenses);

        // Apply pagination manually
        int start = page * size;
        int end = Math.min(start + size, orderedExpenses.size());

        if (start >= orderedExpenses.size()) {
            return new ArrayList<>();
        } else {
            return orderedExpenses.subList(start, end);
        }
    }


    public Category save(Category category)
    {
        return categoryRepository.save(category);
    }

}