package com.jaya.controller;

import com.jaya.dto.share.*;
import com.jaya.models.UserDto;
import com.jaya.service.FriendshipNotificationService;
import com.jaya.service.QrCodeService;
import com.jaya.service.SharedResourceService;
import com.jaya.service.UserAddedItemsService;
import com.jaya.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
@Slf4j
public class ShareController {

    private final SharedResourceService sharedResourceService;
    private final UserService userService;
    private final QrCodeService qrCodeService;
    private final FriendshipNotificationService notificationService;
    private final UserAddedItemsService userAddedItemsService;

    @PostMapping
    public ResponseEntity<ShareResponse> createShare(
            @RequestHeader("Authorization") String jwt,
            @Valid @RequestBody CreateShareRequest request,
            HttpServletRequest httpRequest) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.info("User {} creating share for {} resources", user.getId(), request.getResourceRefs().size());

        String shareBaseUrlOverride = resolveShareBaseUrl(httpRequest);
        ShareResponse response = sharedResourceService.createShare(request, user.getId(), shareBaseUrlOverride);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    private String resolveShareBaseUrl(HttpServletRequest request) {
        String explicitHeader = getHeaderValue(request, "X-Share-Base-Url");
        if (explicitHeader != null) {
            return explicitHeader;
        }

        String origin = getHeaderValue(request, "Origin");
        if (origin != null) {
            return origin;
        }

        String forwardedProto = getHeaderValue(request, "X-Forwarded-Proto");
        String forwardedHost = getHeaderValue(request, "X-Forwarded-Host");
        String forwardedPort = getHeaderValue(request, "X-Forwarded-Port");
        if (forwardedProto != null && forwardedHost != null) {
            StringBuilder builder = new StringBuilder();
            builder.append(forwardedProto).append("://").append(forwardedHost);
            if (forwardedPort != null && !forwardedPort.isBlank() && !forwardedHost.contains(":")
                    && !isDefaultPort(forwardedProto, forwardedPort)) {
                builder.append(":").append(forwardedPort);
            }
            return builder.toString();
        }

        String referer = getHeaderValue(request, "Referer");
        if (referer != null) {
            try {
                URI uri = new URI(referer);
                if (uri.getScheme() != null && uri.getHost() != null) {
                    int port = uri.getPort();
                    String portPart = port > 0 && !isDefaultPort(uri.getScheme(), String.valueOf(port))
                            ? ":" + port
                            : "";
                    return uri.getScheme() + "://" + uri.getHost() + portPart;
                }
            } catch (URISyntaxException e) {
                log.debug("Invalid referer header while resolving share base URL: {}", referer);
            }
        }

        return null;
    }

