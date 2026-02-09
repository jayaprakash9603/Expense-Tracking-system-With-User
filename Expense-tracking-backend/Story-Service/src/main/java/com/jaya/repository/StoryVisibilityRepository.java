package com.jaya.repository;

import com.jaya.models.StoryVisibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface StoryVisibilityRepository extends JpaRepository<StoryVisibility, UUID> {

    
    Optional<StoryVisibility> findByStoryIdAndUserId(UUID storyId, Integer userId);

    
    List<StoryVisibility> findByUserId(Integer userId);

    
    List<StoryVisibility> findByUserIdAndSeenTrue(Integer userId);

    
    List<StoryVisibility> findByUserIdAndDismissedTrue(Integer userId);

    
    @Query("SELECT sv.storyId FROM StoryVisibility sv WHERE sv.userId = :userId AND sv.seen = true")
    Set<UUID> findSeenStoryIdsByUserId(@Param("userId") Integer userId);

    
    @Query("SELECT sv.storyId FROM StoryVisibility sv WHERE sv.userId = :userId AND sv.dismissed = true")
    Set<UUID> findDismissedStoryIdsByUserId(@Param("userId") Integer userId);

    
    boolean existsByStoryIdAndUserIdAndSeenTrue(UUID storyId, Integer userId);

    
    @Query("SELECT SUM(sv.viewCount) FROM StoryVisibility sv WHERE sv.storyId = :storyId")
    Long countTotalViewsForStory(@Param("storyId") UUID storyId);

    
    @Query("SELECT COUNT(sv) FROM StoryVisibility sv WHERE sv.storyId = :storyId AND sv.seen = true")
    Long countUniqueViewersForStory(@Param("storyId") UUID storyId);

    
    @Query("SELECT COUNT(sv) FROM StoryVisibility sv WHERE sv.storyId = :storyId AND sv.ctaClicked = true")
    Long countCtaClicksForStory(@Param("storyId") UUID storyId);

    
    @Modifying
    @Query("DELETE FROM StoryVisibility sv WHERE sv.storyId = :storyId")
    void deleteByStoryId(@Param("storyId") UUID storyId);

    
    @Query("SELECT sv.storyId FROM StoryVisibility sv " +
            "WHERE sv.userId = :userId AND sv.storyId IN :storyIds AND sv.seen = true")
    Set<UUID> findSeenStoryIdsFromList(
            @Param("userId") Integer userId,
            @Param("storyIds") List<UUID> storyIds);
}
