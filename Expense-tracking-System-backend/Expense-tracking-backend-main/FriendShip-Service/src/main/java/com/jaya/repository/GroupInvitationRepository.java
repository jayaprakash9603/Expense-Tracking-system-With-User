
package com.jaya.repository;

import com.jaya.models.GroupInvitation;
import com.jaya.models.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface GroupInvitationRepository extends JpaRepository<GroupInvitation, Integer> {

    List<GroupInvitation> findByInviteeIdAndStatus(Integer inviteeId, InvitationStatus status);

    List<GroupInvitation> findByInviterIdAndStatus(Integer inviterId, InvitationStatus status);

    List<GroupInvitation> findByGroupIdAndStatus(Integer groupId, InvitationStatus status);

    Optional<GroupInvitation> findByGroupIdAndInviteeIdAndStatus(Integer groupId, Integer inviteeId, InvitationStatus status);

    @Query("SELECT gi FROM GroupInvitation gi WHERE gi.inviteeId = :userId AND gi.status = 'PENDING' AND gi.expiresAt > :now")
    List<GroupInvitation> findPendingInvitationsForUser(@Param("userId") Integer userId, @Param("now") LocalDateTime now);

    @Query("SELECT gi FROM GroupInvitation gi WHERE gi.inviterId = :userId AND gi.status = 'PENDING'")
    List<GroupInvitation> findSentInvitationsByUser(@Param("userId") Integer userId);

    @Query("SELECT gi FROM GroupInvitation gi WHERE gi.status = 'PENDING' AND gi.expiresAt <= :now")
    List<GroupInvitation> findExpiredInvitations(@Param("now") LocalDateTime now);
}