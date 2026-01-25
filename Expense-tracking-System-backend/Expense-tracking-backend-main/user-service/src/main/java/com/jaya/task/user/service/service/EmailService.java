package com.jaya.task.user.service.service;

import com.jaya.task.user.service.modal.EmailLog;
import com.jaya.task.user.service.repository.EmailLogRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

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

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public void sendEmailWithAttachment(String to, String subject, String text, ByteArrayResource attachment,
            String attachmentFilename) throws MessagingException {
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

    public void sendOtpEmail(String to, String otp) {
        sendOtpEmailInternal(to, "OTP to Reset Your Password", "OTP", "Use this one time code to reset your password.",
                otp);
    }

    public void sendLoginOtpEmail(String to, String otp) {
        sendOtpEmailInternal(to, "Your login verification code", "Login verification",
                "Use this one time code to complete your login.", otp);
    }

    private void sendOtpEmailInternal(String to, String subject, String heading, String leadText, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom("jjayaprakash2002@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);

            String htmlContent = buildOtpEmailTemplate(heading, leadText, otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("OTP email sent successfully to: {}", to);
        } catch (MessagingException e) {
            logger.error("Failed to send OTP email to: {}", to, e);
            throw new RuntimeException("Failed to send OTP email", e);
        }
    }

    private String buildOtpEmailTemplate(String heading, String leadText, String otp) {
        String template = """
                <!DOCTYPE html>
                <html lang=\"en\">
                <head>
                    <meta charset=\"UTF-8\" />
                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
                    <title>Your Expensio OTP</title>
                    <style>
                        body { background:#f5f7fa; font-family:Arial,Helvetica,sans-serif; padding:18px; color:#222; }
                        .card { max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; padding:28px 26px 30px; box-shadow:0 4px 14px rgba(0,0,0,0.08); border:1px solid #eef0f3; }
                        h1 { margin:0 0 8px; font-size:20px; color:#1a237e; letter-spacing:.5px; }
                        .lead { font-size:14px; line-height:1.5; margin:0 0 18px; }
                        .otp-box { background:#1a237e; color:#fff; text-align:center; letter-spacing:6px; font-size:30px; font-weight:700; padding:16px 10px; border-radius:10px; font-family: 'Courier New', monospace; }
                        .meta { font-size:12px; color:#555; margin-top:14px; line-height:1.5; }
                        .divider { height:1px; background:#e2e6ea; margin:20px 0 14px; border-radius:1px; }
                        .small { font-size:11px; color:#777; margin-top:14px; }
                        a { color:#1a237e; }
                        @media (max-width:480px){ .card{padding:22px 20px;} .otp-box{font-size:26px; letter-spacing:4px; padding:14px 8px;} }
                    </style>
                </head>
                <body>
                    <div class=\"card\">
                        <h1>${HEADING}</h1>
                        <p class=\"lead\">${LEAD_TEXT} If you didn’t request it, you can safely ignore this email.</p>
                        <div class=\"otp-box\">${OTP_CODE}</div>
                        <div class=\"meta\">Valid for 5 minutes • Do not share with anyone.</div>
                        <div class=\"divider\"></div>
                        <div class=\"small\">Expensio Finance will never ask you for this code in any other email, chat or call.<br/>Need help? Contact support.</div>
                    </div>
                </body>
                </html>
                """;

        return template
                .replace("${HEADING}", heading)
                .replace("${LEAD_TEXT}", leadText)
                .replace("${OTP_CODE}", otp);
    }

    public List<EmailLog> getAllEmailLogs() {
        return emailLogRepository.findAll();
    }
}