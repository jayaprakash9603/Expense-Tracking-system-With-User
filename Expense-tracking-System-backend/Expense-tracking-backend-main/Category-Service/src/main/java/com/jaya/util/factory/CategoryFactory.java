package com.jaya.util.factory;

import com.jaya.constant.CategoryConstants;
import com.jaya.models.Category;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;

@Component
public class CategoryFactory {

    public Category createUserCategory(String name, String description, String type, Integer userId) {
        Category category = createBaseCategory();
        category.setName(name);
        category.setDescription(description);
        category.setType(type);
        category.setUserId(userId);
        category.setGlobal(false);
        return category;
    }

    public Category createGlobalCategory(String name, String description, String type) {
        Category category = createBaseCategory();
        category.setName(name);
        category.setDescription(description);
        category.setType(type);
        category.setUserId(CategoryConstants.GLOBAL_USER_ID);
        category.setGlobal(true);
        return category;
    }

    public Category createOthersCategory(Integer userId) {
        return createUserCategory(
                CategoryConstants.DEFAULT_CATEGORY_NAME,
                CategoryConstants.DEFAULT_CATEGORY_DESCRIPTION,
                CategoryConstants.DEFAULT_CATEGORY_TYPE,
                userId);
    }

    public Category createUserCopyFromGlobal(Category globalCategory, Integer userId) {
        Category userCategory = createBaseCategory();
        userCategory.setName(globalCategory.getName());
        userCategory.setDescription(globalCategory.getDescription());
        userCategory.setType(globalCategory.getType());
        userCategory.setIcon(globalCategory.getIcon());
        userCategory.setColor(globalCategory.getColor());
        userCategory.setUserId(userId);
        userCategory.setGlobal(false);
        return userCategory;
    }

    private Category createBaseCategory() {
        Category category = new Category();
        category.setIcon(CategoryConstants.DEFAULT_ICON);
        category.setColor(CategoryConstants.DEFAULT_COLOR);
        category.setExpenseIds(new HashMap<>());
        category.setUserIds(new HashSet<>());
        category.setEditUserIds(new HashSet<>());
        return category;
    }
}
