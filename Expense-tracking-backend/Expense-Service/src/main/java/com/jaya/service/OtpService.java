package com.jaya.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jaya.models.Otp;
import com.jaya.repository.OtpRepository;

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
        
        otpRepository.deleteByEmail(email);

        
        String otp = generateOtp();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(OTP_VALIDITY_MINUTES);

        
        Otp otpEntity = new Otp(email, otp, now, expiresAt);
        otpRepository.save(otpEntity);

        
        emailService.sendOtpEmail(email, otp);

        return otp; 
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        Optional<Otp> otpEntity = otpRepository.findByEmailAndOtp(email, otp);
        if (otpEntity.isPresent()) {
            Otp storedOtp = otpEntity.get();
            if (LocalDateTime.now().isBefore(storedOtp.getExpiresAt())) {
                otpRepository.deleteByEmail(email); 
                return true;
            }
            otpRepository.deleteByEmail(email); 
        }
        return false;
    }
}
