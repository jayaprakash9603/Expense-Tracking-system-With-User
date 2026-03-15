package com.jaya.service;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.exception.AccessDeniedException;
import com.jaya.common.exception.BusinessException;
import com.jaya.common.exception.ConflictException;
import com.jaya.common.exception.ResourceNotFoundException;
import com.jaya.models.Category;
import com.jaya.repository.CategoryRepository;
import com.jaya.testutil.CategoryTestDataFactory;
import com.jaya.util.CategoryServiceHelper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("CategoryService Unit Tests")
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ExpenseClient expenseService;

    @Mock
    private CategoryServiceHelper helper;

    @Mock
    private CategoryAsyncService categoryAsyncService;

    @InjectMocks
    private CategoryService categoryService;

    private UserDTO testUser;

    @BeforeEach
    void setUp() {
        testUser = CategoryTestDataFactory.buildUser();
    }

    // =========================================================================
    // create
    // =========================================================================

    @Nested
    @DisplayName("create")
    class Create {

        @Test
        @DisplayName("creates and saves a valid user category")
        void createsUserCategory() {
            Category input = CategoryTestDataFactory.buildCategoryWithoutId();
            Category saved = CategoryTestDataFactory.buildCategory();

            when(helper.validateUser(CategoryTestDataFactory.TEST_USER_ID)).thenReturn(testUser);
            when(categoryRepository.findByNameAndTypeAndUserId(anyString(), anyString(), anyInt()))
                    .thenReturn(Collections.emptyList());
            when(categoryRepository.save(any(Category.class))).thenReturn(saved);

            Category result = categoryService.create(input, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result).isNotNull();
            assertThat(result.getName()).isEqualTo("Food");
            verify(categoryRepository).save(any(Category.class));
        }

        @Test
        @DisplayName("sets userId=0 when category is global")
        void setsGlobalUserId() {
            Category input = CategoryTestDataFactory.buildGlobalCategory();
            input.setId(null);
            Category saved = CategoryTestDataFactory.buildGlobalCategory();

            when(helper.validateUser(CategoryTestDataFactory.TEST_USER_ID)).thenReturn(testUser);
            when(categoryRepository.findGlobalByNameAndType(anyString(), anyString()))
                    .thenReturn(Collections.emptyList());
            when(categoryRepository.save(any(Category.class))).thenReturn(saved);

            Category result = categoryService.create(input, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.getUserId()).isEqualTo(0);
        }

        @Test
        @DisplayName("throws ConflictException when duplicate user category exists")
        void throwsConflict_whenDuplicate() {
            Category input = CategoryTestDataFactory.buildCategoryWithoutId();
            Category existing = CategoryTestDataFactory.buildCategory();

            when(helper.validateUser(CategoryTestDataFactory.TEST_USER_ID)).thenReturn(testUser);
            when(categoryRepository.findByNameAndTypeAndUserId(anyString(), anyString(), anyInt()))
                    .thenReturn(List.of(existing));

            assertThatThrownBy(() -> categoryService.create(input, CategoryTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(ConflictException.class);

            verify(categoryRepository, never()).save(any());
        }

        @Test
        @DisplayName("throws ConflictException when duplicate global category exists")
        void throwsConflict_whenDuplicateGlobal() {
            Category input = CategoryTestDataFactory.buildGlobalCategory();
            input.setId(null);
            Category existing = CategoryTestDataFactory.buildGlobalCategory();

            when(helper.validateUser(any())).thenReturn(testUser);
            when(categoryRepository.findGlobalByNameAndType(anyString(), anyString()))
                    .thenReturn(List.of(existing));

            assertThatThrownBy(() -> categoryService.create(input, CategoryTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(ConflictException.class);
        }

        @Test
        @DisplayName("does not propagate exception from async finalize")
        void doesNotPropagateAsyncException() {
            Category input = CategoryTestDataFactory.buildCategoryWithoutId();
            Category saved = CategoryTestDataFactory.buildCategory();

            when(helper.validateUser(CategoryTestDataFactory.TEST_USER_ID)).thenReturn(testUser);
            when(categoryRepository.findByNameAndTypeAndUserId(anyString(), anyString(), anyInt()))
                    .thenReturn(Collections.emptyList());
            when(categoryRepository.save(any(Category.class))).thenReturn(saved);
            doThrow(new RuntimeException("async failure"))
                    .when(categoryAsyncService).finalizeCategoryCreateAsync(any(), any(), any());

            Category result = categoryService.create(input, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result).isNotNull(); // no exception propagated
        }
    }

    // =========================================================================
    // getById
    // =========================================================================

    @Nested
    @DisplayName("getById")
    class GetById {

        @Test
        @DisplayName("returns category when user is the owner")
        void returnsCategory_whenOwner() {
            Category category = CategoryTestDataFactory.buildCategory();

            when(categoryRepository.findById(101)).thenReturn(Optional.of(category));

            Category result = categoryService.getById(101, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.getId()).isEqualTo(101);
        }

        @Test
        @DisplayName("returns global category when user is not in userIds or editUserIds")
        void returnsGlobalCategory_whenUserNotInLists() {
            Category global = CategoryTestDataFactory.buildGlobalCategory();
            global.setUserIds(new HashSet<>());
            global.setEditUserIds(new HashSet<>());

            when(categoryRepository.findById(1)).thenReturn(Optional.of(global));

            Category result = categoryService.getById(1, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result.isGlobal()).isTrue();
        }

        @Test
        @DisplayName("throws AccessDeniedException when user is in global category's userIds")
        void throwsAccessDenied_whenUserInUserIds() {
            Category global = CategoryTestDataFactory.buildGlobalCategory();
            global.setUserIds(new HashSet<>(Set.of(CategoryTestDataFactory.TEST_USER_ID)));
            global.setEditUserIds(new HashSet<>());

            when(categoryRepository.findById(1)).thenReturn(Optional.of(global));

            assertThatThrownBy(() -> categoryService.getById(1, CategoryTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("throws AccessDeniedException when non-owner accesses user category")
        void throwsAccessDenied_whenNotOwner() {
            Category category = CategoryTestDataFactory.buildCategory();

            when(categoryRepository.findById(101)).thenReturn(Optional.of(category));

            assertThatThrownBy(() -> categoryService.getById(101, 999))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when category does not exist")
        void throwsNotFound_whenMissing() {
            when(categoryRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> categoryService.getById(999, CategoryTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // =========================================================================
    // getAll
    // =========================================================================

    @Nested
    @DisplayName("getAll")
    class GetAll {

        @Test
        @DisplayName("returns user categories merged with accessible global categories")
        void returnsMergedList() {
            Category userCat = CategoryTestDataFactory.buildCategory();
            Category globalCat = CategoryTestDataFactory.buildGlobalCategory();
            globalCat.setUserIds(new HashSet<>());
            globalCat.setEditUserIds(new HashSet<>());

            when(helper.validateUser(CategoryTestDataFactory.TEST_USER_ID)).thenReturn(testUser);
            when(categoryRepository.findAllWithDetailsByUserId(CategoryTestDataFactory.TEST_USER_ID))
                    .thenReturn(List.of(userCat));
            when(categoryRepository.findAllGlobalWithDetails()).thenReturn(List.of(globalCat));

            List<Category> result = categoryService.getAll(CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("excludes global categories the user has deleted (in userIds)")
        void excludesGlobalCategoriesUserDeleted() {
            Category userCat = CategoryTestDataFactory.buildCategory();
            Category globalCat = CategoryTestDataFactory.buildGlobalCategory();
            globalCat.setUserIds(new HashSet<>(Set.of(CategoryTestDataFactory.TEST_USER_ID)));
            globalCat.setEditUserIds(new HashSet<>());

            when(helper.validateUser(CategoryTestDataFactory.TEST_USER_ID)).thenReturn(testUser);
            when(categoryRepository.findAllWithDetailsByUserId(CategoryTestDataFactory.TEST_USER_ID))
                    .thenReturn(List.of(userCat));
            when(categoryRepository.findAllGlobalWithDetails()).thenReturn(List.of(globalCat));

            List<Category> result = categoryService.getAll(CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).isGlobal()).isFalse();
        }

        @Test
        @DisplayName("returns empty list when user has no categories and all globals are excluded")
        void returnsEmpty_whenNoneAccessible() {
            Category globalCat = CategoryTestDataFactory.buildGlobalCategory();
            globalCat.setUserIds(new HashSet<>(Set.of(CategoryTestDataFactory.TEST_USER_ID)));
            globalCat.setEditUserIds(new HashSet<>());

            when(helper.validateUser(CategoryTestDataFactory.TEST_USER_ID)).thenReturn(testUser);
            when(categoryRepository.findAllWithDetailsByUserId(CategoryTestDataFactory.TEST_USER_ID))
                    .thenReturn(Collections.emptyList());
            when(categoryRepository.findAllGlobalWithDetails()).thenReturn(List.of(globalCat));

            List<Category> result = categoryService.getAll(CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }
    }

    // =========================================================================
    // update
    // =========================================================================

    @Nested
    @DisplayName("update")
    class Update {

        @Test
        @DisplayName("updates a user-owned category")
        void updatesUserCategory() {
            Category existing = CategoryTestDataFactory.buildCategory();
            existing.setExpenseIds(new HashMap<>());
            Category updateCategory = new Category();
            updateCategory.setName("Food & Dining");
            updateCategory.setDescription("Updated");
            updateCategory.setExpenseIds(null);

            when(categoryRepository.findById(101)).thenReturn(Optional.of(existing));
            when(categoryRepository.findByNameAndTypeAndUserIdExcluding(anyString(), anyString(), anyInt(), anyInt()))
                    .thenReturn(Collections.emptyList());
            when(categoryRepository.save(any(Category.class))).thenReturn(existing);

            Category result = categoryService.update(101, updateCategory, testUser);

            assertThat(result).isNotNull();
            verify(categoryRepository).save(any(Category.class));
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when category not found")
        void throwsNotFound_whenMissing() {
            when(categoryRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() ->
                    categoryService.update(999, new Category(), testUser))
                    .isInstanceOf(ResourceNotFoundException.class);
        }

        @Test
        @DisplayName("throws BusinessException when user has already edited a global category once")
        void throwsBusiness_whenAlreadyEdited() {
            Category global = CategoryTestDataFactory.buildGlobalCategory();
            global.setEditUserIds(new HashSet<>(Set.of(CategoryTestDataFactory.TEST_USER_ID)));

            when(categoryRepository.findById(1)).thenReturn(Optional.of(global));

            assertThatThrownBy(() ->
                    categoryService.update(1, new Category(), testUser))
                    .isInstanceOf(BusinessException.class);
        }
    }

    // =========================================================================
    // adminUpdateGlobalCategory
    // =========================================================================

    @Nested
    @DisplayName("adminUpdateGlobalCategory")
    class AdminUpdateGlobalCategory {

        @Test
        @DisplayName("admin can update global category")
        void adminUpdatesGlobal() {
            UserDTO admin = CategoryTestDataFactory.buildAdminUser();
            Category global = CategoryTestDataFactory.buildGlobalCategory();
            Category updateCategory = new Category();
            updateCategory.setName("Updated Salary");

            when(categoryRepository.findById(1)).thenReturn(Optional.of(global));
            when(categoryRepository.findGlobalByNameAndTypeExcluding(anyString(), anyString(), anyInt()))
                    .thenReturn(Collections.emptyList());
            when(categoryRepository.save(any(Category.class))).thenReturn(global);

            Category result = categoryService.adminUpdateGlobalCategory(1, updateCategory, admin);

            assertThat(result).isNotNull();
        }

        @Test
        @DisplayName("throws AccessDeniedException when user lacks ADMIN role")
        void throwsAccess_whenNotAdmin() {
            UserDTO nonAdmin = CategoryTestDataFactory.buildUser();

            assertThatThrownBy(() ->
                    categoryService.adminUpdateGlobalCategory(1, new Category(), nonAdmin))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("throws AccessDeniedException when admin is not in ADMIN mode")
        void throwsAccess_whenNotInAdminMode() {
            UserDTO admin = CategoryTestDataFactory.buildAdminUser();
            admin.setCurrentMode("USER"); // not in admin mode

            assertThatThrownBy(() ->
                    categoryService.adminUpdateGlobalCategory(1, new Category(), admin))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("throws BusinessException when category is not global")
        void throwsBusiness_whenNotGlobal() {
            UserDTO admin = CategoryTestDataFactory.buildAdminUser();
            Category userCategory = CategoryTestDataFactory.buildCategory();

            when(categoryRepository.findById(101)).thenReturn(Optional.of(userCategory));

            assertThatThrownBy(() ->
                    categoryService.adminUpdateGlobalCategory(101, new Category(), admin))
                    .isInstanceOf(BusinessException.class);
        }
    }

    // =========================================================================
    // delete
    // =========================================================================

    @Nested
    @DisplayName("delete")
    class Delete {

        @Test
        @DisplayName("deletes user-owned category with no expenses")
        void deletesUserCategory_noExpenses() {
            Category category = CategoryTestDataFactory.buildCategory();
            category.setExpenseIds(new HashMap<>());

            when(categoryRepository.findById(101)).thenReturn(Optional.of(category));

            String result = categoryService.delete(101, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result).contains("Deleted");
            verify(categoryRepository).delete(category);
        }

        @Test
        @DisplayName("marks global category deleted for user by adding to userIds")
        void marksGlobalDeleted_forUser() {
            Category global = CategoryTestDataFactory.buildGlobalCategory();
            global.setUserIds(new HashSet<>());
            global.setExpenseIds(new HashMap<>());

            when(categoryRepository.findById(1)).thenReturn(Optional.of(global));
            when(categoryRepository.save(any(Category.class))).thenReturn(global);

            categoryService.delete(1, CategoryTestDataFactory.TEST_USER_ID);

            assertThat(global.getUserIds()).contains(CategoryTestDataFactory.TEST_USER_ID);
            verify(categoryRepository, never()).delete(any());
        }

        @Test
        @DisplayName("throws AccessDeniedException when non-owner deletes user category")
        void throwsAccess_whenNotOwner() {
            Category category = CategoryTestDataFactory.buildCategory();
            category.setExpenseIds(null);

            when(categoryRepository.findById(101)).thenReturn(Optional.of(category));

            assertThatThrownBy(() -> categoryService.delete(101, 999))
                    .isInstanceOf(AccessDeniedException.class);
        }

        @Test
        @DisplayName("throws ResourceNotFoundException when category not found")
        void throwsNotFound() {
            when(categoryRepository.findById(999)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> categoryService.delete(999, CategoryTestDataFactory.TEST_USER_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    // =========================================================================
    // createMultiple
    // =========================================================================

    @Nested
    @DisplayName("createMultiple")
    class CreateMultiple {

        @Test
        @DisplayName("creates multiple categories and returns all")
        void createsMultipleCategories() {
            Category input1 = CategoryTestDataFactory.buildCategoryWithoutId();
            Category input2 = CategoryTestDataFactory.buildIncomeCategory();
            input2.setId(null);

            Category saved1 = CategoryTestDataFactory.buildCategory();
            Category saved2 = CategoryTestDataFactory.buildIncomeCategory();

            when(categoryRepository.save(any(Category.class))).thenReturn(saved1, saved2);

            List<Category> result = categoryService.createMultiple(
                    List.of(input1, input2),
                    CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result).hasSize(2);
        }

        @Test
        @DisplayName("returns empty list when input is empty")
        void returnsEmpty_whenNoInput() {
            List<Category> result = categoryService.createMultiple(
                    Collections.emptyList(),
                    CategoryTestDataFactory.TEST_USER_ID);

            assertThat(result).isEmpty();
        }
    }
}
