package com.jaya.mapper;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.models.Category;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting between CategoryDTO and local Category entity.
 * Used for inter-service communication with Category-Service.
 */
@Component
public class CategoryMapper {

    /**
     * Convert CategoryDTO to local Category entity
     */
    public Category toEntity(CategoryDTO dto) {
        if (dto == null) {
            return null;
        }

        Category category = new Category();
        category.setId(dto.getId());
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setType(dto.getType());
        category.setGlobal(dto.isGlobal());
        category.setIcon(dto.getIcon() != null ? dto.getIcon() : "");
        category.setColor(dto.getColor() != null ? dto.getColor() : "");
        category.setUserId(dto.getUserId() != null ? dto.getUserId() : 0);
        category.setExpenseIds(dto.getExpenseIds() != null ? new HashMap<>(dto.getExpenseIds()) : new HashMap<>());
        category.setUserIds(dto.getUserIds() != null ? new HashSet<>(dto.getUserIds()) : new HashSet<>());
        category.setEditUserIds(dto.getEditUserIds() != null ? new HashSet<>(dto.getEditUserIds()) : new HashSet<>());

        return category;
    }

    /**
     * Convert list of CategoryDTOs to list of local Category entities
     */
    public List<Category> toEntityList(List<CategoryDTO> dtos) {
        if (dtos == null) {
            return List.of();
        }
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    /**
     * Convert local Category entity to CategoryDTO
     */
    public CategoryDTO toDto(Category entity) {
        if (entity == null) {
            return null;
        }

        return CategoryDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .type(entity.getType())
                .isGlobal(entity.isGlobal())
                .icon(entity.getIcon())
                .color(entity.getColor())
                .userId(entity.getUserId())
                .expenseIds(entity.getExpenseIds() != null ? new HashMap<>(entity.getExpenseIds()) : new HashMap<>())
                .userIds(entity.getUserIds() != null ? new HashSet<>(entity.getUserIds()) : new HashSet<>())
                .editUserIds(entity.getEditUserIds() != null ? new HashSet<>(entity.getEditUserIds()) : new HashSet<>())
                .build();
    }

    /**
     * Convert list of local Category entities to list of CategoryDTOs
     */
    public List<CategoryDTO> toDtoList(List<Category> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
