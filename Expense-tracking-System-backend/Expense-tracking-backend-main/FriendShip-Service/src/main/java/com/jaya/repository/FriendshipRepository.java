package com.jaya.repository;

import com.jaya.models.AccessLevel;
import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Integer> {

        // Single friendship lookup (bi-directional handled in service)
        @Query("SELECT f FROM Friendship f WHERE f.requesterId = :requester AND f.recipientId = :recipient")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        Optional<Friendship> findByRequesterIdAndRecipientId(@Param("requester") Integer requester,
                        @Param("recipient") Integer recipient);

        // All friendships where user participates (any status)
        @Query("SELECT f FROM Friendship f WHERE f.requesterId = :user OR f.recipientId = :user")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "200"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        List<Friendship> findByRequesterIdOrRecipientId(@Param("user") Integer user);

        // Incoming requests by status (String overload retained for backward
        // compatibility)
        @Query("SELECT f FROM Friendship f WHERE f.recipientId = :recipient AND f.status = :status")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "100"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        List<Friendship> findByRecipientIdAndStatus(@Param("recipient") Integer recipient,
                        @Param("status") String status);

        @Query("SELECT f FROM Friendship f WHERE f.recipientId = :recipient AND f.status = :status")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "100"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        List<Friendship> findByRecipientIdAndStatus(@Param("recipient") Integer recipient,
                        @Param("status") FriendshipStatus status);

        @Query("SELECT f FROM Friendship f WHERE f.requesterId = :requester AND f.status = :status")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "100"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        List<Friendship> findByRequesterIdAndStatus(@Param("requester") Integer requester,
                        @Param("status") FriendshipStatus status);

        @Query("SELECT f FROM Friendship f WHERE f.requesterId = :requester AND f.recipientId = :recipient AND f.status = :status")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "50"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        Optional<Friendship> findByRequesterIdAndRecipientIdAndStatus(@Param("requester") Integer requester,
                        @Param("recipient") Integer recipient,
                        @Param("status") FriendshipStatus status);

        @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :requester OR f.recipientId = :requester) AND f.status = :status")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "200"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        List<Friendship> findByRequesterIdOrRecipientIdAndStatus(@Param("requester") Integer requester,
                        @Param("status") FriendshipStatus status);

        @Query("SELECT COUNT(f) FROM Friendship f WHERE f.recipientId = :recipient AND f.status = :status")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        int countByRecipientIdAndStatus(@Param("recipient") Integer recipient,
                        @Param("status") FriendshipStatus status);

        @Query("SELECT COUNT(f) FROM Friendship f WHERE f.requesterId = :requester AND f.status = :status")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        int countByRequesterIdAndStatus(@Param("requester") Integer requester,
                        @Param("status") FriendshipStatus status);

        // Unified user+status filter (accepted/pending/etc.)
        @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :userId OR f.recipientId = :userId) AND f.status = :status")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "250"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        List<Friendship> findByUserIdAndStatus(@Param("userId") Integer userId,
                        @Param("status") FriendshipStatus status);

        // Bulk friend-of-friend fetch for suggestions
        @Query("SELECT f FROM Friendship f WHERE f.requesterId IN :userIds OR f.recipientId IN :userIds")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_FETCH_SIZE, value = "500"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        List<Friendship> findAllByRequesterIdInOrRecipientIdIn(@Param("userIds") Set<Integer> userIds);

        // Report queries with date range filtering
        @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :userId OR f.recipientId = :userId) " +
                        "AND (:status IS NULL OR f.status = :status) " +
                        "AND (:fromDate IS NULL OR f.createdAt >= :fromDate) " +
                        "AND (:toDate IS NULL OR f.createdAt <= :toDate)")
        Page<Friendship> findFriendshipsForReport(
                        @Param("userId") Integer userId,
                        @Param("status") FriendshipStatus status,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        Pageable pageable);

        // Count friendships by status for report
        @Query("SELECT COUNT(f) FROM Friendship f WHERE (f.requesterId = :userId OR f.recipientId = :userId) " +
                        "AND f.status = :status " +
                        "AND (:fromDate IS NULL OR f.createdAt >= :fromDate) " +
                        "AND (:toDate IS NULL OR f.createdAt <= :toDate)")
        int countByUserIdAndStatusInDateRange(
                        @Param("userId") Integer userId,
                        @Param("status") FriendshipStatus status,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate);

        // Get friendships by access level for current user
        @Query("SELECT f FROM Friendship f WHERE " +
                        "((f.requesterId = :userId AND f.recipientAccess = :accessLevel) OR " +
                        "(f.recipientId = :userId AND f.requesterAccess = :accessLevel)) " +
                        "AND f.status = 'ACCEPTED'")
        List<Friendship> findByUserIdAndMyAccessLevel(
                        @Param("userId") Integer userId,
                        @Param("accessLevel") AccessLevel accessLevel);

        // Count new friendships per month for activity chart
        @Query("SELECT FUNCTION('MONTH', f.createdAt) as month, COUNT(f) as count " +
                        "FROM Friendship f " +
                        "WHERE (f.requesterId = :userId OR f.recipientId = :userId) " +
                        "AND f.status = 'ACCEPTED' " +
                        "AND f.createdAt >= :startDate " +
                        "GROUP BY FUNCTION('MONTH', f.createdAt)")
        List<Object[]> countNewFriendsByMonth(
                        @Param("userId") Integer userId,
                        @Param("startDate") LocalDateTime startDate);

        // Count requests sent per month
        @Query("SELECT FUNCTION('MONTH', f.createdAt) as month, COUNT(f) as count " +
                        "FROM Friendship f " +
                        "WHERE f.requesterId = :userId " +
                        "AND f.createdAt >= :startDate " +
                        "GROUP BY FUNCTION('MONTH', f.createdAt)")
        List<Object[]> countRequestsSentByMonth(
                        @Param("userId") Integer userId,
                        @Param("startDate") LocalDateTime startDate);

        // Count requests received per month
        @Query("SELECT FUNCTION('MONTH', f.createdAt) as month, COUNT(f) as count " +
                        "FROM Friendship f " +
                        "WHERE f.recipientId = :userId " +
                        "AND f.createdAt >= :startDate " +
                        "GROUP BY FUNCTION('MONTH', f.createdAt)")
        List<Object[]> countRequestsReceivedByMonth(
                        @Param("userId") Integer userId,
                        @Param("startDate") LocalDateTime startDate);
}