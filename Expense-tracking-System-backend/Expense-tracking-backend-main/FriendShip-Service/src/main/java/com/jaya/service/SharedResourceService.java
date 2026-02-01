package com.jaya.service;

import com.jaya.dto.share.*;
import com.jaya.exceptions.ShareNotFoundException;
import com.jaya.exceptions.ShareAccessDeniedException;
import com.jaya.exceptions.ShareExpiredException;
import com.jaya.exceptions.ShareRateLimitException;
import com.jaya.models.ShareAccessLog;
import com.jaya.models.SharedResource;
import com.jaya.models.SharedResource.ResourceRef;
import com.jaya.models.SharedResourceType;
import com.jaya.models.ShareVisibility;
import com.jaya.models.UserDto;
import com.jaya.repository.ShareAccessLogRepository;
import com.jaya.repository.SharedResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import com.jaya.dto.ExpenseDTO;

/**
 * Service for managing shared resources with QR code access.
 * Handles creation, validation, revocation, and data retrieval.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SharedResourceService {

    private final SharedResourceRepository sharedResourceRepository;
    private final ShareAccessLogRepository shareAccessLogRepository;
    private final SecureTokenService secureTokenService;
    private final QrCodeService qrCodeService;
    private final UserService userService;
    private final ExpenseService expenseService;
    private final FriendshipService friendshipService;

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

        // Parse visibility (default to LINK_ONLY for backward compatibility)
        ShareVisibility visibility = ShareVisibility.LINK_ONLY;
        if (request.getVisibility() != null && !request.getVisibility().isEmpty()) {
            try {
                visibility = ShareVisibility.valueOf(request.getVisibility().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid visibility value '{}', defaulting to LINK_ONLY", request.getVisibility());
            }
        }

        // Determine isPublic from visibility for backward compatibility
        boolean isPublic = visibility == ShareVisibility.PUBLIC;

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
                .visibility(visibility)
                .isPublic(isPublic)
                .allowedUserIds(request.getAllowedUserIds())
                .build();

        // Save
        share = sharedResourceRepository.save(share);
        log.info("Created share {} for user {} with visibility {}", share.getId(), userId, visibility);

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
                .visibility(share.getVisibility() != null ? share.getVisibility().name() : "LINK_ONLY")
                .allowedUserIds(share.getAllowedUserIds())
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

        // Check visibility-based access
        String accessDeniedReason = checkVisibilityAccess(share, accessingUserId);
        if (accessDeniedReason != null) {
            return buildInvalidResponse(accessDeniedReason);
        }

        // Record access on the share itself
        share.recordAccess();
        sharedResourceRepository.save(share);

        // Record user access for "Shared With Me" tracking
        recordUserAccess(token, accessingUserId);

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
     * Access shared data with pagination support.
     * Returns paginated items for a specific resource type.
     *
     * @param token           The share token
     * @param accessingUserId The user accessing the share (can be null for
     *                        unauthenticated access)
     * @param resourceType    The type of resource to fetch (EXPENSE, CATEGORY,
     *                        BUDGET, BILL, PAYMENT_METHOD)
     * @param page            Page number (0-indexed)
     * @param size            Page size
     * @return Paginated shared data response
     */
    @Transactional
    public SharedDataPageResponse accessSharePaginated(String token, Integer accessingUserId,
            String resourceType, int page, int size, String search) {
        log.debug("Accessing share with pagination: token={}, type={}, page={}, size={}, search={}",
                token.substring(0, Math.min(8, token.length())) + "...", resourceType, page, size,
                search != null ? search : "none");

        SharedResource share = sharedResourceRepository.findByShareToken(token)
                .orElseThrow(() -> new ShareNotFoundException("Share not found"));

        // Check if active
        if (!Boolean.TRUE.equals(share.getIsActive())) {
            return buildInvalidPageResponse("This share has been revoked");
        }

        // Check expiry
        if (share.getExpiresAt() != null && LocalDateTime.now().isAfter(share.getExpiresAt())) {
            return buildInvalidPageResponse("This share has expired");
        }

        // Record access (only on first page to avoid inflating counts)
        if (page == 0) {
            share.recordAccess();
            sharedResourceRepository.save(share);
        }

        // Fetch owner info
        SharedDataResponse.OwnerInfo ownerInfo = fetchOwnerInfo(share.getOwnerUserId());

        // Group resources by type and count
        Map<String, List<ResourceRef>> refsByType = share.getResourceRefs().stream()
                .collect(Collectors.groupingBy(ref -> ref.getType().toUpperCase()));

        Map<String, Integer> countsByType = new HashMap<>();
        for (Map.Entry<String, List<ResourceRef>> entry : refsByType.entrySet()) {
            countsByType.put(entry.getKey(), entry.getValue().size());
        }

        // If no specific type requested, default to first available or EXPENSE
        String normalizedType = resourceType != null ? resourceType.toUpperCase() : null;
        if (normalizedType == null || normalizedType.isEmpty() || normalizedType.equals("ALL")) {
            // Return overview with counts only
            return SharedDataPageResponse.builder()
                    .isValid(true)
                    .permission(share.getPermission())
                    .resourceType(share.getResourceType())
                    .expiresAt(share.getExpiresAt())
                    .owner(ownerInfo)
                    .shareName(share.getShareName())
                    .totalCount(share.getResourceRefs().size())
                    .countsByType(countsByType)
                    .pagedItems(null)
                    .warnings(new ArrayList<>())
                    .build();
        }

        // Get refs for the requested type
        List<ResourceRef> typeRefs = refsByType.getOrDefault(normalizedType, new ArrayList<>());

        // Normalize search query
        String searchQuery = (search != null && !search.trim().isEmpty())
                ? search.trim().toLowerCase()
                : null;

        // Batch fetch data based on type to avoid N+1 query problem
        List<SharedDataResponse.SharedItem> allItems = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if ("EXPENSE".equals(normalizedType)) {
            // Batch fetch all expenses in a single query
            allItems = fetchExpensesBatch(typeRefs, share.getOwnerUserId(), searchQuery, warnings);
        } else {
            // For other types, use individual fetch (can be optimized later)
            for (ResourceRef ref : typeRefs) {
                try {
                    Object data = fetchResourceData(ref, share.getOwnerUserId());
                    if (data != null) {
                        SharedDataResponse.SharedItem item = SharedDataResponse.SharedItem.builder()
                                .type(ref.getType())
                                .externalRef(ref.getExternalRef())
                                .data(data)
                                .found(true)
                                .build();

                        // If search is provided, filter items
                        if (searchQuery == null || matchesSearch(item, searchQuery)) {
                            allItems.add(item);
                        }
                    } else if (searchQuery == null) {
                        // Only add not-found items when not searching
                        allItems.add(SharedDataResponse.SharedItem.builder()
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
                    if (searchQuery == null) {
                        warnings.add(String.format("Could not retrieve %s '%s'", ref.getType(), ref.getExternalRef()));
                    }
                }
            }
        }

        // Now paginate the filtered results
        int totalItems = allItems.size();
        int totalPages = (int) Math.ceil((double) totalItems / size);

        int startIndex = page * size;
        int endIndex = Math.min(startIndex + size, totalItems);

        List<SharedDataResponse.SharedItem> items = (startIndex < totalItems)
                ? allItems.subList(startIndex, endIndex)
                : new ArrayList<>();

        SharedDataPageResponse.PagedItems pagedItems = SharedDataPageResponse.PagedItems.builder()
                .resourceType(normalizedType)
                .items(items)
                .page(page)
                .size(size)
                .totalItems(totalItems)
                .totalPages(totalPages)
                .hasMore(page < totalPages - 1)
                .build();

        return SharedDataPageResponse.builder()
                .isValid(true)
                .permission(share.getPermission())
                .resourceType(share.getResourceType())
                .expiresAt(share.getExpiresAt())
                .owner(ownerInfo)
                .shareName(share.getShareName())
                .totalCount(share.getResourceRefs().size())
                .countsByType(countsByType)
                .pagedItems(pagedItems)
                .warnings(warnings)
                .build();
    }

    private SharedDataPageResponse buildInvalidPageResponse(String reason) {
        return SharedDataPageResponse.builder()
                .isValid(false)
                .invalidReason(reason)
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

    /**
     * Check if the accessing user is allowed based on share visibility.
     * 
     * @param share           The shared resource
     * @param accessingUserId The ID of the user trying to access (can be null for
     *                        anonymous)
     * @return Error message if access denied, null if access allowed
     */
    private String checkVisibilityAccess(SharedResource share, Integer accessingUserId) {
        ShareVisibility visibility = share.getVisibility();
        if (visibility == null) {
            visibility = ShareVisibility.LINK_ONLY; // Default for backward compatibility
        }

        // Owner always has access
        if (accessingUserId != null && accessingUserId.equals(share.getOwnerUserId())) {
            return null;
        }

        switch (visibility) {
            case PUBLIC:
            case LINK_ONLY:
                // Anyone with the link can access
                return null;

            case FRIENDS_ONLY:
                // Must be logged in and be a friend of the owner
                if (accessingUserId == null) {
                    return "This share is only accessible to friends. Please log in.";
                }
                if (!isFriendOf(share.getOwnerUserId(), accessingUserId)) {
                    return "This share is only accessible to the owner's friends.";
                }
                return null;

            case SPECIFIC_USERS:
                // Must be logged in and be in the allowed users list
                if (accessingUserId == null) {
                    return "This share is private. Please log in to check your access.";
                }
                List<Integer> allowedIds = share.getAllowedUserIds();
                if (allowedIds == null || !allowedIds.contains(accessingUserId)) {
                    return "You don't have permission to access this share.";
                }
                return null;

            default:
                return null;
        }
    }

    /**
     * Check if two users are friends.
     * 
     * @param ownerId The owner user ID
     * @param userId  The user ID to check
     * @return true if they are friends, false otherwise
     */
    private boolean isFriendOf(Integer ownerId, Integer userId) {
        try {
            // Call the FriendshipService to check friendship status
            return friendshipService.areFriends(ownerId, userId);
        } catch (Exception e) {
            log.warn("Failed to check friendship between {} and {}: {}", ownerId, userId, e.getMessage());
            return false;
        }
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

    /**
     * Batch fetch expenses to avoid N+1 query problem.
     * Fetches all expenses in a single query and maps them to SharedItem objects.
     *
     * @param typeRefs    List of resource references for expenses
     * @param ownerUserId Owner user ID for the expenses
     * @param searchQuery Optional search query to filter results
     * @param warnings    List to collect any warnings about missing data
     * @return List of SharedItem objects containing expense data
     */
    private List<SharedDataResponse.SharedItem> fetchExpensesBatch(
            List<ResourceRef> typeRefs,
            Integer ownerUserId,
            String searchQuery,
            List<String> warnings) {

        List<SharedDataResponse.SharedItem> items = new ArrayList<>();

        if (typeRefs.isEmpty()) {
            return items;
        }

        // Collect all expense IDs from refs
        Map<Integer, ResourceRef> idToRefMap = new HashMap<>();
        Set<Integer> expenseIds = new HashSet<>();

        for (ResourceRef ref : typeRefs) {
            Integer expenseId = ref.getInternalId();
            if (expenseId == null) {
                expenseId = parseIdFromExternalRef(ref.getExternalRef());
            }
            if (expenseId != null) {
                expenseIds.add(expenseId);
                idToRefMap.put(expenseId, ref);
            } else {
                log.warn("Could not determine expense ID for ref: {}", ref.getExternalRef());
                if (searchQuery == null) {
                    warnings.add(String.format("Could not parse ID for expense '%s'",
                            ref.getDisplayName() != null ? ref.getDisplayName() : ref.getExternalRef()));
                }
            }
        }

        if (expenseIds.isEmpty()) {
            return items;
        }

        try {
            // Batch fetch all expenses in a single query
            log.debug("Batch fetching {} expenses for user {}", expenseIds.size(), ownerUserId);
            List<ExpenseDTO> expenses = expenseService.getExpensesByIds(ownerUserId, expenseIds);

            // Create a map for quick lookup
            Map<Integer, ExpenseDTO> expenseMap = new HashMap<>();
            for (ExpenseDTO expense : expenses) {
                expenseMap.put(expense.getId(), expense);
            }

            // Build SharedItem list preserving original order
            for (ResourceRef ref : typeRefs) {
                Integer expenseId = ref.getInternalId();
                if (expenseId == null) {
                    expenseId = parseIdFromExternalRef(ref.getExternalRef());
                }

                if (expenseId == null) {
                    continue; // Already handled above
                }

                ExpenseDTO expense = expenseMap.get(expenseId);
                if (expense != null) {
                    SharedDataResponse.SharedItem item = SharedDataResponse.SharedItem.builder()
                            .type(ref.getType())
                            .externalRef(ref.getExternalRef())
                            .data(expense)
                            .found(true)
                            .build();

                    // If search is provided, filter items
                    if (searchQuery == null || matchesSearch(item, searchQuery)) {
                        items.add(item);
                    }
                } else if (searchQuery == null) {
                    // Expense not found - add as not found item
                    items.add(SharedDataResponse.SharedItem.builder()
                            .type(ref.getType())
                            .externalRef(ref.getExternalRef())
                            .data(null)
                            .found(false)
                            .build());
                    warnings.add(String.format("EXPENSE '%s' no longer exists",
                            ref.getDisplayName() != null ? ref.getDisplayName() : ref.getExternalRef()));
                }
            }

            log.debug("Batch fetch complete: {} items returned", items.size());

        } catch (Exception e) {
            log.error("Failed to batch fetch expenses: {}", e.getMessage(), e);
            // Fallback: return empty list with warning
            warnings.add("Failed to fetch expenses: " + e.getMessage());
        }

        return items;
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

    /**
     * Check if a SharedItem matches the search query.
     * Searches across various fields based on the item type.
     */
    private boolean matchesSearch(SharedDataResponse.SharedItem item, String searchQuery) {
        if (item.getData() == null) {
            return false;
        }

        // Convert data to string representation and search
        String dataStr = item.getData().toString().toLowerCase();
        if (dataStr.contains(searchQuery)) {
            return true;
        }

        // Also check externalRef
        if (item.getExternalRef() != null &&
                item.getExternalRef().toLowerCase().contains(searchQuery)) {
            return true;
        }

        // Type-specific field extraction using reflection or map access
        try {
            Object data = item.getData();
            if (data instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> dataMap = (java.util.Map<String, Object>) data;

                // Check common fields
                for (String key : new String[] { "title", "name", "description", "category",
                        "merchant", "notes", "categoryName", "budgetName", "billName" }) {
                    Object value = dataMap.get(key);
                    if (value != null && value.toString().toLowerCase().contains(searchQuery)) {
                        return true;
                    }
                }

                // Check nested expense object if present
                Object expense = dataMap.get("expense");
                if (expense instanceof java.util.Map) {
                    @SuppressWarnings("unchecked")
                    java.util.Map<String, Object> expenseMap = (java.util.Map<String, Object>) expense;
                    for (String key : new String[] { "title", "description", "category" }) {
                        Object value = expenseMap.get(key);
                        if (value != null && value.toString().toLowerCase().contains(searchQuery)) {
                            return true;
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Error during search field extraction: {}", e.getMessage());
        }

        return false;
    }

    // ==========================================================================
    // SHARED WITH ME - Track and retrieve shares accessed by users
    // ==========================================================================

    /**
     * Record that a user has accessed a share.
     * Creates or updates the access log.
     */
    @Transactional
    public void recordUserAccess(String token, Integer accessingUserId) {
        if (accessingUserId == null) {
            return; // Anonymous access, don't track
        }

        SharedResource share = sharedResourceRepository.findByShareToken(token)
                .orElse(null);

        if (share == null || share.getOwnerUserId().equals(accessingUserId)) {
            return; // Share not found or user is accessing their own share
        }

        Optional<ShareAccessLog> existingLog = shareAccessLogRepository
                .findByAccessingUserIdAndSharedResource(accessingUserId, share);

        if (existingLog.isPresent()) {
            ShareAccessLog log = existingLog.get();
            log.recordAccess();
            shareAccessLogRepository.save(log);
        } else {
            ShareAccessLog newLog = ShareAccessLog.builder()
                    .accessingUserId(accessingUserId)
                    .sharedResource(share)
                    .lastAccessedAt(LocalDateTime.now())
                    .build();
            shareAccessLogRepository.save(newLog);
        }
    }

    /**
     * Get all shares that have been shared with the user (accessed by them).
     */
    @Transactional(readOnly = true)
    public List<SharedWithMeItem> getSharesSharedWithMe(Integer userId) {
        List<ShareAccessLog> accessLogs = shareAccessLogRepository.findByAccessingUserId(userId);

        return accessLogs.stream()
                .map(log -> mapToSharedWithMeItem(log))
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }

    /**
     * Get saved shares for a user.
     */
    @Transactional(readOnly = true)
    public List<SharedWithMeItem> getSavedShares(Integer userId) {
        List<ShareAccessLog> accessLogs = shareAccessLogRepository.findSavedByAccessingUserId(userId);

        return accessLogs.stream()
                .map(log -> mapToSharedWithMeItem(log))
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }

    /**
     * Toggle save status for a share.
     */
    @Transactional
    public boolean toggleSaveShare(String token, Integer userId) {
        SharedResource share = sharedResourceRepository.findByShareToken(token)
                .orElseThrow(() -> new ShareNotFoundException("Share not found"));

        Optional<ShareAccessLog> existingLog = shareAccessLogRepository
                .findByAccessingUserIdAndSharedResource(userId, share);

        if (existingLog.isPresent()) {
            ShareAccessLog log = existingLog.get();
            log.setIsSaved(!Boolean.TRUE.equals(log.getIsSaved()));
            shareAccessLogRepository.save(log);
            return log.getIsSaved();
        } else {
            // Create new log with saved status
            ShareAccessLog newLog = ShareAccessLog.builder()
                    .accessingUserId(userId)
                    .sharedResource(share)
                    .lastAccessedAt(LocalDateTime.now())
                    .isSaved(true)
                    .build();
            shareAccessLogRepository.save(newLog);
            return true;
        }
    }

    private SharedWithMeItem mapToSharedWithMeItem(ShareAccessLog log) {
        SharedResource share = log.getSharedResource();
        if (share == null) {
            return null;
        }

        SharedWithMeItem.OwnerInfo ownerInfo = fetchSharedWithMeOwnerInfo(share.getOwnerUserId());

        return SharedWithMeItem.builder()
                .shareId(share.getId())
                .token(share.getShareToken())
                .shareUrl(qrCodeService.buildShareUrl(share.getShareToken()))
                .resourceType(share.getResourceType())
                .permission(share.getPermission())
                .shareName(share.getShareName())
                .resourceCount(share.getResourceRefs() != null ? share.getResourceRefs().size() : 0)
                .expiresAt(share.getExpiresAt())
                .isActive(share.getIsActive())
                .firstAccessedAt(log.getFirstAccessedAt())
                .lastAccessedAt(log.getLastAccessedAt())
                .myAccessCount(log.getAccessCount())
                .isSaved(log.getIsSaved())
                .owner(ownerInfo)
                .build();
    }

    private SharedWithMeItem.OwnerInfo fetchSharedWithMeOwnerInfo(Integer ownerId) {
        try {
            UserDto owner = userService.getUserProfileById(ownerId);
            if (owner != null) {
                return SharedWithMeItem.OwnerInfo.builder()
                        .id(owner.getId())
                        .firstName(owner.getFirstName())
                        .lastName(owner.getLastName())
                        .username(owner.getUsername())
                        .email(owner.getEmail())
                        .profileImage(owner.getImage())
                        .build();
            }
        } catch (Exception e) {
            log.debug("Could not fetch owner info for user {}: {}", ownerId, e.getMessage());
        }
        return SharedWithMeItem.OwnerInfo.builder()
                .id(ownerId)
                .firstName("User")
                .lastName("#" + ownerId)
                .build();
    }

    // ==========================================================================
    // PUBLIC SHARES - Get publicly discoverable shares
    // ==========================================================================

    /**
     * Get all public shares (including all users' shares).
     * Uses visibility = PUBLIC to determine public shares.
     * Public shares are visible to everyone by design.
     */
    @Transactional(readOnly = true)
    public List<PublicShareItem> getPublicShares(Integer requestingUserId) {
        // Public shares are visible to everyone, including the owner
        // This allows users to verify their public shares appear correctly
        List<SharedResource> publicShares = sharedResourceRepository.findAllPublicShares(
                LocalDateTime.now(), ShareVisibility.PUBLIC);

        return publicShares.stream()
                .map(share -> mapToPublicShareItem(share, requestingUserId))
                .collect(Collectors.toList());
    }

    /**
     * Make a share public or private.
     * Updates both visibility and isPublic fields for backward compatibility.
     */
    @Transactional
    public void setSharePublic(String token, Integer userId, boolean isPublic) {
        SharedResource share = sharedResourceRepository.findByTokenAndOwner(token, userId)
                .orElseThrow(() -> new ShareAccessDeniedException(
                        "Share not found or you don't have permission to modify it"));

        share.setIsPublic(isPublic);
        // Also update visibility for consistency
        share.setVisibility(isPublic ? ShareVisibility.PUBLIC : ShareVisibility.LINK_ONLY);
        sharedResourceRepository.save(share);

        log.info("Share {} set to public={} by user {}", share.getId(), isPublic, userId);
    }

    private PublicShareItem mapToPublicShareItem(SharedResource share, Integer requestingUserId) {
        PublicShareItem.OwnerInfo ownerInfo = fetchPublicOwnerInfo(share.getOwnerUserId());

        // Determine if this share belongs to the requesting user
        boolean isOwnShare = requestingUserId != null && requestingUserId.equals(share.getOwnerUserId());

        return PublicShareItem.builder()
                .id(share.getId())
                .token(share.getShareToken())
                .shareUrl(qrCodeService.buildShareUrl(share.getShareToken()))
                .resourceType(share.getResourceType())
                .permission(share.getPermission())
                .shareName(share.getShareName())
                .resourceCount(share.getResourceRefs() != null ? share.getResourceRefs().size() : 0)
                .expiresAt(share.getExpiresAt())
                .createdAt(share.getCreatedAt())
                .accessCount(share.getAccessCount())
                .visibility(share.getVisibility() != null ? share.getVisibility().name() : "PUBLIC")
                .isActive(share.getIsActive())
                .isOwnShare(isOwnShare)
                .owner(ownerInfo)
                .build();
    }

    private PublicShareItem.OwnerInfo fetchPublicOwnerInfo(Integer ownerId) {
        try {
            UserDto owner = userService.getUserProfileById(ownerId);
            if (owner != null) {
                return PublicShareItem.OwnerInfo.builder()
                        .id(owner.getId())
                        .firstName(owner.getFirstName())
                        .lastName(owner.getLastName())
                        .username(owner.getUsername())
                        .profileImage(owner.getImage())
                        .build();
            }
        } catch (Exception e) {
            log.debug("Could not fetch owner info for user {}: {}", ownerId, e.getMessage());
        }
        return PublicShareItem.OwnerInfo.builder()
                .id(ownerId)
                .firstName("User")
                .lastName("#" + ownerId)
                .build();
    }
}
