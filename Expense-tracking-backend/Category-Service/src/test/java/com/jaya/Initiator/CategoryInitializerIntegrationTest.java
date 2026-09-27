package com.jaya.Initiator;

import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.constant.CategoryConstants;
import com.jaya.constant.DefaultGlobalCategory;
import com.jaya.kafka.service.FriendActivityService;
import com.jaya.kafka.service.UnifiedActivityService;
import com.jaya.models.Category;
import com.jaya.repository.CategoryRepository;
import com.jaya.service.CategoryAsyncService;
import com.jaya.service.CategoryEventProducer;
import com.jaya.service.FriendShipService;
import com.jaya.service.GlobalCategorySeeder;
import com.jaya.util.CategoryServiceHelper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.cloud.discovery.enabled=false",
        "eureka.client.enabled=false",
        "eureka.client.register-with-eureka=false",
        "eureka.client.fetch-registry=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@DisplayName("Global Category Seeding Integration Tests")
class CategoryInitializerIntegrationTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private GlobalCategorySeeder globalCategorySeeder;

    @Autowired
    private CategoryInitializer categoryInitializer;

    @MockBean
    private IUserServiceClient userServiceClient;

    @MockBean
    private FriendShipService friendshipService;

    @MockBean
    private UnifiedActivityService unifiedActivityService;

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

    @Test
    @DisplayName("registers the startup initializer bean")
    void registersInitializer() {
        assertThat(categoryInitializer).isNotNull();
    }

    @Test
    @DisplayName("every default category exists globally after startup")
    void seedsDefaultsOnStartup() {
        List<String> globalNames = categoryRepository.findByIsGlobalTrue().stream()
                .map(Category::getName)
                .toList();

        assertThat(globalNames).containsExactlyInAnyOrder(
                "Food", "Groceries", "Bills", "Rent", "Travel", "Shopping", "Online Shopping",
                "Gift Cards", "Investment", "Deductions", "Expenses", "Transfer", "Others",
                "Income", "Cashbacks");
    }

    @Test
    @DisplayName("seeded categories are owned by the global user")
    void seededCategoriesAreGlobal() {
        List<Category> food = categoryRepository.findGlobalByNameAndType("Food", CategoryConstants.TYPE_EXPENSE);

        assertThat(food).hasSize(1);
        assertThat(food.get(0).isGlobal()).isTrue();
        assertThat(food.get(0).getUserId()).isEqualTo(CategoryConstants.GLOBAL_USER_ID);
        assertThat(food.get(0).getIcon()).isEqualTo(DefaultGlobalCategory.FOOD.getIcon());
        assertThat(food.get(0).getColor()).isEqualTo(DefaultGlobalCategory.FOOD.getColor());
    }

    @Test
    @DisplayName("re-running the seeder against the database creates no duplicates")
    void reRunningSeederIsIdempotent() {
        long globalCountBefore = categoryRepository.findByIsGlobalTrue().size();

        int created = globalCategorySeeder.seedMissingGlobalCategories();

        assertThat(created).isZero();
        assertThat(categoryRepository.findByIsGlobalTrue()).hasSize((int) globalCountBefore);
    }

    @Test
    @DisplayName("does not duplicate a name when the existing global row uses a different type")
    void doesNotDuplicateWhenTypeDiffers() {
        categoryRepository.deleteAll(categoryRepository.findGlobalByName("Gift Cards"));
        Category legacy = new Category();
        legacy.setName("Gift Cards");
        legacy.setType("Income");
        legacy.setGlobal(true);
        legacy.setUserId(CategoryConstants.GLOBAL_USER_ID);
        categoryRepository.save(legacy);

        int created = globalCategorySeeder.seedMissingGlobalCategories();

        assertThat(created).isZero();
        assertThat(categoryRepository.findGlobalByName("Gift Cards")).hasSize(1);
    }

    @Test
    @DisplayName("recreates a default that was deleted from the database")
    void recreatesDeletedDefault() {
        List<Category> cashbacks = categoryRepository.findGlobalByNameAndType("Cashbacks",
                CategoryConstants.TYPE_INCOME);
        categoryRepository.deleteAll(cashbacks);

        int created = globalCategorySeeder.seedMissingGlobalCategories();

        assertThat(created).isEqualTo(1);
        assertThat(categoryRepository.findGlobalByNameAndType("Cashbacks", CategoryConstants.TYPE_INCOME)).hasSize(1);
    }
}
