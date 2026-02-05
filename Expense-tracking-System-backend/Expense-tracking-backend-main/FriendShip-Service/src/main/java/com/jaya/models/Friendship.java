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

    private Integer requesterId;

    private Integer recipientId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private FriendshipStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AccessLevel requesterAccess;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AccessLevel recipientAccess;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}