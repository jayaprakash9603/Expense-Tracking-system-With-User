package com.jaya.controller;



import com.jaya.dto.BulkDeleteRequest;
import com.jaya.dto.ChatRequest;
import com.jaya.dto.ChatResponse;
import com.jaya.dto.UserDto;
import com.jaya.exception.ChatServiceException;
import com.jaya.service.ChatService;
import com.jaya.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller for managing chat messages via HTTP.
 */
@RestController
@RequestMapping("/api/chats")
public class ChatController {
    @Autowired
    private ChatService chatService;

    @Autowired
    private UserService userService;


    @PostMapping("/one-to-one")
    public ChatResponse sendOneToOneChat(@Valid @RequestBody ChatRequest request,@RequestHeader("Authorization")String jwt) {
        UserDto user=userService.getuserProfile(jwt);
        return chatService.sendOneToOneChat(request,user.getId());
    }

    @PostMapping("/group")
    public ChatResponse sendGroupChat(@Valid @RequestBody ChatRequest request,@RequestHeader("Authorization")String jwt) {
        UserDto user=userService.getuserProfile(jwt);
        return chatService.sendGroupChat(request,user.getId());

    }


    @GetMapping("/user")
    public List<ChatResponse> getChatsForUser(@RequestHeader("Authorization")String jwt) {
        UserDto user=userService.getuserProfile(jwt);
        return chatService.getChatsForUser(user.getId());
    }

    @GetMapping("/group/{groupId}")
    public List<ChatResponse> getChatsForGroup(@PathVariable Integer groupId,@RequestHeader("Authorization")String jwt) {
        UserDto user=userService.getuserProfile(jwt);
        return chatService.getChatsForGroup(groupId,user.getId());
    }


    @GetMapping("")
    public List<ChatResponse> getChatsBySender(@RequestHeader("Authorization")String jwt) {
        UserDto user=userService.getuserProfile(jwt);
        return chatService.getChatsBySender(user.getId());
    }


    @GetMapping("/between")
    public List<ChatResponse> getChatsBetweenUsers(
            @RequestHeader("Authorization")String jwt, @RequestParam Integer userId2) {
        UserDto user=userService.getuserProfile(jwt);
        return chatService.getChatsBetweenUsers(user.getId(), userId2);
    }

    @GetMapping("/user/search")
    public List<ChatResponse> searchChatsForUser(
            @RequestParam String keyword, @RequestHeader("Authorization") String jwt) {
        UserDto user = userService.getuserProfile(jwt);
        return chatService.searchChatsForUser(user.getId(), keyword);
    }

    /**
     * Searches group chats by keyword.
     * @param groupId ID of the group.
     * @param keyword Search term for chat content.
     * @return List of matching ChatResponse objects.
     */
    @GetMapping("/group/{groupId}/search")
    public List<ChatResponse> searchChatsForGroup(
            @PathVariable Integer groupId, @RequestParam String keyword,@RequestHeader("Authorization")String jwt) {
        UserDto user=userService.getuserProfile(jwt);
        return chatService.searchChatsForGroup(groupId, keyword,user.getId());
    }

    /**
     * Marks a chat as read.
     * @param chatId ID of the chat to mark as read.
     * @return Updated ChatResponse.
     */
    @PutMapping("/{chatId}/read")
    public ChatResponse markChatAsRead(@PathVariable Integer chatId, @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        return chatService.markChatAsRead(chatId, user.getId());
    }


    @GetMapping("/user/unread")
    public List<ChatResponse> getUnreadChatsForUser(@RequestHeader("Authorization")String jwt ){
        UserDto user=userService.getuserProfile(jwt);
        return chatService.getUnreadChatsForUser(user.getId());
    }

    /**
     * Retrieves unread chats for a group.
     * @param groupId ID of the group.
     * @return List of unread ChatResponse objects.
     */
    @GetMapping("/group/{groupId}/unread")
    public List<ChatResponse> getUnreadChatsForGroup(@PathVariable Integer groupId,
                                                     @RequestHeader("Authorization")String jwt) {
        UserDto user=userService.getuserProfile(jwt);
        return chatService.getUnreadChatsForGroup(groupId, user.getId());
    }

    /**
     * Deletes multiple chats by IDs.
     * @param request DTO containing list of chat IDs.
     */
    @DeleteMapping("/bulk")
    public void deleteChats(@Valid @RequestBody BulkDeleteRequest request, @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        chatService.deleteChats(request.getChatIds(), user.getId());
    }

    /**
     * Deletes a single chat by ID.
     * @param id ID of the chat to delete.
     */
    @DeleteMapping("/{id}")
    public void deleteChat(@PathVariable Integer id, @RequestHeader("Authorization") String jwt) throws Exception {
        UserDto user = userService.getuserProfile(jwt);
        chatService.deleteChat(id, user.getId());
    }



// Add these endpoints to the existing ChatController:

