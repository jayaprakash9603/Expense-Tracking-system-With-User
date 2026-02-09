
package com.jaya.models;

import jakarta.persistence.*;
import lombok.*;
import com.jaya.dto.User;

@Entity
@Table(name = "expense_friendship")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Friendship {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;


    private Integer  requesterId; 

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
}