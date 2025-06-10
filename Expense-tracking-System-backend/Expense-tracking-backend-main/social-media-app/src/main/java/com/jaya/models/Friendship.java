// File: com.jaya.models.Friendship.java
package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @ManyToOne
    private User requester; // User who sent the request

    @ManyToOne
    private User recipient; // User who receives the request

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private FriendshipStatus status; // PENDING, ACCEPTED, REJECTED

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AccessLevel requesterAccess; // Access given by recipient to requester

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private AccessLevel recipientAccess; // Access given by requester to recipient
}