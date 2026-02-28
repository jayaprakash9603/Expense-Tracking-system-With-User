package com.jaya.repository;

import com.jaya.models.SharedResource;
import com.jaya.models.SharedResourceType;
import com.jaya.models.ShareVisibility;
import jakarta.persistence.QueryHint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.QueryHints;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SharedResourceRepository extends JpaRepository<SharedResource, Long> {

        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true"),
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_READ_ONLY, value = "true")
        })
        Optional<SharedResource> findByShareToken(String shareToken);

        @Query("SELECT sr FROM SharedResource sr WHERE sr.shareToken = :token AND sr.isActive = true")
        @QueryHints({
                        @QueryHint(name = org.hibernate.jpa.HibernateHints.HINT_CACHEABLE, value = "true")
        })
        Optional<SharedResource> findActiveByToken(@Param("token") String token);

        @Query("SELECT sr FROM SharedResource sr WHERE sr.ownerUserId = :userId ORDER BY sr.createdAt DESC")
        List<SharedResource> findByOwnerUserId(@Param("userId") Integer userId);

        @Query("SELECT sr FROM SharedResource sr WHERE sr.ownerUserId = :userId AND sr.isActive = true ORDER BY sr.createdAt DESC")
        List<SharedResource> findActiveByOwnerUserId(@Param("userId") Integer userId);

        @Query("SELECT sr FROM SharedResource sr WHERE sr.ownerUserId = :userId ORDER BY sr.createdAt DESC")
        Page<SharedResource> findByOwnerUserIdPaged(@Param("userId") Integer userId, Pageable pageable);

        @Query("SELECT sr FROM SharedResource sr WHERE sr.isActive = true AND sr.expiresAt IS NOT NULL AND sr.expiresAt < :now")
        List<SharedResource> findExpiredActiveShares(@Param("now") LocalDateTime now);

        @Modifying
        @Query("UPDATE SharedResource sr SET sr.isActive = false WHERE sr.isActive = true AND sr.expiresAt IS NOT NULL AND sr.expiresAt < :now")
        int deactivateExpiredShares(@Param("now") LocalDateTime now);

        boolean existsByShareToken(String shareToken);

        @Query("SELECT COUNT(sr) FROM SharedResource sr WHERE sr.ownerUserId = :userId AND sr.isActive = true")
        long countActiveSharesByOwner(@Param("userId") Integer userId);

        @Query("SELECT COUNT(sr) FROM SharedResource sr WHERE sr.ownerUserId = :userId AND sr.createdAt >= :since")
        long countSharesCreatedSince(@Param("userId") Integer userId, @Param("since") LocalDateTime since);

        @Query("SELECT sr FROM SharedResource sr WHERE sr.ownerUserId = :userId AND sr.resourceType = :type AND sr.isActive = true")
        List<SharedResource> findActiveByOwnerAndType(
                        @Param("userId") Integer userId,
                        @Param("type") SharedResourceType type);

        @Query("SELECT sr FROM SharedResource sr WHERE sr.shareToken = :token AND sr.ownerUserId = :userId")
        Optional<SharedResource> findByTokenAndOwner(@Param("token") String token, @Param("userId") Integer userId);

        @Modifying
        @Query("DELETE FROM SharedResource sr WHERE sr.ownerUserId = :userId")
        void deleteAllByOwnerUserId(@Param("userId") Integer userId);

        @Query("SELECT COUNT(sr), SUM(sr.accessCount) FROM SharedResource sr WHERE sr.ownerUserId = :userId")
        Object[] getShareStatsByOwner(@Param("userId") Integer userId);

        @Query("SELECT sr FROM SharedResource sr WHERE sr.visibility = :visibility AND sr.isActive = true " +
                        "AND (sr.expiresAt IS NULL OR sr.expiresAt > :now) " +
                        "AND sr.ownerUserId != :excludeUserId " +
                        "ORDER BY sr.createdAt DESC")
        List<SharedResource> findPublicSharesExcludingUser(@Param("now") LocalDateTime now,
                        @Param("excludeUserId") Integer excludeUserId,
                        @Param("visibility") ShareVisibility visibility);

        @Query("SELECT sr FROM SharedResource sr WHERE sr.visibility = :visibility AND sr.isActive = true " +
                        "AND (sr.expiresAt IS NULL OR sr.expiresAt > :now) " +
                        "ORDER BY sr.createdAt DESC")
        List<SharedResource> findAllPublicShares(@Param("now") LocalDateTime now,
                        @Param("visibility") ShareVisibility visibility);

        @Query("SELECT COUNT(sr) FROM SharedResource sr WHERE sr.visibility = :visibility AND sr.isActive = true " +
                        "AND (sr.expiresAt IS NULL OR sr.expiresAt > :now)")
        long countPublicShares(@Param("now") LocalDateTime now,
                        @Param("visibility") ShareVisibility visibility);
}
