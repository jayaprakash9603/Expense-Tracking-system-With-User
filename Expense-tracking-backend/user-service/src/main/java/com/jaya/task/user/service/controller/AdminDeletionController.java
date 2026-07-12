package com.jaya.task.user.service.controller;

import com.jaya.common.deletion.DeletionInitiator;
import com.jaya.task.user.service.dto.DeletionStatusResponse;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.modal.deletion.DeletionSaga;
import com.jaya.task.user.service.service.UserService;
import com.jaya.task.user.service.service.deletion.AccountDeletionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/users/{userId:\\d+}/deletion-request")
@RequiredArgsConstructor
@Slf4j
public class AdminDeletionController {

    private final AccountDeletionService accountDeletionService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<DeletionStatusResponse> requestForUser(
            @PathVariable Integer userId,
            @RequestHeader("Authorization") String jwt) {
        User admin = userService.getUserProfile(jwt);
        DeletionSaga saga = accountDeletionService.requestDeletion(
                userId, DeletionInitiator.ADMIN, admin == null ? null : admin.getId());
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(DeletionStatusResponse.from(saga));
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<DeletionStatusResponse> getStatus(@PathVariable Integer userId) {
        return accountDeletionService.getActiveSaga(userId)
                .map(s -> ResponseEntity.ok(DeletionStatusResponse.from(s)))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @DeleteMapping
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<DeletionStatusResponse> cancel(
            @PathVariable Integer userId,
            @RequestHeader("Authorization") String jwt) {
        User admin = userService.getUserProfile(jwt);
        DeletionSaga saga = accountDeletionService.cancelDeletion(
                userId, admin == null ? null : admin.getId());
        return ResponseEntity.ok(DeletionStatusResponse.from(saga));
    }

    @PostMapping("/retry")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<DeletionStatusResponse> retry(@PathVariable Integer userId) {
        DeletionSaga saga = accountDeletionService.adminRetry(userId);
        return ResponseEntity.accepted().body(DeletionStatusResponse.from(saga));
    }

    @PostMapping("/bulk")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> bulkSchedule(
            @RequestBody List<Integer> userIds,
            @RequestHeader("Authorization") String jwt) {
        User admin = userService.getUserProfile(jwt);
        int scheduled = 0;
        int failed = 0;
        for (Integer id : userIds) {
            try {
                accountDeletionService.requestDeletion(id, DeletionInitiator.ADMIN,
                        admin == null ? null : admin.getId());
                scheduled++;
            } catch (RuntimeException e) {
                log.warn("Failed to schedule deletion for user {}: {}", id, e.getMessage());
                failed++;
            }
        }
        return ResponseEntity.ok(Map.of(
                "scheduled", scheduled,
                "failed", failed,
                "message", "Bulk deletion scheduled with 5-day grace period"));
    }
}
