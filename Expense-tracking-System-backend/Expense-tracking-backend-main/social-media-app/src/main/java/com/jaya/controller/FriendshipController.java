//package com.jaya.controller;
//
//import com.jaya.dto.BatchShareRequestItem;
//import com.jaya.dto.FriendshipResponseDTO;
//import com.jaya.dto.User;
//import com.jaya.dto.UserSummaryDTO;
//import com.jaya.exceptions.UserException;
//import com.jaya.models.AccessLevel;
//import com.jaya.models.Friendship;
//import com.jaya.models.FriendshipStatus;
//import com.jaya.service.FriendshipService;
////import com.jaya.service.SocketService;
//import com.jaya.service.UserService;
//import com.jaya.util.FriendshipMapper;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.HttpStatus;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//import java.util.Map;
//import java.util.stream.Collectors;
//
//@RestController
//@RequestMapping("/api/friendships")
//public class FriendshipController {
//
//    @Autowired
//    private FriendshipService friendshipService;
//
//    @Autowired
//    private UserService userService;
//
//    @PostMapping("/request")
//    public ResponseEntity<FriendshipResponseDTO> sendFriendRequest(
//            @RequestHeader("Authorization") String jwt,
//            @RequestParam Integer recipientId) throws Exception {
//        User requester = userService.findUserByJwt(jwt);
//        Friendship friendship = friendshipService.sendFriendRequest(requester.getId(), recipientId);
//        return new ResponseEntity<>(FriendshipMapper.toDTO(friendship), HttpStatus.CREATED);
//    }
//
//    @PutMapping("/{friendshipId}/respond")
//    public ResponseEntity<FriendshipResponseDTO> respondToRequest(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer friendshipId,
//            @RequestParam boolean accept) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        Friendship friendship = friendshipService.respondToRequest(friendshipId, user.getId(), accept);
//        return ResponseEntity.ok(FriendshipMapper.toDTO(friendship));
//    }
//
//    @GetMapping("/{friendshipId}")
//    public ResponseEntity<?> getFriendshipById(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer friendshipId) throws UserException {
//
//        User user = userService.findUserByJwt(jwt);
//        try {
//            Friendship friendship = friendshipService.getFriendshipById(friendshipId, user.getId());
//            if (friendship == null) {
//                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Friendship not found"));
//            }
//            return ResponseEntity.ok(FriendshipMapper.toDTO(friendship));
//        } catch (RuntimeException e) {
//            if (e.getMessage().contains("Access denied")) {
//                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "You are not authorized to view this friendship."));
//            }
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
//    }
//    @PutMapping("/{friendshipId}/access")
//    public ResponseEntity<FriendshipResponseDTO> setAccessLevel(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer friendshipId,
//            @RequestParam AccessLevel accessLevel) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        Friendship friendship = friendshipService.setAccessLevel(friendshipId, user.getId(), accessLevel);
//        return ResponseEntity.ok(FriendshipMapper.toDTO(friendship));
//    }
//
//    @GetMapping("/friends")
//    public ResponseEntity<List<FriendshipResponseDTO>> getUserFriendships(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<Friendship> friendships = friendshipService.getUserFriendships(user.getId());
//        // Use the enhanced mapper that provides user perspective
//        List<FriendshipResponseDTO> dtos = FriendshipMapper.toDTOListWithPerspective(friendships, user.getId());
//        return ResponseEntity.ok(dtos);
//    }
//
//    @GetMapping("/pending")
//    public ResponseEntity<List<FriendshipResponseDTO>> getPendingRequests(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<Friendship> pendingRequests = friendshipService.getPendingRequests(user.getId());
//        List<FriendshipResponseDTO> dtos = FriendshipMapper.toDTOListWithPerspective(pendingRequests, user.getId());
//        return ResponseEntity.ok(dtos);
//    }
//
//    @GetMapping("/pending/incoming")
//    public ResponseEntity<List<FriendshipResponseDTO>> getIncomingRequests(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<Friendship> incomingRequests = friendshipService.getIncomingRequests(user.getId());
//        List<FriendshipResponseDTO> dtos = FriendshipMapper.toDTOList(incomingRequests);
//        return ResponseEntity.ok(dtos);
//    }
//
//    @GetMapping("/pending/outgoing")
//    public ResponseEntity<List<FriendshipResponseDTO>> getOutgoingRequests(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<Friendship> outgoingRequests = friendshipService.getOutgoingRequests(user.getId());
//        List<FriendshipResponseDTO> dtos = FriendshipMapper.toDTOList(outgoingRequests);
//        return ResponseEntity.ok(dtos);
//    }
//
//    @DeleteMapping("/request/{friendshipId}/cancel")
//    public ResponseEntity<?> cancelFriendRequest(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer friendshipId) throws UserException {
//        User user = userService.findUserByJwt(jwt);
//        friendshipService.cancelFriendRequest(friendshipId, user.getId());
//        return ResponseEntity.ok(Map.of("message", "Friend request cancelled successfully"));
//    }
//
//    @DeleteMapping("/{friendshipId}")
//    public ResponseEntity<?> removeFriendship(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer friendshipId) throws UserException {
//        User user = userService.findUserByJwt(jwt);
//        friendshipService.removeFriendship(friendshipId, user.getId());
//        return ResponseEntity.ok(Map.of("message", "Friendship removed successfully"));
//    }
//
//    @PostMapping("/block/{userId}")
//    public ResponseEntity<?> blockUser(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer userId) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        friendshipService.blockUser(user.getId(), userId);
//        return ResponseEntity.ok(Map.of("message", "User blocked successfully"));
//    }
//
//    @PostMapping("/unblock/{userId}")
//    public ResponseEntity<?> unblockUser(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer userId) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        friendshipService.unblockUser(user.getId(), userId);
//        return ResponseEntity.ok(Map.of("message", "User unblocked successfully"));
//    }
//
//    @GetMapping("/blocked")
//    public ResponseEntity<List<UserSummaryDTO>> getBlockedUsers(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<User> blockedUsers = friendshipService.getBlockedUsers(user.getId());
//        List<UserSummaryDTO> userDTOs = blockedUsers.stream()
//                .map(UserSummaryDTO::fromUser)
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(userDTOs);
//    }
//
//    @GetMapping("/stats")
//    public ResponseEntity<Map<String, Object>> getFriendshipStats(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<Friendship> allFriendships = friendshipService.getAllUserFriendships(user.getId());
//        Map<String, Object> stats = FriendshipMapper.createFriendshipSummary(allFriendships, user.getId());
//        return ResponseEntity.ok(stats);
//    }
//
//    @GetMapping("/check/{userId}")
//    public ResponseEntity<Map<String, Object>> checkFriendshipStatus(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer userId) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        Friendship friendship = friendshipService.getFriendship(user.getId(), userId);
//        Map<String, Object> result = FriendshipMapper.createFriendshipStatus(friendship, user.getId());
//        return ResponseEntity.ok(result);
//    }
//
//    @GetMapping("/suggestions")
//    public ResponseEntity<List<UserSummaryDTO>> getFriendSuggestions(
//            @RequestHeader("Authorization") String jwt,
//            @RequestParam(defaultValue = "10") int limit) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<User> suggestions = friendshipService.getFriendSuggestions(user.getId(), limit);
//        List<UserSummaryDTO> userDTOs = suggestions.stream()
//                .map(UserSummaryDTO::fromUser)
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(userDTOs);
//    }
//
//    @GetMapping("/mutual/{userId}")
//    public ResponseEntity<List<UserSummaryDTO>> getMutualFriends(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer userId) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<User> mutualFriends = friendshipService.getMutualFriends(user.getId(), userId);
//        List<UserSummaryDTO> userDTOs = mutualFriends.stream()
//                .map(UserSummaryDTO::fromUser)
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(userDTOs);
//    }
//
//    @GetMapping("/search")
//    public ResponseEntity<List<UserSummaryDTO>> searchFriends(
//            @RequestHeader("Authorization") String jwt,
//            @RequestParam String query) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<User> friends = friendshipService.searchFriends(user.getId(), query);
//        List<UserSummaryDTO> userDTOs = friends.stream()
//                .map(UserSummaryDTO::fromUser)
//                .collect(Collectors.toList());
//        return ResponseEntity.ok(userDTOs);
//    }
//
//
//    // Add these endpoints after the existing searchFriends method
//
//    @GetMapping("/access-check/{userId}")
//    public ResponseEntity<Map<String, Object>> checkExpenseAccess(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer userId) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        Map<String, Object> accessInfo = friendshipService.getExpenseAccessInfo(userId, user.getId());
//        return ResponseEntity.ok(accessInfo);
//    }
//
//    @GetMapping("/shared-with-me")
//    public ResponseEntity<List<Map<String, Object>>> getSharedWithMe(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<Map<String, Object>> sharedAccess = friendshipService.getSharedWithMe(user.getId());
//        return ResponseEntity.ok(sharedAccess);
//    }
//
//    @GetMapping("/i-shared-with")
//    public ResponseEntity<List<Map<String, Object>>> getISharedWith(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<Map<String, Object>> sharedAccess = friendshipService.getISharedWith(user.getId());
//        return ResponseEntity.ok(sharedAccess);
//    }
//
//    @PutMapping("/quick-share/{userId}")
//    public ResponseEntity<?> quickShareExpenses(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer userId,
//            @RequestParam AccessLevel accessLevel) throws UserException {
//        User user = userService.findUserByJwt(jwt);
//        try {
//            Map<String, Object> result = friendshipService.quickShareExpenses(user.getId(), userId, accessLevel);
//            return ResponseEntity.ok(result);
//        } catch (RuntimeException e) {
//            if (e.getMessage().contains("No friendship exists")) {
//                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", e.getMessage()));
//            }
//            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", e.getMessage()));
//        } catch (Exception e) {
//            throw new RuntimeException(e);
//        }
//    }
//
//    @GetMapping("/expense-sharing-summary")
//    public ResponseEntity<Map<String, Object>> getExpenseSharingSummary(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        Map<String, Object> summary = friendshipService.getExpenseSharingSummary(user.getId());
//        return ResponseEntity.ok(summary);
//    }
//
//    @PostMapping("/batch-share")
//    public ResponseEntity<?> batchShareExpenses(
//            @RequestHeader("Authorization") String jwt,
//            @RequestBody List<BatchShareRequestItem> requests) throws UserException {
//        User user = userService.findUserByJwt(jwt);
//
//        if (requests == null || requests.isEmpty()) {
//            return ResponseEntity.badRequest().body(Map.of("message", "No user IDs provided"));
//        }
//
//        List<String> results = friendshipService.batchShareExpenses(user.getId(), requests);
//
//        return ResponseEntity.ok(Map.of(
//                "message", "Batch share operation completed",
//                "results", results
//        ));
//    }
//
//    @GetMapping("/recommended-to-share")
//    public ResponseEntity<List<Map<String, Object>>> getRecommendedToShare(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<Map<String, Object>> recommendations = friendshipService.getRecommendedToShare(user.getId());
//        return ResponseEntity.ok(recommendations);
//    }
//
//
//
////    @Autowired
////    private SocketService socketService;
//
////    @PostMapping("/request")
////    public ResponseEntity<?> sendFriendRequest(
////            @RequestHeader("Authorization") String jwt,
////            @RequestParam  Integer recipientId) throws Exception {
////        User user = userService.findUserByJwt(jwt);
////        Friendship friendship = friendshipService.sendFriendRequest(user.getId(), recipientId);
////
////        // Notify recipient about new friend request
////        socketService.notifyNewFriendRequest(friendship);
////
////        return ResponseEntity.ok(friendship);
////    }
//
//    @PutMapping("/{requestId}/respond")
//    public ResponseEntity<?> respondToFriendRequest(
//            @RequestHeader("Authorization") String jwt,
//            @PathVariable Integer requestId,
//            @RequestParam boolean accept) throws UserException {
//        User user = userService.findUserByJwt(jwt);
//        Friendship friendship = friendshipService.respondToRequest(requestId, user.getId(), accept);
//
//        // Notify requester about friend request response
////        socketService.notifyFriendRequestResponse(friendship);
//
//        return ResponseEntity.ok(friendship);
//    }
//    @GetMapping("/friends/detailed")
//    public ResponseEntity<List<Map<String, Object>>> getDetailedFriends(
//            @RequestHeader("Authorization") String jwt) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        List<Map<String, Object>> friends = friendshipService.getDetailedFriends(user.getId());
//        return ResponseEntity.ok(friends);
//    }
//
//
//    // In FriendshipController.java
//    @GetMapping("/details")
//    public ResponseEntity<?> getFriendshipDetails(
//            @RequestHeader("Authorization") String jwt,
//            @RequestParam Integer friendId) throws Exception {
//        User user = userService.findUserByJwt(jwt);
//        Map<String, Object> details = friendshipService.getFriendshipDetails(user.getId(), friendId);
//        if (details == null) {
//            return ResponseEntity.notFound().build();
//        }
//        return ResponseEntity.ok(details);
//    }
//
//    @GetMapping("/can-access-expenses")
//    boolean canUserAccessExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId) throws Exception {
//        return friendshipService.canUserAccessExpenses(targetUserId, requesterId);
//
//    }
//
//
//
//    @GetMapping("/can-modify-expenses")
//    boolean canUserModifyExpenses(@RequestParam Integer targetUserId, @RequestParam Integer requesterId) throws Exception {
//        return friendshipService.canUserModifyExpenses(targetUserId, requesterId);
//    }
//}