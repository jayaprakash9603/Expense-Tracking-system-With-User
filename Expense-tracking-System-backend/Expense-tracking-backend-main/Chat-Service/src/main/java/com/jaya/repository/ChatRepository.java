package com.jaya.repository;

import com.jaya.models.Chat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChatRepository extends JpaRepository<Chat, Integer> {

        List<Chat> findByRecipientId(Integer recipientId);

        List<Chat> findByGroupId(Integer groupId);

        List<Chat> findBySenderId(Integer senderId);

        List<Chat> findBySenderIdAndRecipientId(Integer senderId, Integer recipientId);

        List<Chat> findByRecipientIdAndContentContainingIgnoreCase(Integer recipientId, String keyword);

        List<Chat> findByGroupIdAndContentContainingIgnoreCase(Integer groupId, String keyword);

        List<Chat> findByRecipientIdAndIsReadFalse(Integer recipientId);

        List<Chat> findByGroupIdAndIsReadFalse(Integer groupId);

        @Query("SELECT c FROM Chat c WHERE c.recipientId = :recipientId AND " +
                        "(c.deletedByRecipient = false OR c.deletedByRecipient IS NULL)")
        List<Chat> findByRecipientIdNotDeletedByRecipient(@Param("recipientId") Integer recipientId);

        @Query("SELECT c FROM Chat c WHERE " +
                        "((c.senderId = :userId1 AND c.recipientId = :userId2 AND (c.deletedBySender = false OR c.deletedBySender IS NULL)) OR "
                        +
                        "(c.senderId = :userId2 AND c.recipientId = :userId1 AND (c.deletedByRecipient = false OR c.deletedByRecipient IS NULL))) "
                        +
                        "ORDER BY c.timestamp")
        List<Chat> findConversationBetweenUsers(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);

        @Query("SELECT c FROM Chat c WHERE " +
                        "((c.senderId = :userId1 AND c.recipientId = :userId2) OR " +
                        "(c.senderId = :userId2 AND c.recipientId = :userId1)) AND " +
                        "c.groupId IS NULL AND " +
                        "(c.deletedBySender IS NULL OR c.deletedBySender = false OR c.senderId != :userId1) AND " +
                        "(c.deletedByRecipient IS NULL OR c.deletedByRecipient = false OR c.recipientId != :userId1) " +
                        "ORDER BY c.timestamp DESC")
        Page<Chat> findConversationBetweenUsersPaginated(@Param("userId1") Integer userId1,
                        @Param("userId2") Integer userId2,
                        Pageable pageable);

        @Query("SELECT DISTINCT c FROM Chat c LEFT JOIN FETCH c.deletedByUsers WHERE c.groupId = :groupId " +
                        "AND (:userId NOT MEMBER OF c.deletedByUsers OR c.deletedByUsers IS EMPTY)")
        List<Chat> findByGroupIdNotDeletedByUser(@Param("groupId") Integer groupId, @Param("userId") Integer userId);

        @Query("SELECT c FROM Chat c WHERE c.groupId = :groupId AND " +
                        "(c.deletedBySender = false OR c.deletedBySender IS NULL) AND " +
                        "(:userId NOT MEMBER OF c.deletedByUsers OR c.deletedByUsers IS NULL) " +
                        "ORDER BY c.timestamp DESC")
        Page<Chat> findByGroupIdPaginated(@Param("groupId") Integer groupId,
                        @Param("userId") Integer userId,
                        Pageable pageable);

        @Query("SELECT c FROM Chat c WHERE c.recipientId = :recipientId AND " +
                        "LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%')) AND " +
                        "(c.deletedByRecipient = false OR c.deletedByRecipient IS NULL)")
        List<Chat> findByRecipientIdAndContentContainingIgnoreCaseNotDeleted(
                        @Param("recipientId") Integer recipientId, @Param("keyword") String keyword);

        @Query("SELECT c FROM Chat c WHERE c.groupId = :groupId AND " +
                        "LOWER(c.content) LIKE LOWER(CONCAT('%', :keyword, '%')) AND " +
                        "(:userId NOT MEMBER OF c.deletedByUsers OR c.deletedByUsers IS EMPTY)")
        List<Chat> findByGroupIdAndContentContainingIgnoreCaseNotDeleted(
                        @Param("groupId") Integer groupId, @Param("keyword") String keyword,
                        @Param("userId") Integer userId);

        @Query("SELECT c FROM Chat c WHERE c.recipientId = :recipientId AND c.isRead = false AND " +
                        "(c.deletedByRecipient = false OR c.deletedByRecipient IS NULL)")
        List<Chat> findByRecipientIdAndIsReadFalseNotDeleted(@Param("recipientId") Integer recipientId);

        @Query("SELECT c FROM Chat c WHERE c.groupId = :groupId AND " +
                        "(:userId NOT MEMBER OF c.readByUsers OR c.readByUsers IS EMPTY) AND " +
                        "(:userId NOT MEMBER OF c.deletedByUsers OR c.deletedByUsers IS EMPTY) AND " +
                        "c.senderId != :userId")
        List<Chat> findByGroupIdAndNotReadByUserAndNotDeleted(@Param("groupId") Integer groupId,
                        @Param("userId") Integer userId);

        @Query("SELECT COUNT(c) FROM Chat c WHERE c.senderId = :userId")
        Long countBySenderId(@Param("userId") Integer userId);

        @Query("SELECT COUNT(c) FROM Chat c WHERE c.recipientId = :userId")
        Long countByRecipientId(@Param("userId") Integer userId);

        @Query("SELECT COUNT(c) FROM Chat c WHERE c.groupId = :groupId")
        Long countByGroupId(@Param("groupId") Integer groupId);

        @Query("SELECT COUNT(c) FROM Chat c WHERE c.groupId = :groupId AND c.senderId = :userId")
        Long countByGroupIdAndSenderId(@Param("groupId") Integer groupId, @Param("userId") Integer userId);

        @Query("SELECT COUNT(c) FROM Chat c WHERE " +
                        "((c.recipientId = :userId AND c.isRead = false AND (c.deletedByRecipient = false OR c.deletedByRecipient IS NULL)) OR "
                        +
                        "(c.groupId IS NOT NULL AND :userId NOT MEMBER OF c.readByUsers AND " +
                        "(:userId NOT MEMBER OF c.deletedByUsers OR c.deletedByUsers IS EMPTY))) AND " +
                        "c.senderId != :userId")
        Long countUnreadMessagesForUser(@Param("userId") Integer userId);

        @Query("SELECT COUNT(c) FROM Chat c WHERE c.groupId = :groupId AND " +
                        "(:userId NOT MEMBER OF c.readByUsers OR c.readByUsers IS NULL) AND " +
                        "c.senderId != :userId")
        Long countUnreadGroupMessagesForUser(@Param("groupId") Integer groupId, @Param("userId") Integer userId);

        @Query("SELECT COUNT(DISTINCT CASE " +
                        "WHEN c.recipientId = :userId THEN c.senderId " +
                        "WHEN c.senderId = :userId THEN c.recipientId " +
                        "ELSE c.groupId END) FROM Chat c WHERE " +
                        "(c.senderId = :userId OR c.recipientId = :userId OR c.groupId IS NOT NULL)")
        Long countActiveConversationsForUser(@Param("userId") Integer userId);

        @Query("SELECT COUNT(c) FROM Chat c WHERE c.senderId = :userId AND " +
                        "DATE(c.timestamp) = CURRENT_DATE")
        Long countMessagesSentToday(@Param("userId") Integer userId);

        @Query("SELECT COUNT(c) FROM Chat c WHERE c.groupId = :groupId AND " +
                        "DATE(c.timestamp) = CURRENT_DATE")
        Long countGroupMessagesToday(@Param("groupId") Integer groupId);

        @Query("SELECT CASE " +
                        "WHEN c.senderId = :userId THEN c.recipientId " +
                        "ELSE c.senderId END as partnerId, COUNT(c) as messageCount " +
                        "FROM Chat c WHERE " +
                        "(c.senderId = :userId OR c.recipientId = :userId) AND c.groupId IS NULL " +
                        "GROUP BY CASE WHEN c.senderId = :userId THEN c.recipientId ELSE c.senderId END " +
                        "ORDER BY messageCount DESC")
        List<Object[]> findMostActiveChatPartnerData(@Param("userId") Integer userId);

        @Query("SELECT c.senderId, COUNT(c) FROM Chat c WHERE c.groupId = :groupId " +
                        "GROUP BY c.senderId ORDER BY COUNT(c) DESC")
        Object findMostActiveMemberInGroup(@Param("groupId") Integer groupId);

        default Object findMostActiveChatPartner(Integer userId) {
                List<Object[]> results = findMostActiveChatPartnerData(userId);
                if (results.isEmpty()) {
                        return null;
                }
                Object[] topResult = results.get(0);
                return java.util.Map.of(
                                "partnerId", topResult[0],
                                "messageCount", topResult[1]);
        }

        @Query("SELECT c.senderId, COUNT(c) FROM Chat c WHERE c.recipientId = :userId AND " +
                        "(c.isRead = false OR c.isRead IS NULL) GROUP BY c.senderId")
        List<Object[]> getUnreadCountsByUser(@Param("userId") Integer userId);

        @Query("SELECT c.groupId, COUNT(c) FROM Chat c WHERE c.groupId IS NOT NULL AND " +
                        "(:userId NOT MEMBER OF c.readByUsers OR c.readByUsers IS NULL) AND " +
                        "c.senderId != :userId GROUP BY c.groupId")
        List<Object[]> getUnreadCountsByGroup(@Param("userId") Integer userId);

        @Query("SELECT c FROM Chat c WHERE c.isMediaMessage = true AND " +
                        "((c.senderId = :userId1 AND c.recipientId = :userId2) OR " +
                        "(c.senderId = :userId2 AND c.recipientId = :userId1)) AND " +
                        "c.groupId IS NULL ORDER BY c.timestamp DESC")
        List<Chat> findMediaMessagesBetweenUsers(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);

        @Query("SELECT c FROM Chat c WHERE c.isMediaMessage = true AND c.groupId = :groupId " +
                        "ORDER BY c.timestamp DESC")
        List<Chat> findMediaMessagesByGroupId(@Param("groupId") Integer groupId);

        @Query("SELECT c FROM Chat c WHERE c.isPinned = true AND " +
                        "((c.senderId = :userId1 AND c.recipientId = :userId2) OR " +
                        "(c.senderId = :userId2 AND c.recipientId = :userId1)) AND " +
                        "c.groupId IS NULL ORDER BY c.pinnedAt DESC")
        List<Chat> findPinnedMessagesBetweenUsers(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);

        @Query("SELECT c FROM Chat c WHERE c.isPinned = true AND c.groupId = :groupId " +
                        "ORDER BY c.pinnedAt DESC")
        List<Chat> findPinnedMessagesByGroupId(@Param("groupId") Integer groupId);

        @Query("SELECT c FROM Chat c WHERE " +
                        "(c.senderId = :userId OR c.recipientId = :userId OR c.groupId IS NOT NULL) " +
                        "ORDER BY c.timestamp DESC")
        List<Chat> findRecentChatsForUser(@Param("userId") Integer userId, Pageable pageable);

        @Query("SELECT c FROM Chat c WHERE c.groupId = :groupId AND " +
                        "(:userId NOT IN (SELECT d FROM c.deletedByUsers d) OR c.deletedByUsers IS NULL) AND " +
                        "(c.deletedBySender IS NULL OR c.deletedBySender = false OR c.senderId = :userId) " +
                        "ORDER BY c.timestamp DESC")
        Page<Chat> findByGroupIdAndNotDeletedByUserPaginated(@Param("groupId") Integer groupId,
                        @Param("userId") Integer userId,
                        Pageable pageable);

        @Query("SELECT c FROM Chat c WHERE c.recipientId = :userId AND " +
                        "(c.isDelivered = false OR c.isDelivered IS NULL)")
        List<Chat> findUndeliveredMessagesForUser(@Param("userId") Integer userId);

        @Query("SELECT c FROM Chat c WHERE " +
                        "((c.senderId = :userId1 AND c.recipientId = :userId2) OR " +
                        "(c.senderId = :userId2 AND c.recipientId = :userId1)) AND " +
                        "c.groupId IS NULL AND " +
                        "(:query IS NULL OR LOWER(c.content) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
                        "(:messageType IS NULL OR " +
                        "(:messageType = 'TEXT' AND (c.isMediaMessage = false OR c.isMediaMessage IS NULL)) OR " +
                        "(:messageType = 'MEDIA' AND c.isMediaMessage = true)) AND " +
                        "(:fromDate IS NULL OR c.timestamp >= :fromDate) AND " +
                        "(:toDate IS NULL OR c.timestamp <= :toDate) " +
                        "ORDER BY c.timestamp DESC")
        Page<Chat> searchMessagesBetweenUsersAdvanced(@Param("userId1") Integer userId1,
                        @Param("userId2") Integer userId2,
                        @Param("query") String query,
                        @Param("messageType") String messageType,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        Pageable pageable);

        @Query("SELECT c FROM Chat c WHERE c.groupId = :groupId AND " +
                        "(:query IS NULL OR LOWER(c.content) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
                        "(:messageType IS NULL OR " +
                        "(:messageType = 'TEXT' AND (c.isMediaMessage = false OR c.isMediaMessage IS NULL)) OR " +
                        "(:messageType = 'MEDIA' AND c.isMediaMessage = true)) AND " +
                        "(:fromDate IS NULL OR c.timestamp >= :fromDate) AND " +
                        "(:toDate IS NULL OR c.timestamp <= :toDate) " +
                        "ORDER BY c.timestamp DESC")
        Page<Chat> searchGroupMessagesAdvanced(@Param("groupId") Integer groupId,
                        @Param("query") String query,
                        @Param("messageType") String messageType,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        Pageable pageable);

        @Query("SELECT c FROM Chat c WHERE " +
                        "(c.senderId = :userId OR c.recipientId = :userId OR c.groupId IS NOT NULL) AND " +
                        "(:query IS NULL OR LOWER(c.content) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
                        "(:messageType IS NULL OR " +
                        "(:messageType = 'TEXT' AND (c.isMediaMessage = false OR c.isMediaMessage IS NULL)) OR " +
                        "(:messageType = 'MEDIA' AND c.isMediaMessage = true)) AND " +
                        "(:fromDate IS NULL OR c.timestamp >= :fromDate) AND " +
                        "(:toDate IS NULL OR c.timestamp <= :toDate) " +
                        "ORDER BY c.timestamp DESC")
        Page<Chat> searchAllUserMessagesAdvanced(@Param("userId") Integer userId,
                        @Param("query") String query,
                        @Param("messageType") String messageType,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        Pageable pageable);

        @Query("SELECT c FROM Chat c WHERE c.id IN :chatIds ORDER BY c.timestamp DESC")
        List<Chat> findByIdIn(@Param("chatIds") List<Integer> chatIds);

        @Query(value = "SELECT CASE WHEN c.sender_id = :userId THEN c.recipient_id ELSE c.sender_id END as friend_id, " +
                        "c.id as chat_id, " +
                        "(SELECT COUNT(*) FROM chats c2 WHERE " +
                        "((c2.sender_id = CASE WHEN c.sender_id = :userId THEN c.recipient_id ELSE c.sender_id END AND c2.recipient_id = :userId) " +
                        "OR (c2.sender_id = :userId AND c2.recipient_id = CASE WHEN c.sender_id = :userId THEN c.recipient_id ELSE c.sender_id END)) " +
                        "AND c2.is_read = false AND c2.recipient_id = :userId) as unread_count " +
                        "FROM chats c WHERE c.id IN " +
                        "(SELECT MAX(c3.id) FROM chats c3 WHERE c3.group_id IS NULL AND (c3.sender_id = :userId OR c3.recipient_id = :userId) " +
                        "GROUP BY CASE WHEN c3.sender_id = :userId THEN c3.recipient_id ELSE c3.sender_id END) " +
                        "ORDER BY c.timestamp DESC", nativeQuery = true)
        List<Object[]> findRecentOneToOneConversations(@Param("userId") Integer userId);

        @Query(value = "SELECT c.group_id, c.id as chat_id, " +
                        "(SELECT COUNT(*) FROM chats c2 WHERE c2.group_id = c.group_id AND c2.is_read = false AND c2.sender_id != :userId) as unread_count " +
                        "FROM chats c WHERE c.id IN " +
                        "(SELECT MAX(c3.id) FROM chats c3 WHERE c3.group_id IS NOT NULL AND c3.group_id IN " +
                        "(SELECT DISTINCT c4.group_id FROM chats c4 WHERE c4.sender_id = :userId OR c4.recipient_id = :userId) " +
                        "GROUP BY c3.group_id) " +
                        "ORDER BY c.timestamp DESC", nativeQuery = true)
        List<Object[]> findRecentGroupConversations(@Param("userId") Integer userId);

        // =====================================================
        // OPTIMIZED FETCH JOIN QUERIES TO AVOID N+1 PROBLEMS
        // =====================================================

        /**
         * Fetch conversation between users with all collections pre-loaded.
         * Avoids N+1 queries for reactions, readByUsers, etc.
         */
        @Query("SELECT DISTINCT c FROM Chat c " +
                        "LEFT JOIN FETCH c.reactions " +
                        "LEFT JOIN FETCH c.readByUsers " +
                        "LEFT JOIN FETCH c.deliveredToUsers " +
                        "LEFT JOIN FETCH c.deletedByUsers " +
                        "WHERE ((c.senderId = :userId1 AND c.recipientId = :userId2 AND (c.deletedBySender = false OR c.deletedBySender IS NULL)) OR " +
                        "(c.senderId = :userId2 AND c.recipientId = :userId1 AND (c.deletedByRecipient = false OR c.deletedByRecipient IS NULL))) " +
                        "ORDER BY c.timestamp")
        List<Chat> findConversationBetweenUsersOptimized(@Param("userId1") Integer userId1, @Param("userId2") Integer userId2);

        /**
         * Fetch chats by IDs with all collections pre-loaded.
         * Use this when you need to load multiple chats efficiently.
         */
        @Query("SELECT DISTINCT c FROM Chat c " +
                        "LEFT JOIN FETCH c.reactions " +
                        "LEFT JOIN FETCH c.readByUsers " +
                        "LEFT JOIN FETCH c.deliveredToUsers " +
                        "LEFT JOIN FETCH c.deletedByUsers " +
                        "WHERE c.id IN :chatIds " +
                        "ORDER BY c.timestamp DESC")
        List<Chat> findByIdInOptimized(@Param("chatIds") List<Integer> chatIds);

        /**
         * Fetch single chat by ID with all collections pre-loaded.
         */
        @Query("SELECT c FROM Chat c " +
                        "LEFT JOIN FETCH c.reactions " +
                        "LEFT JOIN FETCH c.readByUsers " +
                        "LEFT JOIN FETCH c.deliveredToUsers " +
                        "LEFT JOIN FETCH c.deletedByUsers " +
                        "WHERE c.id = :chatId")
        java.util.Optional<Chat> findByIdOptimized(@Param("chatId") Integer chatId);

        /**
         * Fetch group chats with all collections pre-loaded.
         */
        @Query("SELECT DISTINCT c FROM Chat c " +
                        "LEFT JOIN FETCH c.reactions " +
                        "LEFT JOIN FETCH c.readByUsers " +
                        "LEFT JOIN FETCH c.deliveredToUsers " +
                        "LEFT JOIN FETCH c.deletedByUsers " +
                        "WHERE c.groupId = :groupId " +
                        "AND (:userId NOT MEMBER OF c.deletedByUsers OR c.deletedByUsers IS EMPTY) " +
                        "ORDER BY c.timestamp")
        List<Chat> findByGroupIdOptimized(@Param("groupId") Integer groupId, @Param("userId") Integer userId);

        /**
         * Fetch unread messages for user with collections pre-loaded.
         */
        @Query("SELECT DISTINCT c FROM Chat c " +
                        "LEFT JOIN FETCH c.reactions " +
                        "WHERE c.recipientId = :recipientId AND c.isRead = false AND " +
                        "(c.deletedByRecipient = false OR c.deletedByRecipient IS NULL)")
        List<Chat> findUnreadMessagesForUserOptimized(@Param("recipientId") Integer recipientId);

        /**
         * Fetch distinct sender IDs from conversations with a user.
         * Useful for batch loading user info.
         */
        @Query("SELECT DISTINCT c.senderId FROM Chat c WHERE c.recipientId = :userId OR c.senderId = :userId")
        List<Integer> findDistinctParticipantIds(@Param("userId") Integer userId);

        /**
         * Fetch distinct sender IDs from a group.
         * Useful for batch loading user info.
         */
        @Query("SELECT DISTINCT c.senderId FROM Chat c WHERE c.groupId = :groupId")
        List<Integer> findDistinctSenderIdsByGroupId(@Param("groupId") Integer groupId);

        // =====================================================
        // BATCH UPDATE QUERIES TO AVOID N+1 UPDATE PROBLEMS
        // =====================================================

        /**
         * Batch mark one-to-one messages as read.
         * Returns the number of updated rows.
         */
        @org.springframework.data.jpa.repository.Modifying
        @Query("UPDATE Chat c SET c.isRead = true WHERE c.id IN :chatIds AND c.isRead = false")
        int batchMarkAsRead(@Param("chatIds") List<Integer> chatIds);

        /**
         * Batch mark messages as delivered.
         */
        @org.springframework.data.jpa.repository.Modifying
        @Query("UPDATE Chat c SET c.isDelivered = true, c.deliveredAt = :deliveredAt WHERE c.id IN :chatIds AND (c.isDelivered = false OR c.isDelivered IS NULL)")
        int batchMarkAsDelivered(@Param("chatIds") List<Integer> chatIds, @Param("deliveredAt") LocalDateTime deliveredAt);

        /**
         * Find unread message IDs for recipient from a specific sender.
         */
        @Query("SELECT c.id FROM Chat c WHERE c.senderId = :senderId AND c.recipientId = :recipientId AND c.isRead = false")
        List<Integer> findUnreadChatIdsBySenderAndRecipient(@Param("senderId") Integer senderId, @Param("recipientId") Integer recipientId);

        /**
         * Find all unread message IDs for a user (as recipient).
         */
        @Query("SELECT c.id FROM Chat c WHERE c.recipientId = :userId AND c.isRead = false")
        List<Integer> findAllUnreadChatIdsForUser(@Param("userId") Integer userId);

        /**
         * Find all undelivered message IDs for a user.
         */
        @Query("SELECT c.id FROM Chat c WHERE c.recipientId = :userId AND (c.isDelivered = false OR c.isDelivered IS NULL)")
        List<Integer> findAllUndeliveredChatIdsForUser(@Param("userId") Integer userId);

        /**
         * Find unread group message IDs for a user (messages not sent by the user and not read by the user).
         */
        @Query("SELECT c.id FROM Chat c WHERE c.groupId = :groupId AND c.senderId != :userId " +
               "AND (:userId NOT MEMBER OF c.readByUsers OR c.readByUsers IS EMPTY)")
        List<Integer> findUnreadGroupChatIdsForUser(@Param("groupId") Integer groupId, @Param("userId") Integer userId);
}
