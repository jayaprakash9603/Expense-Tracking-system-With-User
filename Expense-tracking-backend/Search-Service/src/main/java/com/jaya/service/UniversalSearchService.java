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

    public UniversalSearchResponse search(SearchRequestDTO request, String authToken) {
        long startTime = System.currentTimeMillis();

        String query = request.getQuery();
        int limit = request.getLimit() != null ? request.getLimit() : defaultLimit;

        log.info("Starting universal search for query: '{}', limit: {}", query, limit);

        Set<String> sectionsToSearch = parseSections(request.getSections());

        UniversalSearchResponse.UniversalSearchResponseBuilder responseBuilder = UniversalSearchResponse.builder()
                .query(query);

        List<CompletableFuture<Void>> futures = new ArrayList<>();

        if (sectionsToSearch.contains("expenses") || sectionsToSearch.isEmpty()) {
            futures.add(searchExpenses(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.expenses(results)));
        }

        if (sectionsToSearch.contains("budgets") || sectionsToSearch.isEmpty()) {
            futures.add(searchBudgets(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.budgets(results)));
        }

        if (sectionsToSearch.contains("categories") || sectionsToSearch.isEmpty()) {
            futures.add(searchCategories(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.categories(results)));
        }

        if (sectionsToSearch.contains("bills") || sectionsToSearch.isEmpty()) {
            futures.add(searchBills(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.bills(results)));
        }

        if (sectionsToSearch.contains("payment_methods") || sectionsToSearch.isEmpty()) {
            futures.add(searchPaymentMethods(query, limit, authToken, request.getTargetId())
                    .thenAccept(results -> responseBuilder.paymentMethods(results)));
        }

        if (sectionsToSearch.contains("friends") || sectionsToSearch.isEmpty()) {
            futures.add(searchFriends(query, limit, authToken)
                    .thenAccept(results -> responseBuilder.friends(results)));
        }

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

    private CompletableFuture<List<SearchResultDTO>> searchExpenses(
            String query, int limit, String authToken, Integer targetId) {

        Mono<Map<Integer, Map<String, Object>>> categoriesMono = webClient.get()
                .uri(categoryServiceUrl + "/api/categories", uriBuilder -> {
                    if (targetId != null) {
                        uriBuilder.queryParam("targetId", targetId);
                    }
                    return uriBuilder.build();
                })
                .header(HttpHeaders.AUTHORIZATION, authToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .timeout(Duration.ofMillis(searchTimeoutMs))
                .map(response -> {
                    // Extract data from ApiResponse wrapper
                    List<Map<String, Object>> categories = extractListFromApiResponse(response);
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

        Mono<List<Map<String, Object>>> expensesMono = webClient.get()
                .uri(expenseServiceUrl + "/api/expenses/search/fuzzy", uriBuilder -> {
                    uriBuilder.queryParam("query", query);
                    uriBuilder.queryParam("limit", limit);
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

        return Mono.zip(expensesMono, categoriesMono)
                .map(tuple -> {
                    List<Map<String, Object>> expenses = tuple.getT1();
                    Map<Integer, Map<String, Object>> categoryMap = tuple.getT2();
                    return mapExpenseResultsWithCategories(expenses, categoryMap, limit);
                })
                .toFuture();
    }

    private CompletableFuture<List<SearchResultDTO>> searchBudgets(
            String query, int limit, String authToken, Integer targetId) {

        return webClient.get()
                .uri(budgetServiceUrl + "/api/budgets/search", uriBuilder -> {
                    uriBuilder.queryParam("query", query);
                    uriBuilder.queryParam("limit", limit);
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
                .map(budgets -> mapBudgetResults(budgets, limit))
                .onErrorResume(e -> {
                    log.error("Error searching budgets: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

    private CompletableFuture<List<SearchResultDTO>> searchCategories(
            String query, int limit, String authToken, Integer targetId) {

        return webClient.get()
                .uri(categoryServiceUrl + "/api/categories/search", uriBuilder -> {
                    uriBuilder.queryParam("query", query);
                    uriBuilder.queryParam("limit", limit);
                    if (targetId != null) {
                        uriBuilder.queryParam("targetId", targetId);
                    }
                    return uriBuilder.build();
                })
                .header(HttpHeaders.AUTHORIZATION, authToken)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {
                })
                .timeout(Duration.ofMillis(searchTimeoutMs))
                .map(response -> {
                    // Extract data from ApiResponse wrapper
                    List<Map<String, Object>> categories = extractListFromApiResponse(response);
                    return mapCategoryResults(categories, limit);
                })
                .onErrorResume(e -> {
                    log.error("Error searching categories: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

    private CompletableFuture<List<SearchResultDTO>> searchBills(
            String query, int limit, String authToken, Integer targetId) {

        return webClient.get()
                .uri(billServiceUrl + "/api/bills/search", uriBuilder -> {
                    uriBuilder.queryParam("query", query);
                    uriBuilder.queryParam("limit", limit);
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
                .map(bills -> mapBillResults(bills, limit))
                .onErrorResume(e -> {
                    log.error("Error searching bills: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

    private CompletableFuture<List<SearchResultDTO>> searchPaymentMethods(
            String query, int limit, String authToken, Integer targetId) {

        return webClient.get()
                .uri(paymentMethodServiceUrl + "/api/payment-methods/search", uriBuilder -> {
                    uriBuilder.queryParam("query", query);
                    uriBuilder.queryParam("limit", limit);
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
                .map(paymentMethods -> mapPaymentMethodResults(paymentMethods, limit))
                .onErrorResume(e -> {
                    log.error("Error searching payment methods: {}", e.getMessage());
                    return Mono.just(Collections.emptyList());
                })
                .toFuture();
    }

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

    private List<SearchResultDTO> mapExpenseResultsWithCategories(
            List<Map<String, Object>> expenses,
            Map<Integer, Map<String, Object>> categoryMap,
            int limit) {
        return expenses.stream()
                .limit(limit)
                .map(exp -> {

                    Map<String, Object> expenseDetails = (Map<String, Object>) exp.get("expense");

                    String name = (String) exp.get("expenseName");
                    if (name == null && expenseDetails != null) {
                        name = (String) expenseDetails.get("expenseName");
                        if (name == null) {
                            name = (String) expenseDetails.get("name");
                        }
                    }
                    if (name == null) {
                        name = (String) exp.get("name");
                    }

                    Object amount = exp.get("amount");
                    if (amount == null && expenseDetails != null) {
                        amount = expenseDetails.get("amount");
                    }

                    String type = (String) exp.get("type");
                    String paymentMethod = (String) exp.get("paymentMethod");
                    String comments = (String) exp.get("comments");
                    Object netAmount = exp.get("netAmount");
                    Object creditDue = exp.get("creditDue");

                    if (expenseDetails != null) {
                        if (type == null)
                            type = (String) expenseDetails.get("type");
                        if (paymentMethod == null)
                            paymentMethod = (String) expenseDetails.get("paymentMethod");
                        if (comments == null)
                            comments = (String) expenseDetails.get("comments");
                        if (netAmount == null)
                            netAmount = expenseDetails.get("netAmount");
                        if (creditDue == null)
                            creditDue = expenseDetails.get("creditDue");
                    }

                    String categoryName = (String) exp.getOrDefault("categoryName", "Uncategorized");
                    String categoryIcon = null;
                    String categoryColor = null;
                    Integer categoryId = null;

                    Object catIdObj = exp.get("categoryId");
                    if (catIdObj != null) {
                        categoryId = catIdObj instanceof Number ? ((Number) catIdObj).intValue()
                                : Integer.parseInt(catIdObj.toString());

                        Map<String, Object> category = categoryMap.get(categoryId);
                        if (category != null) {
                            categoryIcon = (String) category.get("icon");
                            categoryColor = (String) category.get("color");
                            if (categoryName.equals("Uncategorized") || categoryName.isEmpty()) {
                                categoryName = (String) category.getOrDefault("name", "Uncategorized");
                            }
                        }
                    }

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

                    String dateStr = formatDate(exp.get("date"));

                    String subtitle = (comments != null && !comments.isEmpty())
                            ? comments
                            : categoryName;

                    return SearchResultDTO.builder()
                            .id(String.valueOf(exp.get("id")))
                            .type(SearchResultType.EXPENSE)
                            .title(name != null && !name.isEmpty() ? name : "Expense")
                            .subtitle(subtitle)
                            .icon(categoryIcon)
                            .color(categoryColor)
                            .metadata(metadata)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> mapBudgetResults(
            List<Map<String, Object>> budgets, int limit) {
        return budgets.stream()
                .limit(limit)
                .map(budget -> {

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

    private List<SearchResultDTO> mapCategoryResults(
            List<Map<String, Object>> categories, int limit) {
        return categories.stream()
                .limit(limit)
                .map(cat -> {

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

    private List<SearchResultDTO> mapBillResults(
            List<Map<String, Object>> bills, int limit) {
        return bills.stream()
                .limit(limit)
                .map(bill -> {

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

                    String description = (String) bill.get("description");
                    String frequency = (String) bill.getOrDefault("frequency", "One-time");
                    String subtitle = (description != null && !description.isEmpty())
                            ? description
                            : frequency;

                    return SearchResultDTO.builder()
                            .id(String.valueOf(bill.get("id")))
                            .type(SearchResultType.BILL)
                            .title((String) bill.getOrDefault("billName", bill.getOrDefault("name", "Bill")))
                            .subtitle(subtitle)
                            .icon((String) bill.get("icon"))
                            .color((String) bill.get("color"))
                            .metadata(metadata)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<SearchResultDTO> mapPaymentMethodResults(
            List<Map<String, Object>> paymentMethods, int limit) {
        return paymentMethods.stream()
                .limit(limit)
                .map(pm -> {

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

    private String formatDate(Object date) {
        if (date == null)
            return "N/A";
        String dateStr = date.toString();

        try {

            if (dateStr.matches("\\d{4}-\\d{2}-\\d{2}.*")) {
                java.time.LocalDate localDate = java.time.LocalDate.parse(dateStr.substring(0, 10));
                return localDate.format(java.time.format.DateTimeFormatter.ofPattern("MMM dd, yyyy"));
            }
        } catch (Exception e) {

        }
        return dateStr;
    }

    /**
     * Extracts the list from an ApiResponse wrapper.
     * ApiResponse format: { "success": true, "data": [...], ... }
     * Falls back to empty list if extraction fails.
     */
    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> extractListFromApiResponse(Map<String, Object> response) {
        if (response == null) {
            return Collections.emptyList();
        }

        // Try to extract the 'data' field from ApiResponse wrapper
        Object data = response.get("data");
        if (data instanceof List) {
            return (List<Map<String, Object>>) data;
        }

        // If no 'data' field or not a list, check if response itself is a list
        // structure
        // (this handles non-wrapped responses gracefully)
        log.warn("Could not extract list from ApiResponse, data field was: {}",
                data != null ? data.getClass().getSimpleName() : "null");
        return Collections.emptyList();
    }
}
