package com.jaya.service.interfaces;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.dto.request.CreateCategoryRequest;
import com.jaya.common.dto.request.UpdateCategoryRequest;
import com.jaya.models.Category;
import com.jaya.models.User;

import java.util.List;

public interface ICategoryService {
    Category create(CreateCategoryRequest request, Integer userId);

    Category getById(Integer id, Integer userId);

    List<Category> getAllForUser(Integer userId);

    Category update(Integer id, UpdateCategoryRequest request, User user);

    String delete(Integer id, Integer userId);

    List<Category> getByName(String name, Integer userId);

    List<Category> searchCategories(String query, Integer userId);

    List<CategoryDTO> searchCategoriesLight(String query, Integer userId);

    List<Category> createMultiple(List<CreateCategoryRequest> requests, Integer userId);
}
