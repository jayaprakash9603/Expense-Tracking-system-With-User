package com.jaya.service;

import com.jaya.common.exception.AccessDeniedException;
import com.jaya.common.exception.BusinessException;
import com.jaya.common.exception.ConflictException;
import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.common.error.ErrorCode;
import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.dto.ExpenseDTO;
import com.jaya.models.Category;
import com.jaya.common.dto.UserDTO;
import com.jaya.repository.CategoryRepository;
import com.jaya.util.CategoryServiceHelper;
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
    private ExpenseClient expenseService;

    @Autowired
    private CategoryServiceHelper helper;

    private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

    @Autowired
    private CategoryAsyncService categoryAsyncService;

    private void checkForDuplicateCategory(String name, String type, Integer userId, boolean isGlobal,
            Integer excludeId) {
        if (name == null || name.trim().isEmpty()) {
            return;
        }

        List<Category> duplicates;

        if (isGlobal) {
            if (excludeId != null) {
                duplicates = categoryRepository.findGlobalByNameAndTypeExcluding(name.trim(), type, excludeId);
            } else {
                duplicates = categoryRepository.findGlobalByNameAndType(name.trim(), type);
            }
            if (!duplicates.isEmpty()) {
                throw ConflictException.categoryAlreadyExists(name + " (" + type + ") - global");
            }
        } else {
            Integer categoryUserId = (userId != null) ? userId : 0;
            if (excludeId != null) {
                duplicates = categoryRepository.findByNameAndTypeAndUserIdExcluding(name.trim(), type, categoryUserId,
                        excludeId);
            } else {
                duplicates = categoryRepository.findByNameAndTypeAndUserId(name.trim(), type, categoryUserId);
            }
            if (!duplicates.isEmpty()) {
                throw ConflictException.categoryAlreadyExists(name + " (" + type + ")");
            }
        }
    }

    public Category create(Category category, Integer userId) {
        UserDTO UserDTO = helper.validateUser(userId);
        checkForDuplicateCategory(category.getName(), category.getType(), userId, category.isGlobal(), null);
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
        Category initialSavedCategory = categoryRepository.save(createCategory);
        try {
            categoryAsyncService.finalizeCategoryCreateAsync(initialSavedCategory, category, UserDTO);
        } catch (Exception e) {
            logger.warn("Failed to dispatch async finalize for category {}: {}", initialSavedCategory.getId(),
                    e.getMessage());
        }
        return initialSavedCategory;
    }

    public Category getById(Integer id, Integer userId) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.categoryNotFound(id));

        logger.debug("Checking access for UserDTO {} to category {}", userId, id);
        if (category.getUserId() != null && category.getUserId().equals(userId)) {
            logger.debug("UserDTO {} owns category {}", userId, id);
            return category;
        }
        if (category.isGlobal()) {
            boolean inUserIds = category.getUserIds() != null && category.getUserIds().contains(userId);
            boolean inEditUserIds = category.getEditUserIds() != null && category.getEditUserIds().contains(userId);

            logger.debug("Global category - inUserIds: {}, inEditUserIds: {}", inUserIds, inEditUserIds);
            if (!inUserIds && !inEditUserIds) {
                logger.debug("UserDTO {} can access global category {}", userId, id);
                return category;
            }
        }

        logger.warn("Access denied for UserDTO {} to category {}", userId, id);
        throw AccessDeniedException.forCategory(Long.valueOf(id));
    }

    public List<Category> getAll(Integer userId) {
        UserDTO UserDTO = helper.validateUser(userId);
        List<Category> userCategories = categoryRepository.findAllWithDetailsByUserId(UserDTO.getId());
        List<Category> globalCategories = categoryRepository.findAllGlobalWithDetails().stream()
                .filter(category -> !category.getUserIds().contains(userId) &&
                        !category.getEditUserIds().contains(userId))
                .collect(Collectors.toList());
        List<Category> allCategories = new ArrayList<>();
        allCategories.addAll(userCategories);
        allCategories.addAll(globalCategories);

        return allCategories;
    }

    public boolean isUserEdited(Integer userId, Integer id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.categoryNotFound(id));
        if (category.isGlobal() && category.getEditUserIds().contains(userId)) {
            return true;
        }
        return false;
    }

    public Category update(Integer id, Category category, UserDTO UserDTO) {
        Integer userId = UserDTO.getId();
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.categoryNotFound(id));
        if (existing.isGlobal() && isUserEdited(userId, id)) {
            throw new BusinessException(ErrorCode.CATEGORY_UPDATE_FAILED,
                    "You can only edit this global category once.");
        }
        String newName = category.getName() != null ? category.getName() : existing.getName();
        String newType = category.getType() != null ? category.getType() : existing.getType();
        if (existing.isGlobal() && !isUserEdited(userId, id)) {
            checkForDuplicateCategory(newName, newType, userId, false, null);
        } else if (!existing.isGlobal()) {
            checkForDuplicateCategory(newName, newType, existing.getUserId(), false, id);
        }
        if (existing.isGlobal() && !isUserEdited(userId, id)) {
            existing.getEditUserIds().add(userId);
            categoryRepository.save(existing);
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
            Set<Integer> currentGlobalIds = getUserExpenseIds(existing, userId);
            Set<Integer> requestedIds = hasExpenseIdsInRequest(category, userId)
                    ? getRequestedExpenseIdsForUser(category, userId)
                    : new HashSet<>(currentGlobalIds);
            removeExpenseIdsFromOtherCategories(userId, requestedIds,
                    new HashSet<>(Arrays.asList(existing.getId(), userCategory.getId())));
            Set<Integer> removedIds = new HashSet<>(currentGlobalIds);
            removedIds.removeAll(requestedIds);
            if (existing.getExpenseIds() != null && existing.getExpenseIds().containsKey(userId)) {
                existing.getExpenseIds().remove(userId);
                categoryRepository.save(existing);
            }
            if (!requestedIds.isEmpty()) {
                updateExpenseEntitiesCategory(userId, requestedIds, userCategory.getId(), userCategory.getName());
                setCategoryExpenseIdsForUser(userCategory, userId, requestedIds);
                userCategory = categoryRepository.save(userCategory);
            }
            if (!removedIds.isEmpty()) {
                assignExpensesToOthersCategory(userId, removedIds);
            }

            return userCategory;
        }
        existing.setName(category.getName());
        existing.setDescription(category.getDescription());
        if (category.getColor() != null)
            existing.setColor(category.getColor());
        if (category.getIcon() != null)
            existing.setIcon(category.getIcon());
        if (!hasExpenseIdsInRequest(category, userId)) {
            return categoryRepository.save(existing);
        }
        Set<Integer> oldIds = getUserExpenseIds(existing, userId);
        Set<Integer> newIds = getRequestedExpenseIdsForUser(category, userId);
        removeExpenseIdsFromOtherCategories(userId, newIds, Collections.singleton(existing.getId()));
        updateExpenseEntitiesCategory(userId, newIds, existing.getId(), existing.getName());
        setCategoryExpenseIdsForUser(existing, userId, newIds);
        Set<Integer> removed = new HashSet<>(oldIds);
        removed.removeAll(newIds);
        if (!removed.isEmpty()) {
            assignExpensesToOthersCategory(userId, removed);
        }

        return categoryRepository.save(existing);
    }

    public Category adminUpdateGlobalCategory(Integer id, Category category, UserDTO UserDTO) {
        if (!UserDTO.hasAdminRole()) {
            throw new AccessDeniedException(ErrorCode.AUTHZ_ROLE_REQUIRED, "UserDTO does not have ADMIN role");
        }
        if (!UserDTO.isInAdminMode()) {
            throw new AccessDeniedException(ErrorCode.AUTHZ_INSUFFICIENT_PRIVILEGES,
                    "UserDTO must be in ADMIN mode to edit global categories");
        }

        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.categoryNotFound(id));

        if (!existing.isGlobal()) {
            throw new BusinessException(ErrorCode.CATEGORY_UPDATE_FAILED,
                    "This endpoint is only for global categories. Category ID " + id + " is not global.");
        }
        String newName = category.getName() != null ? category.getName() : existing.getName();
        String newType = category.getType() != null ? category.getType() : existing.getType();
        checkForDuplicateCategory(newName, newType, 0, true, id);

        logger.info("Admin UserDTO {} updating global category: {} (ID: {})", UserDTO.getId(), existing.getName(),
                existing.getId());
        if (category.getName() != null) {
            existing.setName(category.getName());
        }
        if (category.getDescription() != null) {
            existing.setDescription(category.getDescription());
        }
        if (category.getColor() != null) {
            existing.setColor(category.getColor());
        }
        if (category.getIcon() != null) {
            existing.setIcon(category.getIcon());
        }
        if (category.getType() != null) {
            existing.setType(category.getType());
        }

        Category updated = categoryRepository.save(existing);
        logger.info("Global category {} updated successfully by admin", updated.getId());
        return updated;
    }

    private void assignExpensesToOthersCategory(Integer userId, Set<Integer> expenseIds) {
        if (expenseIds.isEmpty()) {
            return;
        }
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

    private ExpenseClient getExpenseService() {
        return expenseService;
    }

    private boolean hasExpenseIdsInRequest(Category input, Integer userId) {
        return input.getExpenseIds() != null && input.getExpenseIds().containsKey(userId);
    }

    private Set<Integer> getRequestedExpenseIdsForUser(Category input, Integer userId) {
        if (input.getExpenseIds() == null)
            return new HashSet<>();
        Set<Integer> ids = input.getExpenseIds().get(userId);
        return ids != null ? new HashSet<>(ids) : new HashSet<>();
    }

    private Set<Integer> getUserExpenseIds(Category category, Integer userId) {
        if (category.getExpenseIds() == null)
            return new HashSet<>();
        Set<Integer> ids = category.getExpenseIds().get(userId);
        return ids != null ? new HashSet<>(ids) : new HashSet<>();
    }

    private void removeExpenseIdsFromOtherCategories(Integer userId, Set<Integer> ids,
            Set<Integer> excludedCategoryIds) {
        if (ids == null || ids.isEmpty())
            return;
        List<Category> all = categoryRepository.findAll();
        for (Category other : all) {
            if (excludedCategoryIds != null && excludedCategoryIds.contains(other.getId()))
                continue;
            if (other.getExpenseIds() == null || !other.getExpenseIds().containsKey(userId))
                continue;
            Set<Integer> otherIds = other.getExpenseIds().get(userId);
            if (otherIds == null || otherIds.isEmpty())
                continue;
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

    private void updateExpenseEntitiesCategory(Integer userId, Set<Integer> expenseIds, Integer targetCategoryId,
            String targetCategoryName) {
        if (expenseIds == null || expenseIds.isEmpty())
            return;
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
        if (category.getExpenseIds() == null)
            category.setExpenseIds(new HashMap<>());
        if (expenseIds == null || expenseIds.isEmpty()) {
            category.getExpenseIds().remove(userId);
        } else {
            category.getExpenseIds().put(userId, new HashSet<>(expenseIds));
        }
    }

    public String delete(Integer id, Integer userId) {
        Category existing = categoryRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.categoryNotFound(id));
        if (!existing.isGlobal() && (existing.getUserId() == null || !existing.getUserId().equals(userId))) {
            throw AccessDeniedException.forCategory(Long.valueOf(id));
        }
        Set<Integer> expenseIds = existing.getExpenseIds() != null && existing.getExpenseIds().containsKey(userId)
                ? new HashSet<>(existing.getExpenseIds().get(userId))
                : new HashSet<>();

        List<ExpenseDTO> affectedExpenses = new ArrayList<>();
        for (Integer expenseId : expenseIds) {
            ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
            if (expense != null) {
                affectedExpenses.add(expense);
            }
        }
        if (existing.getExpenseIds() != null) {
            existing.getExpenseIds().remove(userId);
            categoryRepository.save(existing);
        }
        if (existing.isGlobal()) {
            existing.getUserIds().add(userId);
            categoryRepository.save(existing);
        } else {
            categoryRepository.delete(existing);
        }
        if (!affectedExpenses.isEmpty()) {
            assignExpensesToOthersCategory(userId, affectedExpenses);
        }

        return "Category Deleted Successfully";
    }

    private void assignExpensesToOthersCategory(Integer userId, List<ExpenseDTO> expenses) {
        if (expenses.isEmpty()) {
            return;
        }
        Category othersCategory;
        try {
            othersCategory = getByName("Others", userId).get(0);
        } catch (Exception e) {
            Category newCategory = new Category();
            newCategory.setName("Others");
            newCategory.setDescription("Default category for uncategorized expenses");
            newCategory.setUserId(userId);
            newCategory.setGlobal(false);
            othersCategory = categoryRepository.save(newCategory);
        }
        if (othersCategory.getExpenseIds() == null) {
            othersCategory.setExpenseIds(new HashMap<>());
        }
        Set<Integer> validExpenseIds = new HashSet<>();
        for (ExpenseDTO expense : expenses) {
            expense.setCategoryId(othersCategory.getId());
            expenseService.save(expense);
            validExpenseIds.add(expense.getId());
        }
        if (!validExpenseIds.isEmpty()) {
            Set<Integer> existingIds = othersCategory.getExpenseIds()
                    .getOrDefault(userId, new HashSet<>());
            existingIds.addAll(validExpenseIds);
            othersCategory.getExpenseIds().put(userId, existingIds);
            categoryRepository.save(othersCategory);
        }
    }

    public String deleteGlobalCategoryById(Integer id, UserDTO UserDTO) {
        Category existing = getById(id, UserDTO.getId());
        if (existing != null && existing.isGlobal() && (!existing.getUserIds().contains(UserDTO.getId())
                && !existing.getEditUserIds().contains(UserDTO.getId()))) {
            categoryRepository.deleteById(id);
            return "Category is deleted";
        }
        return "You cant delete this category";
    }

    public List<Category> createMultiple(List<Category> categories, Integer userId) {
        List<Category> createdCategories = new ArrayList<>();
        for (Category category : categories) {
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
            Category initialSavedCategory = categoryRepository.save(createCategory);
            final Integer categoryId = initialSavedCategory.getId();
            Set<Integer> requestedExpenseIds = new HashSet<>();
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                requestedExpenseIds.addAll(category.getExpenseIds().get(userId));
            }

            Set<Integer> validExpenseIds = new HashSet<>();
            for (Integer expenseId : requestedExpenseIds) {
                ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                    validExpenseIds.add(expenseId);
                }
            }
            if (!validExpenseIds.isEmpty()) {
                List<Category> allCategories = categoryRepository.findAll().stream()
                        .filter(c -> !c.getId().equals(categoryId) && c.getExpenseIds() != null
                                && c.getExpenseIds().containsKey(userId))
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

    public List<Category> updateMultiple(List<Category> categories, UserDTO UserDTO) {
        Integer userId = UserDTO.getId();
        List<Category> updatedCategories = new ArrayList<>();
        Map<Integer, List<Category>> expenseToCategories = new HashMap<>();
        Map<Integer, Set<Integer>> previousExpenseIdsByCategory = new HashMap<>();
        Map<Integer, Integer> previousExpenseToCategoryMap = new HashMap<>();
        List<Category> existingCategories = categoryRepository.findAll();
        for (Category existingCategory : existingCategories) {
            if (existingCategory.getExpenseIds() != null && existingCategory.getExpenseIds().containsKey(userId)) {
                Set<Integer> expenseIds = existingCategory.getExpenseIds().get(userId);
                if (expenseIds != null) {
                    for (Integer expenseId : expenseIds) {
                        previousExpenseToCategoryMap.put(expenseId, existingCategory.getId());
                    }
                }
            }
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
        Set<Integer> duplicateExpenseIds = newExpenseToCategoriesMap.entrySet().stream()
                .filter(e -> e.getValue().size() > 1)
                .map(Map.Entry::getKey)
                .collect(Collectors.toSet());

        logger.info("Found {} duplicate expense IDs across categories in the update", duplicateExpenseIds.size());
        Map<Integer, Integer> movedExpenses = new HashMap<>();
        Set<Integer> expensesToMoveToOthers = new HashSet<>(duplicateExpenseIds);
        for (Map.Entry<Integer, List<Integer>> entry : newExpenseToCategoriesMap.entrySet()) {
            Integer expenseId = entry.getKey();
            List<Integer> newCategoryIds = entry.getValue();
            if (duplicateExpenseIds.contains(expenseId)) {
                continue;
            }
            Integer previousCategoryId = previousExpenseToCategoryMap.get(expenseId);

            if (previousCategoryId != null && !newCategoryIds.contains(previousCategoryId)) {
                movedExpenses.put(expenseId, newCategoryIds.get(0));
                logger.info("Expense ID {} moved from category {} to {}",
                        expenseId, previousCategoryId, newCategoryIds.get(0));
            }
        }
        Set<Integer> removedExpenseIds = new HashSet<>();

        for (Map.Entry<Integer, Integer> entry : previousExpenseToCategoryMap.entrySet()) {
            Integer expenseId = entry.getKey();
            if (!newExpenseToCategoriesMap.containsKey(expenseId) && !movedExpenses.containsKey(expenseId)) {
                removedExpenseIds.add(expenseId);
                logger.info("Expense ID {} removed from all categories", expenseId);
            }
        }
        for (Category category : categories) {
            if (category.getExpenseIds() == null) {
                category.setExpenseIds(new HashMap<>());
            }

            Set<Integer> expenseIds = category.getExpenseIds().containsKey(userId)
                    ? new HashSet<>(category.getExpenseIds().get(userId))
                    : new HashSet<>();
            expenseIds.removeAll(duplicateExpenseIds);
            for (Map.Entry<Integer, Integer> entry : movedExpenses.entrySet()) {
                Integer expenseId = entry.getKey();
                Integer newCategoryId = entry.getValue();
                if (!category.getId().equals(newCategoryId)) {
                    expenseIds.remove(expenseId);
                }
            }
            if (!expenseIds.isEmpty()) {
                category.getExpenseIds().put(userId, expenseIds);
            } else {
                category.getExpenseIds().remove(userId);
            }
        }
        Category othersCategory = null;
        expensesToMoveToOthers.addAll(removedExpenseIds);

        if (!expensesToMoveToOthers.isEmpty()) {
            try {
                othersCategory = getByName("Others", userId).get(0);
                logger.info("Found existing Others category with ID: {}", othersCategory.getId());
            } catch (Exception e) {
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
            if (othersCategory.getExpenseIds() == null) {
                othersCategory.setExpenseIds(new HashMap<>());
            }
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().containsKey(userId)
                    ? new HashSet<>(othersCategory.getExpenseIds().get(userId))
                    : new HashSet<>();
            for (Integer expenseId : expensesToMoveToOthers) {
                ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                    expense.setCategoryId(othersCategory.getId());
                    expenseService.save(expense);
                    othersExpenseIds.add(expenseId);
                    logger.info("Assigned expense ID {} to Others category", expenseId);
                }
            }
            if (!othersExpenseIds.isEmpty()) {
                othersCategory.getExpenseIds().put(userId, othersExpenseIds);
                categoryRepository.save(othersCategory);
            }
        }
        for (Category category : categories) {
            if (othersCategory != null && category.getId() != null && category.getId().equals(othersCategory.getId())) {
                updatedCategories.add(othersCategory);
                continue;
            }

            Category existing = categoryRepository.findById(category.getId()).orElse(null);
            if (existing != null) {
                existing.setName(category.getName());
                existing.setDescription(category.getDescription());
                existing.setGlobal(category.isGlobal());
                existing.setIcon(category.getIcon());
                existing.setColor(category.getColor());
                existing.setType(category.getType());
                if (existing.getExpenseIds() == null) {
                    existing.setExpenseIds(new HashMap<>());
                }
                if (existing.getUserIds() == null) {
                    existing.setUserIds(new HashSet<>());
                }
                if (existing.getEditUserIds() == null) {
                    existing.setEditUserIds(new HashSet<>());
                }
                Set<Integer> newExpenseIds = category.getExpenseIds().containsKey(userId)
                        ? new HashSet<>(category.getExpenseIds().get(userId))
                        : new HashSet<>();
                for (Integer expenseId : newExpenseIds) {
                    ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                    if (expense != null && expense.getUserId() != null && expense.getUserId().equals(userId)) {
                        expense.setCategoryId(existing.getId());
                        expenseService.save(expense);
                    }
                }
                if (!newExpenseIds.isEmpty()) {
                    existing.getExpenseIds().put(userId, newExpenseIds);
                } else {
                    existing.getExpenseIds().remove(userId);
                }
                updatedCategories.add(categoryRepository.save(existing));
            }
        }

        return updatedCategories;
    }

    public void deleteMultiple(List<Integer> categoryIds, Integer userId) {
        if (categoryIds == null || categoryIds.isEmpty()) {
            logger.info("No category IDs provided for deletion");
            return;
        }

        logger.info("Deleting multiple categories: {}", categoryIds);
        List<ExpenseDTO> expensesToReassign = new ArrayList<>();
        List<Category> categoriesToDelete = new ArrayList<>();
        for (Integer id : categoryIds) {
            Category existing = categoryRepository.findById(id).orElse(null);
            if (existing == null) {
                logger.warn("Category with ID {} not found", id);
                continue;
            }
            if ("Others".equals(existing.getName())) {
                logger.warn("Skipping deletion of 'Others' category (ID: {})", id);
                continue;
            }
            if (existing.isGlobal()) {
                existing.getUserIds().add(userId);
                categoryRepository.save(existing);
                logger.info("Added UserDTO {} to userIds of global category {}", userId, id);
                continue;
            }
            if (existing.getUserId() == null || !existing.getUserId().equals(userId)) {
                logger.warn("Category {} does not belong to UserDTO {}", id, userId);
                continue;
            }
            if (existing.getExpenseIds() != null && existing.getExpenseIds().containsKey(userId)) {
                Set<Integer> expenseIds = existing.getExpenseIds().get(userId);
                if (expenseIds != null && !expenseIds.isEmpty()) {
                    for (Integer expenseId : expenseIds) {
                        ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                        if (expense != null) {
                            expensesToReassign.add(expense);
                        }
                    }
                }
            }
            categoriesToDelete.add(existing);
        }
        if (!expensesToReassign.isEmpty()) {
            logger.info("Found {} expenses to reassign to 'Others' category", expensesToReassign.size());
            Category othersCategory;
            try {
                List<Category> othersCategories = getByName("Others", userId);
                if (othersCategories.isEmpty()) {
                    throw new Exception("Others category not found");
                }
                othersCategory = othersCategories.get(0);
                logger.info("Found existing 'Others' category with ID: {}", othersCategory.getId());
            } catch (Exception e) {
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
            if (othersCategory.getExpenseIds() == null) {
                othersCategory.setExpenseIds(new HashMap<>());
            }
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().containsKey(userId)
                    ? new HashSet<>(othersCategory.getExpenseIds().get(userId))
                    : new HashSet<>();
            for (ExpenseDTO expense : expensesToReassign) {
                expense.setCategoryId(othersCategory.getId());
                expenseService.save(expense);
                othersExpenseIds.add(expense.getId());
                logger.info("Reassigned expense ID {} to 'Others' category", expense.getId());
            }
            if (!othersExpenseIds.isEmpty()) {
                othersCategory.getExpenseIds().put(userId, othersExpenseIds);
                categoryRepository.save(othersCategory);
                logger.info("Updated 'Others' category with {} expense IDs", othersExpenseIds.size());
            }
        }
        for (Category category : categoriesToDelete) {
            categoryRepository.delete(category);
            logger.info("Deleted category with ID: {}", category.getId());
        }

        logger.info("Completed deletion of {} categories", categoriesToDelete.size());
    }

    public void deleteAllGlobal(Integer userId, boolean global) {
        logger.info("deleteAllGlobal called with UserDTO: {} and global: {}", userId, global);

        List<ExpenseDTO> expensesToReassign = new ArrayList<>();

        if (global) {
            List<Category> globalCategories = categoryRepository.findAllByIsGlobalTrueWithDetails();
            logger.info("Global categories to delete: {}", globalCategories.size());
            for (Category category : globalCategories) {
                if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                    Set<Integer> expenseIds = category.getExpenseIds().get(userId);
                    if (expenseIds != null && !expenseIds.isEmpty()) {
                        for (Integer expenseId : expenseIds) {
                            ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                            if (expense != null) {
                                expense.setCategoryId(null);
                                expenseService.save(expense);
                                expensesToReassign.add(expense);
                            }
                        }
                    }
                    category.getExpenseIds().remove(userId);
                    categoryRepository.save(category);
                }
                if (!category.getUserIds().contains(userId)) {
                    category.getUserIds().add(userId);
                    categoryRepository.save(category);
                }
            }

            logger.info("Added UserDTO {} to userIds of {} global categories",
                    userId, globalCategories.size());
            logger.info("Found {} expenses to reassign from global categories", expensesToReassign.size());

        } else {
            List<Category> userCategories = categoryRepository.findAllByUserId(userId);
            logger.info("UserDTO-specific categories to delete: {}", userCategories.size());
            for (Category category : userCategories) {
                if ("Others".equals(category.getName())) {
                    continue;
                }

                if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                    Set<Integer> expenseIds = category.getExpenseIds().get(userId);
                    if (expenseIds != null && !expenseIds.isEmpty()) {
                        for (Integer expenseId : expenseIds) {
                            ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                            if (expense != null) {
                                expense.setCategoryId(null);
                                expenseService.save(expense);
                                expensesToReassign.add(expense);
                            }
                        }
                    }
                }
            }
            List<Category> categoriesToDelete = userCategories.stream()
                    .filter(category -> !"Others".equals(category.getName()))
                    .collect(Collectors.toList());

            categoryRepository.deleteAll(categoriesToDelete);
            logger.info("Deleted {} UserDTO-specific categories", categoriesToDelete.size());
            logger.info("Found {} expenses to reassign from UserDTO categories", expensesToReassign.size());
        }
        if (!expensesToReassign.isEmpty()) {
            Category othersCategory;
            try {
                List<Category> othersCategories = getByName("Others", userId);
                if (othersCategories.isEmpty()) {
                    throw new Exception("Others category not found");
                }
                othersCategory = othersCategories.get(0);
                logger.info("Found existing 'Others' category with ID: {}", othersCategory.getId());
            } catch (Exception e) {
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
            if (othersCategory.getExpenseIds() == null) {
                othersCategory.setExpenseIds(new HashMap<>());
            }
            Set<Integer> othersExpenseIds = othersCategory.getExpenseIds().containsKey(userId)
                    ? new HashSet<>(othersCategory.getExpenseIds().get(userId))
                    : new HashSet<>();
            for (ExpenseDTO expense : expensesToReassign) {
                expense.setCategoryId(othersCategory.getId());
                expenseService.save(expense);
                othersExpenseIds.add(expense.getId());
                logger.info("Reassigned expense ID {} to 'Others' category", expense.getId());
            }
            if (!othersExpenseIds.isEmpty()) {
                othersCategory.getExpenseIds().put(userId, othersExpenseIds);
                categoryRepository.save(othersCategory);
                logger.info("Updated 'Others' category with {} expense IDs", othersExpenseIds.size());
            }
        }
    }

    public void deleteAllUserCategories(Integer userId) {
        logger.info("Deleting all UserDTO categories for UserDTO ID: {}", userId);

        List<Category> userCategories = getAll(userId);
        logger.info("UserDTO categories to delete: {}", userCategories.size());
        List<ExpenseDTO> allUserExpenses = new ArrayList<>();
        for (Category category : userCategories) {
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
                Set<Integer> expenseIds = category.getExpenseIds().get(userId);
                if (expenseIds != null && !expenseIds.isEmpty()) {
                    for (Integer expenseId : expenseIds) {
                        ExpenseDTO expense = expenseService.getExpenseById(expenseId, userId);
                        if (expense != null) {
                            expense.setCategoryId(null);
                            expenseService.save(expense);
                            allUserExpenses.add(expense);
                        }
                    }
                }
            }
        }

        logger.info("Found {} expenses across all UserDTO categories", allUserExpenses.size());
        List<Category> filteredCategories = new ArrayList<>();
        for (Category category : userCategories) {
            if (category.isGlobal()) {
                if (category.getUserIds() == null) {
                    category.setUserIds(new HashSet<>());
                }
                category.getUserIds().add(userId);
                categoryRepository.save(category);
                logger.info("Added UserDTO {} to userIds of global category {}", userId, category.getId());
            } else {
                filteredCategories.add(category);
            }
        }
        categoryRepository.deleteAll(filteredCategories);
        logger.info("Deleted {} UserDTO-specific categories", filteredCategories.size());
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
                expenseService.save(expense);
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

    public List<Category> getByName(String name, Integer userId) {
        List<Category> categories = getAll(userId);
        if (categories.isEmpty()) {
            throw new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND, "No categories found for UserDTO");
        } else {
            logger.debug("Categories found with the name: {}", name);
            List<Category> foundCategories = categories.stream()
                    .filter(category -> category.getName().equals(name))
                    .collect(Collectors.toList());

            if (foundCategories.isEmpty()) {
                throw new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND,
                        "Category with name '" + name + "' not found");
            }

            return foundCategories;
        }
    }

    public void deleteAll() {
        categoryRepository.deleteAll();
    }

    public List<Category> getAllForUser(Integer userId) {
        List<Category> userCategories = categoryRepository.findByUserIdWithDetails(userId);
        List<Category> globalCategories = categoryRepository.findByIsGlobalTrueWithDetails();
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

    public List<ExpenseDTO> getOthersAndUncategorizedExpenses(UserDTO UserDTO) {
        List<ExpenseDTO> allUserExpenses = expenseService.getAllExpenses(UserDTO.getId());
        List<Category> allCategories = categoryRepository.findAll();
        Category othersCategory = allCategories.stream()
                .filter(cat -> "Others".equalsIgnoreCase(cat.getName()) &&
                        ((cat.getUserId() != null && cat.getUserId().equals(UserDTO.getId())) || cat.isGlobal()))
                .findFirst().orElse(null);

        Set<Integer> othersExpenseIds = new HashSet<>();
        if (othersCategory != null && othersCategory.getExpenseIds() != null
                && othersCategory.getExpenseIds().containsKey(UserDTO.getId())) {
            othersExpenseIds.addAll(othersCategory.getExpenseIds().get(UserDTO.getId()));
        }
        Set<Integer> categorizedExpenseIds = new HashSet<>();
        for (Category category : allCategories) {
            if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(UserDTO.getId())) {
                categorizedExpenseIds.addAll(category.getExpenseIds().get(UserDTO.getId()));
            }
        }
        return allUserExpenses.stream()
                .filter(expense -> othersExpenseIds.contains(expense.getId())
                        || !categorizedExpenseIds.contains(expense.getId()))
                .collect(Collectors.toList());
    }

    public List<ExpenseDTO> getAllExpensesWithCategoryFlag(Integer userId, Integer categoryId) {
        List<ExpenseDTO> allUserExpenses = expenseService.getAllExpenses(userId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> ResourceNotFoundException.categoryNotFound(categoryId));
        Set<Integer> categoryExpenseIds = new HashSet<>();
        if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
            categoryExpenseIds = category.getExpenseIds().get(userId);
        }
        for (ExpenseDTO expense : allUserExpenses) {
            expense.setIncludeInBudget(categoryExpenseIds.contains(expense.getId()));
        }

        return allUserExpenses;
    }

    private List<ExpenseDTO> filterByFlowType(List<ExpenseDTO> expenses, String flowType) {
        return expenses.stream()
                .filter(expense -> {
                    if (expense.getExpense() == null)
                        return false;

                    String type = expense.getExpense().getType();
                    if ("gain".equalsIgnoreCase(flowType) || "income".equalsIgnoreCase(flowType)) {
                        return "gain".equalsIgnoreCase(type) || "income".equalsIgnoreCase(type);
                    } else if ("loss".equalsIgnoreCase(flowType) || "expense".equalsIgnoreCase(flowType)) {
                        return "loss".equalsIgnoreCase(type) || "expense".equalsIgnoreCase(type);
                    }
                    return true;
                })
                .collect(Collectors.toList());
    }

    private Sort createSort(String sortBy, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        if (sortBy.startsWith("expense.")) {
            return Sort.by(direction, "id");
        }

        return Sort.by(direction, sortBy);
    }

    private List<ExpenseDTO> sortExpensesByNestedField(List<ExpenseDTO> expenses, String sortBy, String sortDirection) {
        boolean ascending = sortDirection.equalsIgnoreCase("asc");
        String nestedField = sortBy.substring("expense.".length());

        return expenses.stream()
                .sorted((e1, e2) -> {
                    if (e1.getExpense() == null && e2.getExpense() == null)
                        return 0;
                    if (e1.getExpense() == null)
                        return ascending ? -1 : 1;
                    if (e2.getExpense() == null)
                        return ascending ? 1 : -1;
                    switch (nestedField) {
                        case "expenseName":
                            String name1 = e1.getExpense().getExpenseName();
                            String name2 = e2.getExpense().getExpenseName();
                            if (name1 == null && name2 == null)
                                return 0;
                            if (name1 == null)
                                return ascending ? -1 : 1;
                            if (name2 == null)
                                return ascending ? 1 : -1;
                            int result = name1.compareTo(name2);
                            return ascending ? result : -result;

                        case "amount":
                            Double amount1 = e1.getExpense().getAmount();
                            Double amount2 = e2.getExpense().getAmount();
                            if (amount1 == null && amount2 == null)
                                return 0;
                            if (amount1 == null)
                                return ascending ? -1 : 1;
                            if (amount2 == null)
                                return ascending ? 1 : -1;
                            return ascending ? amount1.compareTo(amount2) : amount2.compareTo(amount1);

                        case "type":
                            String type1 = e1.getExpense().getType();
                            String type2 = e2.getExpense().getType();
                            if (type1 == null && type2 == null)
                                return 0;
                            if (type1 == null)
                                return ascending ? -1 : 1;
                            if (type2 == null)
                                return ascending ? 1 : -1;
                            result = type1.compareTo(type2);
                            return ascending ? result : -result;

                        case "paymentMethod":
                            String method1 = e1.getExpense().getPaymentMethod();
                            String method2 = e2.getExpense().getPaymentMethod();
                            if (method1 == null && method2 == null)
                                return 0;
                            if (method1 == null)
                                return ascending ? -1 : 1;
                            if (method2 == null)
                                return ascending ? 1 : -1;
                            result = method1.compareTo(method2);
                            return ascending ? result : -result;

                        case "netAmount":
                            Double net1 = e1.getExpense().getNetAmount();
                            Double net2 = e2.getExpense().getNetAmount();
                            if (net1 == null && net2 == null)
                                return 0;
                            if (net1 == null)
                                return ascending ? -1 : 1;
                            if (net2 == null)
                                return ascending ? 1 : -1;
                            return ascending ? net1.compareTo(net2) : net2.compareTo(net1);

                        case "comments":
                            String comments1 = e1.getExpense().getComments();
                            String comments2 = e2.getExpense().getComments();
                            if (comments1 == null && comments2 == null)
                                return 0;
                            if (comments1 == null)
                                return ascending ? -1 : 1;
                            if (comments2 == null)
                                return ascending ? 1 : -1;
                            result = comments1.compareTo(comments2);
                            return ascending ? result : -result;

                        default:
                            return ascending ? e1.getId().compareTo(e2.getId()) : e2.getId().compareTo(e1.getId());
                    }
                })
                .collect(Collectors.toList());
    }

    public List<ExpenseDTO> getAllUserExpensesOrderedByCategoryFlag(
            Integer userId,
            Integer categoryId,
            Integer page,
            Integer size,
            String sortBy,
            String sortDirection) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> ResourceNotFoundException.categoryNotFound(categoryId));
        Set<Integer> categoryExpenseIds = new HashSet<>();
        if (category.getExpenseIds() != null && category.getExpenseIds().containsKey(userId)) {
            categoryExpenseIds = category.getExpenseIds().get(userId);
        }
        Sort sort = createSort(sortBy, sortDirection);
        List<ExpenseDTO> allUserExpenses;
        if (sortBy.startsWith("expense.")) {
            allUserExpenses = expenseService.getAllExpenses(userId);
            allUserExpenses = sortExpensesByNestedField(allUserExpenses, sortBy, sortDirection);
        } else {
            allUserExpenses = expenseService.getAllExpensesWithSort(userId, sort.toString());
        }
        for (ExpenseDTO expense : allUserExpenses) {
            expense.setIncludeInBudget(categoryExpenseIds.contains(expense.getId()));
        }
        List<ExpenseDTO> inCategoryExpenses = new ArrayList<>();
        List<ExpenseDTO> notInCategoryExpenses = new ArrayList<>();

        for (ExpenseDTO expense : allUserExpenses) {
            if (expense.isIncludeInBudget()) {
                inCategoryExpenses.add(expense);
            } else {
                notInCategoryExpenses.add(expense);
            }
        }
        List<ExpenseDTO> orderedExpenses = new ArrayList<>(inCategoryExpenses);
        orderedExpenses.addAll(notInCategoryExpenses);
        int start = page * size;
        int end = Math.min(start + size, orderedExpenses.size());

        if (start >= orderedExpenses.size()) {
            return new ArrayList<>();
        } else {
            return orderedExpenses.subList(start, end);
        }
    }

    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    public List<CategoryDTO> searchCategories(Integer userId, String query, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }
        String subsequencePattern = convertToSubsequencePattern(query.trim());
        logger.debug("Searching categories for UserDTO {} with query '{}' (pattern: '{}') limit {}", userId, query,
                subsequencePattern, limit);
        List<CategoryDTO> results = categoryRepository.searchCategoriesFuzzyWithLimit(userId, subsequencePattern);
        return results.stream().limit(limit).collect(Collectors.toList());
    }

    private String convertToSubsequencePattern(String query) {
        if (query == null || query.isEmpty()) {
            return "%";
        }
        StringBuilder pattern = new StringBuilder("%");
        for (char c : query.toCharArray()) {
            pattern.append(c).append("%");
        }
        return pattern.toString();
    }

}
