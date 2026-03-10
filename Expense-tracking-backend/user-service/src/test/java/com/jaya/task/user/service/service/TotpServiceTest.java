package com.jaya.task.user.service.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;

class TotpServiceTest {

    private TotpService totpService;

    @BeforeEach
    void setUp() {
        totpService = new TotpService();
        ReflectionTestUtils.setField(totpService, "encryptionKey", "TestEncryptionKey2024ForTests!!");
    }

    @Nested
    class GenerateSecret {

        @Test
        void generatesNonNullSecret() {
            String secret = totpService.generateSecret();

            assertThat(secret).isNotNull().isNotBlank();
        }

        @Test
        void generatesDifferentSecretsEachTime() {
            String secret1 = totpService.generateSecret();
            String secret2 = totpService.generateSecret();

            assertThat(secret1).isNotEqualTo(secret2);
        }
    }

    @Nested
    class EncryptDecrypt {

        @Test
        void roundtripPreservesSecret() {
            String original = totpService.generateSecret();

            String encrypted = totpService.encryptSecret(original);
            String decrypted = totpService.decryptSecret(encrypted);

            assertThat(decrypted).isEqualTo(original);
        }

        @Test
        void encryptedDiffersFromPlaintext() {
            String plain = "JBSWY3DPEHPK3PXP";

            String encrypted = totpService.encryptSecret(plain);

            assertThat(encrypted).isNotEqualTo(plain);
        }

        @Test
        void differentEncryptionsOfSameValueDiffer() {
            String plain = "JBSWY3DPEHPK3PXP";

            String enc1 = totpService.encryptSecret(plain);
            String enc2 = totpService.encryptSecret(plain);

            assertThat(enc1).isNotEqualTo(enc2);
        }
    }

    @Nested
    class GenerateQrCode {

        @Test
        void generatesDataUriStartingWithPrefix() {
            String secret = totpService.generateSecret();

            String dataUri = totpService.generateQrCodeDataUri("user@example.com", secret);

            assertThat(dataUri).startsWith("data:image/png;base64,");
        }
    }

    @Nested
    class GenerateOtpAuthUri {

        @Test
        void containsEmailAndSecret() {
            String uri = totpService.generateOtpAuthUri("user@example.com", "TESTSECRET");

            assertThat(uri).contains("user@example.com");
            assertThat(uri).contains("TESTSECRET");
            assertThat(uri).startsWith("otpauth://totp/");
        }
    }

    @Nested
    class VerifyCode {

        @Test
        void returnsFalseForNullSecret() {
            assertThat(totpService.verifyCode(null, "123456")).isFalse();
        }

        @Test
        void returnsFalseForNullCode() {
            assertThat(totpService.verifyCode("TESTSECRET", null)).isFalse();
        }

        @Test
        void returnsFalseForWrongLengthCode() {
            assertThat(totpService.verifyCode("TESTSECRET", "12345")).isFalse();
        }

        @Test
        void returnsFalseForInvalidCode() {
            String secret = totpService.generateSecret();

            assertThat(totpService.verifyCode(secret, "000000")).isFalse();
        }
    }

    @Nested
    class VerifyCodeWithEncryptedSecret {

        @Test
        void decryptsAndVerifies() {
            String secret = totpService.generateSecret();
            String encrypted = totpService.encryptSecret(secret);

            boolean result = totpService.verifyCodeWithEncryptedSecret(encrypted, "000000");

            assertThat(result).isFalse();
        }
    }

    @Nested
    class GenerateBackupCodes {

        @Test
        @SuppressWarnings("unchecked")
        void generatesCorrectNumberOfCodes() {
            Map<String, Object> result = totpService.generateBackupCodes();

            List<String> plainCodes = (List<String>) result.get("plainCodes");
            assertThat(plainCodes).hasSize(10);
        }

        @Test
        @SuppressWarnings("unchecked")
        void backupCodesAreFormatted() {
            Map<String, Object> result = totpService.generateBackupCodes();

            List<String> plainCodes = (List<String>) result.get("plainCodes");
            for (String code : plainCodes) {
                assertThat(code).matches("[A-Z0-9]{4}-[A-Z0-9]{4}");
            }
        }

        @Test
        void hashedCodesStringIsNotEmpty() {
            Map<String, Object> result = totpService.generateBackupCodes();

            String hashed = (String) result.get("hashedCodes");
            assertThat(hashed).isNotBlank();
            assertThat(hashed.split(",")).hasSize(10);
        }
    }

    @Nested
    class VerifyAndConsumeBackupCode {

        @Test
        @SuppressWarnings("unchecked")
        void consumesValidBackupCode() {
            Map<String, Object> codes = totpService.generateBackupCodes();
            List<String> plainCodes = (List<String>) codes.get("plainCodes");
            String hashedCodes = (String) codes.get("hashedCodes");

            String firstCode = plainCodes.get(0);
            String remaining = totpService.verifyAndConsumeBackupCode(hashedCodes, firstCode);

            assertThat(remaining).isNotNull();
            assertThat(remaining.split(",")).hasSize(9);
        }

        @Test
        void returnsNullForInvalidCode() {
            Map<String, Object> codes = totpService.generateBackupCodes();
            String hashedCodes = (String) codes.get("hashedCodes");

            String remaining = totpService.verifyAndConsumeBackupCode(hashedCodes, "XXXX-XXXX");

            assertThat(remaining).isNull();
        }

        @Test
        void returnsNullWhenNoCodesStored() {
            String remaining = totpService.verifyAndConsumeBackupCode(null, "XXXX-XXXX");

            assertThat(remaining).isNull();
        }

        @Test
        void returnsNullForEmptyCodesString() {
            String remaining = totpService.verifyAndConsumeBackupCode("", "XXXX-XXXX");

            assertThat(remaining).isNull();
        }
    }

    @Nested
    class CountRemainingBackupCodes {

        @Test
        void countsCorrectly() {
            assertThat(totpService.countRemainingBackupCodes("a,b,c")).isEqualTo(3);
        }

        @Test
        void returnsZeroForNull() {
            assertThat(totpService.countRemainingBackupCodes(null)).isZero();
        }

        @Test
        void returnsZeroForEmpty() {
            assertThat(totpService.countRemainingBackupCodes("")).isZero();
        }
    }
}
