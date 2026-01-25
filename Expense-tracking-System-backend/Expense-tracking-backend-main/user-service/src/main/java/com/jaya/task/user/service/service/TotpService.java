package com.jaya.task.user.service.service;

import dev.samstevens.totp.code.*;
import dev.samstevens.totp.exceptions.QrGenerationException;
import dev.samstevens.totp.qr.QrData;
import dev.samstevens.totp.qr.QrGenerator;
import dev.samstevens.totp.qr.ZxingPngQrGenerator;
import dev.samstevens.totp.secret.DefaultSecretGenerator;
import dev.samstevens.totp.secret.SecretGenerator;
import dev.samstevens.totp.time.SystemTimeProvider;
import dev.samstevens.totp.time.TimeProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.*;
import java.util.stream.Collectors;

/**
 * =============================================================================
 * TotpService - Production-Grade TOTP (Time-based One-Time Password) Service
 * =============================================================================
 * Implements RFC 6238 compatible TOTP for Google Authenticator integration.
 * 
 * Security Features:
 * - AES-256-GCM encryption for secrets at rest
 * - BCrypt hashing for backup codes
 * - ±1 time window tolerance for clock drift
 * - Secure random generation for secrets and backup codes
 * 
 * @author Expense Tracking System
 * @version 1.0
 *          =============================================================================
 */
@Service
public class TotpService {

    private static final Logger logger = LoggerFactory.getLogger(TotpService.class);

    // TOTP Configuration
    private static final String ISSUER = "Expensio Finance";
    private static final int SECRET_LENGTH = 32; // 256-bit secret
    private static final int BACKUP_CODE_COUNT = 10;
    private static final int BACKUP_CODE_LENGTH = 8;
    private static final int TIME_PERIOD = 30; // seconds
    private static final int CODE_DIGITS = 6;
    private static final int ALLOWED_TIME_DISCREPANCY = 1; // ±1 time window (30 sec each)

    // AES-GCM Encryption Configuration
    private static final String ENCRYPTION_ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    @Value("${mfa.encryption.key:ExpensioMfaSecretKey2024!@#$}")
    private String encryptionKey;

    private final SecretGenerator secretGenerator;
    private final QrGenerator qrGenerator;
    private final CodeVerifier codeVerifier;
    private final BCryptPasswordEncoder passwordEncoder;

