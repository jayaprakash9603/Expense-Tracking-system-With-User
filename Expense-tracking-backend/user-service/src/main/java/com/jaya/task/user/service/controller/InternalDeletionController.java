package com.jaya.task.user.service.controller;

import com.jaya.common.deletion.PurgeUserCommand;
import com.jaya.common.deletion.PurgeUserResult;
import com.jaya.task.user.service.modal.Role;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.RoleRepository;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.service.deletion.AccountDeletionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;

/**
 * Internal service-to-service endpoints for the user-service participant step.
 * Protected by the {@code ROLE_SERVICE} authority granted by
 * {@link com.jaya.common.security.InternalServiceAuthFilter}; end-user
 * JWTs cannot reach these routes.
 */
@RestController
@RequestMapping("/api/internal/users")
@RequiredArgsConstructor
@Slf4j
public class InternalDeletionController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final AccountDeletionService accountDeletionService;

    /**
     * Direct-call synchronous participant purge for user-owned auxiliary data
     * (roles, OAuth links, MFA state). The identity row itself is anonymized
     * during saga finalization, not here.
     */
    @PostMapping("/{userId}/purge")
    @PreAuthorize("hasAuthority('ROLE_SERVICE')")
    @Transactional
    public ResponseEntity<PurgeUserResult> purge(
            @PathVariable Integer userId,
            @RequestBody PurgeUserCommand command) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getRoles() != null) {
                    for (String roleName : user.getRoles()) {
                        roleRepository.findByName(roleName).ifPresent(role -> {
                            if (role.getUsers() != null && role.getUsers().remove(userId)) {
                                roleRepository.save(role);
                            }
                        });
                    }
                }
                user.setMfaEnabled(false);
                user.setMfaSecret(null);
                user.setMfaBackupCodes(null);
                user.setTwoFactorEnabled(false);
                userRepository.save(user);
            }
            PurgeUserResult result = PurgeUserResult.builder()
                    .sagaId(command.getSagaId())
                    .idempotencyKey(command.getIdempotencyKey())
                    .userId(userId)
                    .service("user-service")
                    .status(PurgeUserResult.Status.SUCCEEDED)
                    .completedAt(Instant.now())
                    .attempt(command.getAttempt())
                    .build();
            accountDeletionService.handleResult(result);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            log.error("user-service self-purge failed for user {}: {}", userId, e.getMessage(), e);
            PurgeUserResult failure = PurgeUserResult.builder()
                    .sagaId(command.getSagaId())
                    .idempotencyKey(command.getIdempotencyKey())
                    .userId(userId)
                    .service("user-service")
                    .status(PurgeUserResult.Status.FAILED)
                    .errorMessage(e.getMessage())
                    .completedAt(Instant.now())
                    .attempt(command.getAttempt())
                    .build();
            accountDeletionService.handleResult(failure);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(failure);
        }
    }

    /** Health probe for the orchestrator to verify a participant is reachable. */
    @GetMapping("/purge/ping")
    @PreAuthorize("hasAuthority('ROLE_SERVICE')")
    public ResponseEntity<Void> ping() {
        return ResponseEntity.noContent().build();
    }
}
