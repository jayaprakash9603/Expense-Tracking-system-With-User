package com.jaya.service.interfaces;

import com.jaya.models.Category;
import com.jaya.models.User;

/**
 * Interface for admin-only category operations.
 * Follows Interface Segregation Principle (ISP).
 */
public interface ICategoryAdminService {

    /**
     * Update a global category (admin only).
     *
     * @param id       The category ID
     * @param category The category data to update
     * @param admin    The admin user
     * @return The updated category
     */
    Category adminUpdateGlobalCategory(Integer id, Category category, User admin);

    /**
     * Delete a global category (admin only).
     *
     * @param id   The category ID
     * @param user The admin user
     * @return Success message
     */
    String deleteGlobalCategoryById(Integer id, User user);
}
