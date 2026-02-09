package com.jaya.repository;

import com.jaya.models.ShareAccessLog;
import com.jaya.models.SharedResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShareAccessLogRepository extends JpaRepository<ShareAccessLog, Long> {

        Optional<ShareAccessLog> findByAccessingUserIdAndSharedResource(Integer accessingUserId,
                        SharedResource sharedResource);

        @Query("SELECT sal FROM ShareAccessLog sal " +
                        "JOIN FETCH sal.sharedResource sr " +
                        "WHERE sal.accessingUserId = :userId " +
                        "AND sr.ownerUserId != :userId " +
                        "ORDER BY sal.lastAccessedAt DESC")
        List<ShareAccessLog> findByAccessingUserId(@Param("userId") Integer userId);

        @Query("SELECT sal FROM ShareAccessLog sal " +
                        "JOIN FETCH sal.sharedResource sr " +
                        "WHERE sal.accessingUserId = :userId " +
                        "AND sal.isSaved = true " +
                        "AND sr.ownerUserId != :userId " +
                        "ORDER BY sal.lastAccessedAt DESC")
        List<ShareAccessLog> findSavedByAccessingUserId(@Param("userId") Integer userId);

        @Query("SELECT COUNT(DISTINCT sal.accessingUserId) FROM ShareAccessLog sal WHERE sal.sharedResource.id = :shareId")
        long countUniqueAccessorsByShareId(@Param("shareId") Long shareId);

        List<ShareAccessLog> findBySharedResourceId(Long shareId);

        void deleteBySharedResourceId(Long shareId);
}
