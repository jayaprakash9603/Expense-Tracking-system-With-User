package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.EmailLog;
import com.jaya.task.user.service.repository.EmailLogRepository;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private EmailLogRepository emailLogRepository;

    @Mock
    private MimeMessage mimeMessage;

    @InjectMocks
    private EmailService emailService;

    @BeforeEach
    void setUp() {
        lenient().when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
    }

    @Nested
    class SendEmailWithAttachment {

        @Test
        void sendsEmailAndLogsIt() throws Exception {
            ByteArrayResource attachment = new ByteArrayResource("test data".getBytes());
            when(emailLogRepository.save(any(EmailLog.class))).thenAnswer(inv -> inv.getArgument(0));

            emailService.sendEmailWithAttachment(
                    "to@example.com", "Subject", "Body text", attachment, "report.pdf");

            verify(mailSender).send(any(MimeMessage.class));
            verify(emailLogRepository).save(any(EmailLog.class));
        }

        @Test
        void logContainsCorrectMetadata() throws Exception {
            ByteArrayResource attachment = new ByteArrayResource("content".getBytes());
            ArgumentCaptor<EmailLog> captor = ArgumentCaptor.forClass(EmailLog.class);
            when(emailLogRepository.save(captor.capture())).thenAnswer(inv -> inv.getArgument(0));

            emailService.sendEmailWithAttachment(
                    "to@example.com", "Test Subject", "Text body", attachment, "file.xlsx");

            EmailLog log = captor.getValue();
            assertThat(log.getToEmail()).isEqualTo("to@example.com");
            assertThat(log.getSubject()).isEqualTo("Test Subject");
            assertThat(log.getSentAt()).isNotNull();
            assertThat(log.getAttachmentDetails()).containsKey("filename");
        }
    }

    @Nested
    class SendOtpEmail {

        @Test
        void sendsOtpEmailWithoutException() {
            emailService.sendOtpEmail("user@example.com", "123456");

            verify(mailSender).send(any(MimeMessage.class));
        }
    }

    @Nested
    class SendLoginOtpEmail {

        @Test
        void sendsLoginOtpEmailWithoutException() {
            emailService.sendLoginOtpEmail("user@example.com", "654321");

            verify(mailSender).send(any(MimeMessage.class));
        }
    }

    @Nested
    class GetAllEmailLogs {

        @Test
        void returnsAllLogs() {
            EmailLog log1 = new EmailLog();
            log1.setToEmail("a@example.com");
            EmailLog log2 = new EmailLog();
            log2.setToEmail("b@example.com");

            when(emailLogRepository.findAll()).thenReturn(List.of(log1, log2));

            List<EmailLog> result = emailService.getAllEmailLogs();

            assertThat(result).hasSize(2);
        }
    }
}
