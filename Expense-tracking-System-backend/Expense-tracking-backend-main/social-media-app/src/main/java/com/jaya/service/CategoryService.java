package com.jaya.service;

import com.jaya.models.Category;
import com.jaya.models.Expense;
import com.jaya.models.User;
import com.jaya.repository.CategoryRepository;
import com.jaya.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    @Lazy
    private ExpenseService expenseService;

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    public Category create(Category category, User user) {
        // Create the initial category
        Category createCategory = new Category();
        if (category.isGlobal()) {
            createCategory.setUser(null);
        } else {
            createCategory.setUser(user);
        }
        createCategory.setDescription(category.getDescription());
        createCategory.setName(category.getName());
        createCategory.setGlobal(category.isGlobal());

        // Initialize collections
        createCategory.setExpenseIds(new java.util.HashMap<>());
        createCategory.setUserIds(new java.util.HashSet<>());
        createCategory.setEditUserIds(new java.util.HashSet<>());



        // Save the category first to generate its ID
        Category initialSavedCategory = categoryRepository.save(createCategory);

        // Use a final variable for the ID which won't change
        final Integer categoryId = initialSavedCategory.getId();

        // Collect all expense IDs provided for this user
        Set<Integer> requestedExpenseIds = new HashSet<>();
        if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(user.getId())) {
            requestedExpenseIds.addAll(category.getExpenseIds().get(user.getId()));
        }

        // Filter and process only valid expenses
        Set<Integer> validExpenseIds = new HashSet<>();
        for (Integer expenseId : requestedExpenseIds) {
            Expense expense = expenseRepository.findById(expenseId).orElse(null);
            if (expense != null && expense.getUser() != null && expense.getUser().getId().equals(user.getId())) {
                expense.setCategoryId(categoryId);
                expenseRepository.save(expense);
                validExpenseIds.add(expenseId);
            }
        }

        // Remove these expense IDs from all other categories for this user
        if (!validExpenseIds.isEmpty()) {
            List<Category> allCategories = categoryRepository.findAll().stream()
                    .filter(cat -> !cat.getId().equals(categoryId))
                    .collect(Collectors.toList());

            for (Category otherCategory : allCategories) {
                if (otherCategory.getExpenseIds() != null && otherCategory.getExpenseIds().containsKey(user.getId())) {
                    Set<Integer> expenseIds = otherCategory.getExpenseIds().get(user.getId());
                    if (expenseIds != null && expenseIds.removeAll(validExpenseIds)) {
                        if (expenseIds.isEmpty()) {
                            otherCategory.getExpenseIds().remove(user.getId());
                        } else {
                            otherCategory.getExpenseIds().put(user.getId(), expenseIds);
                        }
                        categoryRepository.save(otherCategory);
                    }
                }
            }
        }

        // Update the category's expenseIds map for this user and return the final version
        if (!validExpenseIds.isEmpty()) {
            // Fetch the latest version of the category
            Category finalCategory = categoryRepository.findById(categoryId).orElse(initialSavedCategory);
            finalCategory.getExpenseIds().put(user.getId(), validExpenseIds);
            return categoryRepository.save(finalCategory);
        }

        return initialSavedCategory;
    }

    public Category getById(Integer id, User user) throws Exception {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new Exception("Category not found"));

