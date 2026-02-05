package com.jaya.service.helper;

import com.jaya.common.exception.AccessDeniedException;
import com.jaya.common.exception.ConflictException;
import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.constant.CategoryConstants;
import com.jaya.models.Category;
import com.jaya.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class CategoryValidationHelper {

    private final CategoryRepository categoryRepository;

    public Category validateAndGetCategory(Integer categoryId) {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> {
                    log.warn("Category not found: categoryId={}", categoryId);
                    return ResourceNotFoundException.categoryNotFound(categoryId);
                });
    }

    public Category validateAndGetCategoryWithDetails(Integer categoryId) {
        return categoryRepository.findByIdWithDetails(categoryId)
                .orElseThrow(() -> {
                    log.warn("Category not found: categoryId={}", categoryId);
                    return ResourceNotFoundException.categoryNotFound(categoryId);
                });
    }

    public void validateUserAccess(Category category, Integer userId) {
        if (category.getUserId() != null && category.getUserId().equals(userId)) {
            log.debug("Access granted: user {} owns category {}", userId, category.getId());
            return;
        }

        if (category.isGlobal()) {
            boolean isHidden = category.getUserIds() != null && category.getUserIds().contains(userId);
            boolean hasEdited = category.getEditUserIds() != null && category.getEditUserIds().contains(userId);

            if (!isHidden && !hasEdited) {
                log.debug("Access granted: user {} can access global category {}", userId, category.getId());
                return;
            }
        }

        log.warn("Access denied: user {} cannot access category {}", userId, category.getId());
        throw AccessDeniedException.forCategory(Long.valueOf(category.getId()));
    }

    public boolean hasUserEditedGlobalCategory(Category category, Integer userId) {
        if (!category.isGlobal()) {
            return false;
        }
        return category.getEditUserIds() != null && category.getEditUserIds().contains(userId);
    }

    public void checkForDuplicateCategory(String name, String type, Integer userId,
            boolean isGlobal, Integer excludeId) {
        if (name == null || name.trim().isEmpty()) {
            return;
        }

        List<Category> duplicates;
        String trimmedName = name.trim();

        if (isGlobal) {
            duplicates = excludeId != null
                    ? categoryRepository.findGlobalByNameAndTypeExcluding(trimmedName, type, excludeId)
                    : categoryRepository.findGlobalByNameAndType(trimmedName, type);

            if (!duplicates.isEmpty()) {
                log.warn("Duplicate global category found: name={}, type={}", trimmedName, type);
                throw ConflictException.categoryAlreadyExists(trimmedName + " (" + type + ") - global");
            }
        } else {
            Integer categoryUserId = (userId != null) ? userId : CategoryConstants.GLOBAL_USER_ID;
            duplicates = excludeId != null
                    ? categoryRepository.findByNameAndTypeAndUserIdExcluding(trimmedName, type, categoryUserId,
                            excludeId)
                    : categoryRepository.findByNameAndTypeAndUserId(trimmedName, type, categoryUserId);

            if (!duplicates.isEmpty()) {
                log.warn("Duplicate category found: name={}, type={}, userId={}", trimmedName, type, categoryUserId);
                throw ConflictException.categoryAlreadyExists(trimmedName + " (" + type + ")");
            }
        }
    }

    public void validateOwnershipForModification(Category category, Integer userId) {
        if (!category.isGlobal() &&
                (category.getUserId() == null || !category.getUserId().equals(userId))) {
            log.warn("Ownership validation failed: user {} cannot modify category {}", userId, category.getId());
            throw AccessDeniedException.forCategory(Long.valueOf(category.getId()));
        }
    }
}
