package com.jaya.mapper;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.models.ExpenseCategory;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CategoryMapper {

    public ExpenseCategory toEntity(CategoryDTO dto) {
        if (dto == null) {
            return null;
        }

        ExpenseCategory category = new ExpenseCategory();
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

    public List<ExpenseCategory> toEntityList(List<CategoryDTO> dtos) {
        if (dtos == null) {
            return List.of();
        }
        return dtos.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    public CategoryDTO toDto(ExpenseCategory entity) {
        if (entity == null) {
            return null;
        }

        CategoryDTO dto = new CategoryDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setType(entity.getType());
        dto.setGlobal(entity.isGlobal());
        dto.setIcon(entity.getIcon());
        dto.setColor(entity.getColor());
        dto.setUserId(entity.getUserId());
        dto.setExpenseIds(entity.getExpenseIds() != null ? new HashMap<>(entity.getExpenseIds()) : new HashMap<>());
        dto.setUserIds(entity.getUserIds() != null ? new HashSet<>(entity.getUserIds()) : new HashSet<>());
        dto.setEditUserIds(entity.getEditUserIds() != null ? new HashSet<>(entity.getEditUserIds()) : new HashSet<>());
        return dto;
    }

    public List<CategoryDTO> toDtoList(List<ExpenseCategory> entities) {
        if (entities == null) {
            return List.of();
        }
        return entities.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}

