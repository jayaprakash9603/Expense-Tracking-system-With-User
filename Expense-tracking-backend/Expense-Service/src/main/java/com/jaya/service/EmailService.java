package com.jaya.service;

import com.jaya.models.EmailLog;
import com.jaya.repository.EmailLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static java.util.Objects.requireNonNull;

@Service("expenseEmailService")
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private EmailLogRepository emailLogRepository;

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private static final String BASE_TEMPLATE_PATH = "templates/email/base-template.html";
    private static final int MAX_LOG_TEXT_LENGTH = 2000;

    private String truncateForLog(String content) {
        if (content == null) {
            return null;
        }
        if (content.length() <= MAX_LOG_TEXT_LENGTH) {
            return content;
        }
        return content.substring(0, MAX_LOG_TEXT_LENGTH);
    }

    public void sendEmailWithAttachment(String to, String subject, String text, ByteArrayResource attachment, String attachmentFilename) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        helper.setFrom("jjayaprakash2002@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);
        
        boolean isHtml = text != null && text.trim().startsWith("<");
        helper.setText(text, isHtml);
        helper.addAttachment(attachmentFilename, attachment);

        System.out.println("email was sending");

        mailSender.send(message);

        System.out.println("email was sent successfully");

        
        EmailLog emailLog = new EmailLog();
        emailLog.setToEmail(to);
    emailLog.setSubject(subject);
    emailLog.setText(truncateForLog(text));
        emailLog.setSentAt(LocalDateTime.now());

        
        Map<String, String> attachmentDetails = new HashMap<>();
        attachmentDetails.put("filename", attachmentFilename);
        attachmentDetails.put("size", String.valueOf(attachment.contentLength()));

        emailLog.setAttachmentDetails(attachmentDetails);

        emailLogRepository.save(emailLog);
    }

    




    public void sendEmailWithAttachments(String to,
                                         String subject,
                                         String text,
                                         Map<String, ByteArrayResource> attachments) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        
        MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());
        helper.setFrom("jjayaprakash2002@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);
        
        boolean isHtml = text != null && text.trim().startsWith("<");
        helper.setText(text, isHtml);

        if (attachments != null) {
            for (Map.Entry<String, ByteArrayResource> entry : attachments.entrySet()) {
                String filename = requireNonNull(entry.getKey(), "Attachment filename must not be null");
                ByteArrayResource resource = requireNonNull(entry.getValue(), "Attachment resource must not be null");
                helper.addAttachment(filename, resource);
            }
        }

        mailSender.send(message);

        
        EmailLog emailLog = new EmailLog();
        emailLog.setToEmail(to);
    emailLog.setSubject(subject);
    emailLog.setText(truncateForLog(text));
        emailLog.setSentAt(LocalDateTime.now());

        Map<String, String> attachmentDetails = new HashMap<>();
        if (attachments != null) {
            
            String filenames = String.join(",", attachments.keySet());
            attachmentDetails.put("filenames", filenames);
        }
        emailLog.setAttachmentDetails(attachmentDetails);

        emailLogRepository.save(emailLog);
    }

    



    public String buildBaseTemplateBody(Map<String, String> variables) {
        try {
            ClassLoader cl = Thread.currentThread().getContextClassLoader();
            if (cl == null) {
                cl = EmailService.class.getClassLoader();
            }

            try (var is = cl.getResourceAsStream(BASE_TEMPLATE_PATH)) {
                if (is == null) {
                    logger.warn("Email base template not found at {} - falling back to plain text body", BASE_TEMPLATE_PATH);
                    return variables.getOrDefault("fallbackText", "");
                }

                String template = new String(is.readAllBytes(), StandardCharsets.UTF_8);

                Map<String, String> merged = new HashMap<>();
                
                merged.put("subject", variables.getOrDefault("subject", "Expensio Report"));
                merged.put("tagline", variables.getOrDefault("tagline", "Automated Report"));
                merged.put("headline", variables.getOrDefault("headline", "Your latest"));
                merged.put("headlineAccent", variables.getOrDefault("headlineAccent", "money snapshot"));
                merged.put("subHeadline", variables.getOrDefault("subHeadline", "A consolidated view of your recent activity."));
                merged.put("reportRange", variables.getOrDefault("reportRange", "All time"));
                merged.put("totalExpenses", variables.getOrDefault("totalExpenses", "—"));
                merged.put("totalBills", variables.getOrDefault("totalBills", "—"));
                merged.put("generatedOn", variables.getOrDefault("generatedOn", LocalDateTime.now().toLocalDate().toString()));
                merged.put("ctaUrl", variables.getOrDefault("ctaUrl", "https://localhost:3000"));
                merged.put("year", variables.getOrDefault("year", String.valueOf(LocalDateTime.now().getYear())));
                merged.put("settingsUrl", variables.getOrDefault("settingsUrl", "https://localhost:3000/settings/notifications"));
                merged.put("privacyUrl", variables.getOrDefault("privacyUrl", "https://localhost:3000/privacy"));

                
                merged.putAll(variables);

                String body = template;
                for (Map.Entry<String, String> entry : merged.entrySet()) {
                    body = body.replace("{{" + entry.getKey() + "}}", entry.getValue() != null ? entry.getValue() : "");
                }

                
                body = body.replaceAll("\\{\\{[a-zA-Z0-9_]+}}", "");
                return body;
            }
        } catch (IOException e) {
            logger.error("Failed to load email base template", e);
            return variables.getOrDefault("fallbackText", "");
        }
    }

    public void sendOtpEmail(String to, String otp) {
        

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setTo(to);
            helper.setSubject("Expensio Finance - OTP for Password Reset");
            helper.setText(
                "<h3>Your OTP for Password Reset</h3>" +
                "<p>Use the following OTP to reset your password:</p>" +
                "<h2>" + otp + "</h2>" +
                "<p>This OTP is valid for 5 minutes.</p>" +
                "<p>If you did not request this, please ignore this email.</p>",
                true
            );
            mailSender.send(message);
        } catch (MessagingException e) {
            throw new RuntimeException("Failed to send OTP email", e);
        }

    }
    public List<EmailLog> getAllEmailLogs() {
        return emailLogRepository.findAll();
    }
}

