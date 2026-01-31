package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity to track which shared items a user has added to their account.
 * This allows persistent tracking across sessions (login/logout).
 */
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

    /**
     * User who added the item to their account.
     */
    @Column(name = "user_id", nullable = false)
    private Integer userId;

    /**
     * Share token the item came from.
     */
    @Column(name = "share_token", nullable = false, length = 64)
    private String shareToken;

    /**
     * External reference of the shared item (e.g., EXP-123).
     */
    @Column(name = "external_ref", nullable = false, length = 255)
    private String externalRef;

    /**
     * Type of the resource (EXPENSE, CATEGORY, BUDGET, BILL, PAYMENT_METHOD).
     */
    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;

    /**
     * Original owner's user ID.
     */
    @Column(name = "original_owner_id")
    private Integer originalOwnerId;

    /**
     * ID of the newly created item in user's account (after adding).
     */
    @Column(name = "new_item_id")
    private Integer newItemId;

    /**
     * When the item was added.
     */
    @CreationTimestamp
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;
}
