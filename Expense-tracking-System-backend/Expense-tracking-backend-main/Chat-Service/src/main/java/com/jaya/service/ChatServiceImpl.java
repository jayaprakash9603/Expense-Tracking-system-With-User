package com.jaya.service;

import com.jaya.dto.ChatRequest;
import com.jaya.dto.ChatResponse;
import com.jaya.exception.ChatServiceException;
import com.jaya.models.Chat;
import com.jaya.repository.ChatRepository;
import com.jaya.util.ServiceHelper;
import feign.FeignException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@EnableAsync
public class ChatServiceImpl implements ChatService {

    public final Logger logger = LoggerFactory.getLogger(ChatServiceImpl.class);
    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private ServiceHelper helper;

    @Autowired
    private GroupService groupService;

    @Autowired
    private FriendShipService friendshipService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Autowired
    private AsyncChatSaver asyncChatSaver;

    @Override
    public ChatResponse sendOneToOneChat(ChatRequest request, Integer userId) {
        validateUsers(List.of(userId, request.getRecipientId()));
        validateFriendship(userId, request.getRecipientId());

        Chat chat = toEntity(request, userId);
        Chat savedChat = chatRepository.save(chat);
        ChatResponse response = toResponse(savedChat, userId);

        messagingTemplate.convertAndSendToUser(
                request.getRecipientId().toString(), "/queue/chats", response);
        return response;
    }


    
    
   
@Override
public ChatResponse sendGroupChat(ChatRequest request, Integer userId) {
     System.out.println("Main thread: " + Thread.currentThread().getName());
    validateUsers(List.of(userId));
    validateGroup(request.getGroupId(), userId);

    Chat chat = toEntity(request, userId);
    asyncChatSaver.saveChatAsync(chat); // returns immediately

    //  chatRepository.save(chat);
    ChatResponse response = toResponse(chat, userId);
    messagingTemplate.convertAndSend("/topic/group/" + request.getGroupId(), response);
    logger.info("Message published to /topic/group/{}: {}", request.getGroupId(), response);
    return response;
}

    @Override
    public List<ChatResponse> getChatsForUser(Integer userId) {
        validateUsers(List.of(userId));
        return chatRepository.findByRecipientIdNotDeletedByRecipient(userId).stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public List<ChatResponse> getChatsForGroup(Integer groupId, Integer userId) {
        validateGroup(groupId, userId);
        return chatRepository.findByGroupIdNotDeletedByUser(groupId, userId).stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public List<ChatResponse> getChatsBySender(Integer senderId) {
        validateUsers(List.of(senderId));
        return chatRepository.findBySenderId(senderId).stream()
                .map(chat -> toResponse(chat, senderId))
                .toList();
    }

    @Override
    public List<ChatResponse> getChatsBetweenUsers(Integer userId1, Integer userId2) {
        validateUsers(List.of(userId1, userId2));
        validateFriendship(userId1, userId2);

        return chatRepository.findConversationBetweenUsers(userId1, userId2).stream()
                .map(chat -> toResponse(chat, userId1))
                .filter(response -> response.getContent() != null)
                .toList();
    }

    @Override
    public List<ChatResponse> searchChatsForUser(Integer userId, String keyword) {
        validateUsers(List.of(userId));
        return chatRepository.findByRecipientIdAndContentContainingIgnoreCaseNotDeleted(userId, keyword)
                .stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public List<ChatResponse> searchChatsForGroup(Integer groupId, String keyword, Integer userId) {
        validateGroup(groupId, userId);
        return chatRepository.findByGroupIdAndContentContainingIgnoreCaseNotDeleted(groupId, keyword, userId)
                .stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public ChatResponse markChatAsRead(Integer chatId, Integer userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ChatServiceException("Chat not found: " + chatId));

        validateChatReadPermission(chat, userId);

        if (chat.isOneToOneChat()) {
            chat.setRead(true);
        } else if (chat.isGroupChat()) {
            chat.markAsReadByUser(userId);
        }

        Chat updatedChat = chatRepository.save(chat);
        ChatResponse response = toResponse(updatedChat, userId);

        if (chat.getRecipientId() != null) {
            messagingTemplate.convertAndSendToUser(
                    chat.getRecipientId().toString(), "/queue/chats", response);
        } else if (chat.getGroupId() != null) {
            messagingTemplate.convertAndSend("/topic/group/" + chat.getGroupId(), response);
        }
        return response;
    }

    @Override
    public List<Integer> getChatReaders(Integer chatId, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ChatServiceException("Chat not found: " + chatId));

        if (chat.isOneToOneChat()) {
            if (!chat.getSenderId().equals(userId) && !chat.getRecipientId().equals(userId)) {
                throw new ChatServiceException("Access denied: You can only view read status of your own conversations");
            }
            return List.of();
        } else if (chat.isGroupChat()) {
            validateGroup(chat.getGroupId(), userId);
            return chat.getReadByUsers() != null ?
                    chat.getReadByUsers().stream().toList() :
                    List.of();
        }

        throw new ChatServiceException("Invalid chat type");
    }

    @Override
    public boolean isMessageReadByUser(Integer chatId, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ChatServiceException("Chat not found: " + chatId));

        if (chat.isOneToOneChat()) {
            return chat.isRead();
        } else if (chat.isGroupChat()) {
            return chat.isReadByUser(userId);
        }

        return false;
    }

    @Override
    public int getMessageReadCount(Integer chatId, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ChatServiceException("Chat not found: " + chatId));

        if (chat.isGroupChat()) {
            validateGroup(chat.getGroupId(), userId);
            return chat.getReadCount();
        } else {
            return chat.isRead() ? 1 : 0;
        }
    }