    /**
     * Edit a message
     */
    @PutMapping("/{messageId}/edit")
    public ResponseEntity<?> editMessage(
            @PathVariable Integer messageId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            String newContent = request.get("content");
            if (newContent == null || newContent.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content cannot be empty");
            }

            ChatResponse response = chatService.editMessage(messageId, newContent, user.getId());
            return ResponseEntity.ok(response);
        } catch (ChatServiceException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error editing message: " + e.getMessage());
        }
    }

    /**
     * Reply to a message
     */
    @PostMapping("/{messageId}/reply")
    public ResponseEntity<?> replyToMessage(
            @PathVariable Integer messageId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            String content = request.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Content cannot be empty");
            }

            ChatResponse response = chatService.replyToMessage(messageId, content, user.getId());
            return ResponseEntity.ok(response);
        } catch (ChatServiceException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error replying to message: " + e.getMessage());
        }
    }

    /**
     * Forward a message
     */
    @PostMapping("/{messageId}/forward")
    public ResponseEntity<?> forwardMessage(
            @PathVariable Integer messageId,
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            Integer targetUserId = (Integer) request.get("targetUserId");
            Integer targetGroupId = (Integer) request.get("targetGroupId");

            ChatResponse response = chatService.forwardMessage(messageId, targetUserId, targetGroupId, user.getId());
            return ResponseEntity.ok(response);
        } catch (ChatServiceException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error forwarding message: " + e.getMessage());
        }
    }

    /**
     * Get chat history with pagination
     */
    @GetMapping("/history/user/{userId}")
    public ResponseEntity<?> getChatHistory(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            Page<ChatResponse> history = chatService.getChatHistory(user.getId(), userId, page, size);
            return ResponseEntity.ok(history);
        } catch (ChatServiceException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting chat history: " + e.getMessage());
        }
    }

    /**
     * Get group chat history with pagination
     */
    @GetMapping("/history/group/{groupId}")
    public ResponseEntity<?> getGroupChatHistory(
            @PathVariable Integer groupId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            Page<ChatResponse> history = chatService.getGroupChatHistory(groupId, user.getId(), page, size);
            return ResponseEntity.ok(history);
        } catch (ChatServiceException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println(e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting group chat history: " + e.getMessage());
        }
    }

    /**
     * Get chat statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getChatStatistics(@RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            Map<String, Object> stats = chatService.getChatStatistics(user.getId());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting chat statistics: " + e.getMessage());
        }
    }

    /**
     * Add reaction to message
     */
    @PostMapping("/{messageId}/reactions")
    public ResponseEntity<?> addReaction(
            @PathVariable Integer messageId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            String reaction = request.get("reaction");
            if (reaction == null || reaction.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Reaction cannot be empty");
            }

            chatService.addReaction(messageId, reaction, user.getId());
            return ResponseEntity.ok("Reaction added successfully");
        } catch (ChatServiceException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error adding reaction: " + e.getMessage());
        }
    }

    /**
     * Remove reaction from message
     */
    @DeleteMapping("/{messageId}/reactions")
    public ResponseEntity<?> removeReaction(
            @PathVariable Integer messageId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            String reaction = request.get("reaction");
            if (reaction == null || reaction.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Reaction cannot be empty");
            }

            chatService.removeReaction(messageId, reaction, user.getId());
            return ResponseEntity.ok("Reaction removed successfully");
        } catch (ChatServiceException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error removing reaction: " + e.getMessage());
        }
    }

    /**
     * Send media message
     */
    @PostMapping("/media")
    public ResponseEntity<?> sendMediaMessage(
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            Integer recipientId = (Integer) request.get("recipientId");
            Integer groupId = (Integer) request.get("groupId");
            String mediaUrl = (String) request.get("mediaUrl");
            String mediaType = (String) request.get("mediaType");
            String caption = (String) request.get("caption");

            if (mediaUrl == null || mediaUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Media URL cannot be empty");
            }

            ChatResponse response = chatService.sendMediaMessage(recipientId, groupId, mediaUrl, mediaType, caption, user.getId());
            return ResponseEntity.ok(response);
        } catch (ChatServiceException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error sending media message: " + e.getMessage());
        }
    }

    /**
     * Get unread message count
     */
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadMessageCount(@RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            Long count = chatService.getUnreadMessageCount(user.getId());
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error getting unread count: " + e.getMessage());
        }
    }

    /**
     * Start typing indicator
     */
    @PostMapping("/typing/start")
    public ResponseEntity<?> startTyping(
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            Integer chatId = (Integer) request.get("chatId");
            String chatType = (String) request.get("chatType");

            chatService.startTyping(chatId, chatType, user.getId());
            return ResponseEntity.ok("Typing started");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error starting typing: " + e.getMessage());
        }
    }

    /**
     * Stop typing indicator
     */
    @PostMapping("/typing/stop")
    public ResponseEntity<?> stopTyping(
            @RequestBody Map<String, Object> request,
            @RequestHeader("Authorization") String jwt) {
        try {
            UserDto user = userService.getuserProfile(jwt);
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
            }

            Integer chatId = (Integer) request.get("chatId");
            String chatType = (String) request.get("chatType");

            chatService.stopTyping(chatId, chatType, user.getId());
            return ResponseEntity.ok("Typing stopped");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error stopping typing: " + e.getMessage());
        }
    }
}