package com.jaya.common.service.client.local;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.service.client.ICategoryServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Local implementation for Category Service client in monolithic mode.
 * Calls the local CategoryService bean directly instead of making HTTP calls.
 */
@Component
@Profile("monolithic")
@Slf4j
public class LocalCategoryServiceClient implements ICategoryServiceClient {

    private final ApplicationContext applicationContext;
    private Object categoryService;

    @Autowired
    public LocalCategoryServiceClient(@Lazy ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    private Object getCategoryService() {
        if (categoryService == null) {
            try {
                categoryService = applicationContext.getBean("categoryServiceImpl");
            } catch (Exception e) {
                log.warn("Could not find categoryServiceImpl, trying CategoryServiceImpl class", e);
                try {
                    categoryService = applicationContext.getBean(
                        Class.forName("com.jaya.service.CategoryServiceImpl"));
                } catch (ClassNotFoundException ex) {
                    log.error("CategoryServiceImpl class not found", ex);
                    throw new RuntimeException("CategoryService not available in monolithic mode", ex);
                }
            }
        }
        return categoryService;
    }

    @Override
    public CategoryDTO getById(Integer categoryId, Integer userId) {
        log.debug("LocalCategoryServiceClient: Getting category by ID: {}", categoryId);
        try {
            Object service = getCategoryService();
            var method = service.getClass().getMethod("getById", Integer.class, Integer.class);
            return (CategoryDTO) method.invoke(service, categoryId, userId);
        } catch (Exception e) {
            log.error("Error calling local CategoryService.getById", e);
            throw new RuntimeException("Failed to get category by ID locally", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<CategoryDTO> getByName(String categoryName, Integer userId) {
        log.debug("LocalCategoryServiceClient: Getting categories by name: {}", categoryName);
        try {
            Object service = getCategoryService();
            var method = service.getClass().getMethod("getByName", String.class, Integer.class);
            return (List<CategoryDTO>) method.invoke(service, categoryName, userId);
        } catch (Exception e) {
            log.error("Error calling local CategoryService.getByName", e);
            throw new RuntimeException("Failed to get categories by name locally", e);
        }
    }

    @Override
    public CategoryDTO create(CategoryDTO category, Integer userId) {
        log.debug("LocalCategoryServiceClient: Creating category for user: {}", userId);
        try {
            Object service = getCategoryService();
            var method = service.getClass().getMethod("create", CategoryDTO.class, Integer.class);
            return (CategoryDTO) method.invoke(service, category, userId);
        } catch (Exception e) {
            log.error("Error calling local CategoryService.create", e);
            throw new RuntimeException("Failed to create category locally", e);
        }
    }

    @Override
    public CategoryDTO save(CategoryDTO category) {
        log.debug("LocalCategoryServiceClient: Saving category");
        try {
            Object service = getCategoryService();
            var method = service.getClass().getMethod("save", CategoryDTO.class);
            return (CategoryDTO) method.invoke(service, category);
        } catch (Exception e) {
            log.error("Error calling local CategoryService.save", e);
            throw new RuntimeException("Failed to save category locally", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<CategoryDTO> getAllForUser(Integer userId) {
        log.debug("LocalCategoryServiceClient: Getting all categories for user: {}", userId);
        try {
            Object service = getCategoryService();
            var method = service.getClass().getMethod("getAllForUser", Integer.class);
            return (List<CategoryDTO>) method.invoke(service, userId);
        } catch (Exception e) {
            log.error("Error calling local CategoryService.getAllForUser", e);
            throw new RuntimeException("Failed to get all categories locally", e);
        }
    }
}
