package com.jaya.service;

import com.jaya.models.Category;
import com.jaya.models.Expense;
import com.jaya.models.User;
import com.jaya.repository.CategoryRepository;
import com.jaya.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CategoryService {
    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private ExpenseRepository expenseRepository;

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    public Category create(Category category, User user) {

        Category createCategory=new Category();
        if (category.isGlobal()) {
            createCategory.setUser(null);
        }else {
            createCategory.setUser(user);
        }
        createCategory.setDescription(category.getDescription());
        createCategory.setName(category.getName());
        createCategory.setGlobal(category.isGlobal());
        return categoryRepository.save(createCategory);
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

        // Fetch global categories where the user is in userIds or editUserIds
        List<Category> globalCategories = categoryRepository.findAllByIsGlobalTrue().stream()
                .filter(category ->
                        !category.getUserIds().contains(user.getId()) &&
                                !category.getEditUserIds().contains(user.getId())
                )
                .collect(Collectors.toList());

        // Fetch global categories where the user is NOT in userIds or editUserIds
        List<Category> excludedGlobalCategories = categoryRepository.findAllByIsGlobalTrue().stream()
                .filter(category ->
                        !category.getUserIds().contains(user.getId()) &&
                                !category.getEditUserIds().contains(user.getId())
                )
                .collect(Collectors.toList());

        // Combine all categories
        List<Category> allCategories = new ArrayList<>();
        allCategories.addAll(userCategories);
        allCategories.addAll(globalCategories);

        // Log or process excluded global categories if needed
        excludedGlobalCategories.forEach(category -> {
            System.out.println("Excluded Global Category: " + category.getName());
        });

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

        System.out.println("category id" + id);
        System.out.println("edited userid" + existing.getEditUserIds());

        if (existing.isGlobal() && isUserEdited(user, id)) {
            throw new Exception("You can only edit this global category once.");
        }

        if (existing.isGlobal() && !isUserEdited(user, id)) {
            System.out.println("User is editing the global category for the first time.");
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
            return categoryRepository.save(existing);
        }
    }

    public String delete(Integer id, User user) throws Exception {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> new Exception("Category not found"));

        // Check if the category being deleted is already named "Others"
        boolean isOthersCategory = "Others".equals(existing.getName());

        // Store affected expenses for later processing
        List<Expense> affectedExpenses = new ArrayList<>();

        if (existing.isGlobal()) {
            existing.getUserIds().add(user.getId());
            categoryRepository.save(existing);

            Category category = getById(id, user);

            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(user.getId())) {
                Set<Integer> expenseIds = category.getExpenseIds().get(user.getId());

                if (expenseIds != null && !expenseIds.isEmpty()) {
                    // Collect all affected expenses first
                    for (Integer expenseId : expenseIds) {
                        Expense expense = expenseRepository.findByUserIdAndId(user.getId(), expenseId);
                        if (expense != null) {
                            // Temporarily set categoryId to null
                            expense.setCategoryId(null);
                            expenseRepository.save(expense);
                            affectedExpenses.add(expense);
                        }
                    }

                    // Remove expenses from the deleted category
                    category.getExpenseIds().remove(user.getId());
                    categoryRepository.save(category);
                }
            }

            // Return early if we're not deleting an "Others" category
            if (!isOthersCategory) {
                // Find or create "Others" category and assign expenses
                assignExpensesToOthersCategory(user, affectedExpenses);
                return "Category Deleted Successfully";
            }
        } else if (existing.getUser() != null && existing.getUser().equals(user)) {
            if (existing.getExpenseIds() != null && !existing.getExpenseIds().isEmpty()) {
                for (Integer userId : existing.getExpenseIds().keySet()) {
                    Set<Integer> expenseIds = existing.getExpenseIds().get(userId);

                    if (expenseIds != null && !expenseIds.isEmpty()) {
                        // Collect all affected expenses first
                        for (Integer expenseId : expenseIds) {
                            Expense expense = expenseRepository.findByUserIdAndId(userId, expenseId);
                            if (expense != null) {
                                // Temporarily set categoryId to null
                                expense.setCategoryId(null);
                                expenseRepository.save(expense);
                                affectedExpenses.add(expense);
                            }
                        }
                    }
                }
            }

            // Delete the category
            categoryRepository.delete(existing);

            // If we deleted an "Others" category, create a new one and reassign expenses
            if (isOthersCategory && !affectedExpenses.isEmpty()) {
                assignExpensesToOthersCategory(user, affectedExpenses);
            } else if (!isOthersCategory && !affectedExpenses.isEmpty()) {
                // If not deleting "Others", still assign to existing/new "Others"
                assignExpensesToOthersCategory(user, affectedExpenses);
            }

            return "Category Deleted Successfully";
        }

        return "You can't delete another user's category";
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
        for (Expense expense : expenses) {
            // Set the expense's category to Others
            expense.setCategoryId(othersCategory.getId());
            expenseRepository.save(expense);

            // Add expense to Others category's tracking
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds()
                    .getOrDefault(expense.getUser().getId(), new java.util.HashSet<>());
            othersExpenseIds.add(expense.getId());
            othersCategory.getExpenseIds().put(expense.getUser().getId(), othersExpenseIds);
        }

        // Save the Others category with all the updated references
        categoryRepository.save(othersCategory);
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
        for (Category category : categories) {
            Category existing = categoryRepository.findById(category.getId()).orElse(null);
            if (existing != null) {
                existing.setName(category.getName());
                existing.setDescription(category.getDescription());
                existing.setGlobal(category.isGlobal());
                updatedCategories.add(categoryRepository.save(existing));
            }
        }
        return updatedCategories;
    }

    // Delete multiple categories
    public void deleteMultiple(List<Integer> categoryIds, User user) {
        for (Integer id : categoryIds) {
            Category existing = categoryRepository.findById(id).orElse(null);
            if (existing != null) {
                categoryRepository.delete(existing);
            }
        }
    }


    public void deleteAllGlobal(User user, boolean global) {
        logger.info("deleteAllGlobal called with user: {} and global: {}", user.getId(), global);
        if (global) {
            List<Category> globalCategories = categoryRepository.findAllByIsGlobalTrue();
            logger.info("Global categories to delete: {}", globalCategories.size());
            categoryRepository.deleteAll(globalCategories);
        } else {
            List<Category> userCategories = categoryRepository.findAllByUserId(user.getId());
            logger.info("User-specific categories to delete: {}", userCategories.size());
            categoryRepository.deleteAll(userCategories);
        }
    }

    public void deleteAllUserCategories(User user) {
        logger.info("Deleting all user categories for user ID: {}", user.getId());

        List<Category> userCategories = categoryRepository.findAllByUserId(user.getId());
        List<Expense> affectedExpenses = new ArrayList<>();

        for (Category category : userCategories) {
            if ("Others".equals(category.getName())) {
                continue;
            }

            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(user.getId())) {
                Set<Integer> expenseIds = category.getExpenseIds().get(user.getId());

                if (expenseIds != null && !expenseIds.isEmpty()) {
                    for (Integer expenseId : expenseIds) {
                        Expense expense = expenseRepository.findByUserIdAndId(user.getId(), expenseId);
                        if (expense != null) {
                            expense.setCategoryId(null);
                            expenseRepository.save(expense);
                            affectedExpenses.add(expense);
                        }
                    }
                }
            }
        }

        List<Category> categoriesToDelete = userCategories.stream()
                .filter(category -> !"Others".equals(category.getName()))
                .collect(Collectors.toList());

        categoryRepository.deleteAll(categoriesToDelete);

        if (!affectedExpenses.isEmpty()) {
            assignExpensesToOthersCategory(user, affectedExpenses);
        }

        Category othersCategory = userCategories.stream()
                .filter(category -> "Others".equals(category.getName()))
                .findFirst()
                .orElse(null);

        if (othersCategory != null) {
            if (othersCategory.getExpenseIds() != null && othersCategory.getExpenseIds().containsKey(user.getId())) {
                Set<Integer> expenseIds = othersCategory.getExpenseIds().get(user.getId());

                if (expenseIds != null && !expenseIds.isEmpty()) {
                    for (Integer expenseId : expenseIds) {
                        Expense expense = expenseRepository.findByUserIdAndId(user.getId(), expenseId);
                        if (expense != null) {
                            expense.setCategoryId(null);
                            expenseRepository.save(expense);
                        }
                    }
                }
            }

            categoryRepository.delete(othersCategory);
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
}