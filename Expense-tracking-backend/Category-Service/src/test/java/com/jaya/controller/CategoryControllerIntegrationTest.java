package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.dto.request.CreateCategoryRequest;
import com.jaya.common.dto.request.UpdateCategoryRequest;
import com.jaya.common.exception.AccessDeniedException;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.kafka.service.FriendActivityService;
import com.jaya.kafka.service.UnifiedActivityService;
import com.jaya.models.Category;
import com.jaya.service.CategoryAsyncService;
import com.jaya.service.CategoryEventProducer;
import com.jaya.service.CategoryService;
import com.jaya.service.FriendShipService;
import com.jaya.testutil.CategoryTestDataFactory;
import com.jaya.util.CategoryServiceHelper;
import com.jaya.util.mapper.CategoryMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static com.jaya.testutil.CategoryTestDataFactory.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CategoryControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Primary controller dependencies — mocked to isolate controller logic
    @MockBean
    private CategoryService categoryService;

    @MockBean
    private IUserServiceClient IUserServiceClient;

    @MockBean
    private FriendShipService friendshipService;

    @MockBean
    private UnifiedActivityService unifiedActivityService;

    @MockBean
    private CategoryMapper categoryMapper;

    // Additional Spring beans that would fail context init without mocks
    // (Kafka excluded, Eureka excluded — these beans use unavailable infrastructure)
    @MockBean
    private CategoryAsyncService categoryAsyncService;

    @MockBean
    private CategoryServiceHelper categoryServiceHelper;

    @MockBean
    private CategoryEventProducer categoryEventProducer;

    @MockBean
    private FriendActivityService friendActivityService;

    @MockBean
    private JavaMailSender javaMailSender;

    private UserDTO reqUser;

    @BeforeEach
    void setUp() {
        reqUser = CategoryTestDataFactory.buildUser();
    }

    // =========================================================================
    // POST /api/categories
    // =========================================================================

    @Nested
    @DisplayName("POST /api/categories - Create Category")
    class CreateCategoryTests {

        @Test
        @DisplayName("should create category for self and return 201")
        void shouldCreateCategoryForSelf() throws Exception {
            CreateCategoryRequest request = buildCreateRequest();
            Category created = buildCategory();
            CategoryDTO dto = buildCategoryDTO();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryMapper.toEntity(any(CreateCategoryRequest.class), eq(TEST_USER_ID))).thenReturn(created);
            when(categoryService.create(any(Category.class), eq(TEST_USER_ID))).thenReturn(created);
            when(categoryMapper.toResponse(created)).thenReturn(dto);

            mockMvc.perform(post("/api/categories")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data.id").value(101))
                    .andExpect(jsonPath("$.data.name").value("Food"));
        }

        @Test
        @DisplayName("should create category for target user when permission granted")
        void shouldCreateCategoryForTargetUser() throws Exception {
            CreateCategoryRequest request = buildCreateRequest();
            UserDTO targetUser = buildTargetUser();
            Category created = buildCategory();
            CategoryDTO dto = buildCategoryDTO();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(IUserServiceClient.getUserById(TARGET_USER_ID)).thenReturn(targetUser);
            when(friendshipService.canUserModifyExpenses(TARGET_USER_ID, TEST_USER_ID)).thenReturn(true);
            when(categoryMapper.toEntity(any(CreateCategoryRequest.class), eq(TARGET_USER_ID))).thenReturn(created);
            when(categoryService.create(any(Category.class), eq(TARGET_USER_ID))).thenReturn(created);
            when(categoryMapper.toResponse(created)).thenReturn(dto);

            mockMvc.perform(post("/api/categories")
                            .param("targetId", String.valueOf(TARGET_USER_ID))
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("should return 400 when category name is blank")
        void shouldReturn400WhenNameIsBlank() throws Exception {
            CreateCategoryRequest request = buildCreateRequestInvalidBlankName();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);

            mockMvc.perform(post("/api/categories")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 400 when category name is null")
        void shouldReturn400WhenNameIsNull() throws Exception {
            CreateCategoryRequest request = buildCreateRequestNullName();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);

            mockMvc.perform(post("/api/categories")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should return 401 when JWT resolves to null user")
        void shouldReturnErrorWhenJwtResolvesToNull() throws Exception {
            CreateCategoryRequest request = buildCreateRequest();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(null);

            mockMvc.perform(post("/api/categories")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("should return 403 when targetUser modify permission denied")
        void shouldReturnErrorWhenModifyPermissionDenied() throws Exception {
            CreateCategoryRequest request = buildCreateRequest();
            UserDTO targetUser = buildTargetUser();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(IUserServiceClient.getUserById(TARGET_USER_ID)).thenReturn(targetUser);
            when(friendshipService.canUserModifyExpenses(TARGET_USER_ID, TEST_USER_ID)).thenReturn(false);

            mockMvc.perform(post("/api/categories")
                            .param("targetId", String.valueOf(TARGET_USER_ID))
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("should return 404 when target user not found")
        void shouldReturnErrorWhenTargetUserNotFound() throws Exception {
            CreateCategoryRequest request = buildCreateRequest();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(IUserServiceClient.getUserById(TARGET_USER_ID)).thenReturn(null);

            mockMvc.perform(post("/api/categories")
                            .param("targetId", String.valueOf(TARGET_USER_ID))
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound());
        }
    }

    // =========================================================================
    // GET /api/categories/{id}
    // =========================================================================

    @Nested
    @DisplayName("GET /api/categories/{id} - Get Category By ID")
    class GetCategoryByIdTests {

        @Test
        @DisplayName("should return category by ID with status 200")
        void shouldGetCategoryById() throws Exception {
            Category category = buildCategory();
            CategoryDTO dto = buildCategoryDTO();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getById(101, TEST_USER_ID)).thenReturn(category);
            when(categoryMapper.toResponse(category)).thenReturn(dto);

            mockMvc.perform(get("/api/categories/101")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id").value(101))
                    .andExpect(jsonPath("$.data.name").value("Food"));
        }

        @Test
        @DisplayName("should return error when category not found")
        void shouldReturnErrorWhenCategoryNotFound() throws Exception {
            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getById(999, TEST_USER_ID)).thenThrow(new RuntimeException("Category not found"));

            mockMvc.perform(get("/api/categories/999")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().is5xxServerError());
        }

        @Test
        @DisplayName("should return category for target user with read access")
        void shouldGetCategoryForTargetUser() throws Exception {
            UserDTO targetUser = buildTargetUser();
            Category category = buildCategory();
            CategoryDTO dto = buildCategoryDTO();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(IUserServiceClient.getUserById(TARGET_USER_ID)).thenReturn(targetUser);
            when(friendshipService.canUserAccessExpenses(TARGET_USER_ID, TEST_USER_ID)).thenReturn(true);
            when(categoryService.getById(101, TARGET_USER_ID)).thenReturn(category);
            when(categoryMapper.toResponse(category)).thenReturn(dto);

            mockMvc.perform(get("/api/categories/101")
                            .param("targetId", String.valueOf(TARGET_USER_ID))
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk());
        }
    }

    // =========================================================================
    // GET /api/categories/name/{name}
    // =========================================================================

    @Nested
    @DisplayName("GET /api/categories/name/{name} - Get Category By Name")
    class GetCategoryByNameTests {

        @Test
        @DisplayName("should return categories matching name with status 200")
        void shouldGetCategoryByName() throws Exception {
            List<Category> categories = List.of(buildCategory());
            List<CategoryDTO> dtos = List.of(buildCategoryDTO());

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getByName("Food", TEST_USER_ID)).thenReturn(categories);
            when(categoryMapper.toResponseList(categories)).thenReturn(dtos);

            mockMvc.perform(get("/api/categories/name/Food")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(1));
        }

        @Test
        @DisplayName("should return empty list when no categories match name")
        void shouldReturnEmptyListWhenNoCategoryMatchesName() throws Exception {
            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getByName("Unknown", TEST_USER_ID)).thenReturn(List.of());
            when(categoryMapper.toResponseList(List.of())).thenReturn(List.of());

            mockMvc.perform(get("/api/categories/name/Unknown")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk());
        }
    }

    // =========================================================================
    // GET /api/categories
    // =========================================================================

    @Nested
    @DisplayName("GET /api/categories - Get All Categories")
    class GetAllCategoriesTests {

        @Test
        @DisplayName("should return all categories for user with status 200")
        void shouldGetAllCategories() throws Exception {
            List<Category> categories = List.of(buildCategory(), buildGlobalCategory());
            List<CategoryDTO> dtos = List.of(buildCategoryDTO(), buildGlobalCategoryDTO());

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getAll(TEST_USER_ID)).thenReturn(categories);
            when(categoryMapper.toResponseList(categories)).thenReturn(dtos);

            mockMvc.perform(get("/api/categories")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2));
        }

        @Test
        @DisplayName("should return 200 with empty message when user has no categories")
        void shouldReturnEmptyListWhenNoCategories() throws Exception {
            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getAll(TEST_USER_ID)).thenReturn(List.of());

            mockMvc.perform(get("/api/categories")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isOk());
        }
    }

    // =========================================================================
    // PUT /api/categories/{id}
    // =========================================================================

    @Nested
    @DisplayName("PUT /api/categories/{id} - Update Category")
    class UpdateCategoryTests {

        @Test
        @DisplayName("should update category and return 200")
        void shouldUpdateCategory() throws Exception {
            UpdateCategoryRequest request = buildUpdateRequest();
            Category existing = buildCategory();
            Category updated = buildCategory();
            CategoryDTO dto = buildCategoryDTO();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getById(101, TEST_USER_ID)).thenReturn(existing);
            when(categoryMapper.toEntityForUpdate(any(UpdateCategoryRequest.class), eq(TEST_USER_ID))).thenReturn(updated);
            when(categoryService.update(eq(101), any(Category.class), eq(reqUser))).thenReturn(updated);
            when(categoryMapper.toResponse(updated)).thenReturn(dto);

            mockMvc.perform(put("/api/categories/101")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data.id").value(101));
        }

        @Test
        @DisplayName("should return error when category to update is not found")
        void shouldReturnErrorWhenCategoryNotFound() throws Exception {
            UpdateCategoryRequest request = buildUpdateRequest();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getById(999, TEST_USER_ID)).thenThrow(new RuntimeException("not found"));

            mockMvc.perform(put("/api/categories/999")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().is5xxServerError());
        }

        @Test
        @DisplayName("should update category for target user with write permission")
        void shouldUpdateCategoryForTargetUser() throws Exception {
            UpdateCategoryRequest request = buildUpdateRequest();
            UserDTO targetUser = buildTargetUser();
            Category existing = buildCategory();
            Category updated = buildCategory();
            CategoryDTO dto = buildCategoryDTO();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(IUserServiceClient.getUserById(TARGET_USER_ID)).thenReturn(targetUser);
            when(friendshipService.canUserModifyExpenses(TARGET_USER_ID, TEST_USER_ID)).thenReturn(true);
            when(categoryService.getById(101, TARGET_USER_ID)).thenReturn(existing);
            when(categoryMapper.toEntityForUpdate(any(UpdateCategoryRequest.class), eq(TARGET_USER_ID))).thenReturn(updated);
            when(categoryService.update(eq(101), any(Category.class), eq(targetUser))).thenReturn(updated);
            when(categoryMapper.toResponse(updated)).thenReturn(dto);

            mockMvc.perform(put("/api/categories/101")
                            .param("targetId", String.valueOf(TARGET_USER_ID))
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }
    }

    // =========================================================================
    // DELETE /api/categories/{id}
    // =========================================================================

    @Nested
    @DisplayName("DELETE /api/categories/{id} - Delete Category")
    class DeleteCategoryTests {

        @Test
        @DisplayName("should delete category and return 204")
        void shouldDeleteCategory() throws Exception {
            Category category = buildCategory();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getById(101, TEST_USER_ID)).thenReturn(category);
            when(categoryService.delete(101, TEST_USER_ID)).thenReturn("Category deleted successfully");

            mockMvc.perform(delete("/api/categories/101")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("should return error when category to delete is not found")
        void shouldReturnErrorWhenDeleteNotFound() throws Exception {
            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.getById(999, TEST_USER_ID)).thenThrow(new RuntimeException("not found"));

            mockMvc.perform(delete("/api/categories/999")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().is5xxServerError());
        }
    }

    // =========================================================================
    // POST /api/categories/bulk
    // =========================================================================

    @Nested
    @DisplayName("POST /api/categories/bulk - Create Multiple Categories")
    class CreateMultipleCategoriesTests {

        @Test
        @DisplayName("should create multiple categories and return 201")
        void shouldCreateMultipleCategories() throws Exception {
            List<CreateCategoryRequest> requests = List.of(buildCreateRequest(), buildCreateRequestMinimal());
            List<Category> created = List.of(buildCategory(), buildIncomeCategory());
            List<CategoryDTO> dtos = List.of(buildCategoryDTO(), buildGlobalCategoryDTO());

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryMapper.toEntity(any(CreateCategoryRequest.class), eq(TEST_USER_ID))).thenReturn(buildCategory());
            when(categoryService.createMultiple(anyList(), eq(TEST_USER_ID))).thenReturn(created);
            when(categoryMapper.toResponseList(created)).thenReturn(dtos);

            mockMvc.perform(post("/api/categories/bulk")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requests)))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2));
        }

        @Test
        @DisplayName("should return 201 with empty list when bulk request is empty")
        void shouldReturn201WhenBulkRequestIsEmpty() throws Exception {
            List<CreateCategoryRequest> requests = List.of();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.createMultiple(anyList(), eq(TEST_USER_ID))).thenReturn(List.of());
            when(categoryMapper.toResponseList(List.of())).thenReturn(List.of());

            mockMvc.perform(post("/api/categories/bulk")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(requests)))
                    .andExpect(status().isCreated());
        }
    }

    // =========================================================================
    // PUT /api/categories/bulk
    // =========================================================================

    @Nested
    @DisplayName("PUT /api/categories/bulk - Update Multiple Categories")
    class UpdateMultipleCategoriesTests {

        @Test
        @DisplayName("should update multiple categories and return 200")
        void shouldUpdateMultipleCategories() throws Exception {
            List<Category> categories = List.of(buildCategory(), buildIncomeCategory());
            List<CategoryDTO> dtos = List.of(buildCategoryDTO(), buildGlobalCategoryDTO());

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            when(categoryService.updateMultiple(anyList(), eq(reqUser))).thenReturn(categories);
            when(categoryMapper.toResponseList(categories)).thenReturn(dtos);

            mockMvc.perform(put("/api/categories/bulk")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(categories)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.data").isArray())
                    .andExpect(jsonPath("$.data.length()").value(2));
        }
    }

    // =========================================================================
    // DELETE /api/categories/bulk
    // =========================================================================

    @Nested
    @DisplayName("DELETE /api/categories/bulk - Delete Multiple Categories")
    class DeleteMultipleCategoriesTests {

        @Test
        @DisplayName("should delete multiple categories and return 204")
        void shouldDeleteMultipleCategories() throws Exception {
            List<Integer> ids = List.of(101, 102);

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            doNothing().when(categoryService).deleteMultiple(ids, TEST_USER_ID);

            mockMvc.perform(delete("/api/categories/bulk")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(ids)))
                    .andExpect(status().isNoContent());
        }
    }

    // =========================================================================
    // PATCH /api/categories/admin/global/{id}
    // =========================================================================

    @Nested
    @DisplayName("PATCH /api/categories/admin/global/{id} - Admin Update Global Category")
    class AdminUpdateGlobalCategoryTests {

        @Test
        @DisplayName("should allow admin to update global category and return 200")
        void shouldAdminUpdateGlobalCategory() throws Exception {
            UpdateCategoryRequest request = buildUpdateRequest();
            UserDTO adminUser = buildAdminUser();
            Category globalCategory = buildGlobalCategory();
            Category updated = buildGlobalCategory();
            CategoryDTO dto = buildGlobalCategoryDTO();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(adminUser);
            when(categoryService.getById(1, adminUser.getId())).thenReturn(globalCategory);
            when(categoryMapper.toEntityForUpdate(any(UpdateCategoryRequest.class), eq(adminUser.getId()))).thenReturn(updated);
            when(categoryService.adminUpdateGlobalCategory(eq(1), any(Category.class), eq(adminUser))).thenReturn(updated);
            when(categoryMapper.toResponse(updated)).thenReturn(dto);

            mockMvc.perform(patch("/api/categories/admin/global/1")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk());
        }

        @Test
        @DisplayName("should return 403 when non-admin tries to update global category")
        void shouldReturnErrorForNonAdmin() throws Exception {
            UpdateCategoryRequest request = buildUpdateRequest();
            Category globalCategory = buildGlobalCategory();

            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser); // non-admin user
            when(categoryService.getById(1, TEST_USER_ID)).thenReturn(globalCategory);
            when(categoryMapper.toEntityForUpdate(any(UpdateCategoryRequest.class), eq(TEST_USER_ID))).thenReturn(globalCategory);
            when(categoryService.adminUpdateGlobalCategory(eq(1), any(Category.class), eq(reqUser)))
                    .thenThrow(new AccessDeniedException("Admin role required"));

            mockMvc.perform(patch("/api/categories/admin/global/1")
                            .header("Authorization", TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden());
        }
    }

    // =========================================================================
    // DELETE /api/categories/all/global
    // =========================================================================

    @Nested
    @DisplayName("DELETE /api/categories/all/global - Delete All Global Categories")
    class DeleteAllGlobalCategoriesTests {

        @Test
        @DisplayName("should delete all global category associations and return 204")
        void shouldDeleteAllGlobalCategories() throws Exception {
            when(IUserServiceClient.getUserProfile(TEST_JWT)).thenReturn(reqUser);
            doNothing().when(categoryService).deleteAllGlobal(TEST_USER_ID, true);

            mockMvc.perform(delete("/api/categories/all/global")
                            .param("global", "true")
                            .header("Authorization", TEST_JWT))
                    .andExpect(status().isNoContent());
        }
    }
}
