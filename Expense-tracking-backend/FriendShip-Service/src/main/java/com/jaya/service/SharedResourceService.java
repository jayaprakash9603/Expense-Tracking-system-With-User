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

@Service
@RequiredArgsConstructor
@Slf4j
public class SharedResourceService {

    private final SharedResourceRepository sharedResourceRepository;
    private final ShareAccessLogRepository shareAccessLogRepository;
    private final SecureTokenService secureTokenService;
    private final QrCodeService qrCodeService;
    private final UserService userService;
    private final ExpenseClient expenseService;
    private final FriendshipService friendshipService;

    @Value("${app.share.rate-limit.max-shares-per-hour:10}")
    private int maxSharesPerHour;

    @Value("${app.share.rate-limit.max-active-shares:50}")
    private int maxActiveShares;

    @Value("${app.share.base-url:http://localhost:3000}")
    private String shareBaseUrl;

    @Transactional
    public ShareResponse createShare(CreateShareRequest request, Integer userId, String shareBaseUrlOverride) {
        log.info("Creating share for user {} with {} resources", userId, request.getResourceRefs().size());
        enforceRateLimits(userId);
        String token = generateUniqueToken();
        List<ResourceRef> resourceRefs = request.getResourceRefs().stream()
                .map(dto -> ResourceRef.builder()
                        .type(dto.getType())
                        .internalId(dto.getInternalId())
                        .externalRef(dto.getExternalRef())
                        .displayName(dto.getDisplayName())
                        .build())
                .collect(Collectors.toList());

        ShareVisibility visibility = ShareVisibility.LINK_ONLY;
        if (request.getVisibility() != null && !request.getVisibility().isEmpty()) {
            try {
                visibility = ShareVisibility.valueOf(request.getVisibility().toUpperCase());
            } catch (IllegalArgumentException e) {
                log.warn("Invalid visibility value '{}', defaulting to LINK_ONLY", request.getVisibility());
            }
        }

        boolean isPublic = visibility == ShareVisibility.PUBLIC;
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

        share = sharedResourceRepository.save(share);
        log.info("Created share {} for user {} with visibility {}", share.getId(), userId, visibility);
        String qrCodeDataUri = qrCodeService.generateQrCodeDataUri(token, shareBaseUrlOverride);
        String shareUrl = qrCodeService.buildShareUrl(token, shareBaseUrlOverride);

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

    @Transactional
    public ShareResponse createShare(CreateShareRequest request, Integer userId) {
        return createShare(request, userId, null);
    }

    @Transactional
    public SharedDataResponse accessShare(String token, Integer accessingUserId) {
        log.debug("Accessing share with token: {}", token.substring(0, 8) + "...");

        SharedResource share = sharedResourceRepository.findByShareToken(token)
                .orElseThrow(() -> new ShareNotFoundException("Share not found"));

        if (!Boolean.TRUE.equals(share.getIsActive())) {
            return buildInvalidResponse("This share has been revoked");
        }
        if (share.getExpiresAt() != null && LocalDateTime.now().isAfter(share.getExpiresAt())) {
            return buildInvalidResponse("This share has expired");
        }
        String accessDeniedReason = checkVisibilityAccess(share, accessingUserId);
        if (accessDeniedReason != null) {
            return buildInvalidResponse(accessDeniedReason);
        }
        share.recordAccess();
        sharedResourceRepository.save(share);
        recordUserAccess(token, accessingUserId);
        SharedDataResponse.OwnerInfo ownerInfo = fetchOwnerInfo(share.getOwnerUserId());
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

    @Transactional
    public SharedDataPageResponse accessSharePaginated(String token, Integer accessingUserId,
            String resourceType, int page, int size, String search) {
        log.debug("Accessing share with pagination: token={}, type={}, page={}, size={}, search={}",
                token.substring(0, Math.min(8, token.length())) + "...", resourceType, page, size,
                search != null ? search : "none");

        SharedResource share = sharedResourceRepository.findByShareToken(token)
                .orElseThrow(() -> new ShareNotFoundException("Share not found"));

        if (!Boolean.TRUE.equals(share.getIsActive())) {
            return buildInvalidPageResponse("This share has been revoked");
        }
        if (share.getExpiresAt() != null && LocalDateTime.now().isAfter(share.getExpiresAt())) {
            return buildInvalidPageResponse("This share has expired");
        }
        if (page == 0) {
            share.recordAccess();
            sharedResourceRepository.save(share);
        }

        SharedDataResponse.OwnerInfo ownerInfo = fetchOwnerInfo(share.getOwnerUserId());
        Map<String, List<ResourceRef>> refsByType = share.getResourceRefs().stream()
                .collect(Collectors.groupingBy(ref -> ref.getType().toUpperCase()));

        Map<String, Integer> countsByType = new HashMap<>();
        for (Map.Entry<String, List<ResourceRef>> entry : refsByType.entrySet()) {
            countsByType.put(entry.getKey(), entry.getValue().size());
        }

        String normalizedType = resourceType != null ? resourceType.toUpperCase() : null;
        if (normalizedType == null || normalizedType.isEmpty() || normalizedType.equals("ALL")) {
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

        List<ResourceRef> typeRefs = refsByType.getOrDefault(normalizedType, new ArrayList<>());
        String searchQuery = (search != null && !search.trim().isEmpty())
                ? search.trim().toLowerCase()
                : null;
        List<SharedDataResponse.SharedItem> allItems = new ArrayList<>();
        List<String> warnings = new ArrayList<>();

        if ("EXPENSE".equals(normalizedType)) {
            allItems = fetchExpensesBatch(typeRefs, share.getOwnerUserId(), searchQuery, warnings);
        } else {
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
                        if (searchQuery == null || matchesSearch(item, searchQuery)) {
                            allItems.add(item);
                        }
                    } else if (searchQuery == null) {
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

    @Transactional(readOnly = true)
    public List<ShareListItem> getUserShares(Integer userId) {
        List<SharedResource> shares = sharedResourceRepository.findByOwnerUserId(userId);

        return shares.stream()
                .map(this::mapToListItem)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ShareListItem> getActiveUserShares(Integer userId) {
        List<SharedResource> shares = sharedResourceRepository.findActiveByOwnerUserId(userId);

        return shares.stream()
                .map(this::mapToListItem)
                .collect(Collectors.toList());
    }

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
     * Deactivate expired shares. Called by FriendshipScheduledJobs.
     */
    @Transactional
    public void deactivateExpiredSharesInternal() {
        log.info("Running job to deactivate expired shares");
        int count = sharedResourceRepository.deactivateExpiredShares(LocalDateTime.now());
        if (count > 0) {
            log.info("Deactivated {} expired shares", count);
        }
    }

    private void enforceRateLimits(Integer userId) {
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        long recentShares = sharedResourceRepository.countSharesCreatedSince(userId, oneHourAgo);
        if (recentShares >= maxSharesPerHour) {
            throw new ShareRateLimitException("Rate limit exceeded. Maximum " + maxSharesPerHour + " shares per hour.");
        }
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

    private String checkVisibilityAccess(SharedResource share, Integer accessingUserId) {
        ShareVisibility visibility = share.getVisibility();
        if (visibility == null) {
            visibility = ShareVisibility.LINK_ONLY;
        }
        if (accessingUserId != null && accessingUserId.equals(share.getOwnerUserId())) {
            return null;
        }

        switch (visibility) {
            case PUBLIC:
            case LINK_ONLY:
                return null;

            case FRIENDS_ONLY:
                if (accessingUserId == null) {
                    return "This share is only accessible to friends. Please log in.";
                }
                if (!isFriendOf(share.getOwnerUserId(), accessingUserId)) {
                    return "This share is only accessible to the owner's friends.";
                }
                return null;

            case SPECIFIC_USERS:
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

    private boolean isFriendOf(Integer ownerId, Integer userId) {
        try {
            return friendshipService.areFriends(ownerId, userId);
        } catch (Exception e) {
            log.warn("Failed to check friendship between {} and {}: {}", ownerId, userId, e.getMessage());
            return false;
        }
    }

    private SharedDataResponse.OwnerInfo fetchOwnerInfo(Integer userId) {
        try {
            return SharedDataResponse.OwnerInfo.builder()
                    .id(userId)
                    .name("User " + userId)
                    .build();
        } catch (Exception e) {
            log.warn("Failed to fetch owner info for user {}", userId);
            return SharedDataResponse.OwnerInfo.builder()
                    .id(userId)
                    .build();
        }
    }

    private List<SharedDataResponse.SharedItem> fetchExpensesBatch(
            List<ResourceRef> typeRefs,
            Integer ownerUserId,
            String searchQuery,
            List<String> warnings) {

        List<SharedDataResponse.SharedItem> items = new ArrayList<>();

        if (typeRefs.isEmpty()) {
            return items;
        }

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
            log.debug("Batch fetching {} expenses for user {}", expenseIds.size(), ownerUserId);
            List<ExpenseDTO> expenses = expenseService.getExpensesByIds(ownerUserId, expenseIds);
            Map<Integer, ExpenseDTO> expenseMap = new HashMap<>();
            for (ExpenseDTO expense : expenses) {
                expenseMap.put(expense.getId(), expense);
            }

            for (ResourceRef ref : typeRefs) {
                Integer expenseId = ref.getInternalId();
                if (expenseId == null) {
                    expenseId = parseIdFromExternalRef(ref.getExternalRef());
                }

                if (expenseId == null) {
                    continue;
                }

                ExpenseDTO expense = expenseMap.get(expenseId);
                if (expense != null) {
                    SharedDataResponse.SharedItem item = SharedDataResponse.SharedItem.builder()
                            .type(ref.getType())
                            .externalRef(ref.getExternalRef())
                            .data(expense)
                            .found(true)
                            .build();

                    if (searchQuery == null || matchesSearch(item, searchQuery)) {
                        items.add(item);
                    }
                } else if (searchQuery == null) {
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
            warnings.add("Failed to fetch expenses: " + e.getMessage());
        }

        return items;
    }

    private Object fetchResourceData(ResourceRef ref, Integer ownerUserId) {
        try {
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
                    log.info("Category data fetch not yet implemented for ref: {}", ref.getExternalRef());
                    return null;
                case "BUDGET":
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

    private Integer parseIdFromExternalRef(String externalRef) {
        if (externalRef == null || externalRef.isEmpty()) {
            return null;
        }

        try {
            if (externalRef.contains("-")) {
                String[] parts = externalRef.split("-");
                if (parts.length >= 2) {
                    return Integer.parseInt(parts[1]);
                }
            }

            if (externalRef.contains("_")) {
                String[] parts = externalRef.split("_");
                if (parts.length >= 2) {
                    return Integer.parseInt(parts[1]);
                }
            }

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

    private boolean matchesSearch(SharedDataResponse.SharedItem item, String searchQuery) {
        if (item.getData() == null) {
            return false;
        }

        String dataStr = item.getData().toString().toLowerCase();
        if (dataStr.contains(searchQuery)) {
            return true;
        }

        if (item.getExternalRef() != null &&
                item.getExternalRef().toLowerCase().contains(searchQuery)) {
            return true;
        }
        try {
            Object data = item.getData();
            if (data instanceof java.util.Map) {
                @SuppressWarnings("unchecked")
                java.util.Map<String, Object> dataMap = (java.util.Map<String, Object>) data;

                for (String key : new String[] { "title", "name", "description", "category",
                        "merchant", "notes", "categoryName", "budgetName", "billName" }) {
                    Object value = dataMap.get(key);
                    if (value != null && value.toString().toLowerCase().contains(searchQuery)) {
                        return true;
                    }
                }

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

    @Transactional
    public void recordUserAccess(String token, Integer accessingUserId) {
        if (accessingUserId == null) {
            return;
        }

        SharedResource share = sharedResourceRepository.findByShareToken(token)
                .orElse(null);

        if (share == null || share.getOwnerUserId().equals(accessingUserId)) {
            return;
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

    @Transactional(readOnly = true)
    public List<SharedWithMeItem> getSharesSharedWithMe(Integer userId) {
        List<ShareAccessLog> accessLogs = shareAccessLogRepository.findByAccessingUserId(userId);

        return accessLogs.stream()
                .map(log -> mapToSharedWithMeItem(log))
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SharedWithMeItem> getSavedShares(Integer userId) {
        List<ShareAccessLog> accessLogs = shareAccessLogRepository.findSavedByAccessingUserId(userId);

        return accessLogs.stream()
                .map(log -> mapToSharedWithMeItem(log))
                .filter(item -> item != null)
                .collect(Collectors.toList());
    }

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

    @Transactional(readOnly = true)
    public List<PublicShareItem> getPublicShares(Integer requestingUserId) {
        List<SharedResource> publicShares = sharedResourceRepository.findAllPublicShares(
                LocalDateTime.now(), ShareVisibility.PUBLIC);

        return publicShares.stream()
                .map(share -> mapToPublicShareItem(share, requestingUserId))
                .collect(Collectors.toList());
    }

    @Transactional
    public void setSharePublic(String token, Integer userId, boolean isPublic) {
        SharedResource share = sharedResourceRepository.findByTokenAndOwner(token, userId)
                .orElseThrow(() -> new ShareAccessDeniedException(
                        "Share not found or you don't have permission to modify it"));

        share.setIsPublic(isPublic);
        share.setVisibility(isPublic ? ShareVisibility.PUBLIC : ShareVisibility.LINK_ONLY);
        sharedResourceRepository.save(share);

        log.info("Share {} set to public={} by user {}", share.getId(), isPublic, userId);
    }

    private PublicShareItem mapToPublicShareItem(SharedResource share, Integer requestingUserId) {
        PublicShareItem.OwnerInfo ownerInfo = fetchPublicOwnerInfo(share.getOwnerUserId());
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