    @Override
    public List<ChatResponse> getUnreadChatsForUser(Integer userId) {
        validateUsers(List.of(userId));
        return chatRepository.findByRecipientIdAndIsReadFalseNotDeleted(userId).stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public List<ChatResponse> getUnreadChatsForGroup(Integer groupId, Integer userId) {
        validateGroup(groupId, userId);
        return chatRepository.findByGroupIdAndNotReadByUserAndNotDeleted(groupId, userId).stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public void deleteChats(List<Integer> chatIds, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        for (Integer chatId : chatIds) {
            deleteChat(chatId, userId);
        }
    }

    @Override
    public void deleteChat(Integer id, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        Chat chat = chatRepository.findById(id)
                .orElseThrow(() -> new ChatServiceException("Chat not found: " + id));

        validateChatDeletionPermission(chat, userId);

        if (chat.isOneToOneChat()) {
            handleOneToOneChatDeletion(chat, userId);
        } else if (chat.isGroupChat()) {
            handleGroupChatDeletion(chat, userId);
        }

        chatRepository.save(chat);
        notifyMessageDeletion(chat, userId);

        if (chat.isCompletelyDeleted()) {
            chatRepository.delete(chat);
        }
    }

    @Override
    public ChatResponse editMessage(Integer messageId, String newContent, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new ChatServiceException("Message not found: " + messageId));

        if (!chat.getSenderId().equals(userId)) {
            throw new ChatServiceException("Access denied: You can only edit your own messages");
        }

        if (chat.getTimestamp().isBefore(LocalDateTime.now().minusMinutes(15))) {
            throw new ChatServiceException("Message edit time limit exceeded");
        }

        chat.setContent(newContent);
        chat.setEditedAt(LocalDateTime.now());
        chat.setIsEdited(true);

        Chat updatedChat = chatRepository.save(chat);
        ChatResponse response = toResponse(updatedChat, userId);

        notifyMessageEdit(chat, userId);

        return response;
    }

    @Override
    public ChatResponse replyToMessage(Integer replyToMessageId, String content, Integer userId) throws Exception {
        Chat originalMessage = chatRepository.findById(replyToMessageId)
                .orElseThrow(() -> new ChatServiceException("Original message not found: " + replyToMessageId));

        validateMessageAccess(originalMessage, userId);

        Chat replyChat = new Chat();
        replyChat.setSenderId(userId);
        replyChat.setContent(content);
        replyChat.setReplyToMessageId(replyToMessageId);

        if (originalMessage.isOneToOneChat()) {
            replyChat.setRecipientId(originalMessage.getRecipientId().equals(userId) ?
                    originalMessage.getSenderId() : originalMessage.getRecipientId());
            validateFriendship(userId, replyChat.getRecipientId());
        } else {
            replyChat.setGroupId(originalMessage.getGroupId());
            validateGroup(originalMessage.getGroupId(), userId);
        }

        Chat savedReply = chatRepository.save(replyChat);
        ChatResponse response = toResponse(savedReply, userId);

        notifyMessageReply(savedReply, originalMessage, userId);

        return response;
    }

    @Override
    public ChatResponse forwardMessage(Integer messageId, Integer targetUserId, Integer targetGroupId, Integer userId) throws Exception {
        Chat originalMessage = chatRepository.findById(messageId)
                .orElseThrow(() -> new ChatServiceException("Message not found: " + messageId));

        validateMessageAccess(originalMessage, userId);

        Chat forwardedMessage = new Chat();
        forwardedMessage.setSenderId(userId);
        forwardedMessage.setContent(originalMessage.getContent());
        forwardedMessage.setForwardedFromMessageId(messageId);
        forwardedMessage.setIsForwarded(true);

        if (targetUserId != null) {
            validateFriendship(userId, targetUserId);
            forwardedMessage.setRecipientId(targetUserId);
        } else if (targetGroupId != null) {
            validateGroup(targetGroupId, userId);
            forwardedMessage.setGroupId(targetGroupId);
        } else {
            throw new ChatServiceException("Either target user or target group must be specified");
        }

        Chat savedForward = chatRepository.save(forwardedMessage);
        ChatResponse response = toResponse(savedForward, userId);

        notifyMessageForward(savedForward, userId);

        return response;
    }

    @Override
    public Page<ChatResponse> getChatHistory(Integer userId1, Integer userId2, int page, int size) throws Exception {
        validateUsers(List.of(userId1, userId2));
        validateFriendship(userId1, userId2);

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Chat> chatPage = chatRepository.findConversationBetweenUsersPaginated(userId1, userId2, pageable);

        return chatPage.map(chat -> toResponse(chat, userId1));
    }


    @Override
    public Page<ChatResponse> getGroupChatHistory(Integer groupId, Integer userId, int page, int size) throws Exception {
        try {
            // Validate user
            validateUsers(List.of(userId));

            // Validate group membership
            validateGroup(groupId, userId);

            // Create pageable with sorting by timestamp descending (newest first)
            Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

            // Get paginated chat history for the group
            Page<Chat> chatPage = chatRepository.findByGroupIdAndNotDeletedByUserPaginated(groupId, userId, pageable);

            // Convert to response DTOs
            return chatPage.map(chat -> toResponse(chat, userId));

        } catch (ChatServiceException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new ChatServiceException("Error retrieving group chat history: " + e.getMessage());
        }
    }

    @Override
    public Map<String, Object> getChatStatistics(Integer userId) throws Exception {
        validateUsers(List.of(userId));

        Map<String, Object> stats = new HashMap<>();

        Long totalSent = chatRepository.countBySenderId(userId);
        stats.put("totalMessagesSent", totalSent);

        Long totalReceived = chatRepository.countByRecipientId(userId);
        stats.put("totalMessagesReceived", totalReceived);

        Long unreadCount = chatRepository.countUnreadMessagesForUser(userId);
        stats.put("unreadMessages", unreadCount);

        Long activeConversations = chatRepository.countActiveConversationsForUser(userId);
        stats.put("activeConversations", activeConversations);

        Long todayMessages = chatRepository.countMessagesSentToday(userId);
        stats.put("messagesToday", todayMessages);

        Object mostActiveChatPartner = chatRepository.findMostActiveChatPartner(userId);
        stats.put("mostActiveChatPartner", mostActiveChatPartner);

        return stats;
    }

    @Override
    public void addReaction(Integer messageId, String reaction, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new ChatServiceException("Message not found: " + messageId));

        validateMessageAccess(chat, userId);

        chat.addReaction(userId, reaction);
        chatRepository.save(chat);

        notifyMessageReaction(chat, userId, reaction, "ADD");
    }

