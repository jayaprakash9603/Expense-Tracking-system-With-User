// File: com.jaya.models.Friendship.java
package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;
import com.jaya.dto.User;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;


    private Integer  requesterId; // User who sent the request

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
}