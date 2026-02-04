package com.jaya.util.mapper;

import com.jaya.constant.CategoryConstants;
import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.dto.request.CreateCategoryRequest;
import com.jaya.common.dto.request.UpdateCategoryRequest;
import com.jaya.models.Category;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public Category toEntity(CreateCategoryRequest request, Integer userId) {
        Category category = new Category();

        // Set user ID based on global flag
        category.setUserId(request.isGlobal() ? CategoryConstants.GLOBAL_USER_ID : userId);

        // Map basic fields
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setType(request.getType());
        category.setGlobal(request.isGlobal());
        category.setIcon(request.getIcon() != null ? request.getIcon() : CategoryConstants.DEFAULT_ICON);
        category.setColor(request.getColor() != null ? request.getColor() : CategoryConstants.DEFAULT_COLOR);

        // Initialize collections
        category.setExpenseIds(new HashMap<>());
        category.setUserIds(new HashSet<>());
        category.setEditUserIds(new HashSet<>());

        return category;
    }

    public Category toEntityForUpdate(UpdateCategoryRequest request, Integer userId) {
        Category category = new Category();
        category.setName(request.getName());
        category.setDescription(request.getDescription());
        category.setType(request.getType());
        category.setIcon(request.getIcon());
        category.setColor(request.getColor());

        // Set expense IDs if provided
        if (request.getExpenseIds() != null) {
            category.setExpenseIds(request.getExpenseIds());
        }

        return category;
    }

    public void applyUpdate(Category existing, UpdateCategoryRequest request) {
        if (request.getName() != null) {
            existing.setName(request.getName());
        }
        if (request.getDescription() != null) {
            existing.setDescription(request.getDescription());
        }
        if (request.getType() != null) {
            existing.setType(request.getType());
        }
        if (request.getIcon() != null) {
            existing.setIcon(request.getIcon());
        }
        if (request.getColor() != null) {
            existing.setColor(request.getColor());
        }
    }

    /**
     * Convert Category entity to CategoryDTO.
     *
     * @param category The category entity
     * @return The CategoryDTO
     */
    public CategoryDTO toResponse(Category category) {
        return toResponse(category, null);
    }

    public CategoryDTO toResponse(Category category, Integer userId) {
        CategoryDTO.CategoryDTOBuilder builder = CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .type(category.getType())
                .isGlobal(category.isGlobal())
                .icon(category.getIcon())
                .color(category.getColor())
                .userId(category.getUserId())
                .expenseIds(category.getExpenseIds())
                .userIds(category.getUserIds())
                .editUserIds(category.getEditUserIds());

        // Calculate expense count for the user
        if (userId != null && category.getExpenseIds() != null) {
            Set<Integer> userExpenseIds = category.getExpenseIds().get(userId);
            builder.expenseCount(userExpenseIds != null ? userExpenseIds.size() : 0);
        }

        return builder.build();
    }

    public List<CategoryDTO> toResponseList(List<Category> categories) {
        return categories.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CategoryDTO> toResponseList(List<Category> categories, Integer userId) {
        return categories.stream()
                .map(c -> toResponse(c, userId))
                .collect(Collectors.toList());
    }

    public CategoryDTO toSearchDTO(Category category) {
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .type(category.getType())
                .isGlobal(category.isGlobal())
                .icon(category.getIcon())
                .color(category.getColor())
                .userId(category.getUserId())
                .build();
    }

    public List<CategoryDTO> toSearchDTOList(List<Category> categories) {
        return categories.stream()
                .map(this::toSearchDTO)
                .collect(Collectors.toList());
    }
}
