package com.jaya.common.service.client.local;

import com.jaya.common.dto.ExpenseDTO;
import com.jaya.common.service.client.IExpenseServiceClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Local implementation for Expense Service client in monolithic mode.
 * Calls the local ExpenseService bean directly instead of making HTTP calls.
 */
@Component
@Profile("monolithic")
@Slf4j
public class LocalExpenseServiceClient implements IExpenseServiceClient {

    private final ApplicationContext applicationContext;
    private Object expenseService;

    @Autowired
    public LocalExpenseServiceClient(@Lazy ApplicationContext applicationContext) {
        this.applicationContext = applicationContext;
    }

    private Object getExpenseService() {
        if (expenseService == null) {
            try {
                expenseService = applicationContext.getBean("expenseServiceImpl");
            } catch (Exception e) {
                log.warn("Could not find expenseServiceImpl, trying ExpenseServiceImpl class", e);
                try {
                    expenseService = applicationContext.getBean(
                        Class.forName("com.jaya.service.ExpenseServiceImpl"));
                } catch (ClassNotFoundException ex) {
                    log.error("ExpenseServiceImpl class not found", ex);
                    throw new RuntimeException("ExpenseService not available in monolithic mode", ex);
                }
            }
        }
        return expenseService;
    }

    @Override
    public ExpenseDTO save(ExpenseDTO expense) {
        log.debug("LocalExpenseServiceClient: Saving expense");
        try {
            Object service = getExpenseService();
            var method = service.getClass().getMethod("save", ExpenseDTO.class);
            return (ExpenseDTO) method.invoke(service, expense);
        } catch (Exception e) {
            log.error("Error calling local ExpenseService.save", e);
            throw new RuntimeException("Failed to save expense locally", e);
        }
    }

    @Override
    public ExpenseDTO getExpenseById(Integer expenseId, Integer userId) {
        log.debug("LocalExpenseServiceClient: Getting expense by ID: {}", expenseId);
        try {
            Object service = getExpenseService();
            var method = service.getClass().getMethod("getExpenseById", Integer.class, Integer.class);
            return (ExpenseDTO) method.invoke(service, expenseId, userId);
        } catch (Exception e) {
            log.error("Error calling local ExpenseService.getExpenseById", e);
            throw new RuntimeException("Failed to get expense by ID locally", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ExpenseDTO> findByUserIdAndDateBetweenAndIncludeInBudgetTrue(
            LocalDate startDate, LocalDate endDate, Integer userId) {
        log.debug("LocalExpenseServiceClient: Finding expenses by date range for user: {}", userId);
        try {
            Object service = getExpenseService();
            var method = service.getClass().getMethod(
                "findByUserIdAndDateBetweenAndIncludeInBudgetTrue",
                LocalDate.class, LocalDate.class, Integer.class);
            return (List<ExpenseDTO>) method.invoke(service, startDate, endDate, userId);
        } catch (Exception e) {
            log.error("Error calling local ExpenseService.findByUserIdAndDateBetweenAndIncludeInBudgetTrue", e);
            throw new RuntimeException("Failed to find expenses by date range locally", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ExpenseDTO> getAllExpenses(Integer userId) {
        log.debug("LocalExpenseServiceClient: Getting all expenses for user: {}", userId);
        try {
            Object service = getExpenseService();
            var method = service.getClass().getMethod("getAllExpenses", Integer.class);
            return (List<ExpenseDTO>) method.invoke(service, userId);
        } catch (Exception e) {
            log.error("Error calling local ExpenseService.getAllExpenses", e);
            throw new RuntimeException("Failed to get all expenses locally", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ExpenseDTO> getAllExpensesWithSort(Integer userId, String sort) {
        log.debug("LocalExpenseServiceClient: Getting all expenses with sort for user: {}", userId);
        try {
            Object service = getExpenseService();
            var method = service.getClass().getMethod("getAllExpensesWithSort", Integer.class, String.class);
            return (List<ExpenseDTO>) method.invoke(service, userId, sort);
        } catch (Exception e) {
            log.error("Error calling local ExpenseService.getAllExpensesWithSort", e);
            throw new RuntimeException("Failed to get all expenses with sort locally", e);
        }
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<ExpenseDTO> getExpensesByIds(Integer userId, Set<Integer> expenseIds) {
        log.debug("LocalExpenseServiceClient: Getting expenses by IDs for user: {}", userId);
        try {
            Object service = getExpenseService();
            var method = service.getClass().getMethod("getExpensesByIds", Integer.class, Set.class);
            return (List<ExpenseDTO>) method.invoke(service, userId, expenseIds);
        } catch (Exception e) {
            log.error("Error calling local ExpenseService.getExpensesByIds", e);
            throw new RuntimeException("Failed to get expenses by IDs locally", e);
        }
    }
}
