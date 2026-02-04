package com.jaya.util.validation;

import com.jaya.common.exception.ValidationException;
import com.jaya.common.error.ErrorCode;
import com.jaya.constant.CategoryConstants;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;

@Component
@Slf4j
public class CategoryValidator {

    private static final List<String> VALID_TYPES = Arrays.asList(
            CategoryConstants.TYPE_INCOME,
            CategoryConstants.TYPE_EXPENSE,
            CategoryConstants.TYPE_TRANSFER);

    public void validateName(String name) {
        if (!StringUtils.hasText(name)) {
            throw new ValidationException(ErrorCode.VALIDATION_FAILED,
                    CategoryConstants.ERR_INVALID_CATEGORY_NAME);
        }

        String trimmedName = name.trim();
        if (trimmedName.length() < CategoryConstants.NAME_MIN_LENGTH ||
                trimmedName.length() > CategoryConstants.NAME_MAX_LENGTH) {
            throw new ValidationException(ErrorCode.VALIDATION_FAILED,
                    String.format("Category name must be between %d and %d characters",
                            CategoryConstants.NAME_MIN_LENGTH, CategoryConstants.NAME_MAX_LENGTH));
        }
    }

    public void validateType(String type) {
        if (!StringUtils.hasText(type)) {
            throw new ValidationException(ErrorCode.VALIDATION_FAILED,
                    "Category type is required");
        }

        if (!VALID_TYPES.contains(type.toLowerCase())) {
            throw new ValidationException(ErrorCode.VALIDATION_FAILED,
                    String.format(CategoryConstants.ERR_INVALID_CATEGORY_TYPE, type));
        }
    }

    public void validateDescription(String description) {
        if (description != null && description.length() > CategoryConstants.DESCRIPTION_MAX_LENGTH) {
            throw new ValidationException(ErrorCode.VALIDATION_FAILED,
                    String.format("Description cannot exceed %d characters",
                            CategoryConstants.DESCRIPTION_MAX_LENGTH));
        }
    }

    public void validateIcon(String icon) {
        if (icon != null && icon.length() > CategoryConstants.ICON_MAX_LENGTH) {
            throw new ValidationException(ErrorCode.VALIDATION_FAILED,
                    String.format("Icon name cannot exceed %d characters",
                            CategoryConstants.ICON_MAX_LENGTH));
        }
    }

    public void validateColor(String color) {
        if (color != null && color.length() > CategoryConstants.COLOR_MAX_LENGTH) {
            throw new ValidationException(ErrorCode.VALIDATION_FAILED,
                    String.format("Color code cannot exceed %d characters",
                            CategoryConstants.COLOR_MAX_LENGTH));
        }
    }

    public void validateUserId(Integer userId) {
        if (userId == null || userId < 0) {
            throw new ValidationException(ErrorCode.VALIDATION_FAILED,
                    "Invalid user ID");
        }
    }

    public void validateForCreation(String name, String type, String description,
            String icon, String color) {
        validateName(name);
        validateType(type);
        validateDescription(description);
        validateIcon(icon);
        validateColor(color);
    }

    public void validateForUpdate(String name, String type, String description,
            String icon, String color) {
        if (name != null) {
            validateName(name);
        }
        if (type != null) {
            validateType(type);
        }
        validateDescription(description);
        validateIcon(icon);
        validateColor(color);
    }

    public boolean isValidType(String type) {
        return type != null && VALID_TYPES.contains(type.toLowerCase());
    }
}
