// File: com.jaya.models.Friendship.java
package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    private Integer requesterId; // User who sent the request

    private Integer recipientId; // User who receives the request

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private FriendshipStatus status; // PENDING, ACCEPTED, REJECTED

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AccessLevel requesterAccess; // Access given by recipient to requester

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AccessLevel recipientAccess; // Access given by requester to recipient

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}