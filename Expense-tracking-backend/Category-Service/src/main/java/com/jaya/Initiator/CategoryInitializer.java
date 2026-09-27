package com.jaya.Initiator;

import com.jaya.service.GlobalCategorySeeder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.category.seed-global-defaults", havingValue = "true", matchIfMissing = true)
public class CategoryInitializer implements ApplicationRunner {

    private final GlobalCategorySeeder globalCategorySeeder;

    @Override
    public void run(ApplicationArguments args) {
        try {
            globalCategorySeeder.seedMissingGlobalCategories();
        } catch (Exception ex) {
            log.error("Failed to seed default global categories: {}", ex.getMessage(), ex);
        }
    }
}
