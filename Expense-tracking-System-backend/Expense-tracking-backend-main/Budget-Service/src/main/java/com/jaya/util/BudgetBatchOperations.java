package com.jaya.util;

import com.jaya.models.Budget;
import com.jaya.repository.BudgetRepository;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class BudgetBatchOperations {

    private final BudgetRepository budgetRepository;

    public BudgetBatchOperations(BudgetRepository budgetRepository) {
        this.budgetRepository = budgetRepository;
    }

    public Map<Integer, Budget> fetchBudgetsByIds(List<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Budget> budgets = budgetRepository.findByIdInAndUserId(budgetIds, userId);

        return budgets.stream()
                .collect(Collectors.toMap(Budget::getId, budget -> budget));
    }

    public List<Budget> fetchBudgetsAsList(Set<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return Collections.emptyList();
        }

        return budgetRepository.findByIdInAndUserId(new ArrayList<>(budgetIds), userId);
    }

    public boolean validateBudgetIdsExist(List<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return true;
        }

        List<Budget> foundBudgets = budgetRepository.findByIdInAndUserId(budgetIds, userId);
        return foundBudgets.size() == budgetIds.size();
    }

    public Set<Integer> getMissingBudgetIds(List<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return Collections.emptySet();
        }

        List<Budget> foundBudgets = budgetRepository.findByIdInAndUserId(budgetIds, userId);
        Set<Integer> foundIds = foundBudgets.stream()
                .map(Budget::getId)
                .collect(Collectors.toSet());

        return budgetIds.stream()
                .filter(id -> !foundIds.contains(id))
                .collect(Collectors.toSet());
    }

    public Set<Budget> getBudgetsByIdsOptimized(Set<Integer> budgetIds, Integer userId) {
        if (budgetIds == null || budgetIds.isEmpty()) {
            return Collections.emptySet();
        }

        List<Budget> budgets = budgetRepository.findByIdInAndUserId(
                new ArrayList<>(budgetIds), userId);
        return new HashSet<>(budgets);
    }
}
