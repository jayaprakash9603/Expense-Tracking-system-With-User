package com.jaya.service;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.mapper.CategoryMapper;
import com.jaya.models.Category;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryServiceWrapper {

    private final CategoryServices categoryFeignClient;
    private final CategoryMapper categoryMapper;

    public Category getById(Integer categoryId, Integer userId) throws Exception {
        CategoryDTO dto = categoryFeignClient.getById(categoryId, userId);
        return categoryMapper.toEntity(dto);
    }

    public List<Category> getByName(String categoryName, Integer userId) throws Exception {
        List<CategoryDTO> dtos = categoryFeignClient.getByName(categoryName, userId);
        return categoryMapper.toEntityList(dtos);
    }

    public Category create(Category category, Integer userId) throws Exception {
        CategoryDTO dto = categoryFeignClient.create(category, userId);
        return categoryMapper.toEntity(dto);
    }

    public Category save(Category category) throws Exception {
        CategoryDTO dto = categoryFeignClient.save(category);
        return categoryMapper.toEntity(dto);
    }

    public List<Category> getAllForUser(Integer userId) throws Exception {
        List<CategoryDTO> dtos = categoryFeignClient.getAllForUser(userId);
        return categoryMapper.toEntityList(dtos);
    }
}