    private String getHeaderValue(HttpServletRequest request, String name) {
        String value = request.getHeader(name);
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private boolean isDefaultPort(String scheme, String port) {
        if (scheme == null || port == null) {
            return false;
        }
        return ("http".equalsIgnoreCase(scheme) && "80".equals(port))
                || ("https".equalsIgnoreCase(scheme) && "443".equals(port));
    }

    @GetMapping("/{token}")
    public ResponseEntity<SharedDataResponse> accessShare(
            @PathVariable String token,
            @RequestHeader(value = "Authorization", required = false) String jwt) {

        Integer accessingUserId = null;
        if (jwt != null && !jwt.isEmpty()) {
            try {
                UserDto user = userService.getuserProfile(jwt);
                accessingUserId = user.getId();
            } catch (Exception e) {
                log.debug("Could not get user from JWT, proceeding as anonymous");
            }
        }

        log.debug("Accessing share with token (first 8 chars): {}", token.substring(0, Math.min(8, token.length())));

        SharedDataResponse response = sharedResourceService.accessShare(token, accessingUserId);

        if (!Boolean.TRUE.equals(response.getIsValid())) {
            return ResponseEntity.status(HttpStatus.GONE).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{token}/paginated")
    public ResponseEntity<SharedDataPageResponse> accessSharePaginated(
            @PathVariable String token,
            @RequestParam(defaultValue = "ALL") String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String search,
            @RequestHeader(value = "Authorization", required = false) String jwt) {

        Integer accessingUserId = null;
        if (jwt != null && !jwt.isEmpty()) {
            try {
                UserDto user = userService.getuserProfile(jwt);
                accessingUserId = user.getId();
            } catch (Exception e) {
                log.debug("Could not get user from JWT, proceeding as anonymous");
            }
        }

        log.debug("Accessing paginated share: token={}..., type={}, page={}, size={}, search={}",
                token.substring(0, Math.min(8, token.length())), type, page, size,
                search != null ? search : "none");

        size = Math.max(1, Math.min(100, size));

        SharedDataPageResponse response = sharedResourceService.accessSharePaginated(
                token, accessingUserId, type, page, size, search);

        if (!Boolean.TRUE.equals(response.getIsValid())) {
            return ResponseEntity.status(HttpStatus.GONE).body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{token}/validate")
    public ResponseEntity<Map<String, Object>> validateShare(@PathVariable String token) {
        try {
            SharedDataResponse response = sharedResourceService.accessShare(token, null);

            return ResponseEntity.ok(Map.of(
                    "valid", Boolean.TRUE.equals(response.getIsValid()),
                    "permission", response.getPermission() != null ? response.getPermission().name() : null,
                    "expiresAt", response.getExpiresAt() != null ? response.getExpiresAt().toString() : null,
                    "shareName", response.getShareName() != null ? response.getShareName() : "",
                    "invalidReason", response.getInvalidReason() != null ? response.getInvalidReason() : ""));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                    "valid", false,
                    "invalidReason", e.getMessage()));
        }
    }

    @DeleteMapping("/{token}")
    public ResponseEntity<Map<String, String>> revokeShare(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.info("User {} revoking share with token: {}...", user.getId(),
                token.substring(0, Math.min(8, token.length())));

        sharedResourceService.revokeShare(token, user.getId());

        return ResponseEntity.ok(Map.of("message", "Share revoked successfully"));
    }

    @GetMapping("/my-shares")
    public ResponseEntity<List<ShareListItem>> getMyShares(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "false") boolean activeOnly) throws Exception {

        UserDto user = userService.getuserProfile(jwt);

        List<ShareListItem> shares;
        if (activeOnly) {
            shares = sharedResourceService.getActiveUserShares(user.getId());
        } else {
            shares = sharedResourceService.getUserShares(user.getId());
        }

        return ResponseEntity.ok(shares);
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<SharedWithMeItem>> getSharedWithMe(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "false") boolean savedOnly) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.info("User {} fetching shares shared with them, savedOnly={}", user.getId(), savedOnly);

        List<SharedWithMeItem> shares;
        if (savedOnly) {
            shares = sharedResourceService.getSavedShares(user.getId());
        } else {
            shares = sharedResourceService.getSharesSharedWithMe(user.getId());
        }

        return ResponseEntity.ok(shares);
    }

    @GetMapping("/public")
    public ResponseEntity<List<PublicShareItem>> getPublicShares(
            @RequestHeader(value = "Authorization", required = false) String jwt) {

        Integer excludeUserId = null;
        if (jwt != null && !jwt.isEmpty()) {
            try {
                UserDto user = userService.getuserProfile(jwt);
                excludeUserId = user.getId();
            } catch (Exception e) {
                log.debug("Could not get user from JWT for public shares");
            }
        }

        List<PublicShareItem> shares = sharedResourceService.getPublicShares(excludeUserId);
        return ResponseEntity.ok(shares);
    }

    @PostMapping("/{token}/toggle-save")
    public ResponseEntity<Map<String, Object>> toggleSaveShare(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.info("User {} toggling save for share token: {}...", user.getId(),
                token.substring(0, Math.min(8, token.length())));

        boolean isSaved = sharedResourceService.toggleSaveShare(token, user.getId());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "isSaved", isSaved,
                "message", isSaved ? "Share saved successfully" : "Share unsaved successfully"));
    }

    @PutMapping("/{token}/public")
    public ResponseEntity<Map<String, Object>> setSharePublic(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token,
            @RequestParam boolean isPublic) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.info("User {} setting share {}... to public={}", user.getId(),
                token.substring(0, Math.min(8, token.length())), isPublic);

        sharedResourceService.setSharePublic(token, user.getId(), isPublic);

        return ResponseEntity.ok(Map.of(
                "token", token,
                "isPublic", isPublic,
                "message", isPublic ? "Share is now public" : "Share is now private"));
    }

    @GetMapping("/stats")
    public ResponseEntity<ShareStats> getShareStats(
            @RequestHeader("Authorization") String jwt) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        ShareStats stats = sharedResourceService.getShareStats(user.getId());

        return ResponseEntity.ok(stats);
    }

    @PostMapping("/{token}/regenerate-qr")
    public ResponseEntity<Map<String, String>> regenerateQr(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token,
            @RequestParam(defaultValue = "300") int size,
            HttpServletRequest httpRequest) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.debug("Regenerating QR for share token: {}...", token.substring(0, Math.min(8, token.length())));

        List<ShareListItem> userShares = sharedResourceService.getUserShares(user.getId());
        boolean ownsShare = userShares.stream().anyMatch(s -> s.getToken().equals(token));

        if (!ownsShare) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to regenerate this QR code"));
        }

        String shareBaseUrlOverride = resolveShareBaseUrl(httpRequest);
        String qrCode = qrCodeService.generateQrCodeWithSize(token, size, shareBaseUrlOverride);
        String shareUrl = qrCodeService.buildShareUrl(token, shareBaseUrlOverride);

        return ResponseEntity.ok(Map.of(
                "qrCodeDataUri", qrCode,
                "shareUrl", shareUrl));
    }

    @GetMapping("/{token}/qr")
    public ResponseEntity<Map<String, String>> getShareQr(
            @PathVariable String token,
            @RequestParam(defaultValue = "300") int size,
            HttpServletRequest httpRequest) {

        log.debug("Generating QR for share token: {}...", token.substring(0, Math.min(8, token.length())));

        try {
            SharedDataResponse response = sharedResourceService.accessShare(token, null);
            if (!Boolean.TRUE.equals(response.getIsValid())) {
                return ResponseEntity.status(HttpStatus.GONE)
                        .body(Map.of("error", "Share is no longer valid: " + response.getInvalidReason()));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Share not found"));
        }

        String shareBaseUrlOverride = resolveShareBaseUrl(httpRequest);
        String qrCode = qrCodeService.generateQrCodeWithSize(token, size, shareBaseUrlOverride);
        String shareUrl = qrCodeService.buildShareUrl(token, shareBaseUrlOverride);

        return ResponseEntity.ok(Map.of(
                "qrCodeDataUri", qrCode,
                "shareUrl", shareUrl));
    }

    @PostMapping("/{token}/share-with-friend")
    public ResponseEntity<ShareWithFriendResponse> shareWithFriend(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token,
            @Valid @RequestBody ShareWithFriendRequest request,
            HttpServletRequest httpRequest) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.info("User {} sharing token {}... with friend {}",
                user.getId(), token.substring(0, Math.min(8, token.length())), request.getFriendId());

        List<ShareListItem> userShares = sharedResourceService.getUserShares(user.getId());
        ShareListItem share = userShares.stream()
                .filter(s -> s.getToken().equals(token))
                .findFirst()
                .orElse(null);

        if (share == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ShareWithFriendResponse.builder()
                            .success(false)
                            .message("You don't have permission to share this data")
                            .build());
        }

        if (!Boolean.TRUE.equals(share.getIsActive())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ShareWithFriendResponse.builder()
                            .success(false)
                            .message("This share has been revoked")
                            .build());
        }

        String shareBaseUrlOverride = resolveShareBaseUrl(httpRequest);
        String shareUrl = qrCodeService.buildShareUrl(token, shareBaseUrlOverride);

        notificationService.sendDataSharedNotification(
                user,
                request.getFriendId(),
                shareUrl,
                share.getShareName() != null ? share.getShareName() : "Shared Data",
                share.getResourceCount() != null ? share.getResourceCount() : 0,
                request.getMessage());

        String friendName = "Friend #" + request.getFriendId();
        try {
        } catch (Exception e) {
            log.debug("Could not fetch friend details: {}", e.getMessage());
        }

        return ResponseEntity.ok(ShareWithFriendResponse.builder()
                .success(true)
                .message("Share sent successfully! Your friend has been notified.")
                .friendId(request.getFriendId())
                .friendName(friendName)
                .shareUrl(shareUrl)
                .sharedAt(LocalDateTime.now())
                .build());
    }

    @GetMapping("/{token}/added-items")
    public ResponseEntity<UserAddedItemsDTO> getAddedItems(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        UserAddedItemsDTO addedItems = userAddedItemsService.getAddedItems(user.getId(), token);

        return ResponseEntity.ok(addedItems);
    }

    @PostMapping("/{token}/added-items")
    public ResponseEntity<UserAddedItemsDTO.AddItemResponse> trackAddedItem(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token,
            @Valid @RequestBody UserAddedItemsDTO.AddItemRequest request) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.debug("User {} tracking added item {} from share {}",
                user.getId(), request.getExternalRef(), token);

        UserAddedItemsDTO.AddItemResponse response = userAddedItemsService.trackAddedItem(
                user.getId(), token, request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{token}/added-items/bulk")
    public ResponseEntity<UserAddedItemsDTO.BulkAddResponse> trackAddedItemsBulk(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token,
            @Valid @RequestBody UserAddedItemsDTO.BulkAddRequest request) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.debug("User {} bulk tracking {} items from share {}",
                user.getId(), request.getItems().size(), token);

        UserAddedItemsDTO.BulkAddResponse response = userAddedItemsService.trackAddedItems(
                user.getId(), token, request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{token}/added-items/{externalRef}")
    public ResponseEntity<Map<String, Object>> isItemAdded(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token,
            @PathVariable String externalRef) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        boolean isAdded = userAddedItemsService.isItemAdded(user.getId(), token, externalRef);

        return ResponseEntity.ok(Map.of(
                "externalRef", externalRef,
                "isAdded", isAdded));
    }

    @DeleteMapping("/{token}/added-items/{externalRef}")
    public ResponseEntity<Map<String, String>> untrackItem(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token,
            @PathVariable String externalRef) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        userAddedItemsService.untrackItem(user.getId(), token, externalRef);

        return ResponseEntity.ok(Map.of("message", "Item untracked successfully"));
    }
}
