package com.jaya.repository;

import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, Integer> {
    Optional<Friendship> findByRequesterAndRecipient(User requester, User recipient);
    List<Friendship> findByRequesterOrRecipient(User requester, User recipient);
    List<Friendship> findByRecipientAndStatus(User recipient, String status);
    List<Friendship> findByRecipientAndStatus(User recipient, FriendshipStatus status);
    List<Friendship> findByRequesterAndStatus(User requester, FriendshipStatus status);
    Optional<Friendship> findByRequesterAndRecipientAndStatus(User requester, User recipient, FriendshipStatus status);
    List<Friendship> findByRequesterOrRecipientAndStatus(User requester, User recipient, FriendshipStatus status);
    int countByRecipientAndStatus(User recipient, FriendshipStatus status);
    int countByRequesterAndStatus(User requester, FriendshipStatus status);

    // File: Expense-tracking-System-backend/Expense-tracking-backend-main/social-media-app/src/main/java/com/jaya/repository/FriendshipRepository.java
    @Query("SELECT u FROM User u WHERE u.id NOT IN :excludedIds ORDER BY function('RAND')")
    List<User> findRandomUsers(@Param("excludedIds") Set<Integer> excludedIds, Pageable pageable);
}