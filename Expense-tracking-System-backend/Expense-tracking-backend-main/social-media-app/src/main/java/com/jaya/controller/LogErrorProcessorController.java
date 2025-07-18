package com.jaya.controller;



import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;

@RestController
public class LogErrorProcessorController {

    private static final String LOGS_DIR = "logs"; // Directory to store logs

    @PostMapping("/upload-logs")
    public ResponseEntity<Resource> uploadAndProcessLogs(@RequestParam("files") MultipartFile[] files) {
        try {
            // Store error logs for each file
            Map<String, List<String>> fileErrorLogs = new HashMap<>();

            // Process each uploaded file
            for (MultipartFile file : files) {
                String fileName = file.getOriginalFilename();
                List<String> errorLogs = extractErrorLogs(file);
                fileErrorLogs.put(fileName, errorLogs);
            }

            // Find common error logs across all files
            List<String> commonErrorLogs = findCommonErrorLogs(fileErrorLogs);

            // Generate file name with date, time, and seconds
            String outputFileName = "common_error_logs_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".log";
            Path logsDir = Paths.get(LOGS_DIR);
            Path outputPath = logsDir.resolve(outputFileName);

            // Create logs directory if it doesn't exist
            Files.createDirectories(logsDir);

            // Write common error logs to file
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            try (BufferedWriter writer = Files.newBufferedWriter(outputPath)) {
                for (String errorLog : commonErrorLogs) {
                    writer.write(errorLog);
                    writer.newLine();
                    outputStream.write((errorLog + "\n").getBytes());
                }
            }

            // Create resource for download
            ByteArrayResource resource = new ByteArrayResource(outputStream.toByteArray());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + outputFileName)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(new ByteArrayResource(("Error processing files: " + e.getMessage()).getBytes()));
        }
    }

    private List<String> extractErrorLogs(MultipartFile file) throws IOException {
        List<String> errorLogs = new ArrayList<>();
        Pattern errorPattern = Pattern.compile(".*(ERROR|Exception).*", Pattern.CASE_INSENSITIVE);

        try (var reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (errorPattern.matcher(line).matches()) {
                    errorLogs.add(line);
                }
            }
        }
        return errorLogs;
    }

    private List<String> findCommonErrorLogs(Map<String, List<String>> fileErrorLogs) {
        if (fileErrorLogs.isEmpty()) {
            return new ArrayList<>();
        }

        // Get the set of error logs from the first file
        Set<String> commonErrors = new HashSet<>(fileErrorLogs.values().iterator().next());

        // Retain only errors present in all files
        for (List<String> errorLogs : fileErrorLogs.values()) {
            commonErrors.retainAll(new HashSet<>(errorLogs));
        }

        return new ArrayList<>(commonErrors);
    }
}