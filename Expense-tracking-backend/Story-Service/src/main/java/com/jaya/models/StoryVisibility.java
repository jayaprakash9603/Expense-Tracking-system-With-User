package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;





@Entity
@Table(name = "story_visibility", uniqueConstraints = @UniqueConstraint(columnNames = { "story_id",
        "user_id" }), indexes = {
                @Index(name = "idx_visibility_user", columnList = "user_id"),
                @Index(name = "idx_visibility_story", columnList = "story_id"),
                @Index(name = "idx_visibility_seen", columnList = "seen")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoryVisibility {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "story_id", nullable = false)
    private UUID storyId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "seen", nullable = false)
    @Builder.Default
    private Boolean seen = false;

    @Column(name = "seen_at")
    private LocalDateTime seenAt;

    
    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    
    @Column(name = "cta_clicked", nullable = false)
    @Builder.Default
    private Boolean ctaClicked = false;

    @Column(name = "cta_clicked_at")
    private LocalDateTime ctaClickedAt;

    @Column(name = "clicked_cta_id")
    private UUID clickedCtaId;

    
    @Column(name = "dismissed", nullable = false)
    @Builder.Default
    private Boolean dismissed = false;

    @Column(name = "dismissed_at")
    private LocalDateTime dismissedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    
    public void markAsSeen() {
        if (!this.seen) {
            this.seen = true;
            this.seenAt = LocalDateTime.now();
        }
        this.viewCount++;
    }

    public void markCtaClicked(UUID ctaId) {
        this.ctaClicked = true;
        this.ctaClickedAt = LocalDateTime.now();
        this.clickedCtaId = ctaId;
    }

    public void dismiss() {
        this.dismissed = true;
        this.dismissedAt = LocalDateTime.now();
    }
}
