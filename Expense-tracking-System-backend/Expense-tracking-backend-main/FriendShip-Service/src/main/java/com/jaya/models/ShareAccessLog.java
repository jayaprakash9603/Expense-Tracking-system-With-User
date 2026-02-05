package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "share_access_logs", indexes = {
        @Index(name = "idx_access_user_id", columnList = "accessingUserId"),
        @Index(name = "idx_access_share_id", columnList = "sharedResourceId"),
        @Index(name = "idx_access_user_share", columnList = "accessingUserId, sharedResourceId", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShareAccessLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer accessingUserId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sharedResourceId", nullable = false)
    private SharedResource sharedResource;

    @CreationTimestamp
    @Column(name = "first_accessed_at", updatable = false)
    private LocalDateTime firstAccessedAt;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;

    @Column(nullable = false)
    @Builder.Default
    private Integer accessCount = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isSaved = false;

    public void recordAccess() {
        this.accessCount = (this.accessCount == null ? 0 : this.accessCount) + 1;
        this.lastAccessedAt = LocalDateTime.now();
    }
}
