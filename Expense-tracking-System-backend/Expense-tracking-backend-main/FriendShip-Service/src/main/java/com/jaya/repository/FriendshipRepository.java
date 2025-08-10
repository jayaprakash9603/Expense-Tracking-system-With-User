package com.jaya.repository;

import com.jaya.models.Friendship;
import com.jaya.models.FriendshipStatus;
import com.jaya.models.UserDto;
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
    Optional<Friendship> findByRequesterIdAndRecipientId(Integer requester, Integer recipient);
    List<Friendship> findByRequesterIdOrRecipientId(Integer requester, Integer recipient);
    List<Friendship> findByRecipientIdAndStatus(Integer recipient, String status);
    List<Friendship> findByRecipientIdAndStatus(Integer recipient, FriendshipStatus status);
    List<Friendship> findByRequesterIdAndStatus(Integer requester, FriendshipStatus status);
    Optional<Friendship> findByRequesterIdAndRecipientIdAndStatus(Integer requester, Integer recipient, FriendshipStatus status);
    List<Friendship> findByRequesterIdOrRecipientIdAndStatus(Integer requester, Integer recipient, FriendshipStatus status);
    int countByRecipientIdAndStatus(Integer recipient, FriendshipStatus status);
    int countByRequesterIdAndStatus(Integer requester, FriendshipStatus status);

}