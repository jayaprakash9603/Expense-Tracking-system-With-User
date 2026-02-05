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

















@Service
public class TotpService {

    private static final Logger logger = LoggerFactory.getLogger(TotpService.class);

    
    private static final String ISSUER = "Expensio Finance";
    private static final int SECRET_LENGTH = 32; 
    private static final int BACKUP_CODE_COUNT = 10;
    private static final int BACKUP_CODE_LENGTH = 8;
    private static final int TIME_PERIOD = 30; 
    private static final int CODE_DIGITS = 6;
    private static final int ALLOWED_TIME_DISCREPANCY = 1; 

    
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

        
        TimeProvider timeProvider = new SystemTimeProvider();
        CodeGenerator codeGenerator = new DefaultCodeGenerator(HashingAlgorithm.SHA1, CODE_DIGITS);
        this.codeVerifier = new DefaultCodeVerifier(codeGenerator, timeProvider);

        
        ((DefaultCodeVerifier) this.codeVerifier).setAllowedTimePeriodDiscrepancy(ALLOWED_TIME_DISCREPANCY);

        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    
    
    

    





    public String generateSecret() {
        String secret = secretGenerator.generate();
        logger.debug("Generated new TOTP secret for user setup");
        
        return secret;
    }

    





    public String encryptSecret(String plainSecret) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);

            SecretKeySpec keySpec = getKeySpec();
            GCMParameterSpec gcmSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);

            Cipher cipher = Cipher.getInstance(ENCRYPTION_ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec, gcmSpec);

            byte[] encrypted = cipher.doFinal(plainSecret.getBytes(StandardCharsets.UTF_8));

            
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);

            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            logger.error("Failed to encrypt TOTP secret", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    





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
        
        byte[] keyBytes = new byte[32];
        byte[] providedKey = encryptionKey.getBytes(StandardCharsets.UTF_8);
        System.arraycopy(providedKey, 0, keyBytes, 0, Math.min(providedKey.length, 32));
        return new SecretKeySpec(keyBytes, "AES");
    }

    
    
    

    






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

    
    
    

    







    public boolean verifyCode(String secret, String code) {
        if (secret == null || code == null || code.length() != CODE_DIGITS) {
            logger.debug("Invalid input for TOTP verification");
            return false;
        }

        try {
            boolean isValid = codeVerifier.isValidCode(secret, code);
            
            logger.debug("TOTP verification result: {}", isValid ? "SUCCESS" : "FAILED");
            return isValid;
        } catch (Exception e) {
            logger.error("TOTP verification error", e);
            return false;
        }
    }

    






    public boolean verifyCodeWithEncryptedSecret(String encryptedSecret, String code) {
        String plainSecret = decryptSecret(encryptedSecret);
        return verifyCode(plainSecret, code);
    }

    
    
    

    






    public Map<String, Object> generateBackupCodes() {
        SecureRandom random = new SecureRandom();
        List<String> plainCodes = new ArrayList<>();
        List<String> hashedCodes = new ArrayList<>();

        for (int i = 0; i < BACKUP_CODE_COUNT; i++) {
            
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
        
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < BACKUP_CODE_LENGTH; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        return code.toString();
    }

    private String formatBackupCode(String code) {
        
        return code.substring(0, 4) + "-" + code.substring(4);
    }

    







    public String verifyAndConsumeBackupCode(String hashedCodesString, String inputCode) {
        if (hashedCodesString == null || hashedCodesString.isEmpty()) {
            logger.warn("No backup codes found in database");
            return null;
        }

        
        String normalizedInput = inputCode.replace("-", "").toUpperCase();
        logger.debug("Attempting backup code verification. Input length: {}, Normalized: {}",
                inputCode.length(), normalizedInput.length());

        List<String> hashedCodes = new ArrayList<>(Arrays.asList(hashedCodesString.split(",")));
        logger.debug("Number of stored backup codes: {}", hashedCodes.size());

        for (int i = 0; i < hashedCodes.size(); i++) {
            if (passwordEncoder.matches(normalizedInput, hashedCodes.get(i))) {
                
                hashedCodes.remove(i);
                logger.info("Backup code used successfully. Remaining codes: {}", hashedCodes.size());
                return hashedCodes.isEmpty() ? "" : String.join(",", hashedCodes);
            }
        }

        logger.warn("Invalid backup code attempt. Code did not match any stored codes.");
        return null;
    }

    





    public int countRemainingBackupCodes(String hashedCodesString) {
        if (hashedCodesString == null || hashedCodesString.isEmpty()) {
            return 0;
        }
        return hashedCodesString.split(",").length;
    }
}
