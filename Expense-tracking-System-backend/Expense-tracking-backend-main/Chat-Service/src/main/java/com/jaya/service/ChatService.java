package com.jaya.service;

import com.jaya.dto.ChatRequest;
import com.jaya.dto.ChatResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

public interface ChatService {
    ChatResponse sendOneToOneChat(ChatRequest request, Integer userId);

    ChatResponse sendGroupChat(ChatRequest request, Integer userId);

    List<ChatResponse> getChatsForUser(Integer userId);

    List<ChatResponse> getChatsForGroup(Integer groupId, Integer userId);

    List<ChatResponse> getChatsBySender(Integer senderId);

    List<ChatResponse> getChatsBetweenUsers(Integer userId1, Integer userId2);

    List<ChatResponse> searchChatsForUser(Integer userId, String keyword);

    List<ChatResponse> searchChatsForGroup(Integer groupId, String keyword, Integer userId);

    ChatResponse markChatAsRead(Integer chatId, Integer userId) throws Exception;

    List<ChatResponse> getUnreadChatsForUser(Integer userId);

    List<ChatResponse> getUnreadChatsForGroup(Integer groupId, Integer userId);

    void deleteChats(List<Integer> chatIds, Integer userId) throws Exception;

    void deleteChat(Integer id, Integer userId) throws Exception;

    List<Integer> getChatReaders(Integer chatId, Integer userId) throws Exception;

    boolean isMessageReadByUser(Integer chatId, Integer userId) throws Exception;

    int getMessageReadCount(Integer chatId, Integer userId) throws Exception;

    ChatResponse editMessage(Integer messageId, String newContent, Integer userId) throws Exception;

    ChatResponse replyToMessage(Integer replyToMessageId, String content, Integer userId) throws Exception;

    ChatResponse forwardMessage(Integer messageId, Integer targetUserId, Integer targetGroupId, Integer userId)
            throws Exception;

    ChatResponse forwardMessage(Integer messageId, Integer targetUserId, Integer userId) throws Exception;

    void pinMessage(Integer messageId, Integer userId) throws Exception;

    void unpinMessage(Integer messageId, Integer userId) throws Exception;

    List<ChatResponse> getPinnedMessages(Integer chatId, String chatType, Integer userId) throws Exception;

    Page<ChatResponse> getChatHistory(Integer userId1, Integer userId2, int page, int size) throws Exception;

    Page<ChatResponse> getGroupChatHistory(Integer groupId, Integer userId, int page, int size) throws Exception;

    List<ChatResponse> getRecentChats(Integer userId, int limit) throws Exception;

    Map<String, Object> getChatStatistics(Integer userId) throws Exception;

    Map<String, Object> getGroupChatStatistics(Integer groupId, Integer userId) throws Exception;

    Long getUnreadMessageCount(Integer userId) throws Exception;

    Map<String, Long> getUnreadCountByChat(Integer userId) throws Exception;

    void addReaction(Integer messageId, String reaction, Integer userId) throws Exception;

    void removeReaction(Integer messageId, String reaction, Integer userId) throws Exception;

    ChatResponse addReaction(Integer messageId, String reaction, Integer userId, boolean returnResponse) throws Exception;

    ChatResponse removeReaction(Integer messageId, Integer userId) throws Exception;

    Map<String, List<Integer>> getMessageReactions(Integer messageId, Integer userId) throws Exception;

    List<Map<String, Object>> getConversationsList(Integer userId) throws Exception;

    void startTyping(Integer chatId, String chatType, Integer userId) throws Exception;

    void stopTyping(Integer chatId, String chatType, Integer userId) throws Exception;

    List<Integer> getTypingUsers(Integer chatId, String chatType, Integer userId) throws Exception;

    void markMessageAsDelivered(Integer messageId, Integer userId) throws Exception;

    List<ChatResponse> getUndeliveredMessages(Integer userId) throws Exception;

    Map<String, Object> getMessageStatus(Integer messageId, Integer userId) throws Exception;

    void muteChat(Integer chatId, String chatType, Integer userId, Long muteUntil) throws Exception;

    void unmuteChat(Integer chatId, String chatType, Integer userId) throws Exception;

    boolean isChatMuted(Integer chatId, String chatType, Integer userId) throws Exception;

    void archiveChat(Integer chatId, String chatType, Integer userId) throws Exception;

    void unarchiveChat(Integer chatId, String chatType, Integer userId) throws Exception;

    List<ChatResponse> getArchivedChats(Integer userId) throws Exception;

    ChatResponse sendMediaMessage(Integer recipientId, Integer groupId, String mediaUrl, String mediaType,
            String caption, Integer userId) throws Exception;

    List<ChatResponse> getMediaMessages(Integer chatId, String chatType, Integer userId) throws Exception;

    Page<ChatResponse> searchMessagesAdvanced(String query, Integer userId, String chatType, Integer chatId,
            String messageType, String dateFrom, String dateTo, int page, int size) throws Exception;

    List<ChatResponse> exportChatHistory(Integer userId1, Integer userId2, Integer userId) throws Exception;

    List<ChatResponse> exportGroupChatHistory(Integer groupId, Integer userId) throws Exception;

    void updateUserPresence(Integer userId, String status) throws Exception;

    String getUserPresence(Integer userId) throws Exception;

    Map<Integer, String> getMultipleUserPresence(List<Integer> userIds, Integer requesterId) throws Exception;
}