    public TotpService() {
        this.secretGenerator = new DefaultSecretGenerator(SECRET_LENGTH);
        this.qrGenerator = new ZxingPngQrGenerator();

        // Configure code generator with SHA1 (Google Authenticator standard)
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1, CODE_DIGITS);
        this.codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);

        // Configure time discrepancy allowance (±1 window = ±30 seconds)
        ((DefaultCodeVerifier) this.codeVerifier).setAllowedTimePeriodDiscrepancy(ALLOWED_TIME_DISCREPANCY);

        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    // =========================================================================
    // Secret Generation & Management
    // =========================================================================

    /**
     * Generates a new TOTP secret.
     * SECURITY: This secret should be encrypted before storage.
     * 
     * @return Base32-encoded TOTP secret
     */
    public String generateSecret() {
        String secret = secretGenerator.generate();
        logger.debug("Generated new TOTP secret for user setup");
        // SECURITY: Never log the actual secret
        return secret;
    }

    /**
     * Encrypts the TOTP secret using AES-256-GCM.
     * 
     * @param plainSecret The plaintext TOTP secret
     * @return Base64-encoded encrypted secret (IV + ciphertext)
     */
    public String encryptSecret(String plainSecret) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            SecretKeySpec keySpec = getKeySpec();
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);

            Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);

            byte[] encrypted = cipher.doFinal(plainSecret.getBytes(StandardCharsets.UTF_8));

            // Combine IV + encrypted data
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            logger.error("Failed to encrypt TOTP secret", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    /**
     * Decrypts the TOTP secret from storage.
     * 
     * @param encryptedSecret Base64-encoded encrypted secret
     * @return Plaintext TOTP secret
     */
    public String decryptSecret(String encryptedSecret) {
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedSecret);

            byte[] iv = new byte[GCM_IV_LENGTH];
            byte[] encrypted = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            System.arraycopy(combined, iv.length, encrypted, 0, encrypted.length);

            SecretKeySpec keySpec = getKeySpec();
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);

            Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, keySpec, gcmSpec);

            byte[] decrypted = cipher.doFinal(encrypted);
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            logger.error("Failed to decrypt TOTP secret", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }

    private SecretKeySpec getKeySpec() {
        // Ensure key is exactly 32 bytes for AES-256
        byte[] keyBytes = new byte[32];
        byte[] providedKey = encryptionKey.getBytes(StandardCharsets.UTF_8);
        System.arraycopy(providedKey, 0, keyBytes, 0, Math.min(providedKey.length, 32));
        return new SecretKeySpec(keyBytes, "AES");
    }

    // =========================================================================
    // QR Code Generation
    // =========================================================================

    /**
     * Generates QR code data URI for Google Authenticator setup.
     * 
     * @param email  User's email (used as account name)
     * @param secret Plaintext TOTP secret
     * @return Base64-encoded PNG image as data URI
     */
    public String generateQrCodeDataUri(String email, String secret) {
        try {
            QrData qrData = new QrData.Builder()
                    .label(email)
                    .secret(secret)
                    .issuer(ISSUER)
                    .algorithm(HashingAlgorithm.SHA1)
                    .digits(CODE_DIGITS)
                    .period(TIME_PERIOD)
                    .build();

            byte[] imageData = qrGenerator.generate(qrData);
            String base64Image = Base64.getEncoder().encodeToString(imageData);

            logger.debug("Generated QR code for MFA setup: email={}", email);
            return "data:image/png;base64," + base64Image;
        } catch (QrGenerationException e) {
            logger.error("Failed to generate QR code for email={}", email, e);
            throw new RuntimeException("QR code generation failed", e);
        }
    }

    /**
     * Generates the otpauth:// URI for manual entry.
     * 
     * @param email  User's email
     * @param secret Plaintext TOTP secret
     * @return otpauth:// URI string
     */
    public String generateOtpAuthUri(String email, String secret) {
        return String.format(
                "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
                ISSUER.replace(" ", "%20"),
                email,
                secret,
                ISSUER.replace(" ", "%20"),
                CODE_DIGITS,
                TIME_PERIOD);
    }

    // =========================================================================
    // Code Verification
    // =========================================================================

    /**
     * Verifies a TOTP code against the secret.
     * Allows ±1 time window (±30 seconds) for clock drift tolerance.
     * 
     * @param secret Plaintext TOTP secret
     * @param code   6-digit code from user
     * @return true if code is valid
     */
    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null || code.length() != CODE_DIGITS) {
            logger.debug("Invalid input for TOTP verification");
            return false;
        }

        try {
            boolean isValid = codeVerifier.isValidCode(secret, code);
            // SECURITY: Never log the actual code
            logger.debug("TOTP verification result: {}", isValid ? "SUCCESS" : "FAILED");
            return isValid;
        } catch (Exception e) {
            logger.error("TOTP verification error", e);
            return false;
        }
    }

    /**
     * Verifies code using encrypted secret from database.
     * 
     * @param encryptedSecret Encrypted TOTP secret from database
     * @param code            6-digit code from user
     * @return true if code is valid
     */
    public boolean verifyCodeWithEncryptedSecret(String encryptedSecret, String code) {
        String plainSecret = decryptSecret(encryptedSecret);
        return verifyCode(plainSecret, code);
    }

    // =========================================================================
    // Backup Codes Management
    // =========================================================================

    /**
     * Generates backup codes for MFA recovery.
     * Returns plaintext codes (show once to user) and hashed codes (for storage).
     * 
     * @return Map with "plainCodes" (List<String>) and "hashedCodes" (String,
     *         comma-separated)
     */
    public Map<String, Object> generateBackupCodes() {
        SecureRandom random = new SecureRandom();
        List<String> plainCodes = new ArrayList<>();
        List<String> hashedCodes = new ArrayList<>();

        for (int i = 0; i < BACKUP_CODE_COUNT; i++) {
            // Generate alphanumeric backup code
            String code = generateBackupCode(random);
            plainCodes.add(formatBackupCode(code));
            hashedCodes.add(passwordEncoder.encode(code));
        }

        Map<String, Object> result = new HashMap<>();
        result.put("plainCodes", plainCodes);
        result.put("hashedCodes", String.join(",", hashedCodes));

        logger.debug("Generated {} backup codes", BACKUP_CODE_COUNT);
        return result;
    }

    private String generateBackupCode(SecureRandom random) {
        // Exclude ambiguous characters: 0/O, 1/I/l to avoid user confusion
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < BACKUP_CODE_LENGTH; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }

    private String formatBackupCode(String code) {
        // Format as XXXX-XXXX for readability
        return code.substring(0, 4) + "-" + code.substring(4);
    }

    /**
     * Verifies a backup code and marks it as used if valid.
     * 
     * @param hashedCodesString Comma-separated hashed backup codes from database
     * @param inputCode         Backup code from user (with or without dash)
     * @return Updated hashed codes string with used code removed, or null if
     *         invalid
     */
    public String verifyAndConsumeBackupCode(String hashedCodesString, String inputCode) {
        if (hashedCodesString == null || hashedCodesString.isEmpty()) {
            logger.warn("No backup codes found in database");
            return null;
        }

        // Normalize input (remove dash, uppercase)
        String normalizedInput = inputCode.replace("-", "").toUpperCase();
        logger.debug("Attempting backup code verification. Input length: {}, Normalized: {}",
                inputCode.length(), normalizedInput.length());

        List<String> hashedCodes = new ArrayList<>(Arrays.asList(hashedCodesString.split(",")));
        logger.debug("Number of stored backup codes: {}", hashedCodes.size());

        for (int i = 0; i < hashedCodes.size(); i++) {
            if (passwordEncoder.matches(normalizedInput, hashedCodes.get(i))) {
                // Remove used code
                hashedCodes.remove(i);
                logger.info("Backup code used successfully. Remaining codes: {}", hashedCodes.size());
                return hashedCodes.isEmpty() ? "" : String.join(",", hashedCodes);
            }
        }

        logger.warn("Invalid backup code attempt. Code did not match any stored codes.");
        return null;
    }

    /**
     * Counts remaining backup codes.
     * 
     * @param hashedCodesString Comma-separated hashed backup codes
     * @return Number of remaining backup codes
     */
    public int countRemainingBackupCodes(String hashedCodesString) {
        if (hashedCodesString == null || hashedCodesString.isEmpty()) {
            return 0;
        }
        return hashedCodesString.split(",").length;
    }
}
