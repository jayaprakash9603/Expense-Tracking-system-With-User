package com.jaya.util.factory;

import com.jaya.constant.CategoryConstants;
import com.jaya.models.Category;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("CategoryFactory Unit Tests")
class CategoryFactoryTest {

    private CategoryFactory factory;

    @BeforeEach
    void setUp() {
        factory = new CategoryFactory();
    }

    @Nested
    @DisplayName("createUserCategory")
    class CreateUserCategory {

        @Test
        @DisplayName("creates user category with correct fields")
        void createsUserCategory() {
            Category result = factory.createUserCategory("Food", "Food expenses", "expense", 1);

            assertThat(result.getName()).isEqualTo("Food");
            assertThat(result.getDescription()).isEqualTo("Food expenses");
            assertThat(result.getType()).isEqualTo("expense");
            assertThat(result.getUserId()).isEqualTo(1);
            assertThat(result.isGlobal()).isFalse();
        }

        @Test
        @DisplayName("initialises empty collections")
        void initialisesCollections() {
            Category result = factory.createUserCategory("Food", null, "expense", 5);

            assertThat(result.getExpenseIds()).isNotNull().isEmpty();
            assertThat(result.getUserIds()).isNotNull().isEmpty();
            assertThat(result.getEditUserIds()).isNotNull().isEmpty();
        }

        @Test
        @DisplayName("sets default icon and color")
        void setsDefaultIconAndColor() {
            Category result = factory.createUserCategory("Food", null, "expense", 1);

            assertThat(result.getIcon()).isEqualTo(CategoryConstants.DEFAULT_ICON);
            assertThat(result.getColor()).isEqualTo(CategoryConstants.DEFAULT_COLOR);
        }
    }

    @Nested
    @DisplayName("createGlobalCategory")
    class CreateGlobalCategory {

        @Test
        @DisplayName("creates global category with userId=0")
        void createsGlobalCategory() {
            Category result = factory.createGlobalCategory("Salary", "Monthly salary", "income");

            assertThat(result.getName()).isEqualTo("Salary");
            assertThat(result.getType()).isEqualTo("income");
            assertThat(result.getUserId()).isEqualTo(CategoryConstants.GLOBAL_USER_ID);
            assertThat(result.isGlobal()).isTrue();
        }
    }

    @Nested
    @DisplayName("createOthersCategory")
    class CreateOthersCategory {

        @Test
        @DisplayName("creates Others category for specified userId")
        void createsOthersCategory() {
            Category result = factory.createOthersCategory(7);

            assertThat(result.getName()).isEqualTo(CategoryConstants.DEFAULT_CATEGORY_NAME);
            assertThat(result.getUserId()).isEqualTo(7);
            assertThat(result.isGlobal()).isFalse();
        }
    }

    @Nested
    @DisplayName("createUserCopyFromGlobal")
    class CreateUserCopyFromGlobal {

        @Test
        @DisplayName("creates user copy with data from global and new userId")
        void createsCopy() {
            Category global = new Category();
            global.setName("Salary");
            global.setDescription("Global salary");
            global.setType("income");
            global.setIcon("salary-icon");
            global.setColor("#33FF57");
            global.setGlobal(true);
            global.setUserId(0);

            Category result = factory.createUserCopyFromGlobal(global, 3);

            assertThat(result.getName()).isEqualTo("Salary");
            assertThat(result.getDescription()).isEqualTo("Global salary");
            assertThat(result.getType()).isEqualTo("income");
            assertThat(result.getIcon()).isEqualTo("salary-icon");
            assertThat(result.getColor()).isEqualTo("#33FF57");
            assertThat(result.getUserId()).isEqualTo(3);
            assertThat(result.isGlobal()).isFalse();
        }
    }
}
