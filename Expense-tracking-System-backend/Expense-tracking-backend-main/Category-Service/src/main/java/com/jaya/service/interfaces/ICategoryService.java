package com.jaya.service.interfaces;

import com.jaya.dto.CategorySearchDTO;
import com.jaya.dto.request.CreateCategoryRequest;
import com.jaya.dto.request.UpdateCategoryRequest;
import com.jaya.models.Category;
import com.jaya.models.User;

import java.util.List;

/**
 * Category Service Interface following Interface Segregation Principle (ISP).
 * Defines the contract for category operations.
 */
public interface ICategoryService {

    // ========================================
    // CRUD OPERATIONS
    // ========================================

    /**
     * Create a new category for the specified user.
     *
     * @param request The category creation request
     * @param userId  The user ID creating the category
     * @return The created category
     */
    Category create(CreateCategoryRequest request, Integer userId);

    /**
     * Get a category by ID with user access validation.
     *
     * @param id     The category ID
     * @param userId The requesting user's ID
     * @return The category if accessible
     */
    Category getById(Integer id, Integer userId);

    /**
     * Get all categories accessible by the user (personal + global).
     *
     * @param userId The user ID
     * @return List of accessible categories
     */
    List<Category> getAllForUser(Integer userId);

    /**
     * Update a category.
     *
     * @param id      The category ID
     * @param request The update request
     * @param user    The user performing the update
     * @return The updated category
     */
    Category update(Integer id, UpdateCategoryRequest request, User user);

    /**
     * Delete a category.
     *
     * @param id     The category ID
     * @param userId The user ID
     * @return Success message
     */
    String delete(Integer id, Integer userId);

    // ========================================
    // SEARCH OPERATIONS
    // ========================================

    /**
     * Get categories by name.
     *
     * @param name   The category name
     * @param userId The user ID
     * @return List of matching categories
     */
    List<Category> getByName(String name, Integer userId);

    /**
     * Search categories with fuzzy matching.
     *
     * @param query  The search query
     * @param userId The user ID
     * @return List of matching categories
     */
    List<Category> searchCategories(String query, Integer userId);

    /**
     * Search categories returning lightweight DTOs.
     *
     * @param query  The search query
     * @param userId The user ID
     * @return List of category search DTOs
     */
    List<CategorySearchDTO> searchCategoriesLight(String query, Integer userId);

    // ========================================
    // BULK OPERATIONS
    // ========================================

    /**
     * Create multiple categories.
     *
     * @param requests The list of category requests
     * @param userId   The user ID
     * @return List of created categories
     */
    List<Category> createMultiple(List<CreateCategoryRequest> requests, Integer userId);
}
