package com.jaya.controller;

import com.jaya.dto.ApplicationOverviewDTO;
import com.jaya.service.AnalyticsOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsOverviewService analyticsOverviewService;

    @GetMapping("/overview")
    public ResponseEntity<ApplicationOverviewDTO> getApplicationOverview(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(value = "targetId", required = false) Integer targetId) {

        ApplicationOverviewDTO overview = analyticsOverviewService.getOverview(jwt, targetId);
        return ResponseEntity.ok(overview);
    }
}