//        System.out.println("category id is present in user id or not"+!category.getUserIds().contains(user.getId()));

        if ((category.getUser() != null && category.getUser().equals(user)) || category.isGlobal() && (!category.getUserIds().contains(user.getId()) && !category.getEditUserIds().contains(user.getId()))) {
            return category;
        }

        throw new Exception("Category not Found");
    }

    public List<Category> getAll(User user) {
        // Fetch user-specific categories
        List<Category> userCategories = categoryRepository.findAll().stream()
                .filter(category -> category.getUser() != null && category.getUser().equals(user))
                .collect(Collectors.toList());

        // Fetch global categories where the user is NOT in userIds or editUserIds
        List<Category> globalCategories = categoryRepository.findAllByIsGlobalTrue().stream()
                .filter(category ->
                        !category.getUserIds().contains(user.getId()) &&
                                !category.getEditUserIds().contains(user.getId())
                )
                .collect(Collectors.toList());

        // Combine all categories
        List<Category> allCategories = new ArrayList<>();
        allCategories.addAll(userCategories);
        allCategories.addAll(globalCategories);

        return allCategories;
    }


    public boolean isUserEdited(User user, Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // Check if the user has already edited the category
        if (category.isGlobal() && category.getEditUserIds().contains(user.getId())) {
            return true;
        }
        return false;
    }

    public Category update(Integer id, Category category, User user) throws Exception {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (existing.isGlobal() && isUserEdited(user, id)) {
            throw new Exception("You can only edit this global category once.");
        }

        if (existing.isGlobal() && !isUserEdited(user, id)) {
            existing.getEditUserIds().add(user.getId());
            Category newCategory = new Category();
            newCategory.setName(existing.getName());
            newCategory.setUser(user);
            newCategory.setDescription(existing.getDescription());
            categoryRepository.save(existing);
            return categoryRepository.save(newCategory);
        } else {
            existing.setName(category.getName());
            existing.setDescription(category.getDescription());

            // Get old and new expense IDs for this user
            Set<Integer> oldExpenseIds = existing.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
            Set<Integer> newExpenseIds = category.getExpenseIds() != null && category.getExpenseIds().containsKey(user.getId())
                    ? new HashSet<>(category.getExpenseIds().get(user.getId()))
                    : new HashSet<>();

            // Assign newExpenseIds to this category
            existing.getExpenseIds().put(user.getId(), newExpenseIds);

            // For each expense in newExpenseIds, update its categoryId
            for (Integer expenseId : newExpenseIds) {
                Expense expense = expenseRepository.findById(expenseId).orElse(null);
                if (expense != null && expense.getUser() != null && expense.getUser().getId().equals(user.getId())) {
                    expense.setCategoryId(existing.getId());
                    expenseRepository.save(expense);
                }
            }

            // For removed expense IDs, assign to "Others" category
            Set<Integer> removedExpenseIds = new HashSet<>(oldExpenseIds);
            removedExpenseIds.removeAll(newExpenseIds);

            if (!removedExpenseIds.isEmpty()) {
                // Find or create "Others" category
                Category othersCategory;
                try {
                    othersCategory = getByName("Others", user).get(0);
                } catch (Exception e) {
                    Category newOthers = new Category();
                    newOthers.setName("Others");
                    newOthers.setDescription("Default category for uncategorized expenses");
                    newOthers.setUser(user);
                    newOthers.setGlobal(false);
                    othersCategory = categoryRepository.save(newOthers);
                }

                // Add removed expenses to "Others" category
                Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().getOrDefault(user.getId(), new HashSet<>());
                for (Integer expenseId : removedExpenseIds) {
                    Expense expense = expenseRepository.findById(expenseId).orElse(null);
                    if (expense != null && expense.getUser() != null && expense.getUser().getId().equals(user.getId())) {
                        expense.setCategoryId(othersCategory.getId());
                        expenseRepository.save(expense);
                        othersExpenseIds.add(expenseId);
                    }
                }
                othersCategory.getExpenseIds().put(user.getId(), othersExpenseIds);
                categoryRepository.save(othersCategory);
            }

            return categoryRepository.save(existing);
        }
    }

    public String delete(Integer id, User user) throws Exception {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new Exception("Category not found"));

        // Only the owner can delete a user-specific category
        if (!existing.isGlobal() && (existing.getUser() == null || !existing.getUser().getId().equals(user.getId()))) {
            throw new Exception("You can't delete another user's category");
        }

        // Gather all expense IDs for this user in the category
        Set<Integer> expenseIds = existing.getExpenseIds() != null && existing.getExpenseIds().containsKey(user.getId())
                ? new HashSet<>(existing.getExpenseIds().get(user.getId()))
                : new HashSet<>();

        List<Expense> affectedExpenses = new ArrayList<>();
        for (Integer expenseId : expenseIds) {
            Expense expense = expenseRepository.findByUserIdAndId(user.getId(), expenseId);
            if (expense != null) {
                affectedExpenses.add(expense);
            }
        }

        // Remove the user's expense IDs from the category
        if (existing.getExpenseIds() != null) {
            existing.getExpenseIds().remove(user.getId());
            categoryRepository.save(existing);
        }

        // Delete the category if it's user-specific, or update userIds for global
        if (existing.isGlobal()) {
            existing.getUserIds().add(user.getId());
            categoryRepository.save(existing);
        } else {
            categoryRepository.delete(existing);
        }

        // Assign all affected expenses to "Others" category
        if (!affectedExpenses.isEmpty()) {
            assignExpensesToOthersCategory(user, affectedExpenses);
        }

        return "Category Deleted Successfully";
    }

    // Helper method to assign expenses to Others category
    private void assignExpensesToOthersCategory(User user, List<Expense> expenses) {
        if (expenses.isEmpty()) {
            return;
        }

        // Try to find existing "Others" category or create a new one
        Category othersCategory;
        try {
            othersCategory = getByName("Others", user).get(0);
        } catch (Exception e) {
            // Create "Others" category if it doesn't exist
            Category newCategory = new Category();
            newCategory.setName("Others");
            newCategory.setDescription("Default category for uncategorized expenses");
            newCategory.setUser(user);
            newCategory.setGlobal(false);
            othersCategory = categoryRepository.save(newCategory);
        }

        // Initialize expenseIds map if needed
        if (othersCategory.getExpenseIds() == null) {
            othersCategory.setExpenseIds(new java.util.HashMap<>());
        }

        // Process all expenses
        Set<Integer> validExpenseIds = new HashSet<>();
        for (Expense expense : expenses) {
            // Set the expense's category to Others
            expense.setCategoryId(othersCategory.getId());
            expenseRepository.save(expense);

            // Add expense to valid IDs list
            validExpenseIds.add(expense.getId());
        }

        // Only update the Others category if we have valid expense IDs
        if (!validExpenseIds.isEmpty()) {
            // Get existing expense IDs for this user, if any
            Set<Integer> existingIds = othersCategory.getExpenseIds()
                    .getOrDefault(user.getId(), new HashSet<>());

            // Add all new valid IDs
            existingIds.addAll(validExpenseIds);

            // Update the category
            othersCategory.getExpenseIds().put(user.getId(), existingIds);
            categoryRepository.save(othersCategory);
        }
    }

    public String deleteGlobalCategoryById(Integer id, User user) throws Exception {
        Category existing = getById(id, user);
        if (existing != null && existing.isGlobal() && (!existing.getUserIds().contains(user.getId())&& !existing.getEditUserIds().contains(user.getId()))) {
           categoryRepository.deleteById(id);
           return "Category is deleted";
        }
        return "You cant delete this category";
    }


    // Create multiple categories
    public List<Category> createMultiple(List<Category> categories, User user) {
        for (Category category : categories) {
            if (!category.isGlobal()) {
                category.getUserIds().add(user.getId()); // Associate the category with the user ID if not global
            }
        }
        return categoryRepository.saveAll(categories);
    }

    // Update multiple categories

    public List<Category> updateMultiple(List<Category> categories, User user) {
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
            if (existingCategory.getExpenseIds() != null && existingCategory.getExpenseIds().containsKey(user.getId())) {
                Set<Integer> expenseIds = existingCategory.getExpenseIds().get(user.getId());
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
                                existingCategory.getExpenseIds().containsKey(user.getId())) {
                            previousExpenseIdsByCategory.put(existingCategory.getId(),
                                    new HashSet<>(existingCategory.getExpenseIds().get(user.getId())));
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

            Set<Integer> expenseIds = category.getExpenseIds().containsKey(user.getId())
                    ? new HashSet<>(category.getExpenseIds().get(user.getId()))
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

            Set<Integer> expenseIds = category.getExpenseIds().containsKey(user.getId())
                    ? new HashSet<>(category.getExpenseIds().get(user.getId()))
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
                category.getExpenseIds().put(user.getId(), expenseIds);
            } else {
                // Remove the user's entry if it exists and would be empty
                category.getExpenseIds().remove(user.getId());
            }
        }

        // Step 6: Find or create "Others" category for duplicates and completely removed expenses
        Category othersCategory = null;
        expensesToMoveToOthers.addAll(removedExpenseIds);

        if (!expensesToMoveToOthers.isEmpty()) {
            try {
                othersCategory = getByName("Others", user).get(0);
                logger.info("Found existing Others category with ID: {}", othersCategory.getId());
            } catch (Exception e) {
                // Create "Others" category if it doesn't exist
                Category newCategory = new Category();
                newCategory.setName("Others");
                newCategory.setDescription("Default category for uncategorized expenses");
                newCategory.setUser(user);
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
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().containsKey(user.getId())
                    ? new HashSet<>(othersCategory.getExpenseIds().get(user.getId()))
                    : new HashSet<>();

            // Step 7: Assign all duplicate and removed expenses to Others category
            for (Integer expenseId : expensesToMoveToOthers) {
                Expense expense = expenseRepository.findById(expenseId).orElse(null);
                if (expense != null && expense.getUser() != null && expense.getUser().getId().equals(user.getId())) {
                    // Update the expense to point to Others category
                    expense.setCategoryId(othersCategory.getId());
                    expenseRepository.save(expense);

                    // Add to Others category's expense list
                    othersExpenseIds.add(expenseId);
                    logger.info("Assigned expense ID {} to Others category", expenseId);
                }
            }

            // Only update Others category with expense IDs if there are any
            if (!othersExpenseIds.isEmpty()) {
                othersCategory.getExpenseIds().put(user.getId(), othersExpenseIds);
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
                Set<Integer> newExpenseIds = category.getExpenseIds().containsKey(user.getId())
                        ? new HashSet<>(category.getExpenseIds().get(user.getId()))
                        : new HashSet<>();

                // Update each expense to point to this category
                for (Integer expenseId : newExpenseIds) {
                    Expense expense = expenseRepository.findById(expenseId).orElse(null);
                    if (expense != null && expense.getUser() != null && expense.getUser().getId().equals(user.getId())) {
                        expense.setCategoryId(existing.getId());
                        expenseRepository.save(expense);
                    }
                }

                // Only add the user's expense IDs if there are any
                if (!newExpenseIds.isEmpty()) {
                    existing.getExpenseIds().put(user.getId(), newExpenseIds);
                } else {
                    // Remove the user's entry if it exists and would be empty
                    existing.getExpenseIds().remove(user.getId());
                }

                // Save and add to result list
                updatedCategories.add(categoryRepository.save(existing));
            }
        }

        return updatedCategories;
    }

    // Delete multiple categories
    public void deleteMultiple(List<Integer> categoryIds, User user) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            logger.info("No category IDs provided for deletion");
            return;
        }

        logger.info("Deleting multiple categories: {}", categoryIds);

        // Collect all expenses that need to be reassigned
        List<Expense> expensesToReassign = new ArrayList<>();
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
                existing.getUserIds().add(user.getId());
                categoryRepository.save(existing);
                logger.info("Added user {} to userIds of global category {}", user.getId(), id);
                continue;
            }

            // Only process user-specific categories that belong to this user
            if (existing.getUser() == null || !existing.getUser().getId().equals(user.getId())) {
                logger.warn("Category {} does not belong to user {}", id, user.getId());
                continue;
            }

            // Collect expenses to reassign
            if (existing.getExpenseIds() != null && existing.getExpenseIds().containsKey(user.getId())) {
                Set<Integer> expenseIds = existing.getExpenseIds().get(user.getId());
                if (expenseIds != null && !expenseIds.isEmpty()) {
                    for (Integer expenseId : expenseIds) {
                        Expense expense = expenseRepository.findByUserIdAndId(user.getId(), expenseId);
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
                List<Category> othersCategories = getByName("Others", user);
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
                newCategory.setUser(user);
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
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().containsKey(user.getId())
                    ? new HashSet<>(othersCategory.getExpenseIds().get(user.getId()))
                    : new HashSet<>();

            // Reassign all expenses to Others category
            for (Expense expense : expensesToReassign) {
                // Update the expense to point to Others category
                expense.setCategoryId(othersCategory.getId());
                expenseRepository.save(expense);

                // Add to Others category's expense list
                othersExpenseIds.add(expense.getId());
                logger.info("Reassigned expense ID {} to 'Others' category", expense.getId());
            }

            // Update Others category with the new expense IDs
            if (!othersExpenseIds.isEmpty()) {
                othersCategory.getExpenseIds().put(user.getId(), othersExpenseIds);
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


    public void deleteAllGlobal(User user, boolean global) {
        logger.info("deleteAllGlobal called with user: {} and global: {}", user.getId(), global);

        List<Expense> expensesToReassign = new ArrayList<>();

        if (global) {
            // Handle global categories deletion
            List<Category> globalCategories = categoryRepository.findAllByIsGlobalTrue();
            logger.info("Global categories to delete: {}", globalCategories.size());

            // First collect all expenses that need to be reassigned
            for (Category category : globalCategories) {
                if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(user.getId())) {
                    Set<Integer> expenseIds = category.getExpenseIds().get(user.getId());
                    if (expenseIds != null && !expenseIds.isEmpty()) {
                        for (Integer expenseId : expenseIds) {
                            Expense expense = expenseRepository.findByUserIdAndId(user.getId(), expenseId);
                            if (expense != null) {
                                expense.setCategoryId(null); // Temporarily set to null
                                expenseRepository.save(expense);
                                expensesToReassign.add(expense);
                            }
                        }
                    }
                    // Remove this user's expenses from the category
                    category.getExpenseIds().remove(user.getId());
                    categoryRepository.save(category);
                }

                // Add user to userIds to indicate they've "deleted" this global category
                if (!category.getUserIds().contains(user.getId())) {
                    category.getUserIds().add(user.getId());
                    categoryRepository.save(category);
                }
            }

            logger.info("Added user {} to userIds of {} global categories",
                    user.getId(), globalCategories.size());
            logger.info("Found {} expenses to reassign from global categories", expensesToReassign.size());

        } else {
            // Handle user-specific categories deletion
            List<Category> userCategories = categoryRepository.findAllByUserId(user.getId());
            logger.info("User-specific categories to delete: {}", userCategories.size());

            // First collect all expenses that need to be reassigned
            for (Category category : userCategories) {
                // Skip "Others" category - we'll handle it separately
                if ("Others".equals(category.getName())) {
                    continue;
                }

                if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(user.getId())) {
                    Set<Integer> expenseIds = category.getExpenseIds().get(user.getId());
                    if (expenseIds != null && !expenseIds.isEmpty()) {
                        for (Integer expenseId : expenseIds) {
                            Expense expense = expenseRepository.findByUserIdAndId(user.getId(), expenseId);
                            if (expense != null) {
                                expense.setCategoryId(null); // Temporarily set to null
                                expenseRepository.save(expense);
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
                List<Category> othersCategories = getByName("Others", user);
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
                newCategory.setUser(user);
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
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().containsKey(user.getId())
                    ? new HashSet<>(othersCategory.getExpenseIds().get(user.getId()))
                    : new HashSet<>();

            // Reassign all expenses to Others category
            for (Expense expense : expensesToReassign) {
                // Update the expense to point to Others category
                expense.setCategoryId(othersCategory.getId());
                expenseRepository.save(expense);

                // Add to Others category's expense list
                othersExpenseIds.add(expense.getId());
                logger.info("Reassigned expense ID {} to 'Others' category", expense.getId());
            }

            // Update Others category with the new expense IDs
            if (!othersExpenseIds.isEmpty()) {
                othersCategory.getExpenseIds().put(user.getId(), othersExpenseIds);
                categoryRepository.save(othersCategory);
                logger.info("Updated 'Others' category with {} expense IDs", othersExpenseIds.size());
            }
        }
    }

    public void deleteAllUserCategories(User user) {
        logger.info("Deleting all user categories for user ID: {}", user.getId());

        List<Category> userCategories = getAll(user);
        logger.info("User categories to delete: {}", userCategories.size());
        List<Expense> allUserExpenses = new ArrayList<>();

        // Collect all expenses from all categories (including "Others")
        for (Category category : userCategories) {
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(user.getId())) {
                Set<Integer> expenseIds = category.getExpenseIds().get(user.getId());
                if (expenseIds != null && !expenseIds.isEmpty()) {
                    for (Integer expenseId : expenseIds) {
                        Expense expense = expenseRepository.findByUserIdAndId(user.getId(), expenseId);
                        if (expense != null) {
                            expense.setCategoryId(null);
                            expenseRepository.save(expense);
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
                category.getUserIds().add(user.getId());
                categoryRepository.save(category);
                logger.info("Added user {} to userIds of global category {}", user.getId(), category.getId());
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
            newOthersCategory.setUser(user);
            newOthersCategory.setGlobal(false);
            newOthersCategory.setExpenseIds(new HashMap<>());
            newOthersCategory.setUserIds(new HashSet<>());
            newOthersCategory.setEditUserIds(new HashSet<>());

            Category savedOthersCategory = categoryRepository.save(newOthersCategory);
            logger.info("Created new 'Others' category with ID: {}", savedOthersCategory.getId());

            Set<Integer> newOthersExpenseIds = new HashSet<>();
            for (Expense expense : allUserExpenses) {
                expense.setCategoryId(savedOthersCategory.getId());
                expenseRepository.save(expense);
                newOthersExpenseIds.add(expense.getId());
                logger.info("Reassigned expense ID {} to new 'Others' category", expense.getId());
            }

            if (!newOthersExpenseIds.isEmpty()) {
                savedOthersCategory.getExpenseIds().put(user.getId(), newOthersExpenseIds);
                categoryRepository.save(savedOthersCategory);
                logger.info("Updated new 'Others' category with {} expense IDs", newOthersExpenseIds.size());
            }
        } else {
            logger.info("No expenses found to reassign to a new 'Others' category");
        }
    }


    public List<Category> getByName(String name, User user) throws Exception {
        List<Category> categories = getAll(user);
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
    public List<Category> getAllForUser(User user) {
        // Get user's own categories
        List<Category> userCategories = categoryRepository.findByUserId(user.getId());

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
    public List<Expense> getOthersAndUncategorizedExpenses(User user) {
        List<Expense> allUserExpenses = expenseRepository.findByUserId(user.getId());
        List<Category> allCategories = categoryRepository.findAll();

        // Find "Others" category for this user
        Category othersCategory = allCategories.stream()
                .filter(cat -> "Others".equalsIgnoreCase(cat.getName()) &&
                        ((cat.getUser() != null && cat.getUser().getId().equals(user.getId())) || cat.isGlobal()))
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
}