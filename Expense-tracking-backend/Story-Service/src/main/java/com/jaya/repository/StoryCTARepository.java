package com.jaya.repository;

import com.jaya.models.StoryCTA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StoryCTARepository extends JpaRepository<StoryCTA, UUID> {

    List<StoryCTA> findByStoryIdOrderByDisplayOrderAsc(UUID storyId);

    void deleteByStoryId(UUID storyId);
}
