package com.jaya.constant;

public final class CategoryConstants {

    private CategoryConstants() {
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    public static final String DEFAULT_CATEGORY_NAME = "Others";
    public static final String DEFAULT_CATEGORY_DESCRIPTION = "Default category for uncategorized expenses";
    public static final String DEFAULT_CATEGORY_TYPE = "expense";
    public static final String DEFAULT_ICON = "";
    public static final String DEFAULT_COLOR = "";
    public static final Integer GLOBAL_USER_ID = 0;

    public static final String TYPE_INCOME = "income";
    public static final String TYPE_EXPENSE = "expense";
    public static final String TYPE_TRANSFER = "transfer";

    public static final int NAME_MIN_LENGTH = 1;
    public static final int NAME_MAX_LENGTH = 100;
    public static final int DESCRIPTION_MAX_LENGTH = 500;
    public static final int ICON_MAX_LENGTH = 50;
    public static final int COLOR_MAX_LENGTH = 20;

    public static final String CACHE_CATEGORIES_BY_USER = "categories:user:";
    public static final String CACHE_GLOBAL_CATEGORIES = "categories:global";
    public static final String CACHE_CATEGORY_BY_ID = "category:id:";

    public static final String DEFAULT_CATEGORY_EVENTS_TOPIC = "category-events";
    public static final String DEFAULT_FRIEND_ACTIVITY_TOPIC = "friend-activity";
    public static final String DEFAULT_UNIFIED_ACTIVITY_TOPIC = "unified-activity";

    public static final String MSG_CATEGORY_CREATED = "Category created successfully";
    public static final String MSG_CATEGORY_UPDATED = "Category updated successfully";
    public static final String MSG_CATEGORY_DELETED = "Category deleted successfully";
    public static final String MSG_CATEGORIES_FETCHED = "Categories fetched successfully";
    public static final String MSG_NO_CATEGORIES_FOUND = "No categories found";
    public static final String MSG_ACCESS_DENIED = "You don't have permission to access this category";
    public static final String MSG_GLOBAL_EDIT_ONCE = "You can only edit this global category once";
    public static final String MSG_ADMIN_ONLY = "This endpoint is only for global categories";

    public static final String ERR_CATEGORY_NOT_FOUND = "Category not found with ID: %d";
    public static final String ERR_USER_NOT_FOUND = "User not found with ID: %d";
    public static final String ERR_DUPLICATE_CATEGORY = "Category '%s' already exists";
    public static final String ERR_INVALID_CATEGORY_NAME = "Category name cannot be empty";
    public static final String ERR_INVALID_CATEGORY_TYPE = "Invalid category type: %s";
    public static final String ERR_ADMIN_MODE_REQUIRED = "User must be in ADMIN mode to edit global categories";
    public static final String ERR_ADMIN_ROLE_REQUIRED = "User does not have ADMIN role";

    public static final int DEFAULT_PAGE = 0;
    public static final int DEFAULT_PAGE_SIZE = 20;
    public static final int MAX_PAGE_SIZE = 1000;
    public static final String DEFAULT_SORT_FIELD = "date";
    public static final String DEFAULT_SORT_DIR = "desc";

    public static final int DEFAULT_SEARCH_LIMIT = 20;
    public static final int MAX_SEARCH_LIMIT = 100;
}
