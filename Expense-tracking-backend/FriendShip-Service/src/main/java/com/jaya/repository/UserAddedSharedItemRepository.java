package com.jaya.repository;

import com.jaya.models.UserAddedSharedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface UserAddedSharedItemRepository extends JpaRepository<UserAddedSharedItem, Long> {

        List<UserAddedSharedItem> findByUserIdAndShareToken(Integer userId, String shareToken);

        List<UserAddedSharedItem> findByUserId(Integer userId);

        boolean existsByUserIdAndShareTokenAndExternalRef(Integer userId, String shareToken, String externalRef);

        Optional<UserAddedSharedItem> findByUserIdAndShareTokenAndExternalRef(
                        Integer userId, String shareToken, String externalRef);

        @Query("SELECT u.externalRef FROM UserAddedSharedItem u WHERE u.userId = :userId AND u.shareToken = :shareToken")
        Set<String> findExternalRefsByUserIdAndShareToken(
                        @Param("userId") Integer userId,
                        @Param("shareToken") String shareToken);

        long countByUserIdAndShareToken(Integer userId, String shareToken);

        void deleteByShareToken(String shareToken);

        void deleteByUserIdAndShareTokenAndExternalRef(Integer userId, String shareToken, String externalRef);
}
