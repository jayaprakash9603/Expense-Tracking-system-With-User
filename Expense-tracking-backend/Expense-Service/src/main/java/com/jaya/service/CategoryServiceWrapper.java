package com.jaya.service;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.mapper.CategoryMapper;
import com.jaya.models.ExpenseCategory;
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

    public ExpenseCategory getById(Integer categoryId, Integer userId) throws Exception {
        CategoryDTO dto = categoryFeignClient.getById(categoryId, userId);
        return categoryMapper.toEntity(dto);
    }

    public List<ExpenseCategory> getByName(String categoryName, Integer userId) throws Exception {
        List<CategoryDTO> dtos = categoryFeignClient.getByName(categoryName, userId);
        return categoryMapper.toEntityList(dtos);
    }

    public ExpenseCategory create(ExpenseCategory category, Integer userId) throws Exception {
        CategoryDTO dto = categoryFeignClient.create(category, userId);
        return categoryMapper.toEntity(dto);
    }

    public ExpenseCategory save(ExpenseCategory category) throws Exception {
        CategoryDTO dto = categoryFeignClient.save(category);
        return categoryMapper.toEntity(dto);
    }

    public List<ExpenseCategory> getAllForUser(Integer userId) throws Exception {
        List<CategoryDTO> dtos = categoryFeignClient.getAllForUser(userId);
        return categoryMapper.toEntityList(dtos);
    }
}

