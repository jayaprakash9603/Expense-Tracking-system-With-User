package com.jaya.testutil;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.dto.ExpenseDTO;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.dto.request.CreateCategoryRequest;
import com.jaya.common.dto.request.UpdateCategoryRequest;
import com.jaya.models.Category;

import java.util.HashSet;
import java.util.Set;

public final class CategoryTestDataFactory {

    public static final String TEST_JWT = "Bearer test-jwt-token";
    public static final Integer TEST_USER_ID = 1;
    public static final Integer TARGET_USER_ID = 2;
    public static final Integer GLOBAL_USER_ID = 0;
    public static final String TEST_EMAIL = "testuser@example.com";
    public static final String TEST_USERNAME = "testuser";

    private CategoryTestDataFactory() {
    }

    // -------------------------------------------------------------------------
    // UserDTO builders
    // -------------------------------------------------------------------------

    public static UserDTO buildUser() {
        return UserDTO.builder()
                .id(TEST_USER_ID)
                .username(TEST_USERNAME)
                .email(TEST_EMAIL)
                .firstName("Test")
                .lastName("User")
                .fullName("Test User")
                .roles(new HashSet<>(Set.of("ROLE_USER")))
                .currentMode("USER")
                .active(true)
                .build();
    }

    public static UserDTO buildAdminUser() {
        return UserDTO.builder()
                .id(TEST_USER_ID)
                .username("adminuser")
                .email("admin@example.com")
                .firstName("Admin")
                .lastName("User")
                .fullName("Admin User")
                .roles(new HashSet<>(Set.of("ROLE_ADMIN", "ADMIN")))
                .currentMode("ADMIN")
                .active(true)
                .build();
    }

    public static UserDTO buildTargetUser() {
        return UserDTO.builder()
                .id(TARGET_USER_ID)
                .username("targetuser")
                .email("target@example.com")
                .firstName("Target")
                .lastName("User")
                .fullName("Target User")
                .roles(new HashSet<>(Set.of("ROLE_USER")))
                .currentMode("USER")
                .active(true)
                .build();
    }

    // -------------------------------------------------------------------------
    // Category entity builders
    // -------------------------------------------------------------------------

    public static Category buildCategory() {
        Category category = new Category();
        category.setId(101);
        category.setName("Food");
        category.setDescription("Food and dining expenses");
        category.setType("expense");
        category.setGlobal(false);
        category.setIcon("food-icon");
        category.setColor("#FF5733");
        category.setUserId(TEST_USER_ID);
        category.setEditCount(0);
        category.setIsEdited(false);
        // null LONGBLOB fields to avoid H2 compatibility issues
        category.setExpenseIds(null);
        category.setUserIds(null);
        category.setEditUserIds(null);
        return category;
    }

    public static Category buildGlobalCategory() {
        Category category = new Category();
        category.setId(1);
        category.setName("Salary");
        category.setDescription("Monthly salary income");
        category.setType("income");
        category.setGlobal(true);
        category.setIcon("salary-icon");
        category.setColor("#33FF57");
        category.setUserId(GLOBAL_USER_ID);
        category.setEditCount(0);
        category.setIsEdited(false);
        category.setExpenseIds(null);
        category.setUserIds(null);
        category.setEditUserIds(null);
        return category;
    }

    public static Category buildOthersCategory() {
        Category category = new Category();
        category.setId(999);
        category.setName("Others");
        category.setDescription("Default category for uncategorized expenses");
        category.setType("expense");
        category.setGlobal(false);
        category.setIcon("");
        category.setColor("");
        category.setUserId(TEST_USER_ID);
        category.setEditCount(0);
        category.setIsEdited(false);
        category.setExpenseIds(null);
        category.setUserIds(null);
        category.setEditUserIds(null);
        return category;
    }

    public static Category buildCategoryWithoutId() {
        Category category = buildCategory();
        category.setId(null);
        return category;
    }

