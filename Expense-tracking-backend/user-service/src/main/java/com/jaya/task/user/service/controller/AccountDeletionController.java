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
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

/**
 * Self-service endpoints for the five-day deletion lifecycle. All routes
 * require a valid end-user JWT that resolves to the same user being modified;
 * cross-user calls are always rejected here (admin flows live under
 * {@link AdminDeletionController}).
 */
@RestController
@RequestMapping("/api/user/me/deletion-request")
@RequiredArgsConstructor
@Slf4j
public class AccountDeletionController {

    private final AccountDeletionService accountDeletionService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<DeletionStatusResponse> requestSelfDeletion(
            @RequestHeader("Authorization") String jwt) {
        User user = userService.getUserProfile(jwt);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        DeletionSaga saga = accountDeletionService.requestDeletion(
                user.getId(), DeletionInitiator.SELF, user.getId());
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(DeletionStatusResponse.redactPii(DeletionStatusResponse.from(saga)));
    }

    @GetMapping
    public ResponseEntity<DeletionStatusResponse> getStatus(
            @RequestHeader("Authorization") String jwt) {
        User user = userService.getUserProfile(jwt);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        Optional<DeletionSaga> saga = accountDeletionService.getActiveSaga(user.getId());
        return saga.map(s -> ResponseEntity.ok(
                        DeletionStatusResponse.redactPii(DeletionStatusResponse.from(s))))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @DeleteMapping
    public ResponseEntity<DeletionStatusResponse> cancelSelfDeletion(
            @RequestHeader("Authorization") String jwt) {
        User user = userService.getUserProfile(jwt);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        DeletionSaga saga = accountDeletionService.cancelDeletion(user.getId(), user.getId());
        return ResponseEntity.ok(
                DeletionStatusResponse.redactPii(DeletionStatusResponse.from(saga)));
    }
}
