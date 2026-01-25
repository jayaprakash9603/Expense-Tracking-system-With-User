package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.Otp;
import com.jaya.task.user.service.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class OtpService {

    @Autowired
    private OtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_MINUTES = 5;

    public String generateOtp() {
        SecureRandom random = new SecureRandom();
        StringBuilder otp = new StringBuilder();
        for (int i = 0; i < OTP_LENGTH; i++) {
            otp.append(random.nextInt(10));
        }
        return otp.toString();
    }

    @Transactional
    public String generateAndSendOtp(String email) {
        // Delete any existing OTPs for this email
        otpRepository.deleteByEmail(email);

        // Generate new OTP
        String otp = generateOtp();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(OTP_VALIDITY_MINUTES);

        // Save OTP
        Otp otpEntity = new Otp(email, otp, now, expiresAt);
        otpRepository.save(otpEntity);

        // Send OTP via email (currently logged)
        emailService.sendOtpEmail(email, otp);

        return "Otp Send Successfull"; // Return OTP for response
    }

    @Transactional
    public String generateAndSendLoginOtp(String email) {
        otpRepository.deleteByEmail(email);

        String otp = generateOtp();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(OTP_VALIDITY_MINUTES);

        Otp otpEntity = new Otp(email, otp, now, expiresAt);
        otpRepository.save(otpEntity);

        emailService.sendLoginOtpEmail(email, otp);

        return "Login OTP sent";
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        Optional<Otp> otpEntity = otpRepository.findByEmailAndOtp(email, otp);
        if (otpEntity.isPresent()) {
            Otp storedOtp = otpEntity.get();
            if (LocalDateTime.now().isBefore(storedOtp.getExpiresAt())) {
                otpRepository.deleteByEmail(email); // Invalidate OTP after use
                return true;
            }
            otpRepository.deleteByEmail(email); // Delete expired OTP
        }
        return false;
    }
}