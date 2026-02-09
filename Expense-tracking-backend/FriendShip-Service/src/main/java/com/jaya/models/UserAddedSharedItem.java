package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_added_shared_items", uniqueConstraints = {
                @UniqueConstraint(columnNames = { "user_id", "share_token", "external_ref" })
}, indexes = {
                @Index(name = "idx_user_share_token", columnList = "user_id, share_token"),
                @Index(name = "idx_share_token", columnList = "share_token")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAddedSharedItem {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "user_id", nullable = false)
        private Integer userId;

        @Column(name = "share_token", nullable = false, length = 64)
        private String shareToken;

        @Column(name = "external_ref", nullable = false, length = 255)
        private String externalRef;

        @Column(name = "resource_type", nullable = false, length = 50)
        private String resourceType;

        @Column(name = "original_owner_id")
        private Integer originalOwnerId;

        @Column(name = "new_item_id")
        private Integer newItemId;

        @CreationTimestamp
        @Column(name = "added_at", nullable = false, updatable = false)
        private LocalDateTime addedAt;
}
