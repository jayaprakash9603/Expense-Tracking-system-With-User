package com.jaya.controller;

import com.jaya.dto.*;
import com.jaya.service.StoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for user-facing story operations
 * Handles fetching, viewing, and interacting with stories
 */
@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class StoryController {

    private final StoryService storyService;

    /**
     * Get active stories for the current user
     * GET /api/stories?userId={userId}
     */
    @GetMapping
    public ResponseEntity<StoryListResponse> getActiveStories(
            @RequestParam Integer userId) {
        log.debug("Fetching active stories for user: {}", userId);
        StoryListResponse response = storyService.getActiveStoriesForUser(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get a specific story by ID
     * GET /api/stories/{storyId}?userId={userId}
     */
    @GetMapping("/{storyId}")
    public ResponseEntity<StoryDTO> getStoryById(
            @PathVariable UUID storyId,
            @RequestParam Integer userId) {
        StoryDTO story = storyService.getStoryById(storyId, userId);
        return ResponseEntity.ok(story);
    }

    /**
     * Mark a story as seen
     * POST /api/stories/{storyId}/seen
     */
    @PostMapping("/{storyId}/seen")
    public ResponseEntity<Map<String, String>> markStorySeen(
            @PathVariable UUID storyId,
            @RequestParam Integer userId) {
        log.debug("Marking story {} as seen by user {}", storyId, userId);
        storyService.markStorySeen(storyId, userId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Story marked as seen"));
    }

    /**
     * Mark CTA as clicked
     * POST /api/stories/{storyId}/cta/{ctaId}/clicked
     */
    @PostMapping("/{storyId}/cta/{ctaId}/clicked")
    public ResponseEntity<Map<String, String>> markCtaClicked(
            @PathVariable UUID storyId,
            @PathVariable UUID ctaId,
            @RequestParam Integer userId) {
        log.debug("Marking CTA {} clicked on story {} by user {}", ctaId, storyId, userId);
        storyService.markStoryCtaClicked(storyId, ctaId, userId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "CTA click recorded"));
    }

    /**
     * Dismiss a story for the user
     * POST /api/stories/{storyId}/dismiss
     */
    @PostMapping("/{storyId}/dismiss")
    public ResponseEntity<Map<String, String>> dismissStory(
            @PathVariable UUID storyId,
            @RequestParam Integer userId) {
        log.debug("Dismissing story {} for user {}", storyId, userId);
        storyService.dismissStory(storyId, userId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Story dismissed"));
    }

    /**
     * Bulk mark multiple stories as seen
     * POST /api/stories/seen-bulk
     */
    @PostMapping("/seen-bulk")
    public ResponseEntity<Map<String, String>> markStoriesSeenBulk(
            @RequestBody Map<String, Object> request) {
        Integer userId = (Integer) request.get("userId");
        @SuppressWarnings("unchecked")
        java.util.List<String> storyIds = (java.util.List<String>) request.get("storyIds");

        for (String storyIdStr : storyIds) {
            UUID storyId = UUID.fromString(storyIdStr);
            storyService.markStorySeen(storyId, userId);
        }

        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Marked " + storyIds.size() + " stories as seen"));
    }
}
