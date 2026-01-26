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

    @Value("${search.default-limit:20}")
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
     * Search expenses with category enrichment
     */
    private CompletableFuture<List<SearchResultDTO>> searchExpenses(
            String query, int limit, String authToken, Integer targetId) {

        // First, fetch categories to get icon/color mappings
        Mono<Map<Integer, Map<String, Object>>> categoriesMono = webClient.get()
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
                .map(categories -> {
                    Map<Integer, Map<String, Object>> categoryMap = new HashMap<>();
                    for (Map<String, Object> cat : categories) {
                        Object idObj = cat.get("id");
                        if (idObj != null) {
                            Integer catId = idObj instanceof Number ? ((Number) idObj).intValue()
                                    : Integer.parseInt(idObj.toString());
                            categoryMap.put(catId, cat);
                        }
                    }
                    return categoryMap;
                })
                .onErrorResume(e -> {
                    log.warn("Could not fetch categories for enrichment: {}", e.getMessage());
                    return Mono.just(new HashMap<>());
                });

        // Then fetch expenses and enrich with category data
        Mono<List<Map<String, Object>>> expensesMono = webClient.get()
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
                .onErrorResume(e -> {
                    log.error("Error searching expenses: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                });

        // Combine both results
        return Mono.zip(expensesMono, categoriesMono)
                .map(tuple -> {
                    List<Map<String, Object>> expenses = tuple.getT1();
                    Map<Integer, Map<String, Object>> categoryMap = tuple.getT2();
                    return mapExpenseResultsWithCategories(expenses, categoryMap, limit);
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

    /**
     * Map expense results with category enrichment
     */
    private List<SearchResultDTO> mapExpenseResultsWithCategories(
            List<Map<String, Object>> expenses,
            Map<Integer, Map<String, Object>> categoryMap,
            int limit) {
        return expenses.stream()
                .limit(limit)
                .map(exp -> {
                    // Get expense details from nested object
                    Map<String, Object> expenseDetails = (Map<String, Object>) exp.get("expense");

                    // Extract name - from expense details or direct
                    String name = null;
                    if (expenseDetails != null) {
                        name = (String) expenseDetails.get("expenseName");
                        if (name == null) {
                            name = (String) expenseDetails.get("name");
                        }
                    }
                    if (name == null) {
                        name = (String) exp.get("name");
                    }

                    // Extract amount - from expense details or direct
                    Object amount = null;
                    if (expenseDetails != null) {
                        amount = expenseDetails.get("amount");
                    }
                    if (amount == null) {
                        amount = exp.get("amount");
                    }

                    // Extract other fields from expense details
                    String type = null;
                    String paymentMethod = null;
                    String comments = null;
                    Object netAmount = null;
                    Object creditDue = null;

                    if (expenseDetails != null) {
                        type = (String) expenseDetails.get("type");
                        paymentMethod = (String) expenseDetails.get("paymentMethod");
                        comments = (String) expenseDetails.get("comments");
                        netAmount = expenseDetails.get("netAmount");
                        creditDue = expenseDetails.get("creditDue");
                    }

                    // Get category info - first try from expense, then from category map
                    String categoryName = (String) exp.getOrDefault("categoryName", "Uncategorized");
                    String categoryIcon = null;
                    String categoryColor = null;
                    Integer categoryId = null;

                    Object catIdObj = exp.get("categoryId");
                    if (catIdObj != null) {
                        categoryId = catIdObj instanceof Number ? ((Number) catIdObj).intValue()
                                : Integer.parseInt(catIdObj.toString());

                        // Enrich with category data from map
                        Map<String, Object> category = categoryMap.get(categoryId);
                        if (category != null) {
                            categoryIcon = (String) category.get("icon");
                            categoryColor = (String) category.get("color");
                            if (categoryName.equals("Uncategorized") || categoryName.isEmpty()) {
                                categoryName = (String) category.getOrDefault("name", "Uncategorized");
                            }
                        }
                    }

                    // Build metadata with all relevant expense fields
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("amount", amount != null ? amount : 0);
                    metadata.put("date", exp.getOrDefault("date", ""));
                    metadata.put("categoryName", categoryName);
                    metadata.put("categoryId", categoryId);
                    metadata.put("categoryIcon", categoryIcon);
                    metadata.put("categoryColor", categoryColor);

                    if (type != null)
                        metadata.put("type", type);
                    if (paymentMethod != null)
                        metadata.put("paymentMethod", paymentMethod);
                    if (comments != null)
                        metadata.put("comments", comments);
                    if (netAmount != null)
                        metadata.put("netAmount", netAmount);
                    if (creditDue != null)
                        metadata.put("creditDue", creditDue);

                    metadata.put("includeInBudget", exp.getOrDefault("includeInBudget", false));
                    metadata.put("isBill", exp.getOrDefault("isBill", false));

                    return SearchResultDTO.builder()
                            .id(String.valueOf(exp.get("id")))
                            .type(SearchResultType.EXPENSE)
                            .title(name != null && !name.isEmpty() ? name : "Expense")
                            .subtitle(String.format("%s • %s",
                                    categoryName,
                                    formatAmount(amount)))
                            .icon(categoryIcon)
                            .color(categoryColor)
                            .metadata(metadata)
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
                .map(budget -> {
                    // Build comprehensive metadata for budgets
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("amount", budget.getOrDefault("amount", 0));
                    metadata.put("spent", budget.getOrDefault("spent", 0));
                    metadata.put("remaining", budget.getOrDefault("remaining", 0));
                    metadata.put("categoryName", budget.getOrDefault("categoryName", "All Categories"));
                    metadata.put("categoryId", budget.get("categoryId"));
                    metadata.put("startDate", budget.get("startDate"));
                    metadata.put("endDate", budget.get("endDate"));
                    metadata.put("period", budget.get("period"));
                    metadata.put("alertThreshold", budget.get("alertThreshold"));
                    metadata.put("isActive", budget.getOrDefault("isActive", true));

                    return SearchResultDTO.builder()
                            .id(String.valueOf(budget.get("id")))
                            .type(SearchResultType.BUDGET)
                            .title((String) budget.getOrDefault("name", "Budget"))
                            .subtitle(String.format("%s • %s",
                                    budget.getOrDefault("categoryName", "All Categories"),
                                    formatAmount(budget.get("amount"))))
                            .icon((String) budget.get("icon"))
                            .color((String) budget.get("color"))
                            .metadata(metadata)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> filterAndMapCategoryResults(
            List<Map<String, Object>> categories, String query, int limit) {
        String queryLower = query.toLowerCase();
        return categories.stream()
                .filter(cat -> {
                    String name = (String) cat.get("name");
                    String description = (String) cat.get("description");
                    return (name != null && name.toLowerCase().contains(queryLower)) ||
                            (description != null && description.toLowerCase().contains(queryLower));
                })
                .limit(limit)
                .map(cat -> {
                    // Build comprehensive metadata for categories
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("description", cat.get("description"));
                    metadata.put("type", cat.getOrDefault("type", "expense"));
                    metadata.put("isGlobal", cat.getOrDefault("isGlobal", false));
                    metadata.put("expenseCount", cat.get("expenseCount"));

                    return SearchResultDTO.builder()
                            .id(String.valueOf(cat.get("id")))
                            .type(SearchResultType.CATEGORY)
                            .title((String) cat.getOrDefault("name", "Category"))
                            .subtitle((String) cat.getOrDefault("type", "Custom category"))
                            .icon((String) cat.get("icon"))
                            .color((String) cat.get("color"))
                            .metadata(metadata)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> filterAndMapBillResults(
            List<Map<String, Object>> bills, String query, int limit) {
        String queryLower = query.toLowerCase();
        return bills.stream()
                .filter(bill -> {
                    String name = (String) bill.get("name");
                    String description = (String) bill.get("description");
                    String categoryName = (String) bill.get("categoryName");
                    return (name != null && name.toLowerCase().contains(queryLower)) ||
                            (description != null && description.toLowerCase().contains(queryLower)) ||
                            (categoryName != null && categoryName.toLowerCase().contains(queryLower));
                })
                .limit(limit)
                .map(bill -> {
                    // Build comprehensive metadata for bills
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("amount", bill.getOrDefault("amount", 0));
                    metadata.put("dueDate", bill.get("dueDate"));
                    metadata.put("frequency", bill.getOrDefault("frequency", "One-time"));
                    metadata.put("description", bill.get("description"));
                    metadata.put("categoryName", bill.get("categoryName"));
                    metadata.put("categoryId", bill.get("categoryId"));
                    metadata.put("isPaid", bill.getOrDefault("isPaid", false));
                    metadata.put("isAutoPay", bill.getOrDefault("isAutoPay", false));
                    metadata.put("reminder", bill.get("reminder"));
                    metadata.put("paymentMethod", bill.get("paymentMethod"));

                    return SearchResultDTO.builder()
                            .id(String.valueOf(bill.get("id")))
                            .type(SearchResultType.BILL)
                            .title((String) bill.getOrDefault("name", "Bill"))
                            .subtitle(String.format("%s • %s",
                                    bill.getOrDefault("frequency", "One-time"),
                                    formatAmount(bill.get("amount"))))
                            .icon((String) bill.get("icon"))
                            .color((String) bill.get("color"))
                            .metadata(metadata)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> filterAndMapPaymentMethodResults(
            List<Map<String, Object>> paymentMethods, String query, int limit) {
        String queryLower = query.toLowerCase();
        return paymentMethods.stream()
                .filter(pm -> {
                    String name = (String) pm.get("name");
                    String type = (String) pm.get("type");
                    String accountNumber = (String) pm.get("accountNumber");
                    return (name != null && name.toLowerCase().contains(queryLower)) ||
                            (type != null && type.toLowerCase().contains(queryLower)) ||
                            (accountNumber != null && accountNumber.toLowerCase().contains(queryLower));
                })
                .limit(limit)
                .map(pm -> {
                    // Build comprehensive metadata for payment methods
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("type", pm.getOrDefault("type", "Other"));
                    metadata.put("accountNumber", pm.get("accountNumber"));
                    metadata.put("bankName", pm.get("bankName"));
                    metadata.put("isDefault", pm.getOrDefault("isDefault", false));
                    metadata.put("isActive", pm.getOrDefault("isActive", true));
                    metadata.put("lastFourDigits", pm.get("lastFourDigits"));

                    return SearchResultDTO.builder()
                            .id(String.valueOf(pm.get("id")))
                            .type(SearchResultType.PAYMENT_METHOD)
                            .title((String) pm.getOrDefault("name", "Payment Method"))
                            .subtitle((String) pm.getOrDefault("type", "Payment method"))
                            .icon((String) pm.get("icon"))
                            .color((String) pm.get("color"))
                            .metadata(metadata)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> mapFriendResults(List<Map<String, Object>> friends, int limit) {
        return friends.stream()
                .limit(limit)
                .map(friend -> {
                    String firstName = (String) friend.getOrDefault("firstName", "");
                    String lastName = (String) friend.getOrDefault("lastName", "");
                    String fullName = (firstName + " " + lastName).trim();
                    String email = (String) friend.getOrDefault("email", "");

                    if (fullName.isEmpty()) {
                        fullName = email.isEmpty() ? "Friend" : email;
                    }

                    // Build comprehensive metadata for friends
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("email", email);
                    metadata.put("firstName", firstName);
                    metadata.put("lastName", lastName);
                    metadata.put("status", friend.getOrDefault("status", "ACCEPTED"));
                    metadata.put("friendshipId", friend.get("friendshipId"));
                    metadata.put("profilePicture", friend.get("profilePicture"));
                    metadata.put("accessLevel", friend.get("accessLevel"));

                    return SearchResultDTO.builder()
                            .id(String.valueOf(friend.get("id")))
                            .type(SearchResultType.FRIEND)
                            .title(fullName)
                            .subtitle(email)
                            .icon((String) friend.get("profilePicture"))
                            .metadata(metadata)
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
