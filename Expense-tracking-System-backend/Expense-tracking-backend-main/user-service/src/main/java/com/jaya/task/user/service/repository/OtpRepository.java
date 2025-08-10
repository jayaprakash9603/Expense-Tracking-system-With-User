package com.jaya.task.user.service.repository;



import com.jaya.task.user.service.modal.Otp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByEmailAndOtp(String email, String otp);
    void deleteByEmail(String email);
}