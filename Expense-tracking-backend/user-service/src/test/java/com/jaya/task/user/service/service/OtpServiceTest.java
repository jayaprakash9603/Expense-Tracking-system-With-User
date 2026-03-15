package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.Otp;
import com.jaya.task.user.service.repository.UserOtpRepository;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OtpServiceTest {

    @Mock
    private UserOtpRepository otpRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private OtpService otpService;

    @Nested
    class GenerateOtp {

        @Test
        void generatesOtpOfCorrectLength() {
            String otp = otpService.generateOtp();

            assertThat(otp).hasSize(6);
        }

        @Test
        void generatesNumericOtp() {
            String otp = otpService.generateOtp();

            assertThat(otp).matches("\\d{6}");
        }

        @Test
        void generatesDifferentOtpsOnSubsequentCalls() {
            java.util.Set<String> otps = new java.util.HashSet<>();
            for (int i = 0; i < 50; i++) {
                otps.add(otpService.generateOtp());
            }
            assertThat(otps.size()).isGreaterThan(1);
        }
    }

    @Nested
    class GenerateAndSendOtp {

        @Test
        void deletesOldOtpAndSavesNewAndSendsEmail() {
            when(otpRepository.save(any(Otp.class))).thenAnswer(inv -> inv.getArgument(0));

            String result = otpService.generateAndSendOtp("user@example.com");

            verify(otpRepository).deleteByEmail("user@example.com");
            verify(otpRepository).save(any(Otp.class));
            verify(emailService).sendOtpEmail(eq("user@example.com"), anyString());
            assertThat(result).contains("Otp");
        }

        @Test
        void savedOtpHasCorrectEmailAndExpiry() {
            ArgumentCaptor<Otp> captor = ArgumentCaptor.forClass(Otp.class);
            when(otpRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

            otpService.generateAndSendOtp("user@example.com");

            Otp saved = captor.getValue();
            assertThat(saved.getEmail()).isEqualTo("user@example.com");
            assertThat(saved.getOtp()).hasSize(6);
            assertThat(saved.getExpiresAt()).isAfter(saved.getCreatedAt());
        }
    }

    @Nested
    class GenerateAndSendLoginOtp {

        @Test
        void deletesOldAndSendsLoginOtp() {
            when(otpRepository.save(any(Otp.class))).thenAnswer(inv -> inv.getArgument(0));

            String result = otpService.generateAndSendLoginOtp("user@example.com");

            verify(otpRepository).deleteByEmail("user@example.com");
            verify(emailService).sendLoginOtpEmail(eq("user@example.com"), anyString());
            assertThat(result).contains("Login OTP");
        }
    }

    @Nested
    class VerifyOtp {

        @Test
        void returnsTrueForValidOtp() {
            Otp validOtp = new Otp("user@example.com", "123456",
                    LocalDateTime.now(), LocalDateTime.now().plusSeconds(30));

            when(otpRepository.findByEmailAndOtp("user@example.com", "123456"))
                    .thenReturn(Optional.of(validOtp));

            boolean result = otpService.verifyOtp("user@example.com", "123456");

            assertThat(result).isTrue();
            verify(otpRepository).deleteByEmail("user@example.com");
        }

        @Test
        void returnsFalseForExpiredOtp() {
            Otp expired = new Otp("user@example.com", "123456",
                    LocalDateTime.now().minusMinutes(5), LocalDateTime.now().minusMinutes(4));

            when(otpRepository.findByEmailAndOtp("user@example.com", "123456"))
                    .thenReturn(Optional.of(expired));

            boolean result = otpService.verifyOtp("user@example.com", "123456");

            assertThat(result).isFalse();
        }

        @Test
        void returnsFalseForNonExistentOtp() {
            when(otpRepository.findByEmailAndOtp("user@example.com", "000000"))
                    .thenReturn(Optional.empty());

            boolean result = otpService.verifyOtp("user@example.com", "000000");

            assertThat(result).isFalse();
        }
    }
}
