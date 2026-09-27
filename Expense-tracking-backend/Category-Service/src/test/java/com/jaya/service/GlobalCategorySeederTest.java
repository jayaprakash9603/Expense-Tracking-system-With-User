package com.jaya.service;

import com.jaya.constant.CategoryConstants;
import com.jaya.constant.DefaultGlobalCategory;
import com.jaya.models.Category;
import com.jaya.repository.CategoryRepository;
import com.jaya.util.factory.CategoryFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("GlobalCategorySeeder Unit Tests")
class GlobalCategorySeederTest {

    @Mock
    private CategoryRepository categoryRepository;

    private final List<Category> store = new ArrayList<>();
    private GlobalCategorySeeder seeder;

    @BeforeEach
    void setUp() {
        store.clear();
        seeder = new GlobalCategorySeeder(categoryRepository, new CategoryFactory());

        when(categoryRepository.findGlobalByName(anyString()))
                .thenAnswer(invocation -> findGlobal(invocation.getArgument(0)));

        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            category.setId(store.size() + 1);
            store.add(category);
            return category;
        });
    }

    private List<Category> findGlobal(String name) {
        return store.stream()
                .filter(Category::isGlobal)
                .filter(c -> c.getName().equalsIgnoreCase(name))
                .collect(Collectors.toList());
    }

    private List<String> storedNames() {
        return store.stream().map(Category::getName).collect(Collectors.toList());
    }

    @Nested
    @DisplayName("first run on empty database")
    class FirstRun {

        @Test
        @DisplayName("creates every default global category")
        void createsAllDefaults() {
            int created = seeder.seedMissingGlobalCategories();

            assertThat(created).isEqualTo(DefaultGlobalCategory.values().length);
            assertThat(store).hasSize(DefaultGlobalCategory.values().length);
        }

        @Test
        @DisplayName("covers the full expected category name list")
        void coversExpectedNames() {
            seeder.seedMissingGlobalCategories();

            assertThat(storedNames()).containsExactlyInAnyOrder(
                    "Food", "Groceries", "Bills", "Rent", "Travel", "Shopping", "Online Shopping",
                    "Gift Cards", "Investment", "Deductions", "Expenses", "Transfer", "Others",
                    "Income", "Cashbacks");
        }

        @Test
        @DisplayName("marks every seeded category as global owned by the global user")
        void marksCategoriesGlobal() {
            seeder.seedMissingGlobalCategories();

            assertThat(store).allSatisfy(category -> {
                assertThat(category.isGlobal()).isTrue();
                assertThat(category.getUserId()).isEqualTo(CategoryConstants.GLOBAL_USER_ID);
                assertThat(category.getExpenseIds()).isNotNull().isEmpty();
                assertThat(category.getUserIds()).isNotNull().isEmpty();
                assertThat(category.getEditUserIds()).isNotNull().isEmpty();
            });
        }

        @Test
        @DisplayName("assigns icon and colour from the definition")
        void assignsIconAndColour() {
            seeder.seedMissingGlobalCategories();

            Category food = store.stream().filter(c -> "Food".equals(c.getName())).findFirst().orElseThrow();

            assertThat(food.getIcon()).isEqualTo(DefaultGlobalCategory.FOOD.getIcon());
            assertThat(food.getColor()).isEqualTo(DefaultGlobalCategory.FOOD.getColor());
            assertThat(food.getType()).isEqualTo(CategoryConstants.TYPE_EXPENSE);
        }
    }

    @Nested
    @DisplayName("repeated runs")
    class RepeatedRuns {

        @Test
        @DisplayName("creates nothing on the second run")
        void secondRunIsNoOp() {
            seeder.seedMissingGlobalCategories();
            int createdOnSecondRun = seeder.seedMissingGlobalCategories();

            assertThat(createdOnSecondRun).isZero();
            assertThat(store).hasSize(DefaultGlobalCategory.values().length);
        }

        @Test
        @DisplayName("never duplicates a name across many runs")
        void staysIdempotentAcrossRuns() {
            seeder.seedMissingGlobalCategories();
            seeder.seedMissingGlobalCategories();
            seeder.seedMissingGlobalCategories();

            assertThat(storedNames()).doesNotHaveDuplicates();
        }

        @Test
        @DisplayName("saves each default exactly once even when run twice")
        void savesEachDefaultOnce() {
            seeder.seedMissingGlobalCategories();
            seeder.seedMissingGlobalCategories();

            verify(categoryRepository, times(DefaultGlobalCategory.values().length)).save(any(Category.class));
        }
    }

    @Nested
    @DisplayName("existing global categories")
    class ExistingCategories {

        @Test
        @DisplayName("skips a category that already exists with different casing")
        void skipsCaseInsensitiveMatch() {
            Category existing = new CategoryFactory().createGlobalCategory("food", "already there", "EXPENSE");
            existing.setId(99);
            store.add(existing);

            int created = seeder.seedMissingGlobalCategories();

            assertThat(created).isEqualTo(DefaultGlobalCategory.values().length - 1);
            assertThat(storedNames()).doesNotContain("Food").contains("food");
        }

        @Test
        @DisplayName("skips a category whose existing global row uses a different type")
        void skipsWhenTypeDiffers() {
            Category existing = new CategoryFactory().createGlobalCategory("Investment", "legacy row", "Income");
            existing.setId(98);
            store.add(existing);

            int created = seeder.seedMissingGlobalCategories();

            assertThat(created).isEqualTo(DefaultGlobalCategory.values().length - 1);
            assertThat(storedNames()).filteredOn("Investment"::equals).hasSize(1);
        }

        @Test
        @DisplayName("skips a category whose existing global row has a null type")
        void skipsWhenTypeIsNull() {
            Category existing = new CategoryFactory().createGlobalCategory("Expenses", "legacy row", null);
            existing.setId(97);
            store.add(existing);

            int created = seeder.seedMissingGlobalCategories();

            assertThat(created).isEqualTo(DefaultGlobalCategory.values().length - 1);
            assertThat(storedNames()).filteredOn("Expenses"::equals).hasSize(1);
        }

        @Test
        @DisplayName("recreates only the deleted default")
        void recreatesDeletedDefault() {
            seeder.seedMissingGlobalCategories();
            store.removeIf(c -> "Income".equals(c.getName()));

            int created = seeder.seedMissingGlobalCategories();

            assertThat(created).isEqualTo(1);
            assertThat(storedNames()).contains("Income");
        }
    }
}
