package com.jaya.controller;

import com.jaya.dto.BatchShareRequestItem;
import com.jaya.dto.FriendshipReportDTO;
import com.jaya.dto.FriendshipResponseDTO;
import com.jaya.dto.UserSummaryDTO;
import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.common.dto.UserDTO;
import com.jaya.service.FriendshipService;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.util.FriendshipMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/friendships")
public class FriendshipController {

    @Autowired
    private FriendshipService friendshipService;

    @Autowired
    private IUserServiceClient userClient;

    @PostMapping("/request")
    public ResponseEntity<FriendshipResponseDTO> sendFriendRequest(
            @RequestHeader("Authorization") String jwt,
            @RequestParam Integer recipientId) throws Exception {
        UserDTO requester = userClient.getUserProfile(jwt);
        try {
            Friendship friendship = friendshipService.sendFriendRequest(requester.getId(), recipientId);
            return new ResponseEntity<>(FriendshipMapper.toDTO(friendship), HttpStatus.CREATED);
        } catch (RuntimeException e) {
            if (e.getMessage() != null && e.getMessage().contains("already exists")) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{friendshipId}/respond")
    public ResponseEntity<FriendshipResponseDTO> respondToRequest(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer friendshipId,
            @RequestParam boolean accept) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        Friendship friendship = friendshipService.respondToRequest(friendshipId, user.getId(), accept);
        return ResponseEntity.ok(FriendshipMapper.toDTO(friendship));
    }

    @GetMapping("/{friendshipId}")
    public ResponseEntity<?> getFriendshipById(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer friendshipId) throws Exception {

        UserDTO user = userClient.getUserProfile(jwt);
        try {
            Friendship friendship = friendshipService.getFriendshipById(friendshipId, user.getId());
            if (friendship == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Friendship not found"));
            }
            return ResponseEntity.ok(FriendshipMapper.toDTO(friendship));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Access denied")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "You are not authorized to view this friendship."));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PutMapping("/{friendshipId}/access")
    public ResponseEntity<FriendshipResponseDTO> setAccessLevel(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer friendshipId,
            @RequestParam AccessLevel accessLevel) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        Friendship friendship = friendshipService.setAccessLevel(friendshipId, user.getId(), accessLevel);
        return ResponseEntity.ok(FriendshipMapper.toDTO(friendship));
    }

    @GetMapping("/friends")
    public ResponseEntity<List<FriendshipResponseDTO>> getUserFriendships(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<Friendship> friendships = friendshipService.getUserFriendships(user.getId());
        List<FriendshipResponseDTO> dtos = FriendshipMapper.toDTOListWithPerspective(friendships, user.getId());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/are-friends/{userId1}/{userId2}")
    public ResponseEntity<Boolean> areFriends(@PathVariable Integer userId1,
            @PathVariable Integer userId2) {
        try {
            boolean areFriends = friendshipService.areFriends(userId1, userId2);
            return ResponseEntity.ok(areFriends);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(false);
        }
    }

    @GetMapping("/friend-ids")
    public ResponseEntity<List<Integer>> getFriendIds(@RequestParam Integer userId) {
        try {
            List<Friendship> friendships = friendshipService.getUserFriendships(userId);
            List<Integer> friendIds = friendships.stream()
                    .map(f -> f.getRequesterId().equals(userId) ? f.getRecipientId() : f.getRequesterId())
                    .collect(Collectors.toList());
            return ResponseEntity.ok(friendIds);
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FriendshipResponseDTO>> getPendingRequests(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<Friendship> pendingRequests = friendshipService.getPendingRequests(user.getId());
        List<FriendshipResponseDTO> dtos = FriendshipMapper.toDTOListWithPerspective(pendingRequests, user.getId());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/pending/incoming")
    public ResponseEntity<List<FriendshipResponseDTO>> getIncomingRequests(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<Friendship> incomingRequests = friendshipService.getIncomingRequests(user.getId());
        List<FriendshipResponseDTO> dtos = FriendshipMapper.toDTOList(incomingRequests);
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/pending/outgoing")
    public ResponseEntity<List<FriendshipResponseDTO>> getOutgoingRequests(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<Friendship> outgoingRequests = friendshipService.getOutgoingRequests(user.getId());
        List<FriendshipResponseDTO> dtos = FriendshipMapper.toDTOList(outgoingRequests);
        return ResponseEntity.ok(dtos);
    }

    @DeleteMapping("/request/{friendshipId}/cancel")
    public ResponseEntity<?> cancelFriendRequest(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer friendshipId) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        friendshipService.cancelFriendRequest(friendshipId, user.getId());
        return ResponseEntity.ok(Map.of("message", "Friend request cancelled successfully"));
    }

    @DeleteMapping("/{friendshipId}")
    public ResponseEntity<?> removeFriendship(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer friendshipId) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        friendshipService.removeFriendship(friendshipId, user.getId());
        return ResponseEntity.ok(Map.of("message", "Friendship removed successfully"));
    }

    @PostMapping("/block/{userId}")
    public ResponseEntity<?> blockUser(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer userId) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        friendshipService.blockUser(user.getId(), userId);
        return ResponseEntity.ok(Map.of("message", "User blocked successfully"));
    }

    @PostMapping("/unblock/{userId}")
    public ResponseEntity<?> unblockUser(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer userId) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        friendshipService.unblockUser(user.getId(), userId);
        return ResponseEntity.ok(Map.of("message", "User unblocked successfully"));
    }

    @GetMapping("/blocked")
    public ResponseEntity<List<UserSummaryDTO>> getBlockedUsers(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<UserDTO> blockedUsers = friendshipService.getBlockedUsers(user.getId());
        List<UserSummaryDTO> UserDTOs = blockedUsers.stream()
                .map(UserSummaryDTO::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(UserDTOs);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getFriendshipStats(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<Friendship> allFriendships = friendshipService.getAllUserFriendships(user.getId());
        Map<String, Object> stats = FriendshipMapper.createFriendshipSummary(allFriendships, user.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/check/{userId}")
    public ResponseEntity<Map<String, Object>> checkFriendshipStatus(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer userId) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        Friendship friendship = friendshipService.getFriendship(user.getId(), userId);
        Map<String, Object> result = FriendshipMapper.createFriendshipStatus(friendship, user.getId());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<UserSummaryDTO>> getFriendSuggestions(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "10") int limit) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<UserDTO> suggestions = friendshipService.getFriendSuggestions(user.getId(), limit);
        List<UserSummaryDTO> UserDTOs = suggestions.stream()
                .map(UserSummaryDTO::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(UserDTOs);
    }

    @GetMapping("/mutual/{userId}")
    public ResponseEntity<List<UserSummaryDTO>> getMutualFriends(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer userId) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<UserDTO> mutualFriends = friendshipService.getMutualFriends(user.getId(), userId);
        List<UserSummaryDTO> UserDTOs = mutualFriends.stream()
                .map(UserSummaryDTO::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(UserDTOs);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserSummaryDTO>> searchFriends(
            @RequestHeader("Authorization") String jwt,
            @RequestParam String query) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<UserDTO> friends = friendshipService.searchFriends(user.getId(), query);
        List<UserSummaryDTO> UserDTOs = friends.stream()
                .map(UserSummaryDTO::fromUser)
                .collect(Collectors.toList());
        return ResponseEntity.ok(UserDTOs);
    }

    @GetMapping("/access-check/{userId}")
    public ResponseEntity<Map<String, Object>> checkExpenseAccess(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer userId) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        Map<String, Object> accessInfo = friendshipService.getExpenseAccessInfo(userId, user.getId());
        return ResponseEntity.ok(accessInfo);
    }

    @GetMapping("/shared-with-me")
    public ResponseEntity<List<Map<String, Object>>> getSharedWithMe(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<Map<String, Object>> sharedAccess = friendshipService.getSharedWithMe(user.getId());
        return ResponseEntity.ok(sharedAccess);
    }

    @GetMapping("/i-shared-with")
    public ResponseEntity<List<Map<String, Object>>> getISharedWith(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<Map<String, Object>> sharedAccess = friendshipService.getISharedWith(user.getId());
        return ResponseEntity.ok(sharedAccess);
    }

    @PutMapping("/quick-share/{userId}")
    public ResponseEntity<?> quickShareExpenses(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Integer userId,
            @RequestParam AccessLevel accessLevel) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        try {
            Map<String, Object> result = friendshipService.quickShareExpenses(user.getId(), userId, accessLevel);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("No friendship exists")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/expense-sharing-summary")
    public ResponseEntity<Map<String, Object>> getExpenseSharingSummary(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        Map<String, Object> summary = friendshipService.getExpenseSharingSummary(user.getId());
        return ResponseEntity.ok(summary);
    }

    @PostMapping("/batch-share")
    public ResponseEntity<?> batchShareExpenses(
            @RequestHeader("Authorization") String jwt,
            @RequestBody List<BatchShareRequestItem> requests) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);

        if (requests == null || requests.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No user IDs provided"));
        }

        List<String> results = friendshipService.batchShareExpenses(user.getId(), requests);

        return ResponseEntity.ok(Map.of(
                "message", "Batch share operation completed",
                "results", results));
    }

    @GetMapping("/recommended-to-share")
    public ResponseEntity<List<Map<String, Object>>> getRecommendedToShare(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<Map<String, Object>> recommendations = friendshipService.getRecommendedToShare(user.getId());
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/friends/detailed")
    public ResponseEntity<List<Map<String, Object>>> getDetailedFriends(
            @RequestHeader("Authorization") String jwt) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        List<Map<String, Object>> friends = friendshipService.getDetailedFriends(user.getId());
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/details")
    public ResponseEntity<?> getFriendshipDetails(
            @RequestHeader("Authorization") String jwt,
            @RequestParam Integer friendId) throws Exception {
        UserDTO user = userClient.getUserProfile(jwt);
        Map<String, Object> details = friendshipService.getFriendshipDetails(user.getId(), friendId);
        if (details == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(details);
    }

    @GetMapping("/can-access-expenses")
    boolean canUserAccessExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId)
            throws Exception {
        return friendshipService.canUserAccessExpenses(targetUserId, requesterId);

    }

    @GetMapping("/can-modify-expenses")
    boolean canUserModifyExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId)
            throws Exception {
        return friendshipService.canUserModifyExpenses(targetUserId, requesterId);
    }

    @GetMapping("/get-access-level")
    AccessLevel getUserAccessLevel(@RequestParam Integer userId, @RequestParam Integer viewerId) throws Exception {
        return friendshipService.getUserAccessLevel(userId, viewerId);
    }

    @GetMapping("/report")
    public ResponseEntity<FriendshipReportDTO> getFriendshipReport(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) FriendshipStatus status,
            @RequestParam(required = false) AccessLevel accessLevel,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) throws Exception {

        UserDTO user = userClient.getUserProfile(jwt);
        FriendshipReportDTO report = friendshipService.generateFriendshipReport(
                user.getId(),
                fromDate,
                toDate,
                status,
                accessLevel,
                sortBy,
                sortDirection,
                page,
                size);
        return ResponseEntity.ok(report);
    }
}