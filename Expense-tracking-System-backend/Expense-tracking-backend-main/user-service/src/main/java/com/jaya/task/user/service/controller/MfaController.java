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

/**
 * =============================================================================
 * MfaController - Multi-Factor Authentication (Google Authenticator) Endpoints
 * =============================================================================
 * 
 * Production-grade MFA implementation following security best practices:
 * - TOTP secrets encrypted at rest (AES-256-GCM)
 * - Backup codes hashed with BCrypt
 * - Rate limiting on verification attempts (implemented at Gateway level)
 * - Secure token handling for MFA flow
 * 
 * Endpoints:
 * - GET /auth/mfa/status - Check user's MFA configuration
 * - POST /auth/mfa/setup - Initiate MFA setup (generates QR code)
 * - POST /auth/mfa/enable - Enable MFA after verifying first OTP
 * - POST /auth/mfa/verify - Verify TOTP during login
 * - POST /auth/mfa/disable - Disable MFA (requires password or OTP)
 * - POST /auth/mfa/regenerate-backup-codes - Generate new backup codes
 * 
 * @author Expense Tracking System
 * @version 1.0
 *          =============================================================================
 */
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

    // =========================================================================
    // MFA Status Check
    // =========================================================================

    /**
     * GET /auth/mfa/status
     * Returns the current MFA status for the authenticated user.
     * 
     * @param jwt Authorization header with JWT token
     * @return MfaStatusResponse with MFA configuration details
     */
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

    // =========================================================================
    // MFA Setup - Step 1: Generate QR Code
    // =========================================================================

    /**
     * POST /auth/mfa/setup
     * Initiates MFA setup by generating a new TOTP secret and QR code.
     * The secret is NOT stored until user verifies with enable endpoint.
     * 
     * @param jwt Authorization header with JWT token
     * @return MfaSetupResponse with QR code and secret
     */
    @PostMapping("/setup")
    public ResponseEntity<?> setupMfa(@RequestHeader("Authorization") String jwt) {
        try {
            String email = JwtProvider.getEmailFromJwt(jwt);
            User user = userRepository.findByEmail(email);

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "User not found"));
            }

            // Generate new TOTP secret (not stored yet)
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

    // =========================================================================
    // MFA Enable - Step 2: Verify and Activate
    // =========================================================================

    /**
     * POST /auth/mfa/enable
     * Enables MFA after user verifies their first TOTP code.
     * This confirms the user has correctly set up their authenticator.
     * 
     * @param jwt     Authorization header with JWT token
     * @param request Contains tempSecret and OTP code
     * @return MfaEnableResponse with backup codes (show once!)
     */
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

            // Verify the OTP code with the temporary secret
            String tempSecret = request.getTempSecret();
            String otp = request.getOtp();

            if (!totpService.verifyCode(tempSecret, otp)) {
                logger.warn("Invalid OTP during MFA enable for user: {}", email);
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid verification code. Please try again."));
            }

            // Generate backup codes
            Map<String, Object> backupCodesResult = totpService.generateBackupCodes();
            @SuppressWarnings("unchecked")
            List<String> plainCodes = (List<String>) backupCodesResult.get("plainCodes");
            String hashedCodes = (String) backupCodesResult.get("hashedCodes");

            // Encrypt and store the secret
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

    // =========================================================================
    // MFA Verify - During Login
    // =========================================================================

    /**
     * POST /auth/mfa/verify
     * Verifies TOTP code during login and issues JWT on success.
     * Supports both regular TOTP codes and backup codes.
     * 
     * @param request Contains mfaToken, OTP code, and isBackupCode flag
     * @return AuthResponse with JWT on success
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyMfa(@RequestBody MfaVerifyRequest request) {
        try {
            String mfaToken = request.getMfaToken();
            String otp = request.getOtp();
            boolean isBackupCode = request.isBackupCode();

            // Validate MFA token and extract email
            if (mfaToken == null || mfaToken.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "MFA token is required"));
            }

            String email;
            try {
                // Extract email from MFA token (same as regular JWT)
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
                // Log backup code attempt
                logger.info("Backup code verification attempt: email={}, codeLength={}, remainingCodes={}",
                        email, otp != null ? otp.length() : 0, remainingBackupCodes);

                // Verify backup code
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
                // Verify TOTP code
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

            // Generate full JWT token
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

    // =========================================================================
    // MFA Disable
    // =========================================================================

    /**
     * POST /auth/mfa/disable
     * Disables MFA for the user. Requires password or current OTP for security.
     * 
     * @param jwt     Authorization header with JWT token
     * @param request Contains password or OTP for verification
     * @return Success message on disable
     */
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

            // Verify identity before disabling
            boolean verified = false;

            if (request.isUseOtp()) {
                // Verify with current TOTP code
                verified = totpService.verifyCodeWithEncryptedSecret(
                        user.getMfaSecret(), request.getOtp());
            } else {
                // Verify with password (not available for Google OAuth users without password)
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

            // Disable MFA
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

    // =========================================================================
    // Regenerate Backup Codes
    // =========================================================================

    /**
     * POST /auth/mfa/regenerate-backup-codes
     * Generates new backup codes, invalidating all previous codes.
     * Requires current OTP for verification.
     * 
     * @param jwt     Authorization header with JWT token
     * @param request Contains current OTP for verification
     * @return New backup codes (show once!)
     */
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

            // Verify current OTP
            String otp = request.get("otp");
            if (otp == null || !totpService.verifyCodeWithEncryptedSecret(user.getMfaSecret(), otp)) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "Invalid verification code"));
            }

            // Generate new backup codes
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
