package com.jaya.service.interfaces;

import com.jaya.models.Category;
import com.jaya.models.User;

public interface ICategoryAdminService {
    Category adminUpdateGlobalCategory(Integer id, Category category, User admin);

    String deleteGlobalCategoryById(Integer id, User user);
}
