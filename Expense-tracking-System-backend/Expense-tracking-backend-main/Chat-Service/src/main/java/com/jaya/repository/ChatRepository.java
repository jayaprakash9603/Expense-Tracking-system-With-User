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
}