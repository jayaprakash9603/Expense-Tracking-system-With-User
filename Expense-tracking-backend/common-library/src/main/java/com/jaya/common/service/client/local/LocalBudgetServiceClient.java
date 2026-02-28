package com.jaya.common.service.client.local;

import com.jaya.common.dto.BudgetDTO;
import com.jaya.common.service.client.IBudgetServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Local implementation for Budget Service client in monolithic mode.
 * Calls the local BudgetService bean directly instead of making HTTP calls.
 */
@Component
@Profile("monolithic")
@Slf4j
public class LocalBudgetServiceClient implements IBudgetServiceClient {

    private final ApplicationContext applicationContext;
    private Object budgetService;

    @Autowired
    public LocalBudgetServiceClient(@Lazy ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    private Object getBudgetService() {
        if (budgetService == null) {
            try {
                budgetService = applicationContext.getBean("budgetServiceImpl");
            } catch (Exception e) {
                log.warn("Could not find budgetServiceImpl, trying BudgetServiceImpl class", e);
                try {
                    budgetService = applicationContext.getBean(
                        Class.forName("com.jaya.service.BudgetServiceImpl"));
                } catch (ClassNotFoundException ex) {
                    log.error("BudgetServiceImpl class not found", ex);
                    throw new RuntimeException("BudgetService not available in monolithic mode", ex);
                }
            }
        }
        return budgetService;
    }

    @Override
    public BudgetDTO getBudgetById(Integer budgetId, Integer userId) {
        log.debug("LocalBudgetServiceClient: Getting budget by ID: {}", budgetId);
        try {
            Object service = getBudgetService();
            var method = service.getClass().getMethod("getBudgetById", Integer.class, Integer.class);
            return (BudgetDTO) method.invoke(service, budgetId, userId);
        } catch (Exception e) {
            log.error("Error calling local BudgetService.getBudgetById", e);
            throw new RuntimeException("Failed to get budget by ID locally", e);
        }
    }

    @Override
    public BudgetDTO save(BudgetDTO budget) {
        log.debug("LocalBudgetServiceClient: Saving budget");
        try {
            Object service = getBudgetService();
            var method = service.getClass().getMethod("save", BudgetDTO.class);
            return (BudgetDTO) method.invoke(service, budget);
        } catch (Exception e) {
            log.error("Error calling local BudgetService.save", e);
            throw new RuntimeException("Failed to save budget locally", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<BudgetDTO> getAllBudgetForUser(Integer userId) {
        log.debug("LocalBudgetServiceClient: Getting all budgets for user: {}", userId);
        try {
            Object service = getBudgetService();
            var method = service.getClass().getMethod("getAllBudgetForUser", Integer.class);
            return (List<BudgetDTO>) method.invoke(service, userId);
        } catch (Exception e) {
            log.error("Error calling local BudgetService.getAllBudgetForUser", e);
            throw new RuntimeException("Failed to get all budgets locally", e);
        }
    }
}
