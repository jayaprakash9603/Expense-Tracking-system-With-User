package com.jaya.service;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.mapper.CategoryMapper;
import com.jaya.models.Category;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Wrapper service for Category-Service Feign client.
 * Converts CategoryDTO responses to local Category entities.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceWrapper {

    private final CategoryServices categoryFeignClient;
    private final CategoryMapper categoryMapper;

    /**
     * Get category by ID and convert to local entity
     */
    public Category getById(Integer categoryId, Integer userId) throws Exception {
        CategoryDTO dto = categoryFeignClient.getById(categoryId, userId);
        return categoryMapper.toEntity(dto);
    }

    /**
     * Get categories by name and convert to local entities
     */
    public List<Category> getByName(String categoryName, Integer userId) throws Exception {
        List<CategoryDTO> dtos = categoryFeignClient.getByName(categoryName, userId);
        return categoryMapper.toEntityList(dtos);
    }

    /**
     * Create category and convert response to local entity
     */
    public Category create(Category category, Integer userId) throws Exception {
        CategoryDTO dto = categoryFeignClient.create(category, userId);
        return categoryMapper.toEntity(dto);
    }

    /**
     * Save category and convert response to local entity
     */
    public Category save(Category category) throws Exception {
        CategoryDTO dto = categoryFeignClient.save(category);
        return categoryMapper.toEntity(dto);
    }

    /**
     * Get all categories for user and convert to local entities
     */
    public List<Category> getAllForUser(Integer userId) throws Exception {
        List<CategoryDTO> dtos = categoryFeignClient.getAllForUser(userId);
        return categoryMapper.toEntityList(dtos);
    }
}
