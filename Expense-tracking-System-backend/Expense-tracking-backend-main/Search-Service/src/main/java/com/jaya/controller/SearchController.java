package com.jaya.controller;

import com.jaya.dto.SearchRequestDTO;
import com.jaya.dto.UniversalSearchResponse;
import com.jaya.service.UniversalSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Search Controller
 * Provides universal search endpoint for the expense tracking system
 * 
 * Endpoint: GET /api/search
 * 
 * Query Parameters:
 * - q: Search query (required, min 2 characters)
 * - limit: Max results per section (default: 5, max: 20)
 * - sections: Comma-separated sections to search (default: all)
 * - startDate: Filter by start date (optional)
 * - endDate: Filter by end date (optional)
 * - minAmount: Filter by minimum amount (optional)
 * - maxAmount: Filter by maximum amount (optional)
 * - targetId: Target user ID for friend view (optional)
 */
@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
public class SearchController {

    private final UniversalSearchService searchService;

    /**
     * Universal search endpoint
     * Searches across expenses, budgets, categories, bills, payment methods, and
     * friends
     */
    @GetMapping
    public ResponseEntity<UniversalSearchResponse> search(
            @RequestParam("q") String query,
            @RequestParam(value = "limit", defaultValue = "5") Integer limit,
            @RequestParam(value = "sections", required = false) String sections,
            @RequestParam(value = "startDate", required = false) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) LocalDate endDate,
            @RequestParam(value = "minAmount", required = false) Double minAmount,
            @RequestParam(value = "maxAmount", required = false) Double maxAmount,
            @RequestParam(value = "targetId", required = false) Integer targetId,
            @RequestHeader("Authorization") String authToken) {

        // Validate query
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }

        // Validate limit
        if (limit < 1)
            limit = 5;
        if (limit > 20)
            limit = 20;

        // Build search request
        SearchRequestDTO request = SearchRequestDTO.builder()
                .query(query.trim())
                .limit(limit)
                .sections(sections)
                .startDate(startDate)
                .endDate(endDate)
                .minAmount(minAmount)
                .maxAmount(maxAmount)
                .targetId(targetId)
                .build();

        log.info("Search request received: query='{}', limit={}, sections={}",
                query, limit, sections);

        // Execute search
        UniversalSearchResponse response = searchService.search(request, authToken);

        return ResponseEntity.ok(response);
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Search Service is running");
    }
}
