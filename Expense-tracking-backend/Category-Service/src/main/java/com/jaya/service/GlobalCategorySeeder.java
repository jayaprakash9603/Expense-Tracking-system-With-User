package com.jaya.service;

import com.jaya.constant.DefaultGlobalCategory;
import com.jaya.models.Category;
import com.jaya.repository.CategoryRepository;
import com.jaya.util.factory.CategoryFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GlobalCategorySeeder {

    private final CategoryRepository categoryRepository;
    private final CategoryFactory categoryFactory;

    @Transactional
    public int seedMissingGlobalCategories() {
        int created = 0;
        for (DefaultGlobalCategory definition : DefaultGlobalCategory.values()) {
            if (createIfMissing(definition)) {
                created++;
            }
        }
        log.info("Global category seeding finished: created={}, alreadyPresent={}", created,
                DefaultGlobalCategory.values().length - created);
        return created;
    }

    private boolean createIfMissing(DefaultGlobalCategory definition) {
        if (existsGlobally(definition)) {
            return false;
        }

        Category saved = categoryRepository.save(toGlobalCategory(definition));
        log.info("Created global category: id={}, name={}, type={}", saved.getId(), saved.getName(), saved.getType());
        return true;
    }

    // Matched on name alone: existing global rows carry inconsistent type values
    // ("Expense", "income", null), so matching on type would seed duplicate names.
    private boolean existsGlobally(DefaultGlobalCategory definition) {
        return !categoryRepository
                .findGlobalByName(definition.getCategoryName())
                .isEmpty();
    }

    private Category toGlobalCategory(DefaultGlobalCategory definition) {
        return categoryFactory.createGlobalCategory(
                definition.getCategoryName(),
                definition.getDescription(),
                definition.getType(),
                definition.getIcon(),
                definition.getColor());
    }
}
