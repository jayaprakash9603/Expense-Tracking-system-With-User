package com.jaya.util.mapper;

import com.jaya.common.dto.CategoryDTO;
import com.jaya.common.dto.request.CreateCategoryRequest;
import com.jaya.common.dto.request.UpdateCategoryRequest;
import com.jaya.models.Category;
import com.jaya.testutil.CategoryTestDataFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CategoryMapper Unit Tests")
class CategoryMapperTest {

    private CategoryMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new CategoryMapper();
    }

    // =========================================================================
    // toEntity(CreateCategoryRequest, userId)
    // =========================================================================

    @Nested
    @DisplayName("toEntity from CreateCategoryRequest")
    class ToEntityFromCreate {

        @Test
        @DisplayName("maps all fields for user category")
        void mapsUserCategory() {
            CreateCategoryRequest request = CategoryTestDataFactory.buildCreateRequest();

            Category result = mapper.toEntity(request, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.getName()).isEqualTo("Food");
            assertThat(result.getDescription()).isEqualTo("Food and dining expenses");
            assertThat(result.getType()).isEqualTo("expense");
            assertThat(result.isGlobal()).isFalse();
            assertThat(result.getIcon()).isEqualTo("food-icon");
            assertThat(result.getColor()).isEqualTo("#FF5733");
            assertThat(result.getUserId()).isEqualTo(CategoryTestDataFactory.TEST_USER_ID);
        }

        @Test
        @DisplayName("sets userId=0 for global category")
        void setsGlobalUserId() {
            CreateCategoryRequest request = CategoryTestDataFactory.buildCreateRequestGlobal();

            Category result = mapper.toEntity(request, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.isGlobal()).isTrue();
            assertThat(result.getUserId()).isEqualTo(0);
        }

        @Test
        @DisplayName("initialises empty collections")
        void initialisesCollections() {
            CreateCategoryRequest request = CategoryTestDataFactory.buildCreateRequest();

            Category result = mapper.toEntity(request, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.getExpenseIds()).isNotNull().isEmpty();
            assertThat(result.getUserIds()).isNotNull().isEmpty();
            assertThat(result.getEditUserIds()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("defaults icon and color when null in request")
        void defaultsIconAndColor() {
            CreateCategoryRequest request = CategoryTestDataFactory.buildCreateRequestMinimal();

            Category result = mapper.toEntity(request, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.getIcon()).isNotNull();
            assertThat(result.getColor()).isNotNull();
        }
    }

    // =========================================================================
    // toEntityForUpdate(UpdateCategoryRequest, userId)
    // =========================================================================

    @Nested
    @DisplayName("toEntityForUpdate")
    class ToEntityForUpdate {

        @Test
        @DisplayName("maps all provided fields")
        void mapsAllFields() {
            UpdateCategoryRequest request = CategoryTestDataFactory.buildUpdateRequest();

            Category result = mapper.toEntityForUpdate(request, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.getName()).isEqualTo("Food & Dining");
            assertThat(result.getDescription()).isEqualTo("Updated food and dining expenses");
            assertThat(result.getType()).isEqualTo("expense");
            assertThat(result.getIcon()).isEqualTo("dining-icon");
            assertThat(result.getColor()).isEqualTo("#FF6644");
        }

        @Test
        @DisplayName("null fields remain null (partial update)")
        void partialUpdate_fieldsNullRetained() {
            UpdateCategoryRequest request = CategoryTestDataFactory.buildUpdateRequestNameOnly();

            Category result = mapper.toEntityForUpdate(request, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.getName()).isEqualTo("Groceries");
            assertThat(result.getDescription()).isNull();
            assertThat(result.getType()).isNull();
        }
    }

    // =========================================================================
    // applyUpdate
    // =========================================================================

    @Nested
    @DisplayName("applyUpdate")
    class ApplyUpdateTests {

        @Test
        @DisplayName("updates only non-null fields on existing category")
        void updatesNonNullFields() {
            Category existing = CategoryTestDataFactory.buildCategory();
            UpdateCategoryRequest request = UpdateCategoryRequest.builder()
                    .name("New Name")
                    .build();

            mapper.applyUpdate(existing, request);

            assertThat(existing.getName()).isEqualTo("New Name");
            assertThat(existing.getDescription()).isEqualTo("Food and dining expenses"); // unchanged
        }

        @Test
        @DisplayName("does not overwrite existing fields when request fields are null")
        void doesNotOverwriteWithNull() {
            Category existing = CategoryTestDataFactory.buildCategory();
            String originalName = existing.getName();
            UpdateCategoryRequest request = CategoryTestDataFactory.buildUpdateRequestDescriptionOnly();

            mapper.applyUpdate(existing, request);

            assertThat(existing.getName()).isEqualTo(originalName);
            assertThat(existing.getDescription()).isEqualTo("Updated description only");
        }
    }

    // =========================================================================
    // toResponse(Category)
    // =========================================================================

    @Nested
    @DisplayName("toResponse")
    class ToResponseTests {

        @Test
        @DisplayName("maps all category fields to DTO")
        void mapsFields() {
            Category category = CategoryTestDataFactory.buildCategory();

            CategoryDTO result = mapper.toResponse(category);

            assertThat(result.getId()).isEqualTo(101);
            assertThat(result.getName()).isEqualTo("Food");
            assertThat(result.getType()).isEqualTo("expense");
            assertThat(result.isGlobal()).isFalse();
            assertThat(result.getUserId()).isEqualTo(CategoryTestDataFactory.TEST_USER_ID);
        }

        @Test
        @DisplayName("calculates expenseCount when userId provided and user has expenses")
        void calculatesExpenseCount() {
            Category category = CategoryTestDataFactory.buildCategory();
            category.setExpenseIds(new HashMap<>());
            category.getExpenseIds().put(CategoryTestDataFactory.TEST_USER_ID, new HashSet<>(Set.of(1, 2, 3)));

            CategoryDTO result = mapper.toResponse(category, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.getExpenseCount()).isEqualTo(3);
        }

        @Test
        @DisplayName("expenseCount zero when user has no expenses in category")
        void expenseCountZero_whenUserHasNoExpenses() {
            Category category = CategoryTestDataFactory.buildCategory();
            category.setExpenseIds(new HashMap<>());

            CategoryDTO result = mapper.toResponse(category, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.getExpenseCount()).isEqualTo(0);
        }
    }

    // =========================================================================
    // toResponseList
    // =========================================================================

    @Nested
    @DisplayName("toResponseList")
    class ToResponseListTests {

        @Test
        @DisplayName("maps list of categories to DTOs")
        void mapsList() {
            List<Category> categories = List.of(
                    CategoryTestDataFactory.buildCategory(),
                    CategoryTestDataFactory.buildIncomeCategory());

            List<CategoryDTO> result = mapper.toResponseList(categories);

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("empty list returns empty DTO list")
        void emptyList_returnsEmpty() {
            List<CategoryDTO> result = mapper.toResponseList(List.of());

            assertThat(result).isEmpty();
        }
    }

    // =========================================================================
    // toSearchDTO
    // =========================================================================

    @Nested
    @DisplayName("toSearchDTO")
    class ToSearchDTOTests {

        @Test
        @DisplayName("maps to DTO without collection fields")
        void mapsWithoutCollections() {
            Category category = CategoryTestDataFactory.buildCategory();
            category.setExpenseIds(new HashMap<>());
            category.setUserIds(new HashSet<>(Set.of(1, 2)));

            CategoryDTO result = mapper.toSearchDTO(category);

            assertThat(result.getId()).isEqualTo(101);
            assertThat(result.getName()).isEqualTo("Food");
            assertThat(result.getExpenseIds() == null || result.getExpenseIds().isEmpty()).isTrue();
            assertThat(result.getUserIds() == null || result.getUserIds().isEmpty()).isTrue();
        }
    }
}