    public static Category buildIncomeCategory() {
        Category category = buildCategory();
        category.setId(102);
        category.setName("Salary");
        category.setDescription("Monthly salary");
        category.setType("income");
        return category;
    }

    public static Category buildTransferCategory() {
        Category category = buildCategory();
        category.setId(103);
        category.setName("Bank Transfer");
        category.setDescription("Bank to bank transfer");
        category.setType("transfer");
        return category;
    }

    // -------------------------------------------------------------------------
    // CreateCategoryRequest builders
    // -------------------------------------------------------------------------

    public static CreateCategoryRequest buildCreateRequest() {
        return CreateCategoryRequest.builder()
                .name("Food")
                .description("Food and dining expenses")
                .type("expense")
                .isGlobal(false)
                .icon("food-icon")
                .color("#FF5733")
                .build();
    }

    public static CreateCategoryRequest buildCreateRequestGlobal() {
        return CreateCategoryRequest.builder()
                .name("Salary")
                .description("Monthly salary income")
                .type("income")
                .isGlobal(true)
                .icon("salary-icon")
                .color("#33FF57")
                .build();
    }

    public static CreateCategoryRequest buildCreateRequestMinimal() {
        return CreateCategoryRequest.builder()
                .name("Transport")
                .type("expense")
                .build();
    }

    public static CreateCategoryRequest buildCreateRequestInvalidBlankName() {
        return CreateCategoryRequest.builder()
                .name("")
                .type("expense")
                .build();
    }

    public static CreateCategoryRequest buildCreateRequestInvalidType() {
        return CreateCategoryRequest.builder()
                .name("MyCategory")
                .type("invalid_type")
                .build();
    }

    public static CreateCategoryRequest buildCreateRequestNullName() {
        return CreateCategoryRequest.builder()
                .name(null)
                .type("expense")
                .build();
    }

    // -------------------------------------------------------------------------
    // UpdateCategoryRequest builders
    // -------------------------------------------------------------------------

    public static UpdateCategoryRequest buildUpdateRequest() {
        return UpdateCategoryRequest.builder()
                .name("Food & Dining")
                .description("Updated food and dining expenses")
                .type("expense")
                .icon("dining-icon")
                .color("#FF6644")
                .build();
    }

    public static UpdateCategoryRequest buildUpdateRequestNameOnly() {
        return UpdateCategoryRequest.builder()
                .name("Groceries")
                .build();
    }

    public static UpdateCategoryRequest buildUpdateRequestDescriptionOnly() {
        return UpdateCategoryRequest.builder()
                .description("Updated description only")
                .build();
    }

    // -------------------------------------------------------------------------
    // CategoryDTO builders
    // -------------------------------------------------------------------------

    public static CategoryDTO buildCategoryDTO() {
        return CategoryDTO.builder()
                .id(101)
                .name("Food")
                .description("Food and dining expenses")
                .type("expense")
                .isGlobal(false)
                .icon("food-icon")
                .color("#FF5733")
                .userId(TEST_USER_ID)
                .build();
    }

    public static CategoryDTO buildGlobalCategoryDTO() {
        return CategoryDTO.builder()
                .id(1)
                .name("Salary")
                .description("Monthly salary income")
                .type("income")
                .isGlobal(true)
                .icon("salary-icon")
                .color("#33FF57")
                .userId(GLOBAL_USER_ID)
                .build();
    }

    // -------------------------------------------------------------------------
    // ExpenseDTO builders
    // -------------------------------------------------------------------------

    public static ExpenseDTO buildExpenseDTO() {
        ExpenseDTO.ExpenseDetailsDTO details = ExpenseDTO.ExpenseDetailsDTO.builder()
                .amount(500.0)
                .comments("Lunch at restaurant")
                .build();
        ExpenseDTO dto = new ExpenseDTO();
        dto.setId(5001);
        dto.setExpense(details);
        dto.setCategoryId(101);
        dto.setUserId(TEST_USER_ID);
        return dto;
    }
}
