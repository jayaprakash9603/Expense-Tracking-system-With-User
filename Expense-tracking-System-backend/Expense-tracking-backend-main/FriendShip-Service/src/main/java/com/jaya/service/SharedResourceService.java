package com.jaya.service;

import com.jaya.dto.share.*;
import com.jaya.exceptions.ShareNotFoundException;
import com.jaya.exceptions.ShareAccessDeniedException;
import com.jaya.exceptions.ShareExpiredException;
import com.jaya.exceptions.ShareRateLimitException;
import com.jaya.models.SharedResource;
import com.jaya.models.SharedResource.ResourceRef;
import com.jaya.models.SharedResourceType;
import com.jaya.models.UserDto;
import com.jaya.repository.SharedResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing shared resources with QR code access.
 * Handles creation, validation, revocation, and data retrieval.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SharedResourceService {

    private final SharedResourceRepository sharedResourceRepository;
    private final SecureTokenService secureTokenService;
    private final QrCodeService qrCodeService;
    private final UserService userService;
    private final ExpenseService expenseService;

    @Value("${app.share.rate-limit.max-shares-per-hour:10}")
    private int maxSharesPerHour;

    @Value("${app.share.rate-limit.max-active-shares:50}")
    private int maxActiveShares;

    @Value("${app.share.base-url:http://localhost:3000}")
    private String shareBaseUrl;

    /**
     * Create a new share and generate QR code.
     */
    @Transactional
    public ShareResponse createShare(CreateShareRequest request, Integer userId) {
        log.info("Creating share for user {} with {} resources", userId, request.getResourceRefs().size());

        // Rate limiting checks
        enforceRateLimits(userId);

        // Generate unique token
        String token = generateUniqueToken();

        // Convert DTOs to entity refs
        List<ResourceRef> resourceRefs = request.getResourceRefs().stream()
                .map(dto -> ResourceRef.builder()
                        .type(dto.getType())
                        .internalId(dto.getInternalId())
                        .externalRef(dto.getExternalRef())
                        .displayName(dto.getDisplayName())
                        .build())
                .collect(Collectors.toList());

        // Build entity
        SharedResource share = SharedResource.builder()
                .shareToken(token)
                .ownerUserId(userId)
                .resourceType(request.getResourceType())
                .resourceRefs(resourceRefs)
                .permission(request.getPermission())
                .expiresAt(request.calculateExpiresAt())
                .isActive(true)
                .shareName(request.getShareName())
                .accessCount(0)
                .build();

        // Save
        share = sharedResourceRepository.save(share);
        log.info("Created share {} for user {}", share.getId(), userId);

        // Generate QR code
        String qrCodeDataUri = qrCodeService.generateQrCodeDataUri(token);
        String shareUrl = qrCodeService.buildShareUrl(token);

        return ShareResponse.builder()
                .id(share.getId())
                .token(token)
                .shareUrl(shareUrl)
                .qrCodeDataUri(qrCodeDataUri)
                .resourceType(share.getResourceType())
                .permission(share.getPermission())
                .expiresAt(share.getExpiresAt())
                .isActive(share.getIsActive())
                .createdAt(share.getCreatedAt())
                .shareName(share.getShareName())
                .resourceCount(resourceRefs.size())
                .accessCount(share.getAccessCount())
                .build();
    }

    /**
     * Validate a share token and return the shared data.
     */
    @Transactional
    public SharedDataResponse accessShare(String token, Integer accessingUserId) {
        log.debug("Accessing share with token: {}", token.substring(0, 8) + "...");

        SharedResource share = sharedResourceRepository.findByShareToken(token)
                .orElseThrow(() -> new ShareNotFoundException("Share not found"));

        // Check if active
        if (!Boolean.TRUE.equals(share.getIsActive())) {
            return buildInvalidResponse("This share has been revoked");
        }

        // Check expiry
        if (share.getExpiresAt() != null && LocalDateTime.now().isAfter(share.getExpiresAt())) {
            return buildInvalidResponse("This share has expired");
        }

        // Record access
        share.recordAccess();
        sharedResourceRepository.save(share);

        // Fetch owner info
        SharedDataResponse.OwnerInfo ownerInfo = fetchOwnerInfo(share.getOwnerUserId());

        // Fetch actual shared data
        List<SharedDataResponse.SharedItem> items = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        int foundCount = 0;

        for (ResourceRef ref : share.getResourceRefs()) {
            try {
                Object data = fetchResourceData(ref, share.getOwnerUserId());
                if (data != null) {
                    items.add(SharedDataResponse.SharedItem.builder()
                            .type(ref.getType())
                            .externalRef(ref.getExternalRef())
                            .data(data)
                            .found(true)
                            .build());
                    foundCount++;
                } else {
                    items.add(SharedDataResponse.SharedItem.builder()
                            .type(ref.getType())
                            .externalRef(ref.getExternalRef())
                            .data(null)
                            .found(false)
                            .build());
                    warnings.add(String.format("%s '%s' no longer exists", ref.getType(),
                            ref.getDisplayName() != null ? ref.getDisplayName() : ref.getExternalRef()));
                }
            } catch (Exception e) {
                log.warn("Failed to fetch resource: {} - {}", ref.getExternalRef(), e.getMessage());
                warnings.add(String.format("Could not retrieve %s '%s'", ref.getType(), ref.getExternalRef()));
            }
        }

        return SharedDataResponse.builder()
                .isValid(true)
                .permission(share.getPermission())
                .resourceType(share.getResourceType())
                .expiresAt(share.getExpiresAt())
                .owner(ownerInfo)
                .items(items)
                .warnings(warnings)
                .originalCount(share.getResourceRefs().size())
                .returnedCount(foundCount)
                .shareName(share.getShareName())
                .build();
    }

    /**
     * Revoke a share (owner only).
     */
    @Transactional
    public void revokeShare(String token, Integer userId) {
        log.info("Revoking share for user {}", userId);

        SharedResource share = sharedResourceRepository.findByTokenAndOwner(token, userId)
                .orElseThrow(() -> new ShareAccessDeniedException(
                        "Share not found or you don't have permission to revoke it"));

        share.revoke();
        sharedResourceRepository.save(share);

        log.info("Revoked share {} for user {}", share.getId(), userId);
    }

    /**
     * Get all shares for a user.
     */
    @Transactional(readOnly = true)
    public List<ShareListItem> getUserShares(Integer userId) {
        List<SharedResource> shares = sharedResourceRepository.findByOwnerUserId(userId);

        return shares.stream()
                .map(this::mapToListItem)
                .collect(Collectors.toList());
    }

    /**
     * Get active shares for a user.
     */
    @Transactional(readOnly = true)
    public List<ShareListItem> getActiveUserShares(Integer userId) {
        List<SharedResource> shares = sharedResourceRepository.findActiveByOwnerUserId(userId);

        return shares.stream()
                .map(this::mapToListItem)
                .collect(Collectors.toList());
    }

    /**
     * Get share statistics for a user.
     */
    @Transactional(readOnly = true)
    public ShareStats getShareStats(Integer userId) {
        List<SharedResource> allShares = sharedResourceRepository.findByOwnerUserId(userId);

        long active = allShares.stream().filter(s -> Boolean.TRUE.equals(s.getIsActive()) && s.isValid()).count();
        long revoked = allShares.stream().filter(s -> s.getRevokedAt() != null).count();
        long expired = allShares.stream()
                .filter(s -> s.getExpiresAt() != null && LocalDateTime.now().isAfter(s.getExpiresAt())).count();
        long totalAccess = allShares.stream().mapToLong(s -> s.getAccessCount() != null ? s.getAccessCount() : 0).sum();

        return ShareStats.builder()
                .totalShares((long) allShares.size())
                .activeShares(active)
                .revokedShares(revoked)
                .expiredShares(expired)
                .totalAccessCount(totalAccess)
                .build();
    }

    /**
     * Scheduled job to deactivate expired shares.
     * Runs every hour.
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void deactivateExpiredShares() {
        log.info("Running scheduled job to deactivate expired shares");
        int count = sharedResourceRepository.deactivateExpiredShares(LocalDateTime.now());
        if (count > 0) {
            log.info("Deactivated {} expired shares", count);
        }
    }

    // ========== Private Helper Methods ==========

    private void enforceRateLimits(Integer userId) {
        // Check hourly limit
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentShares = sharedResourceRepository.countSharesCreatedSince(userId, oneHourAgo);
        if (recentShares >= maxSharesPerHour) {
            throw new ShareRateLimitException("Rate limit exceeded. Maximum " + maxSharesPerHour + " shares per hour.");
        }

        // Check active share limit
        long activeShares = sharedResourceRepository.countActiveSharesByOwner(userId);
        if (activeShares >= maxActiveShares) {
            throw new ShareRateLimitException(
                    "Maximum active shares limit reached (" + maxActiveShares + "). Please revoke some shares first.");
        }
    }

    private String generateUniqueToken() {
        String token;
        int attempts = 0;
        do {
            token = secureTokenService.generateToken();
            attempts++;
            if (attempts > 10) {
                throw new RuntimeException("Failed to generate unique token after 10 attempts");
            }
        } while (sharedResourceRepository.existsByShareToken(token));
        return token;
    }

    private SharedDataResponse buildInvalidResponse(String reason) {
        return SharedDataResponse.builder()
                .isValid(false)
                .invalidReason(reason)
                .build();
    }

    private SharedDataResponse.OwnerInfo fetchOwnerInfo(Integer userId) {
        try {
            // This would call the user service
            return SharedDataResponse.OwnerInfo.builder()
                    .id(userId)
                    .name("User " + userId) // Placeholder - replace with actual user lookup
                    .build();
        } catch (Exception e) {
            log.warn("Failed to fetch owner info for user {}", userId);
            return SharedDataResponse.OwnerInfo.builder()
                    .id(userId)
                    .build();
        }
    }

    private Object fetchResourceData(ResourceRef ref, Integer ownerUserId) {
        // Fetch data based on resource type using internal IDs
        try {
            // Try to get internalId, or parse it from externalRef as fallback
            Integer resourceId = ref.getInternalId();
            if (resourceId == null) {
                resourceId = parseIdFromExternalRef(ref.getExternalRef());
            }

            if (resourceId == null) {
                log.warn("Could not determine resource ID for ref: {}", ref.getExternalRef());
                return null;
            }

            switch (ref.getType().toUpperCase()) {
                case "EXPENSE":
                    return expenseService.getExpenseById(resourceId, ownerUserId);
                case "CATEGORY":
                    // TODO: Add category service call when available
                    log.info("Category data fetch not yet implemented for ref: {}", ref.getExternalRef());
                    return null;
                case "BUDGET":
                    // TODO: Add budget service call when available
                    log.info("Budget data fetch not yet implemented for ref: {}", ref.getExternalRef());
                    return null;
                default:
                    log.warn("Unknown resource type: {}", ref.getType());
                    return null;
            }
        } catch (Exception e) {
            log.error("Failed to fetch resource data for ref: {}, error: {}", ref.getExternalRef(), e.getMessage());
            return null;
        }
    }

    /**
     * Parse the resource ID from an external reference.
     * Supports formats: EXP-123, EXP_123_date, CAT-123, BUD-123, etc.
     */
    private Integer parseIdFromExternalRef(String externalRef) {
        if (externalRef == null || externalRef.isEmpty()) {
            return null;
        }

        try {
            // Try format: TYPE-ID (e.g., EXP-259402)
            if (externalRef.contains("-")) {
                String[] parts = externalRef.split("-");
                if (parts.length >= 2) {
                    return Integer.parseInt(parts[1]);
                }
            }

            // Try format: TYPE_ID_... (e.g., EXP_123_2026-01-29)
            if (externalRef.contains("_")) {
                String[] parts = externalRef.split("_");
                if (parts.length >= 2) {
                    return Integer.parseInt(parts[1]);
                }
            }

            // Try parsing as plain number
            return Integer.parseInt(externalRef);
        } catch (NumberFormatException e) {
            log.debug("Could not parse ID from externalRef: {}", externalRef);
            return null;
        }
    }

    private ShareListItem mapToListItem(SharedResource share) {
        List<ShareListItem.ResourceSummary> resources = share.getResourceRefs().stream()
                .map(ref -> ShareListItem.ResourceSummary.builder()
                        .type(ref.getType())
                        .externalRef(ref.getExternalRef())
                        .displayName(ref.getDisplayName())
                        .build())
                .collect(Collectors.toList());

        return ShareListItem.builder()
                .id(share.getId())
                .token(share.getShareToken())
                .shareUrl(qrCodeService.buildShareUrl(share.getShareToken()))
                .resourceType(share.getResourceType())
                .permission(share.getPermission())
                .expiresAt(share.getExpiresAt())
                .isActive(share.getIsActive())
                .createdAt(share.getCreatedAt())
                .revokedAt(share.getRevokedAt())
                .shareName(share.getShareName())
                .resourceCount(share.getResourceRefs().size())
                .accessCount(share.getAccessCount())
                .lastAccessedAt(share.getLastAccessedAt())
                .resources(resources)
                .build();
    }
}