    @Override
    public void removeReaction(Integer messageId, String reaction, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new ChatServiceException("Message not found: " + messageId));

        validateMessageAccess(chat, userId);

        chat.removeReaction(userId, reaction);
        chatRepository.save(chat);

        notifyMessageReaction(chat, userId, reaction, "REMOVE");
    }

    @Override
    public void startTyping(Integer chatId, String chatType, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
            messagingTemplate.convertAndSendToUser(
                    chatId.toString(), "/queue/typing",
                    Map.of("userId", userId, "action", "START_TYPING"));
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
            messagingTemplate.convertAndSend("/topic/group/" + chatId + "/typing",
                    Map.of("userId", userId, "action", "START_TYPING"));
        }
    }

    @Override
    public void stopTyping(Integer chatId, String chatType, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
            messagingTemplate.convertAndSendToUser(
                    chatId.toString(), "/queue/typing",
                    Map.of("userId", userId, "action", "STOP_TYPING"));
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
            messagingTemplate.convertAndSend("/topic/group/" + chatId + "/typing",
                    Map.of("userId", userId, "action", "STOP_TYPING"));
        }
    }

    @Override
    public Long getUnreadMessageCount(Integer userId) throws Exception {
        validateUsers(List.of(userId));
        return chatRepository.countUnreadMessagesForUser(userId);
    }

    @Override
    public ChatResponse sendMediaMessage(Integer recipientId, Integer groupId, String mediaUrl,
                                         String mediaType, String caption, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        Chat chat = new Chat();
        chat.setSenderId(userId);
        chat.setMediaUrl(mediaUrl);
        chat.setMediaType(mediaType);
        chat.setContent(caption != null ? caption : "");
        chat.setIsMediaMessage(true);

        if (recipientId != null) {
            validateFriendship(userId, recipientId);
            chat.setRecipientId(recipientId);
        } else if (groupId != null) {
            validateGroup(groupId, userId);
            chat.setGroupId(groupId);
        } else {
            throw new ChatServiceException("Either recipient or group must be specified");
        }

        Chat savedChat = chatRepository.save(chat);
        ChatResponse response = toResponse(savedChat, userId);

        notifyMediaMessage(savedChat, userId);

        return response;
    }

    @Override
    public void pinMessage(Integer messageId, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new ChatServiceException("Message not found: " + messageId));

        validateMessageAccess(chat, userId);

        if (chat.isGroupChat()) {
            validateGroup(chat.getGroupId(), userId);
        }

        chat.setIsPinned(true);
        chat.setPinnedBy(userId);
        chat.setPinnedAt(LocalDateTime.now());

        chatRepository.save(chat);

        notifyMessagePin(chat, userId, "PIN");
    }

    @Override
    public void unpinMessage(Integer messageId, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new ChatServiceException("Message not found: " + messageId));

        validateMessageAccess(chat, userId);

        if (chat.isGroupChat()) {
            validateGroup(chat.getGroupId(), userId);
        }

        chat.setIsPinned(false);
        chat.setPinnedBy(null);
        chat.setPinnedAt(null);

        chatRepository.save(chat);

        notifyMessagePin(chat, userId, "UNPIN");
    }

    @Override
    public List<ChatResponse> getPinnedMessages(Integer chatId, String chatType, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
            return chatRepository.findPinnedMessagesBetweenUsers(userId, chatId).stream()
                    .map(chat -> toResponse(chat, userId))
                    .toList();
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
            return chatRepository.findPinnedMessagesByGroupId(chatId).stream()
                    .map(chat -> toResponse(chat, userId))
                    .toList();
        } else {
            throw new ChatServiceException("Invalid chat type: " + chatType);
        }
    }

    @Override
    public List<ChatResponse> getRecentChats(Integer userId, int limit) throws Exception {
        validateUsers(List.of(userId));

        Pageable pageable = PageRequest.of(0, limit, Sort.by("timestamp").descending());
        return chatRepository.findRecentChatsForUser(userId, pageable).stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public Map<String, Object> getGroupChatStatistics(Integer groupId, Integer userId) throws Exception {
        validateGroup(groupId, userId);

        Map<String, Object> stats = new HashMap<>();

        Long totalMessages = chatRepository.countByGroupId(groupId);
        stats.put("totalMessages", totalMessages);

        Long userMessages = chatRepository.countByGroupIdAndSenderId(groupId, userId);
        stats.put("userMessages", userMessages);

        Object mostActiveMember = chatRepository.findMostActiveMemberInGroup(groupId);
        stats.put("mostActiveMember", mostActiveMember);

        Long todayMessages = chatRepository.countGroupMessagesToday(groupId);
        stats.put("messagesToday", todayMessages);

        Long unreadCount = chatRepository.countUnreadGroupMessagesForUser(groupId, userId);
        stats.put("unreadMessages", unreadCount);

        return stats;
    }

    @Override
    public Map<String, Long> getUnreadCountByChat(Integer userId) throws Exception {
        validateUsers(List.of(userId));

        Map<String, Long> unreadCounts = new HashMap<>();

        List<Object[]> oneToOneCounts = chatRepository.getUnreadCountsByUser(userId);
        for (Object[] count : oneToOneCounts) {
            Integer senderId = (Integer) count[0];
            Long unreadCount = (Long) count[1];
            unreadCounts.put("user_" + senderId, unreadCount);
        }

        List<Object[]> groupCounts = chatRepository.getUnreadCountsByGroup(userId);
        for (Object[] count : groupCounts) {
            Integer groupId = (Integer) count[0];
            Long unreadCount = (Long) count[1];
            unreadCounts.put("group_" + groupId, unreadCount);
        }

        return unreadCounts;
    }

    @Override
    public Map<String, List<Integer>> getMessageReactions(Integer messageId, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new ChatServiceException("Message not found: " + messageId));

        validateMessageAccess(chat, userId);

        return chat.getReactions() != null ? chat.getReactions() : new HashMap<>();
    }

    @Override
    public List<Integer> getTypingUsers(Integer chatId, String chatType, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
        }

        return List.of();
    }

    @Override
    public void markMessageAsDelivered(Integer messageId, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new ChatServiceException("Message not found: " + messageId));

        if (chat.isOneToOneChat() && !chat.getRecipientId().equals(userId)) {
            throw new ChatServiceException("Only recipient can mark message as delivered");
        }

        if (chat.isGroupChat()) {
            validateGroup(chat.getGroupId(), userId);
            chat.markAsDeliveredByUser(userId);
        } else {
            chat.setIsDelivered(true);
            chat.setDeliveredAt(LocalDateTime.now());
        }

        chatRepository.save(chat);

        notifyMessageDelivery(chat, userId);
    }

    @Override
    public List<ChatResponse> getUndeliveredMessages(Integer userId) throws Exception {
        validateUsers(List.of(userId));

        return chatRepository.findUndeliveredMessagesForUser(userId).stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public Map<String, Object> getMessageStatus(Integer messageId, Integer userId) throws Exception {
        Chat chat = chatRepository.findById(messageId)
                .orElseThrow(() -> new ChatServiceException("Message not found: " + messageId));

        validateMessageAccess(chat, userId);

        Map<String, Object> status = new HashMap<>();
        status.put("messageId", messageId);
        status.put("sent", true);

        if (chat.isOneToOneChat()) {
            status.put("delivered", chat.getIsDelivered() != null ? chat.getIsDelivered() : false);
            status.put("read", chat.isRead());
            status.put("deliveredAt", chat.getDeliveredAt());
        } else if (chat.isGroupChat()) {
            status.put("deliveredTo", chat.getDeliveredToUsers() != null ? chat.getDeliveredToUsers().size() : 0);
            status.put("readBy", chat.getReadByUsers() != null ? chat.getReadByUsers().size() : 0);
            status.put("readCount", chat.getReadCount());
        }

        return status;
    }

    @Override
    public void muteChat(Integer chatId, String chatType, Integer userId, Long muteUntil) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
            helper.muteUserChat(userId, chatId, muteUntil);
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
            helper.muteGroupChat(userId, chatId, muteUntil);
        } else {
            throw new ChatServiceException("Invalid chat type: " + chatType);
        }
    }

    @Override
    public void unmuteChat(Integer chatId, String chatType, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
            helper.unmuteUserChat(userId, chatId);
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
            helper.unmuteGroupChat(userId, chatId);
        } else {
            throw new ChatServiceException("Invalid chat type: " + chatType);
        }
    }

    @Override
    public boolean isChatMuted(Integer chatId, String chatType, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
            return helper.isUserChatMuted(userId, chatId);
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
            return helper.isGroupChatMuted(userId, chatId);
        } else {
            throw new ChatServiceException("Invalid chat type: " + chatType);
        }
    }

    @Override
    public void archiveChat(Integer chatId, String chatType, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
            helper.archiveUserChat(userId, chatId);
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
            helper.archiveGroupChat(userId, chatId);
        } else {
            throw new ChatServiceException("Invalid chat type: " + chatType);
        }
    }

    @Override
    public void unarchiveChat(Integer chatId, String chatType, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
            helper.unarchiveUserChat(userId, chatId);
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
            helper.unarchiveGroupChat(userId, chatId);
        } else {
            throw new ChatServiceException("Invalid chat type: " + chatType);
        }
    }

    @Override
    public List<ChatResponse> getArchivedChats(Integer userId) throws Exception {
        validateUsers(List.of(userId));

        List<Integer> archivedChatIds = helper.getArchivedChats(userId);
        return chatRepository.findByIdIn(archivedChatIds).stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public List<ChatResponse> getMediaMessages(Integer chatId, String chatType, Integer userId) throws Exception {
        validateUsers(List.of(userId));

        if ("FRIEND".equals(chatType)) {
            validateFriendship(userId, chatId);
            return chatRepository.findMediaMessagesBetweenUsers(userId, chatId).stream()
                    .map(chat -> toResponse(chat, userId))
                    .toList();
        } else if ("GROUP".equals(chatType)) {
            validateGroup(chatId, userId);
            return chatRepository.findMediaMessagesByGroupId(chatId).stream()
                    .map(chat -> toResponse(chat, userId))
                    .toList();
        } else {
            throw new ChatServiceException("Invalid chat type: " + chatType);
        }
    }

    @Override
    public Page<ChatResponse> searchMessagesAdvanced(String query, Integer userId, String chatType, Integer chatId,
                                                     String messageType, String dateFrom, String dateTo, int page, int size) throws Exception {
        validateUsers(List.of(userId));

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());

        LocalDateTime fromDate = dateFrom != null ? LocalDateTime.parse(dateFrom) : null;
        LocalDateTime toDate = dateTo != null ? LocalDateTime.parse(dateTo) : null;

        Page<Chat> chatPage;

        if ("FRIEND".equals(chatType) && chatId != null) {
            validateFriendship(userId, chatId);
            chatPage = chatRepository.searchMessagesBetweenUsersAdvanced(
                    userId, chatId, query, messageType, fromDate, toDate, pageable);
        } else if ("GROUP".equals(chatType) && chatId != null) {
            validateGroup(chatId, userId);
            chatPage = chatRepository.searchGroupMessagesAdvanced(
                    chatId, query, messageType, fromDate, toDate, pageable);
        } else {
            chatPage = chatRepository.searchAllUserMessagesAdvanced(
                    userId, query, messageType, fromDate, toDate, pageable);
        }

        return chatPage.map(chat -> toResponse(chat, userId));
    }

    @Override
    public List<ChatResponse> exportChatHistory(Integer userId1, Integer userId2, Integer userId) throws Exception {
        validateUsers(List.of(userId1, userId2, userId));

        if (!userId.equals(userId1) && !userId.equals(userId2)) {
            throw new ChatServiceException("Access denied: You can only export your own chat history");
        }

        validateFriendship(userId1, userId2);

        return chatRepository.findConversationBetweenUsers(userId1, userId2).stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public List<ChatResponse> exportGroupChatHistory(Integer groupId, Integer userId) throws Exception {
        validateGroup(groupId, userId);

        return chatRepository.findByGroupIdNotDeletedByUser(groupId, userId).stream()
                .map(chat -> toResponse(chat, userId))
                .toList();
    }

    @Override
    public void updateUserPresence(Integer userId, String status) throws Exception {
        validateUsers(List.of(userId));

        helper.updateUserPresence(userId, status);

        notifyPresenceChange(userId, status);
    }

    @Override
    public String getUserPresence(Integer userId) throws Exception {
        validateUsers(List.of(userId));

        return helper.getUserPresence(userId);
    }

    @Override
    public Map<Integer, String> getMultipleUserPresence(List<Integer> userIds, Integer requesterId) throws Exception {
        validateUsers(List.of(requesterId));
        validateUsers(userIds);

        Map<Integer, String> presenceMap = new HashMap<>();

        for (Integer userId : userIds) {
            try {
                if (friendshipService.areFriends(requesterId, userId)) {
                    String presence = helper.getUserPresence(userId);
                    presenceMap.put(userId, presence);
                }
            } catch (Exception e) {
                presenceMap.put(userId, "UNKNOWN");
            }
        }

        return presenceMap;
    }

    // Helper methods
    private void validateUsers(List<Integer> userIds) {
        for (Integer userId : userIds) {
            try {
                helper.validateUser(userId);
            } catch (Exception e) {
                throw new ChatServiceException("Invalid user ID: " + userId);
            }
        }
    }

    private void validateFriendship(Integer userId1, Integer userId2) {
        try {
            if (userId1.equals(userId2)) {
                throw new ChatServiceException("Cannot send messages to yourself");
            }

            boolean areFriends = friendshipService.areFriends(userId1, userId2);

            if (!areFriends) {
                throw new ChatServiceException("You can only send messages to your friends. Please send a friend request first.");
            }

        } catch (FeignException.InternalServerError e) {
            String message = extractMessageFromFeignException(e);
            throw new ChatServiceException("Friendship service error: " + message);
        } catch (FeignException.NotFound e) {
            throw new ChatServiceException("Friendship not found between users");
        } catch (FeignException.BadRequest e) {
            String message = extractMessageFromFeignException(e);
            throw new ChatServiceException("Invalid friendship request: " + message);
        } catch (FeignException.Unauthorized e) {
            throw new ChatServiceException("Unauthorized access to friendship data");
        } catch (FeignException.Forbidden e) {
            throw new ChatServiceException("Access forbidden to friendship data");
        } catch (FeignException e) {
            String message = extractMessageFromFeignException(e);
            throw new ChatServiceException("Friendship service communication error: " + message);
        } catch (ChatServiceException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new ChatServiceException("Unexpected error while validating friendship between users");
        }
    }

    private void validateGroup(Integer groupId, Integer userId) {
        try {
            groupService.getGroupByIdwithService(groupId, userId);
        } catch (FeignException.InternalServerError e) {
            String message = extractMessageFromFeignException(e);
            if (message.contains("Access denied") || message.contains("not a member")) {
                throw new ChatServiceException("Access denied: You are not a member of this group");
            } else {
                throw new ChatServiceException("Group service error: " + message);
            }
        } catch (FeignException.NotFound e) {
            throw new ChatServiceException("Group not found with ID: " + groupId);
        } catch (FeignException.BadRequest e) {
            String message = extractMessageFromFeignException(e);
            throw new ChatServiceException("Invalid request: " + message);
        } catch (FeignException.Unauthorized e) {
            throw new ChatServiceException("Unauthorized access to group: " + groupId);
        } catch (FeignException.Forbidden e) {
            throw new ChatServiceException("Access forbidden for group: " + groupId);
        } catch (FeignException e) {
            String message = extractMessageFromFeignException(e);
            throw new ChatServiceException("Group service communication error: " + message);
        } catch (IllegalArgumentException e) {
            throw new ChatServiceException("Invalid group ID or user ID provided");
        } catch (Exception e) {
            e.printStackTrace();
            throw new ChatServiceException("Unexpected error while validating group: " + groupId);
        }
    }

    private String extractMessageFromFeignException(FeignException ex) {
        try {
            String responseBody = ex.contentUTF8();
            if (responseBody != null && !responseBody.isEmpty()) {
                if (responseBody.contains("\"message\":")) {
                    int start = responseBody.indexOf("\"message\":\"") + 11;
                    int end = responseBody.indexOf("\"", start);
                    if (start > 10 && end > start) {
                        return responseBody.substring(start, end);
                    }
                }
                return responseBody.length() > 100 ? responseBody.substring(0, 100) + "..." : responseBody;
            }
        } catch (Exception e) {
            // If extraction fails, fall back to default message
        }

        return ex.getMessage() != null ? ex.getMessage() : "Unknown service error";
    }

    private void validateChatReadPermission(Chat chat, Integer userId) {
        if (chat.getRecipientId() != null) {
            if (!chat.getRecipientId().equals(userId)) {
                throw new ChatServiceException("Access denied: Only the recipient can mark this message as read");
            }
        } else if (chat.getGroupId() != null) {
            try {
                validateGroup(chat.getGroupId(), userId);
            } catch (ChatServiceException e) {
                throw new ChatServiceException("Access denied: You must be a member of the group to mark messages as read");
            }

            if (chat.getSenderId().equals(userId)) {
                throw new ChatServiceException("You cannot mark your own messages as read");
            }
        } else {
            throw new ChatServiceException("Invalid chat: No recipient or group specified");
        }
    }

    private void handleOneToOneChatDeletion(Chat chat, Integer userId) {
        if (userId.equals(chat.getSenderId())) {
            chat.markAsDeletedBySender();
        } else if (userId.equals(chat.getRecipientId())) {
            chat.markAsDeletedByRecipient();
        } else {
            throw new ChatServiceException("Access denied: You can only delete messages from your own conversations");
        }
    }

    private void handleGroupChatDeletion(Chat chat, Integer userId) {
        if (userId.equals(chat.getSenderId())) {
            chat.markAsDeletedBySender();
        } else {
            chat.markAsDeletedByUser(userId);
        }
    }
    private void validateChatDeletionPermission(Chat chat, Integer userId) {
        if (chat.isOneToOneChat()) {
            if (!chat.getSenderId().equals(userId) && !chat.getRecipientId().equals(userId)) {
                throw new ChatServiceException("Access denied: You can only delete messages from your own conversations");
            }
        } else if (chat.isGroupChat()) {
            try {
                validateGroup(chat.getGroupId(), userId);
            } catch (Exception e) {
                throw new ChatServiceException("Access denied: You must be a member of the group to delete messages");
            }
        }
    }

    private void validateMessageAccess(Chat chat, Integer userId) {
        if (chat.isOneToOneChat()) {
            if (!chat.getSenderId().equals(userId) && !chat.getRecipientId().equals(userId)) {
                throw new ChatServiceException("Access denied: You can only access messages from your own conversations");
            }
        } else if (chat.isGroupChat()) {
            validateGroup(chat.getGroupId(), userId);
        }
    }

    private void notifyMessageDeletion(Chat chat, Integer deletedByUserId) {
        try {
            Map<String, Object> deletionNotification = new HashMap<>();
            deletionNotification.put("type", "MESSAGE_DELETED");
            deletionNotification.put("chatId", chat.getId());
            deletionNotification.put("senderId", chat.getSenderId());
            deletionNotification.put("deletedBy", deletedByUserId);
            deletionNotification.put("timestamp", LocalDateTime.now());

            if (chat.isOneToOneChat()) {
                if (deletedByUserId.equals(chat.getSenderId())) {
                    deletionNotification.put("action", "SHOW_AS_DELETED");
                    messagingTemplate.convertAndSendToUser(
                            chat.getRecipientId().toString(), "/queue/chats", deletionNotification);
                } else {
                    deletionNotification.put("action", "REMOVED_BY_RECIPIENT");
                    messagingTemplate.convertAndSendToUser(
                            chat.getSenderId().toString(), "/queue/chats", deletionNotification);
                }
            } else if (chat.isGroupChat()) {
                if (deletedByUserId.equals(chat.getSenderId())) {
                    deletionNotification.put("action", "SHOW_AS_DELETED");
                } else {
                    deletionNotification.put("action", "REMOVED_BY_MEMBER");
                }
                messagingTemplate.convertAndSend("/topic/group/" + chat.getGroupId(), deletionNotification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying message deletion: " + e.getMessage());
        }
    }

    private void notifyMessageEdit(Chat chat, Integer userId) {
        try {
            Map<String, Object> notification = Map.of(
                    "type", "MESSAGE_EDITED",
                    "messageId", chat.getId(),
                    "editedBy", userId,
                    "newContent", chat.getContent(),
                    "timestamp", LocalDateTime.now()
            );

            if (chat.isOneToOneChat()) {
                Integer targetUser = chat.getRecipientId().equals(userId) ?
                        chat.getSenderId() : chat.getRecipientId();
                messagingTemplate.convertAndSendToUser(
                        targetUser.toString(), "/queue/chats", notification);
            } else if (chat.isGroupChat()) {
                messagingTemplate.convertAndSend("/topic/group/" + chat.getGroupId(), notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying message edit: " + e.getMessage());
        }
    }

    private void notifyMessageReply(Chat replyChat, Chat originalMessage, Integer userId) {
        try {
            Map<String, Object> notification = Map.of(
                    "type", "MESSAGE_REPLY",
                    "replyId", replyChat.getId(),
                    "originalMessageId", originalMessage.getId(),
                    "repliedBy", userId,
                    "timestamp", LocalDateTime.now()
            );

            if (replyChat.isOneToOneChat()) {
                messagingTemplate.convertAndSendToUser(
                        replyChat.getRecipientId().toString(), "/queue/chats", notification);
            } else if (replyChat.isGroupChat()) {
                messagingTemplate.convertAndSend("/topic/group/" + replyChat.getGroupId(), notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying message reply: " + e.getMessage());
        }
    }

    private void notifyMessageForward(Chat forwardedMessage, Integer userId) {
        try {
            Map<String, Object> notification = Map.of(
                    "type", "MESSAGE_FORWARDED",
                    "messageId", forwardedMessage.getId(),
                    "forwardedBy", userId,
                    "timestamp", LocalDateTime.now()
            );

            if (forwardedMessage.isOneToOneChat()) {
                messagingTemplate.convertAndSendToUser(
                        forwardedMessage.getRecipientId().toString(), "/queue/chats", notification);
            } else if (forwardedMessage.isGroupChat()) {
                messagingTemplate.convertAndSend("/topic/group/" + forwardedMessage.getGroupId(), notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying message forward: " + e.getMessage());
        }
    }

    private void notifyMessageReaction(Chat chat, Integer userId, String reaction, String action) {
        try {
            Map<String, Object> notification = Map.of(
                    "type", "MESSAGE_REACTION",
                    "messageId", chat.getId(),
                    "userId", userId,
                    "reaction", reaction,
                    "action", action,
                    "timestamp", LocalDateTime.now()
            );

            if (chat.isOneToOneChat()) {
                Integer targetUser = chat.getRecipientId().equals(userId) ?
                        chat.getSenderId() : chat.getRecipientId();
                messagingTemplate.convertAndSendToUser(
                        targetUser.toString(), "/queue/chats", notification);
            } else if (chat.isGroupChat()) {
                messagingTemplate.convertAndSend("/topic/group/" + chat.getGroupId(), notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying message reaction: " + e.getMessage());
        }
    }

    private void notifyMediaMessage(Chat chat, Integer userId) {
        try {
            Map<String, Object> notification = Map.of(
                    "type", "MEDIA_MESSAGE",
                    "messageId", chat.getId(),
                    "senderId", userId,
                    "mediaType", chat.getMediaType(),
                    "timestamp", LocalDateTime.now()
            );

            if (chat.isOneToOneChat()) {
                messagingTemplate.convertAndSendToUser(
                        chat.getRecipientId().toString(), "/queue/chats", notification);
            } else if (chat.isGroupChat()) {
                messagingTemplate.convertAndSend("/topic/group/" + chat.getGroupId(), notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying media message: " + e.getMessage());
        }
    }

    private void notifyMessagePin(Chat chat, Integer userId, String action) {
        try {
            Map<String, Object> notification = Map.of(
                    "type", "MESSAGE_PIN",
                    "messageId", chat.getId(),
                    "userId", userId,
                    "action", action,
                    "timestamp", LocalDateTime.now()
            );

            if (chat.isOneToOneChat()) {
                Integer targetUser = chat.getRecipientId().equals(userId) ?
                        chat.getSenderId() : chat.getRecipientId();
                messagingTemplate.convertAndSendToUser(
                        targetUser.toString(), "/queue/chats", notification);
            } else if (chat.isGroupChat()) {
                messagingTemplate.convertAndSend("/topic/group/" + chat.getGroupId(), notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying message pin: " + e.getMessage());
        }
    }

    private void notifyMessageDelivery(Chat chat, Integer userId) {
        try {
            Map<String, Object> notification = Map.of(
                    "type", "MESSAGE_DELIVERED",
                    "messageId", chat.getId(),
                    "deliveredBy", userId,
                    "timestamp", LocalDateTime.now()
            );

            if (chat.isOneToOneChat()) {
                messagingTemplate.convertAndSendToUser(
                        chat.getSenderId().toString(), "/queue/chats", notification);
            } else if (chat.isGroupChat()) {
                messagingTemplate.convertAndSend("/topic/group/" + chat.getGroupId(), notification);
            }
        } catch (Exception e) {
            System.err.println("Error notifying message delivery: " + e.getMessage());
        }
    }

    private void notifyPresenceChange(Integer userId, String status) {
        try {
            Map<String, Object> notification = Map.of(
                    "type", "PRESENCE_CHANGE",
                    "userId", userId,
                    "status", status,
                    "timestamp", LocalDateTime.now()
            );

            // Notify all friends about presence change
            messagingTemplate.convertAndSend("/topic/presence/" + userId, notification);
        } catch (Exception e) {
            System.err.println("Error notifying presence change: " + e.getMessage());
        }
    }

    private Chat toEntity(ChatRequest request, Integer userId) {
        Chat chat = new Chat();
        chat.setSenderId(userId);
        chat.setRecipientId(request.getRecipientId());
        chat.setGroupId(request.getGroupId());
        chat.setContent(request.getContent());
        return chat;
    }

    private ChatResponse toResponse(Chat chat, Integer currentUserId) {
        ChatResponse response = new ChatResponse();
        response.setId(chat.getId());
        response.setSenderId(chat.getSenderId());
        response.setRecipientId(chat.getRecipientId());
        response.setGroupId(chat.getGroupId());
        response.setTimestamp(chat.getTimestamp());

        // Set sender details using ServiceHelper
        if (chat.getSenderId() != null) {
            try {
                var sender = helper.validateUser(chat.getSenderId());
                response.setEmail(sender.getEmail());
                response.setUsername(sender.getUsername());
                response.setFirstName(sender.getFirstName());
                response.setLastName(sender.getLastName());
            } catch (Exception e) {
                // If user details cannot be fetched, leave fields null or set default
            }
        }

        // Set content based on deletion status
        String displayContent;
        if (currentUserId != null) {
            displayContent = chat.getDisplayContent(currentUserId);
            response.setIsDeletedByCurrentUser(chat.isDeletedByUser(currentUserId));
        } else {
            displayContent = chat.getContent();
            response.setIsDeletedByCurrentUser(false);
        }

        response.setContent(displayContent);
        response.setWasDeleted(displayContent != null && displayContent.contains("🚫 This message was deleted"));
        response.setIsDeletedBySender(chat.getDeletedBySender() != null ? chat.getDeletedBySender() : false);

        // Set edit information
        response.setIsEdited(chat.getIsEdited() != null ? chat.getIsEdited() : false);
        response.setEditedAt(chat.getEditedAt());

        // Set reply information
        response.setReplyToMessageId(chat.getReplyToMessageId());

        // Set forward information
        response.setIsForwarded(chat.getIsForwarded() != null ? chat.getIsForwarded() : false);
        response.setForwardedFromMessageId(chat.getForwardedFromMessageId());

        // Set media information
        response.setIsMediaMessage(chat.getIsMediaMessage() != null ? chat.getIsMediaMessage() : false);
        response.setMediaUrl(chat.getMediaUrl());
        response.setMediaType(chat.getMediaType());

        // Set pin information
        response.setIsPinned(chat.getIsPinned() != null ? chat.getIsPinned() : false);
        response.setPinnedBy(chat.getPinnedBy());
        response.setPinnedAt(chat.getPinnedAt());

        // Set reactions
        response.setReactions(chat.getReactions());

        if (chat.isOneToOneChat()) {
            response.setIsRead(chat.isRead());
            response.setIsDelivered(chat.getIsDelivered() != null ? chat.getIsDelivered() : false);
            response.setDeliveredAt(chat.getDeliveredAt());
        } else if (chat.isGroupChat()) {
            response.setReadByUsers(chat.getReadByUsers());
            response.setReadCount(chat.getReadCount());
            response.setDeliveredToUsers(chat.getDeliveredToUsers());
            if (currentUserId != null) {
                response.setIsReadByCurrentUser(chat.isReadByUser(currentUserId));
                response.setIsDeliveredByCurrentUser(chat.isDeliveredByUser(currentUserId));
            } else {
                response.setIsReadByCurrentUser(false);
                response.setIsDeliveredByCurrentUser(false);
            }
        }

        return response;
    }

    // Keep the old method for backward compatibility
    private ChatResponse toResponse(Chat chat) {
        return toResponse(chat, null);
    }
}