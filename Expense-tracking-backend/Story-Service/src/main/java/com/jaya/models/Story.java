package com.jaya.models;

import com.jaya.models.enums.StorySeverity;
import com.jaya.models.enums.StoryStatus;
import com.jaya.models.enums.StoryType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;





@Entity
@Table(name = "stories", indexes = {
        @Index(name = "idx_story_status", columnList = "status"),
        @Index(name = "idx_story_user", columnList = "target_user_id"),
        @Index(name = "idx_story_type", columnList = "story_type"),
        @Index(name = "idx_story_expires", columnList = "expires_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Story {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "background_color", length = 20)
    private String backgroundColor;

    @Column(name = "background_gradient", length = 100)
    private String backgroundGradient;

    @Enumerated(EnumType.STRING)
    @Column(name = "story_type", nullable = false)
    private StoryType storyType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StorySeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private StoryStatus status = StoryStatus.CREATED;

    
    @Column(name = "target_user_id")
    private Integer targetUserId;

    
    @Column(name = "is_global", nullable = false)
    @Builder.Default
    private Boolean isGlobal = true;

    
    @Column(name = "duration_seconds", nullable = false)
    @Builder.Default
    private Integer durationSeconds = 5;

    
    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 0;

    
    @Column(name = "reference_id")
    private String referenceId;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    
    @Column(columnDefinition = "JSON")
    private String metadata;

    
    @OneToMany(mappedBy = "story", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<StoryCTA> ctaButtons = new ArrayList<>();

    
    @Column(name = "created_by_admin_id")
    private Integer createdByAdminId;

    
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "activated_at")
    private LocalDateTime activatedAt;

    
    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    
    public void addCTA(StoryCTA cta) {
        ctaButtons.add(cta);
        cta.setStory(this);
    }

    public void removeCTA(StoryCTA cta) {
        ctaButtons.remove(cta);
        cta.setStory(null);
    }

    public boolean isExpired() {
        
        if (expiresAt == null) {
            return false;
        }
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public boolean isActive() {
        return status == StoryStatus.ACTIVE && !isExpired() && !isDeleted;
    }

    public void activate() {
        this.status = StoryStatus.ACTIVE;
        this.activatedAt = LocalDateTime.now();
    }

    public void expire() {
        this.status = StoryStatus.EXPIRED;
    }

    public void archive() {
        this.status = StoryStatus.ARCHIVED;
    }

    public void softDelete() {
        this.isDeleted = true;
        this.deletedAt = LocalDateTime.now();
    }
}
