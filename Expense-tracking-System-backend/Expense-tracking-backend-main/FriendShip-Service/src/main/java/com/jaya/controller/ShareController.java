package com.jaya.controller;

import com.jaya.dto.share.*;
import com.jaya.models.UserDto;
import com.jaya.service.FriendshipNotificationService;
import com.jaya.service.QrCodeService;
import com.jaya.service.SharedResourceService;
import com.jaya.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for QR-based secure data sharing.
 * 
 * Endpoints:
 * - POST /api/shares - Create a new share with QR code
 * - GET /api/shares/{token} - Access shared data via token
 * - DELETE /api/shares/{token} - Revoke a share (owner only)
 * - GET /api/shares/my-shares - List user's shares
 * - GET /api/shares/stats - Get share statistics
 * - POST /api/shares/{token}/share-with-friend - Share directly with a friend
 */
@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
@Slf4j
public class ShareController {

    private final SharedResourceService sharedResourceService;
    private final UserService userService;
    private final QrCodeService qrCodeService;
    private final FriendshipNotificationService notificationService;

    /**
     * Create a new share and generate QR code.
     * 
     * @param jwt     Authorization header
     * @param request Share creation request
     * @return ShareResponse with URL and QR code
     */
    @PostMapping
    public ResponseEntity<ShareResponse> createShare(
            @RequestHeader("Authorization") String jwt,
            @Valid @RequestBody CreateShareRequest request) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.info("User {} creating share for {} resources", user.getId(), request.getResourceRefs().size());

        ShareResponse response = sharedResourceService.createShare(request, user.getId());

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Access shared data via token.
     * This endpoint can be accessed without authentication for public viewing.
     * 
     * @param token Share token from QR code URL
     * @param jwt   Optional authorization header
     * @return SharedDataResponse with data and permission info
     */
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

    /**
     * Validate a share token without recording access.
     * Useful for pre-validation before showing data.
     * 
     * @param token Share token
     * @return Validation result
     */
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

    /**
     * Revoke a share (owner only).
     * 
     * @param jwt   Authorization header
     * @param token Share token to revoke
     * @return Success message
     */
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

    /**
     * Get all shares for the authenticated user.
     * 
     * @param jwt        Authorization header
     * @param activeOnly If true, return only active shares
     * @return List of user's shares
     */
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

    /**
     * Get share statistics for the authenticated user.
     * 
     * @param jwt Authorization header
     * @return Share statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<ShareStats> getShareStats(
            @RequestHeader("Authorization") String jwt) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        ShareStats stats = sharedResourceService.getShareStats(user.getId());

        return ResponseEntity.ok(stats);
    }

    /**
     * Regenerate QR code for an existing share.
     * 
     * @param jwt   Authorization header
     * @param token Share token
     * @return New QR code data URI
     */
    @PostMapping("/{token}/regenerate-qr")
    public ResponseEntity<Map<String, String>> regenerateQr(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token,
            @RequestParam(defaultValue = "300") int size) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.debug("Regenerating QR for share token: {}...", token.substring(0, Math.min(8, token.length())));

        // Verify ownership by trying to access user's shares
        List<ShareListItem> userShares = sharedResourceService.getUserShares(user.getId());
        boolean ownsShare = userShares.stream().anyMatch(s -> s.getToken().equals(token));

        if (!ownsShare) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You don't have permission to regenerate this QR code"));
        }

        String qrCode = qrCodeService.generateQrCodeWithSize(token, size);
        String shareUrl = qrCodeService.buildShareUrl(token);

        return ResponseEntity.ok(Map.of(
                "qrCodeDataUri", qrCode,
                "shareUrl", shareUrl));
    }

    /**
     * Share directly with a friend and notify them.
     * 
     * @param jwt     Authorization header
     * @param token   Share token
     * @param request Friend sharing request
     * @return Share with friend response
     */
    @PostMapping("/{token}/share-with-friend")
    public ResponseEntity<ShareWithFriendResponse> shareWithFriend(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String token,
            @Valid @RequestBody ShareWithFriendRequest request) throws Exception {

        UserDto user = userService.getuserProfile(jwt);
        log.info("User {} sharing token {}... with friend {}",
                user.getId(), token.substring(0, Math.min(8, token.length())), request.getFriendId());

        // Verify ownership of the share
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

        // Build share URL
        String shareUrl = qrCodeService.buildShareUrl(token);

        // Send notification to friend
        notificationService.sendDataSharedNotification(
                user,
                request.getFriendId(),
                shareUrl,
                share.getShareName() != null ? share.getShareName() : "Shared Data",
                share.getResourceCount() != null ? share.getResourceCount() : 0,
                request.getMessage());

        // Get friend details for response (optional - if user service supports it)
        String friendName = "Friend #" + request.getFriendId();
        try {
            // Try to get friend details if available
            // This is optional - the notification will still work
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
}
