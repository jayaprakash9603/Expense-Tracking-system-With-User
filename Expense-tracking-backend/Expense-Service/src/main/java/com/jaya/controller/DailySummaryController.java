package com.jaya.controller;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jaya.models.DailySummary;

import jakarta.mail.MessagingException;

@RestController
@RequestMapping("/daily-summary")
public class DailySummaryController {

    private final DailySummaryService dailySummaryService;

    @Autowired
    private IUserServiceClient IUserServiceClient;

    public DailySummaryController(DailySummaryService dailySummaryService) {
        this.dailySummaryService = dailySummaryService;
    }

    @GetMapping("/monthly")
    public List<DailySummary> getDailySummaries(@RequestParam Integer year, @RequestParam Integer month,
            @RequestHeader("Authorization") String jwt) {
        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        return dailySummaryService.getDailySummaries(year, month, reqUser);
    }

    @GetMapping("/yearly")
    public List<DailySummary> getYearlySummaries(@RequestParam Integer year,
            @RequestHeader("Authorization") String jwt) {
        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        return dailySummaryService.getYearlySummaries(year, reqUser);
    }

    @GetMapping("/date")
    public ResponseEntity<?> getDailySummaryForDate(@RequestParam String date,
            @RequestHeader("Authorization") String jwt) {
        LocalDate parsedDate = LocalDate.parse(date);
        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        DailySummary dailySummary = dailySummaryService.getDailySummaryForDate(parsedDate, reqUser);

        if (dailySummary == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("{\"message\": \"No daily summary is found for the date " + parsedDate + "\"}");
        }

        return ResponseEntity.ok(dailySummary);
    }

    @Autowired
    private ExcelService excelService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/monthly/email")
    public ResponseEntity<String> sendDailySummariesByEmail(
            @RequestParam Integer year,
            @RequestParam Integer month,
            @RequestParam String email, @RequestHeader("Authorization") String jwt)
            throws IOException, MessagingException {
        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        List<DailySummary> summaries = dailySummaryService.getDailySummaries(year, month, reqUser);

        ByteArrayInputStream in = excelService.generateDailySummariesExcel(summaries);
        byte[] bytes = in.readAllBytes();

        String subject = "Daily Summaries for " + year + "-" + month;
        emailService.sendEmailWithAttachment(email, subject,
                "Please find attached the daily summaries for " + year + "-" + month + ".",
                new ByteArrayResource(bytes), "daily_summaries_" + year + "_" + month + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }

    @GetMapping("/yearly/email")
    public ResponseEntity<String> sendYearlySummariesByEmail(
            @RequestParam Integer year,
            @RequestParam String email, @RequestHeader("Authorization") String jwt)
            throws IOException, MessagingException {
        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        List<DailySummary> summaries = dailySummaryService.getYearlySummaries(year, reqUser);

        ByteArrayInputStream in = excelService.generateYearlySummariesExcel(summaries);
        byte[] bytes = in.readAllBytes();

        String subject = "Yearly Summaries for " + year;
        emailService.sendEmailWithAttachment(email, subject,
                "Please find attached the yearly summaries for " + year + ".", new ByteArrayResource(bytes),
                "yearly_summaries_" + year + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }

    @GetMapping("/date/email/{date}")
    public ResponseEntity<String> sendDailySummaryByEmail(
            @PathVariable String date,
            @RequestParam String email, @RequestHeader("Authorization") String jwt)
            throws IOException, MessagingException {
        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        LocalDate parsedDate;
        try {
            parsedDate = LocalDate.parse(date);
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("{\"message\": \"Invalid date format. Please use yyyy-MM-dd.\"}");
        }

        DailySummary dailySummary = dailySummaryService.getDailySummaryForDate(parsedDate, reqUser);

        if (dailySummary == null) {
            return ResponseEntity.status(HttpStatus.NO_CONTENT)
                    .body("{\"message\": \"No daily summary is found for the date " + parsedDate + "\"}");
        }

        ByteArrayInputStream in = excelService.generateDailySummaryExcel(dailySummary);
        byte[] bytes = in.readAllBytes();

        String subject = "Daily Summary for " + parsedDate + LocalDateTime.now();
        emailService.sendEmailWithAttachment(email, subject,
                "Please find attached the daily summary for " + parsedDate + ".", new ByteArrayResource(bytes),
                "daily_summary_" + parsedDate + ".xlsx");

        return ResponseEntity.ok("Email sent successfully");
    }

}
