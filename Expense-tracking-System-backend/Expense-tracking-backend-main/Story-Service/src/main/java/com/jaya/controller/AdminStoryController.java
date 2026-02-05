package com.jaya.controller;

import com.jaya.dto.*;
import com.jaya.models.enums.StoryStatus;
import com.jaya.models.enums.StoryType;
import com.jaya.service.StoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;








@RestController
@RequestMapping("/api/admin/stories")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdminStoryController {

    private final StoryService storyService;

    



    @PostMapping
    public ResponseEntity<StoryDTO> createStory(
            @Valid @RequestBody CreateStoryRequest request,
            @RequestHeader(value = "X-Admin-Id", defaultValue = "1") Integer adminId) {
        log.info("Admin {} creating story: {}", adminId, request.getTitle());
        StoryDTO story = storyService.createStory(request, adminId);
        return ResponseEntity.status(HttpStatus.CREATED).body(story);
    }

    



    @PutMapping("/{storyId}")
    public ResponseEntity<StoryDTO> updateStory(
            @PathVariable UUID storyId,
            @RequestBody UpdateStoryRequest request,
            @RequestHeader(value = "X-Admin-Id", defaultValue = "1") Integer adminId) {
        log.info("Admin {} updating story: {}", adminId, storyId);
        StoryDTO story = storyService.updateStory(storyId, request, adminId);
        return ResponseEntity.ok(story);
    }

    



    @DeleteMapping("/{storyId}")
    public ResponseEntity<Map<String, String>> deleteStory(
            @PathVariable UUID storyId,
            @RequestHeader(value = "X-Admin-Id", defaultValue = "1") Integer adminId) {
        log.info("Admin {} deleting story: {}", adminId, storyId);
        storyService.deleteStory(storyId, adminId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Story deleted"));
    }

    



    @PostMapping("/{storyId}/activate")
    public ResponseEntity<Map<String, String>> activateStory(
            @PathVariable UUID storyId,
            @RequestHeader(value = "X-Admin-Id", defaultValue = "1") Integer adminId) {
        log.info("Admin {} activating story: {}", adminId, storyId);
        storyService.activateStory(storyId, adminId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Story activated"));
    }

    



    @PostMapping("/{storyId}/deactivate")
    public ResponseEntity<Map<String, String>> deactivateStory(
            @PathVariable UUID storyId,
            @RequestHeader(value = "X-Admin-Id", defaultValue = "1") Integer adminId) {
        log.info("Admin {} deactivating story: {}", adminId, storyId);
        storyService.deactivateStory(storyId, adminId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Story deactivated"));
    }

    



    @PostMapping("/{storyId}/archive")
    public ResponseEntity<Map<String, String>> archiveStory(
            @PathVariable UUID storyId,
            @RequestHeader(value = "X-Admin-Id", defaultValue = "1") Integer adminId) {
        log.info("Admin {} archiving story: {}", adminId, storyId);
        storyService.archiveStory(storyId, adminId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Story archived"));
    }

    



    @PostMapping("/{storyId}/unarchive")
    public ResponseEntity<Map<String, String>> unarchiveStory(
            @PathVariable UUID storyId,
            @RequestHeader(value = "X-Admin-Id", defaultValue = "1") Integer adminId) {
        log.info("Admin {} unarchiving story: {}", adminId, storyId);
        storyService.unarchiveStory(storyId, adminId);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Story unarchived"));
    }

    



    @GetMapping
    public ResponseEntity<Page<StoryDTO>> getAllStories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<StoryDTO> stories = storyService.getAllStories(pageable);
        return ResponseEntity.ok(stories);
    }

    



    @GetMapping("/{storyId}")
    public ResponseEntity<StoryDTO> getStoryById(@PathVariable UUID storyId) {
        log.info("Fetching story: {}", storyId);
        StoryDTO story = storyService.getStoryById(storyId);
        return ResponseEntity.ok(story);
    }

    



    @GetMapping("/status/{status}")
    public ResponseEntity<Page<StoryDTO>> getStoriesByStatus(
            @PathVariable StoryStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<StoryDTO> stories = storyService.getStoriesByStatus(status, pageable);
        return ResponseEntity.ok(stories);
    }

    



    @GetMapping("/type/{type}")
    public ResponseEntity<Page<StoryDTO>> getStoriesByType(
            @PathVariable StoryType type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<StoryDTO> stories = storyService.getStoriesByType(type, pageable);
        return ResponseEntity.ok(stories);
    }

    



    @PostMapping("/expire")
    public ResponseEntity<Map<String, Object>> expireStories(
            @RequestHeader(value = "X-Admin-Id", defaultValue = "1") Integer adminId) {
        log.info("Admin {} triggering story expiration", adminId);
        int count = storyService.expireOldStories();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "expiredCount", count));
    }

    



    @PostMapping("/archive-expired")
    public ResponseEntity<Map<String, Object>> archiveExpiredStories(
            @RequestHeader(value = "X-Admin-Id", defaultValue = "1") Integer adminId) {
        log.info("Admin {} triggering story archival", adminId);
        int count = storyService.archiveExpiredStories();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "archivedCount", count));
    }
}
