package com.jaya.service;

import com.jaya.models.EmailLog;
import com.jaya.repository.EmailLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailLogRepository emailLogRepository;

    public void sendEmailWithAttachment(String to, String subject, String text, ByteArrayResource attachment, String attachmentFilename) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(text);
        helper.addAttachment(attachmentFilename, attachment);

        mailSender.send(message);

        // Log the email sending history
        EmailLog emailLog = new EmailLog();
        emailLog.setToEmail(to);
        emailLog.setSubject(subject);
        emailLog.setText(text);
        emailLog.setSentAt(LocalDateTime.now());

        // Create a map to store attachment details
        Map<String, String> attachmentDetails = new HashMap<>();
        attachmentDetails.put("filename", attachmentFilename);
        attachmentDetails.put("size", String.valueOf(attachment.contentLength()));

        emailLog.setAttachmentDetails(attachmentDetails);

        emailLogRepository.save(emailLog);
    }

    public List<EmailLog> getAllEmailLogs() {
        return emailLogRepository.findAll();
    }
}