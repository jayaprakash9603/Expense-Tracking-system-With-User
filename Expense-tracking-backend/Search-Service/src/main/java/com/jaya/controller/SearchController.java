package com.jaya.controller;

import com.jaya.dto.SearchRequestDTO;
import com.jaya.dto.UniversalSearchResponse;
import com.jaya.service.UniversalSearchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

















@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@Slf4j
public class SearchController {

    private final UniversalSearchService searchService;

    




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

        
        if (query == null || query.trim().length() < 2) {
            return ResponseEntity.badRequest().build();
        }

        
        if (limit < 1)
            limit = 5;
        if (limit > 20)
            limit = 20;

        
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

        
        UniversalSearchResponse response = searchService.search(request, authToken);

        return ResponseEntity.ok(response);
    }

    


    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Search Service is running");
    }
}
