package com.jaya.service;

import com.jaya.dto.SearchRequestDTO;
import com.jaya.dto.SearchResultDTO;
import com.jaya.dto.SearchResultDTO.SearchResultType;
import com.jaya.dto.UniversalSearchResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Universal Search Service
 * Aggregates search results from multiple microservices
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class UniversalSearchService {

    private final WebClient webClient;

    @Value("${services.expense.url:http://localhost:6000}")
    private String expenseServiceUrl;

    @Value("${services.budget.url:http://localhost:6005}")
    private String budgetServiceUrl;

    @Value("${services.category.url:http://localhost:6008}")
    private String categoryServiceUrl;

    @Value("${services.bill.url:http://localhost:6007}")
    private String billServiceUrl;

    @Value("${services.payment-method.url:http://localhost:6006}")
    private String paymentMethodServiceUrl;

    @Value("${services.friendship.url:http://localhost:6009}")
    private String friendshipServiceUrl;

    @Value("${search.timeout-ms:3000}")
    private long searchTimeoutMs;

    @Value("${search.default-limit:5}")
    private int defaultLimit;

    /**
     * Perform universal search across all domains
     */
    public UniversalSearchResponse search(SearchRequestDTO request, String authToken) {
        long startTime = System.currentTimeMillis();

        String query = request.getQuery();
        int limit = request.getLimit() != null ? request.getLimit() : defaultLimit;

        log.info("Starting universal search for query: '{}', limit: {}", query, limit);

        // Parse which sections to search
        Set<String> sectionsToSearch = parseSections(request.getSections());

        // Create response builder
        UniversalSearchResponse.UniversalSearchResponseBuilder responseBuilder = UniversalSearchResponse.builder()
                .query(query);

        // Execute parallel searches
        List<CompletableFuture<Void>> futures = new ArrayList<>();

        // Search Expenses
        if (sectionsToSearch.contains("expenses") || sectionsToSearch.isEmpty()) {
            futures.add(searchExpenses(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.expenses(results)));
        }

        // Search Budgets
        if (sectionsToSearch.contains("budgets") || sectionsToSearch.isEmpty()) {
            futures.add(searchBudgets(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.budgets(results)));
        }

        // Search Categories
        if (sectionsToSearch.contains("categories") || sectionsToSearch.isEmpty()) {
            futures.add(searchCategories(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.categories(results)));
        }

        // Search Bills
        if (sectionsToSearch.contains("bills") || sectionsToSearch.isEmpty()) {
            futures.add(searchBills(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.bills(results)));
        }

        // Search Payment Methods
        if (sectionsToSearch.contains("payment_methods") || sectionsToSearch.isEmpty()) {
            futures.add(searchPaymentMethods(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.paymentMethods(results)));
        }

        // Search Friends
        if (sectionsToSearch.contains("friends") || sectionsToSearch.isEmpty()) {
            futures.add(searchFriends(query, limit, authToken)
                    .thenAccept(results -> responseBuilder.friends(results)));
        }

        // Wait for all searches to complete
        try {
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                    .get(searchTimeoutMs, java.util.concurrent.TimeUnit.MILLISECONDS);
        } catch (Exception e) {
            log.warn("Some search operations timed out or failed: {}", e.getMessage());
        }

        UniversalSearchResponse response = responseBuilder.build();
        response.calculateTotalResults();
        response.setExecutionTimeMs(System.currentTimeMillis() - startTime);

        log.info("Search completed in {}ms with {} total results",
                response.getExecutionTimeMs(), response.getTotalResults());

        return response;
    }

    /**
     * Search expenses
     */
    private CompletableFuture<List<SearchResultDTO>> searchExpenses(
            String query, int limit, String authToken, Integer targetId) {

        return webClient.get()
                .uri(expenseServiceUrl + "/api/expenses/search", uriBuilder -> {
                    uriBuilder.queryParam("expenseName", query);
                    if (targetId != null) {
                        uriBuilder.queryParam("targetId", targetId);
                    }
                    return uriBuilder.build();
                })
                .header(HttpHeaders.AUTHORIZATION, authToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                })
                .timeout(Duration.ofMillis(searchTimeoutMs))
                .map(expenses -> mapExpenseResults(expenses, limit))
                .onErrorResume(e -> {
                    log.error("Error searching expenses: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

    /**
     * Search budgets
     */
    private CompletableFuture<List<SearchResultDTO>> searchBudgets(
            String query, int limit, String authToken, Integer targetId) {

        return webClient.get()
                .uri(budgetServiceUrl + "/api/budgets", uriBuilder -> {
                    if (targetId != null) {
                        uriBuilder.queryParam("targetId", targetId);
                    }
                    return uriBuilder.build();
                })
                .header(HttpHeaders.AUTHORIZATION, authToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                })
                .timeout(Duration.ofMillis(searchTimeoutMs))
                .map(budgets -> filterAndMapBudgetResults(budgets, query, limit))
                .onErrorResume(e -> {
                    log.error("Error searching budgets: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

    /**
     * Search categories
     */
    private CompletableFuture<List<SearchResultDTO>> searchCategories(
            String query, int limit, String authToken, Integer targetId) {

        return webClient.get()
                .uri(categoryServiceUrl + "/api/categories", uriBuilder -> {
                    if (targetId != null) {
                        uriBuilder.queryParam("targetId", targetId);
                    }
                    return uriBuilder.build();
                })
                .header(HttpHeaders.AUTHORIZATION, authToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                })
                .timeout(Duration.ofMillis(searchTimeoutMs))
                .map(categories -> filterAndMapCategoryResults(categories, query, limit))
                .onErrorResume(e -> {
                    log.error("Error searching categories: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

    /**
     * Search bills
     */
    private CompletableFuture<List<SearchResultDTO>> searchBills(
            String query, int limit, String authToken, Integer targetId) {

        return webClient.get()
                .uri(billServiceUrl + "/api/bills", uriBuilder -> {
                    if (targetId != null) {
                        uriBuilder.queryParam("targetId", targetId);
                    }
                    return uriBuilder.build();
                })
                .header(HttpHeaders.AUTHORIZATION, authToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                })
                .timeout(Duration.ofMillis(searchTimeoutMs))
                .map(bills -> filterAndMapBillResults(bills, query, limit))
                .onErrorResume(e -> {
                    log.error("Error searching bills: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

    /**
     * Search payment methods
     */
    private CompletableFuture<List<SearchResultDTO>> searchPaymentMethods(
            String query, int limit, String authToken, Integer targetId) {

        return webClient.get()
                .uri(paymentMethodServiceUrl + "/api/payment-methods", uriBuilder -> {
                    if (targetId != null) {
                        uriBuilder.queryParam("targetId", targetId);
                    }
                    return uriBuilder.build();
                })
                .header(HttpHeaders.AUTHORIZATION, authToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                })
                .timeout(Duration.ofMillis(searchTimeoutMs))
                .map(paymentMethods -> filterAndMapPaymentMethodResults(paymentMethods, query, limit))
                .onErrorResume(e -> {
                    log.error("Error searching payment methods: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

    /**
     * Search friends
     */
    private CompletableFuture<List<SearchResultDTO>> searchFriends(
            String query, int limit, String authToken) {

        return webClient.get()
                .uri(friendshipServiceUrl + "/api/friendships/search",
                        uriBuilder -> uriBuilder.queryParam("query", query).build())
                .header(HttpHeaders.AUTHORIZATION, authToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {
                })
                .timeout(Duration.ofMillis(searchTimeoutMs))
                .map(friends -> mapFriendResults(friends, limit))
                .onErrorResume(e -> {
                    log.error("Error searching friends: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

    // ==================== Result Mapping Methods ====================

    private List<SearchResultDTO> mapExpenseResults(List<Map<String, Object>> expenses, int limit) {
        return expenses.stream()
                .limit(limit)
                .map(exp -> {
                    Map<String, Object> expenseDetails = (Map<String, Object>) exp.get("expense");
                    String name = expenseDetails != null ? (String) expenseDetails.get("name")
                            : (String) exp.get("name");
                    Object amount = expenseDetails != null ? expenseDetails.get("amount") : exp.get("amount");

                    return SearchResultDTO.builder()
                            .id(String.valueOf(exp.get("id")))
                            .type(SearchResultType.EXPENSE)
                            .title(name != null ? name : "Expense")
                            .subtitle(String.format("%s • %s",
                                    exp.getOrDefault("categoryName", "Uncategorized"),
                                    formatAmount(amount)))
                            .icon((String) exp.get("categoryIcon"))
                            .color((String) exp.get("categoryColor"))
                            .metadata(Map.of(
                                    "amount", amount != null ? amount : 0,
                                    "date", exp.getOrDefault("date", ""),
                                    "categoryName", exp.getOrDefault("categoryName", "")))
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> filterAndMapBudgetResults(
            List<Map<String, Object>> budgets, String query, int limit) {
        String queryLower = query.toLowerCase();
        return budgets.stream()
                .filter(budget -> {
                    String name = (String) budget.get("name");
                    String categoryName = (String) budget.get("categoryName");
                    return (name != null && name.toLowerCase().contains(queryLower)) ||
                            (categoryName != null && categoryName.toLowerCase().contains(queryLower));
                })
                .limit(limit)
                .map(budget -> SearchResultDTO.builder()
                        .id(String.valueOf(budget.get("id")))
                        .type(SearchResultType.BUDGET)
                        .title((String) budget.getOrDefault("name", "Budget"))
                        .subtitle(String.format("%s • %s",
                                budget.getOrDefault("categoryName", "All Categories"),
                                formatAmount(budget.get("amount"))))
                        .metadata(Map.of(
                                "amount", budget.getOrDefault("amount", 0),
                                "spent", budget.getOrDefault("spent", 0),
                                "remaining", budget.getOrDefault("remaining", 0)))
                        .build())
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> filterAndMapCategoryResults(
            List<Map<String, Object>> categories, String query, int limit) {
        String queryLower = query.toLowerCase();
        return categories.stream()
                .filter(cat -> {
                    String name = (String) cat.get("name");
                    return name != null && name.toLowerCase().contains(queryLower);
                })
                .limit(limit)
                .map(cat -> SearchResultDTO.builder()
                        .id(String.valueOf(cat.get("id")))
                        .type(SearchResultType.CATEGORY)
                        .title((String) cat.getOrDefault("name", "Category"))
                        .subtitle((String) cat.getOrDefault("type", "Custom category"))
                        .icon((String) cat.get("icon"))
                        .color((String) cat.get("color"))
                        .build())
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> filterAndMapBillResults(
            List<Map<String, Object>> bills, String query, int limit) {
        String queryLower = query.toLowerCase();
        return bills.stream()
                .filter(bill -> {
                    String name = (String) bill.get("name");
                    String description = (String) bill.get("description");
                    return (name != null && name.toLowerCase().contains(queryLower)) ||
                            (description != null && description.toLowerCase().contains(queryLower));
                })
                .limit(limit)
                .map(bill -> SearchResultDTO.builder()
                        .id(String.valueOf(bill.get("id")))
                        .type(SearchResultType.BILL)
                        .title((String) bill.getOrDefault("name", "Bill"))
                        .subtitle(String.format("%s • %s",
                                bill.getOrDefault("frequency", "One-time"),
                                formatAmount(bill.get("amount"))))
                        .metadata(Map.of(
                                "amount", bill.getOrDefault("amount", 0),
                                "dueDate", bill.getOrDefault("dueDate", ""),
                                "frequency", bill.getOrDefault("frequency", "")))
                        .build())
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> filterAndMapPaymentMethodResults(
            List<Map<String, Object>> paymentMethods, String query, int limit) {
        String queryLower = query.toLowerCase();
        return paymentMethods.stream()
                .filter(pm -> {
                    String name = (String) pm.get("name");
                    String type = (String) pm.get("type");
                    return (name != null && name.toLowerCase().contains(queryLower)) ||
                            (type != null && type.toLowerCase().contains(queryLower));
                })
                .limit(limit)
                .map(pm -> SearchResultDTO.builder()
                        .id(String.valueOf(pm.get("id")))
                        .type(SearchResultType.PAYMENT_METHOD)
                        .title((String) pm.getOrDefault("name", "Payment Method"))
                        .subtitle((String) pm.getOrDefault("type", "Payment method"))
                        .icon((String) pm.get("icon"))
                        .color((String) pm.get("color"))
                        .build())
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> mapFriendResults(List<Map<String, Object>> friends, int limit) {
        return friends.stream()
                .limit(limit)
                .map(friend -> {
                    String firstName = (String) friend.getOrDefault("firstName", "");
                    String lastName = (String) friend.getOrDefault("lastName", "");
                    String fullName = (firstName + " " + lastName).trim();
                    if (fullName.isEmpty()) {
                        fullName = (String) friend.getOrDefault("email", "Friend");
                    }

                    return SearchResultDTO.builder()
                            .id(String.valueOf(friend.get("id")))
                            .type(SearchResultType.FRIEND)
                            .title(fullName)
                            .subtitle((String) friend.getOrDefault("email", ""))
                            .metadata(Map.of(
                                    "email", friend.getOrDefault("email", "")))
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ==================== Helper Methods ====================

    private Set<String> parseSections(String sections) {
        if (sections == null || sections.trim().isEmpty()) {
            return Collections.emptySet();
        }
        return Arrays.stream(sections.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
    }

    private String formatAmount(Object amount) {
        if (amount == null)
            return "$0.00";
        if (amount instanceof Number) {
            return String.format("$%.2f", ((Number) amount).doubleValue());
        }
        return amount.toString();
    }
}
