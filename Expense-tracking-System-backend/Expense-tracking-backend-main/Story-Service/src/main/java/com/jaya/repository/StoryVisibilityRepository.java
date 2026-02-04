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

    // Find visibility record for a specific story and user
    Optional<StoryVisibility> findByStoryIdAndUserId(UUID storyId, Integer userId);

    // Find all visibility records for a user
    List<StoryVisibility> findByUserId(Integer userId);

    // Find all seen stories for a user
    List<StoryVisibility> findByUserIdAndSeenTrue(Integer userId);

    // Find all dismissed stories for a user
    List<StoryVisibility> findByUserIdAndDismissedTrue(Integer userId);

    // Get seen story IDs for a user
    @Query("SELECT sv.storyId FROM StoryVisibility sv WHERE sv.userId = :userId AND sv.seen = true")
    Set<UUID> findSeenStoryIdsByUserId(@Param("userId") Integer userId);

    // Get dismissed story IDs for a user
    @Query("SELECT sv.storyId FROM StoryVisibility sv WHERE sv.userId = :userId AND sv.dismissed = true")
    Set<UUID> findDismissedStoryIdsByUserId(@Param("userId") Integer userId);

    // Check if user has seen a story
    boolean existsByStoryIdAndUserIdAndSeenTrue(UUID storyId, Integer userId);

    // Count total views for a story
    @Query("SELECT SUM(sv.viewCount) FROM StoryVisibility sv WHERE sv.storyId = :storyId")
    Long countTotalViewsForStory(@Param("storyId") UUID storyId);

    // Count unique viewers for a story
    @Query("SELECT COUNT(sv) FROM StoryVisibility sv WHERE sv.storyId = :storyId AND sv.seen = true")
    Long countUniqueViewersForStory(@Param("storyId") UUID storyId);

    // Count CTA clicks for a story
    @Query("SELECT COUNT(sv) FROM StoryVisibility sv WHERE sv.storyId = :storyId AND sv.ctaClicked = true")
    Long countCtaClicksForStory(@Param("storyId") UUID storyId);

    // Delete all visibility records for a story
    @Modifying
    @Query("DELETE FROM StoryVisibility sv WHERE sv.storyId = :storyId")
    void deleteByStoryId(@Param("storyId") UUID storyId);

    // Bulk check if user has seen multiple stories
    @Query("SELECT sv.storyId FROM StoryVisibility sv " +
            "WHERE sv.userId = :userId AND sv.storyId IN :storyIds AND sv.seen = true")
    Set<UUID> findSeenStoryIdsFromList(
            @Param("userId") Integer userId,
            @Param("storyIds") List<UUID> storyIds);
}
