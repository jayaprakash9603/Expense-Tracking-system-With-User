package com.jaya.service.interfaces;

import com.jaya.models.Category;
import com.jaya.common.dto.UserDTO;

public interface ICategoryAdminService {
    Category adminUpdateGlobalCategory(Integer id, Category category, UserDTO admin);

    String deleteGlobalCategoryById(Integer id, UserDTO UserDTO);
}
