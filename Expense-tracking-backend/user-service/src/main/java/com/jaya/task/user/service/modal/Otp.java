package com.jaya.task.user.service.modal;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity(name = "UserOtp")
@Table(name = "user_otp")
@Getter
@Setter
@NoArgsConstructor
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String otp;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    public Otp(String email, String otp, LocalDateTime createdAt, LocalDateTime expiresAt) {
        this.email = email;
        this.otp = otp;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
    }
}