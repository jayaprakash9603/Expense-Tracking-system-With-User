package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.Otp;
import com.jaya.task.user.service.repository.UserOtpRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service("userOtpService")
public class OtpService {

    private static final Logger logger = LoggerFactory.getLogger(OtpService.class);

    @Autowired
    private UserOtpRepository otpRepository;

    @Autowired
    private EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final int OTP_VALIDITY_SECONDS = 30;

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
        LocalDateTime expiresAt = now.plusSeconds(OTP_VALIDITY_SECONDS);

        
        Otp otpEntity = new Otp(email, otp, now, expiresAt);
        otpRepository.save(otpEntity);

        
        logger.info("Generated password-reset OTP for email={}: otp={}", email, otp);

        
        emailService.sendOtpEmail(email, otp);

        return "Otp Send Successfull"; 
    }

    @Transactional
    public String generateAndSendLoginOtp(String email) {
        otpRepository.deleteByEmail(email);

        String otp = generateOtp();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusSeconds(OTP_VALIDITY_SECONDS);

        Otp otpEntity = new Otp(email, otp, now, expiresAt);
        otpRepository.save(otpEntity);

        
        logger.info("Generated login OTP for email={}: otp={}", email, otp);

        emailService.sendLoginOtpEmail(email, otp);

        return "Login OTP sent";
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