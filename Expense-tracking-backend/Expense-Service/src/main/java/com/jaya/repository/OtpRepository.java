package com.jaya.repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.jaya.models.Otp;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmailAndOtp(String email, String otp);
    void deleteByEmail(String email);
}