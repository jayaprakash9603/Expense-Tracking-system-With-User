package com.jaya.task.user.service.controller;

import com.jaya.task.user.service.config.JwtProvider;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.repository.UserRepository;
import com.jaya.task.user.service.request.*;
import com.jaya.task.user.service.service.CustomUserServiceImplementation;
import com.jaya.task.user.service.service.TotpService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
























@RestController
@RequestMapping("/auth/mfa")
public class MfaController {

    private static final Logger logger = LoggerFactory.getLogger(MfaController.class);
    private static final String ISSUER = "Expensio Finance";

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TotpService totpService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CustomUserServiceImplementation customUserService;

    
    
    

    






    @GetMapping("/status")
    public ResponseEntity<?> getMfaStatus(@RequestHeader("Authorization") String jwt) {
        try {
            String email = JwtProvider.getEmailFromJwt(jwt);
            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            int remainingBackupCodes = user.getMfaBackupCodes() != null
                    ? totpService.countRemainingBackupCodes(user.getMfaBackupCodes())
                    : 0;

            String enabledAt = user.getMfaEnabledAt() != null
                    ? user.getMfaEnabledAt().format(DateTimeFormatter.ISO_DATE_TIME)
                    : null;

            MfaStatusResponse response = new MfaStatusResponse(
                    user.isMfaEnabled(),
                    user.isTwoFactorEnabled(),
                    remainingBackupCodes,
                    enabledAt);

            logger.debug("MFA status checked for user: {}", email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error checking MFA status", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check MFA status"));
        }
    }

    
    
    

    







    @PostMapping("/setup")
    public ResponseEntity<?> setupMfa(@RequestHeader("Authorization") String jwt) {
        try {
            String email = JwtProvider.getEmailFromJwt(jwt);
            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            
            String secret = totpService.generateSecret();
            String qrCodeDataUri = totpService.generateQrCodeDataUri(email, secret);
            String otpAuthUri = totpService.generateOtpAuthUri(email, secret);

            MfaSetupResponse response = new MfaSetupResponse(
                    secret,
                    qrCodeDataUri,
                    otpAuthUri,
                    ISSUER);

            logger.info("MFA setup initiated for user: {}", email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error during MFA setup", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to setup MFA"));
        }
    }

    
    
    

    








    @PostMapping("/enable")
    public ResponseEntity<?> enableMfa(
            @RequestHeader("Authorization") String jwt,
            @RequestBody MfaEnableRequest request) {
        try {
            String email = JwtProvider.getEmailFromJwt(jwt);
            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            if (user.isMfaEnabled()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "MFA is already enabled"));
            }

            
            String tempSecret = request.getTempSecret();
            String otp = request.getOtp();

            if (!totpService.verifyCode(tempSecret, otp)) {
                logger.warn("Invalid OTP during MFA enable for user: {}", email);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid verification code. Please try again."));
            }

            
            Map<String, Object> backupCodesResult = totpService.generateBackupCodes();
            @SuppressWarnings("unchecked")
            List<String> plainCodes = (List<String>) backupCodesResult.get("plainCodes");
            String hashedCodes = (String) backupCodesResult.get("hashedCodes");

            
            String encryptedSecret = totpService.encryptSecret(tempSecret);
            LocalDateTime now = LocalDateTime.now();

            user.setMfaEnabled(true);
            user.setMfaSecret(encryptedSecret);
            user.setMfaBackupCodes(hashedCodes);
            user.setMfaEnabledAt(now);
            userRepository.save(user);

            MfaEnableResponse response = new MfaEnableResponse(
                    "MFA has been successfully enabled",
                    plainCodes,
                    now.format(DateTimeFormatter.ISO_DATE_TIME));

            logger.info("MFA enabled successfully for user: {}", email);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error enabling MFA", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to enable MFA"));
        }
    }

    
    
    

    







    @PostMapping("/verify")
    public ResponseEntity<?> verifyMfa(@RequestBody MfaVerifyRequest request) {
        try {
            String mfaToken = request.getMfaToken();
            String otp = request.getOtp();
            boolean isBackupCode = request.isBackupCode();

            
            if (mfaToken == null || mfaToken.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "MFA token is required"));
            }

            String email;
            try {
                
                email = JwtProvider.getEmailFromJwt("Bearer " + mfaToken);
            } catch (Exception e) {
                logger.warn("Invalid or expired MFA token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Invalid or expired MFA token. Please login again."));
            }

            User user = userRepository.findByEmail(email);
            if (user == null || !user.isMfaEnabled()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "User not found or MFA not enabled"));
            }

            boolean isValid = false;
            int remainingBackupCodes = totpService.countRemainingBackupCodes(user.getMfaBackupCodes());

            if (isBackupCode) {
                
                logger.info("Backup code verification attempt: email={}, codeLength={}, remainingCodes={}",
                        email, otp != null ? otp.length() : 0, remainingBackupCodes);

                
                String updatedBackupCodes = totpService.verifyAndConsumeBackupCode(
                        user.getMfaBackupCodes(), otp);

                if (updatedBackupCodes != null) {
                    isValid = true;
                    user.setMfaBackupCodes(updatedBackupCodes);
                    userRepository.save(user);
                    int newRemainingCodes = totpService.countRemainingBackupCodes(updatedBackupCodes);
                    logger.info("Backup code used successfully: email={}, remainingCodes={}", email, newRemainingCodes);
                } else {
                    logger.warn("Invalid backup code attempt: email={}, codeProvided={}", email, otp);
                }
            } else {
                
                isValid = totpService.verifyCodeWithEncryptedSecret(user.getMfaSecret(), otp);
                if (isValid) {
                    logger.info("TOTP code verified successfully: email={}", email);
                }
            }

            if (!isValid) {
                logger.warn("Invalid MFA code for user: {}, isBackupCode={}", email, isBackupCode);
                String errorMsg = isBackupCode
                        ? "Invalid backup code. You have " + remainingBackupCodes + " backup codes remaining."
                        : "Invalid verification code";
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", errorMsg));
            }

            
            UserDetails userDetails = customUserService.loadUserByUsername(email);
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    userDetails.getUsername(),
                    null,
                    userDetails.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = JwtProvider.generateToken(authentication);

            Map<String, Object> response = new HashMap<>();
            response.put("status", true);
            response.put("message", "MFA verification successful");
            response.put("jwt", token);
            response.put("twoFactorRequired", false);
            response.put("mfaRequired", false);

            logger.info("MFA verification successful for user: {}", email);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            logger.error("Error during MFA verification", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "MFA verification failed"));
        }
    }

    
    
    

    







    @PostMapping("/disable")
    public ResponseEntity<?> disableMfa(
            @RequestHeader("Authorization") String jwt,
            @RequestBody MfaDisableRequest request) {
        try {
            String email = JwtProvider.getEmailFromJwt(jwt);
            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            if (!user.isMfaEnabled()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "MFA is not enabled"));
            }

            
            boolean verified = false;

            if (request.isUseOtp()) {
                
                verified = totpService.verifyCodeWithEncryptedSecret(
                        user.getMfaSecret(), request.getOtp());
            } else {
                
                if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                    verified = passwordEncoder.matches(request.getPassword(), user.getPassword());
                } else {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Password verification not available. Please use OTP."));
                }
            }

            if (!verified) {
                logger.warn("Failed verification during MFA disable for user: {}", email);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid verification. Please check your " +
                                (request.isUseOtp() ? "code" : "password") + " and try again."));
            }

            
            user.setMfaEnabled(false);
            user.setMfaSecret(null);
            user.setMfaBackupCodes(null);
            user.setMfaEnabledAt(null);
            userRepository.save(user);

            logger.info("MFA disabled for user: {}", email);
            return ResponseEntity.ok(Map.of(
                    "status", true,
                    "message", "MFA has been successfully disabled"));

        } catch (Exception e) {
            logger.error("Error disabling MFA", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to disable MFA"));
        }
    }

    
    
    

    








    @PostMapping("/regenerate-backup-codes")
    public ResponseEntity<?> regenerateBackupCodes(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Map<String, String> request) {
        try {
            String email = JwtProvider.getEmailFromJwt(jwt);
            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            if (!user.isMfaEnabled()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "MFA is not enabled"));
            }

            
            String otp = request.get("otp");
            if (otp == null || !totpService.verifyCodeWithEncryptedSecret(user.getMfaSecret(), otp)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid verification code"));
            }

            
            Map<String, Object> backupCodesResult = totpService.generateBackupCodes();
            @SuppressWarnings("unchecked")
            List<String> plainCodes = (List<String>) backupCodesResult.get("plainCodes");
            String hashedCodes = (String) backupCodesResult.get("hashedCodes");

            user.setMfaBackupCodes(hashedCodes);
            userRepository.save(user);

            logger.info("Backup codes regenerated for user: {}", email);

            return ResponseEntity.ok(Map.of(
                    "status", true,
                    "message", "New backup codes generated. Save them securely!",
                    "backupCodes", plainCodes,
                    "backupCodeCount", plainCodes.size()));

        } catch (Exception e) {
            logger.error("Error regenerating backup codes", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to regenerate backup codes"));
        }
    }
}
