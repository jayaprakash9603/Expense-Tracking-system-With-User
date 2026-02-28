package com.jaya.common.service.client;

import com.jaya.common.dto.CategoryDTO;

import java.util.List;

/**
 * Interface for Category Service client operations.
 * Implementations:
 * - FeignCategoryServiceClient: @Profile("!monolithic") - calls remote CATEGORY-SERVICE
 * - LocalCategoryServiceClient: @Profile("monolithic") - calls CategoryService bean directly
 */
public interface ICategoryServiceClient {

    /**
     * Get category by ID.
     *
     * @param categoryId the category ID
     * @param userId the user ID
     * @return the category
     */
    CategoryDTO getById(Integer categoryId, Integer userId);

    /**
     * Get categories by name.
     *
     * @param categoryName the category name
     * @param userId the user ID
     * @return list of categories with matching name
     */
    List<CategoryDTO> getByName(String categoryName, Integer userId);

    /**
     * Create a new category.
     *
     * @param category the category to create
     * @param userId the user ID
     * @return the created category
     */
    CategoryDTO create(CategoryDTO category, Integer userId);

    /**
     * Save a category.
     *
     * @param category the category to save
     * @return the saved category
     */
    CategoryDTO save(CategoryDTO category);

    /**
     * Get all categories for a user.
     *
     * @param userId the user ID
     * @return list of categories
     */
    List<CategoryDTO> getAllForUser(Integer userId);
}
