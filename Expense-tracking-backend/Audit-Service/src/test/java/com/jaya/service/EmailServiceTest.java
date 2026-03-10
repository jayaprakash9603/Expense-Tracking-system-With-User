package com.jaya.service;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender javaMailSender;

    @InjectMocks
    private EmailService emailService;

    @Test
    @DisplayName("should send email with correct fields")
    void shouldSendEmailWithCorrectFields() {
        emailService.sendSimpleMessage("user@example.com", "Test Subject", "Test Body");

        ArgumentCaptor<SimpleMailMessage> captor = ArgumentCaptor.forClass(SimpleMailMessage.class);
        verify(javaMailSender).send(captor.capture());

        SimpleMailMessage message = captor.getValue();
        assertThat(message.getTo()).containsExactly("user@example.com");
        assertThat(message.getSubject()).isEqualTo("Test Subject");
        assertThat(message.getText()).isEqualTo("Test Body");
        assertThat(message.getFrom()).isEqualTo("noreply@expensetracker.com");
    }

    @Test
    @DisplayName("should propagate exception when mail sender fails")
    void shouldPropagateExceptionOnFailure() {
        doThrow(new RuntimeException("SMTP error")).when(javaMailSender).send(any(SimpleMailMessage.class));

        assertThatThrownBy(() ->
                emailService.sendSimpleMessage("user@example.com", "Subject", "Body"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("SMTP error");
    }

    @Test
    @DisplayName("should call mail sender exactly once")
    void shouldCallMailSenderOnce() {
        emailService.sendSimpleMessage("a@b.com", "S", "T");

        verify(javaMailSender, times(1)).send(any(SimpleMailMessage.class));
    }
}
