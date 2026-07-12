package com.jaya.automation.bdd.handler;

import com.jaya.automation.api.execution.ApiExecutionResult;
import com.jaya.automation.api.execution.ApiRequest;
import com.jaya.automation.core.context.TestContext;
import com.jaya.automation.core.logging.AutomationLogger;
import com.jaya.automation.core.logging.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Handler for category API operations.
 */
@Component
public class CategoryHandler extends BaseApiHandler {
    private static final AutomationLogger LOG = LoggerFactory.getLogger(CategoryHandler.class);

    public ApiExecutionResult createCategory(Map<String, Object> payload) {
        ApiRequest request = builder("categories.create").body(payload).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 201);

        storeAlias("category.lastCreatedId", result, "id");
        LOG.info("Category created: status={}", result.statusCode());
        return result;
    }

    public ApiExecutionResult createCategoryAndEnrich(Map<String, Object> payload, TestContext context) {
        ApiExecutionResult result = createCategory(payload);
        storeInContext(context, "categoryId", result, "id");
        storeInContext(context, "categoryName", result, "name");
        return result;
    }

    public ApiExecutionResult listCategories() {
        ApiRequest request = builder("categories.list").build();
        ApiExecutionResult result = execute(request);
        assertStatus(result, 200);
        return result;
    }

    public ApiExecutionResult deleteCategory(String categoryId) {
        ApiRequest request = builder("categories.delete").pathParam("id", categoryId).build();
        ApiExecutionResult result = execute(request);
        assertStatusIn(result, 200, 204);
        return result;
    }
}
