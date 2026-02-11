package com.jaya.controller;

import com.jaya.models.Bill;
import com.jaya.dto.BillRequestDTO;
import com.jaya.dto.BillResponseDTO;
import com.jaya.dto.BillSearchDTO;
import com.jaya.dto.ProgressStatus;
import com.jaya.dto.ocr.OcrReceiptResponseDTO;
import com.jaya.common.dto.UserDTO;
import com.jaya.response.Error;
import com.jaya.service.BillService;
import com.jaya.service.ExcelExportService;
import com.jaya.service.FriendShipService;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.service.ocr.ReceiptOcrService;
import com.jaya.util.ServiceHelper;
import com.jaya.kafka.service.UnifiedActivityService;
import com.jaya.exceptions.InvalidImageException;
import com.jaya.exceptions.OcrProcessingException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import org.springframework.core.task.TaskExecutor;
import com.jaya.util.BulkProgressTracker;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/bills")
@RequiredArgsConstructor
@Slf4j
public class BillController {

    private final BillService billService;
    private final IUserServiceClient IUserServiceClient;
    private final ServiceHelper helper;
    private final FriendShipService friendshipService;
    private final BulkProgressTracker progressTracker;
    private final TaskExecutor billTaskExecutor;
    private final ExcelExportService excelExportService;
    private final UnifiedActivityService unifiedActivityService;
    private final ReceiptOcrService receiptOcrService;

    private UserDTO getTargetUserWithPermissionCheck(Integer targetId, UserDTO reqUser) throws Exception {
        if (targetId == null)
            return reqUser;
        UserDTO targetUser = helper.validateUser(targetId);
        if (targetUser == null)
            throw new Exception("Target user not found");
        boolean hasAccess = friendshipService.canUserModifyExpenses(targetId, reqUser.getId());
        if (!hasAccess)
            throw new Exception("You don't have permission to modify this user's expenses");
        return targetUser;
    }

    private UserDTO getTargetUserWithReadAccess(Integer targetId, UserDTO reqUser) throws Exception {
        if (targetId == null)
            return reqUser;
        UserDTO targetUser = helper.validateUser(targetId);
        if (targetUser == null)
            throw new Exception("Target user not found");
        boolean canView = friendshipService.canUserAccessExpenses(targetId, reqUser.getId());
        if (!canView)
            throw new Exception("You don't have permission to view this user's expenses");
        return targetUser;
    }

    @PostMapping
    public ResponseEntity<BillResponseDTO> createBill(@RequestBody BillRequestDTO billDto,
            @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId)
            throws Exception {
        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        UserDTO targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
        Bill bill = com.jaya.mapper.BillMapper.toEntity(billDto, targetUser.getId());
        Bill createdBill = billService.createBill(bill, targetUser.getId());

        unifiedActivityService.sendBillCreatedEvent(createdBill, reqUser, targetUser);

        BillResponseDTO resp = com.jaya.mapper.BillMapper.toDto(createdBill);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/add-multiple")
    public ResponseEntity<List<BillResponseDTO>> addMultipleBills(@RequestHeader("Authorization") String jwt,
            @RequestBody List<BillRequestDTO> bills,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        UserDTO targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);
        List<Bill> toCreate = bills.stream().map(dto -> com.jaya.mapper.BillMapper.toEntity(dto, targetUser.getId()))
                .toList();
        List<Bill> saved = billService.addMultipleBills(toCreate, targetUser.getId());

        unifiedActivityService.sendBulkBillsCreatedEvent(saved, reqUser, targetUser);

        List<BillResponseDTO> resp = saved.stream().map(com.jaya.mapper.BillMapper::toDto).toList();
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PostMapping("/add-multiple/tracked")
    public ResponseEntity<Map<String, String>> addMultipleBillsTracked(@RequestHeader("Authorization") String jwt,
            @RequestBody List<BillRequestDTO> bills,
            @RequestParam(required = false) Integer targetId) throws Exception {
        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        UserDTO targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);

        String jobId = progressTracker.start(targetUser.getId(), bills != null ? bills.size() : 0,
                "Bulk bills import started");

        billTaskExecutor.execute(() -> {
            try {
                List<Bill> toCreate = bills == null ? java.util.Collections.emptyList()
                        : bills.stream().map(dto -> com.jaya.mapper.BillMapper.toEntity(dto, targetUser.getId()))
                                .toList();
                List<Bill> saved = billService.addMultipleBillsWithProgress(toCreate, targetUser.getId(), jobId);
                progressTracker.complete(jobId,
                        "Bulk bills import completed: " + (saved != null ? saved.size() : 0) + " records");
            } catch (Exception ex) {
                progressTracker.fail(jobId, ex.getMessage());
            }
        });

        Map<String, String> response = new HashMap<>();
        response.put("jobId", jobId);
        return ResponseEntity.accepted().body(response);
    }

    @GetMapping("/add-multiple/progress/{jobId}")
    public ResponseEntity<ProgressStatus> getAddMultipleBillsProgress(@PathVariable String jobId,
            @RequestHeader("Authorization") String jwt) throws Exception {
        IUserServiceClient.getUserProfile(jwt);
        ProgressStatus status = progressTracker.get(jobId);
        if (status == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Bill> getBillById(@PathVariable Integer id, @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
            UserDTO targetUser = getTargetUserWithReadAccess(targetId, reqUser);
            Bill bill = billService.getByBillId(id, targetUser.getId());
            return ResponseEntity.ok(bill);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BillResponseDTO> updateBill(@PathVariable Integer id, @RequestBody BillRequestDTO billDto,
            @RequestHeader("Authorization") String jwt, @RequestParam(required = false) Integer targetId)
            throws Exception {

        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        UserDTO targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);

        Bill oldBill = billService.getByBillId(id, targetUser.getId());

        Bill bill = com.jaya.mapper.BillMapper.toEntity(billDto, targetUser.getId());
        bill.setId(id);
        Bill updatedBill = billService.updateBill(bill, targetUser.getId());

        unifiedActivityService.sendBillUpdatedEvent(updatedBill, oldBill, reqUser, targetUser);

        BillResponseDTO resp = com.jaya.mapper.BillMapper.toDto(updatedBill);
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Integer id, @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
            UserDTO targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);

            Bill bill = billService.getByBillId(id, targetUser.getId());
            String billName = "Bill";
            Double billAmount = null;
            if (bill != null) {
                billName = bill.getName();
                billAmount = bill.getAmount();
            }

            billService.deleteBill(id, targetUser.getId());

            unifiedActivityService.sendBillDeletedEvent(id, billName, billAmount, reqUser, targetUser);

            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping()
    public ResponseEntity<String> deleteAllBills(@RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        UserDTO targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);

        List<Bill> bills = billService.getAllBillsForUser(targetUser.getId());
        int count = bills != null ? bills.size() : 0;

        String message = billService.deleteAllBillsForUser(targetUser.getId());

        unifiedActivityService.sendAllBillsDeletedEvent(count, reqUser, targetUser);

        return new ResponseEntity<>(message, HttpStatus.NO_CONTENT);

    }

    @GetMapping("/expenses/{expenseId}")
    public ResponseEntity<Bill> getExpenseIdByBillId(@RequestHeader("Authorization") String jwt,
            @PathVariable Integer expenseId, @RequestParam(required = false) Integer targetId) {
        try {
            UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
            UserDTO targetUser = getTargetUserWithReadAccess(targetId, reqUser);
            Bill bill = billService.getBillIdByExpenseId(targetUser.getId(), expenseId);
            return new ResponseEntity<>(bill, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllBills(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String range,
            @RequestParam(required = false) Integer offset,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) LocalDate expenseDate, @RequestParam(required = false) Integer targetId)
            throws Exception {
        try {
            UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
            UserDTO targetUser = getTargetUserWithReadAccess(targetId, reqUser);
            List<Bill> bills;

            if (range != null && offset != null) {
                bills = billService.getAllBillsForUser(targetUser.getId(), range, offset);
            } else if (month != null && year != null && offset != null) {
                bills = billService.getAllBillsForUser(targetUser.getId(), month, year, offset);
            } else if (month != null && year != null) {
                bills = billService.getAllBillsForUser(targetUser.getId(), month, year);
            } else if (expenseDate != null) {
                return ResponseEntity
                        .ok(billService.getAllExpensesForBill(targetUser.getId(), expenseDate, expenseDate));
            } else if (date != null) {
                bills = billService.getBillsWithinRange(targetUser.getId(), date, date);
            } else if (startDate != null && endDate != null) {
                bills = billService.getBillsWithinRange(targetUser.getId(), startDate, endDate);
            } else {

                System.out.print("all bills called");
                bills = billService.getAllBillsForUser(targetUser.getId());
            }

            boolean applyTypeFilter = type != null && !type.isBlank();
            if (applyTypeFilter || fromDate != null || toDate != null) {
                bills = billService.filterBillsByTypeAndRange(targetUser.getId(), bills,
                        type,
                        fromDate,
                        toDate);
            }
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            Error error = new Error();
            error.setMessage(e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/items")
    public ResponseEntity<List<String>> getAllUniqueItemNames(@RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) throws Exception {

        UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
        UserDTO targetUser = getTargetUserWithReadAccess(targetId, reqUser);
        List<String> resp = billService.getUserAndBackupItems(targetUser.getId());
        return ResponseEntity.ok(resp);

    }

    @GetMapping("/export/excel")
    public ResponseEntity<String> exportUserBillsToExcel(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false, defaultValue = "C:\\Users\\jayapraj\\Downloads\\") String filePath) {

        UserDTO user = IUserServiceClient.getUserProfile(jwt);
        try {
            List<Bill> userBills = billService.getAllBillsForUser(user.getId());

            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
            String fileName = "User_" + user.getEmail() + "_Bills_" + timestamp + ".xlsx";
            String fullPath = filePath + fileName;

            excelExportService.generateBillExcel(userBills, fullPath);

            return ResponseEntity.ok("Excel file generated successfully at: " + fullPath);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating Excel file: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/import/excel")
    public ResponseEntity<?> importBillsFromExcel(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Please select a file to upload");
            }

            String fileName = file.getOriginalFilename();
            if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls"))) {
                return ResponseEntity.badRequest()
                        .body("Please upload a valid Excel file (.xlsx or .xls)");
            }

            UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
            UserDTO targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);

            List<BillRequestDTO> importedBills = excelExportService.importBillsFromExcel(file);

            if (importedBills.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("No valid bill data found in the Excel file");
            }

            importedBills.forEach(bill -> bill.setUserId(targetUser.getId()));

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bills imported successfully from Excel file");
            response.put("totalBills", importedBills.size());
            response.put("bills", importedBills);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error reading Excel file: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid Excel file format: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/import/excel/save")
    public ResponseEntity<?> importAndSaveBillsFromExcel(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId,
            @RequestParam(required = false, defaultValue = "false") boolean skipDuplicates) {

        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("Please select a file to upload");
            }

            String fileName = file.getOriginalFilename();
            if (fileName == null || (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls"))) {
                return ResponseEntity.badRequest()
                        .body("Please upload a valid Excel file (.xlsx or .xls)");
            }

            UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
            UserDTO targetUser = getTargetUserWithPermissionCheck(targetId, reqUser);

            List<BillRequestDTO> importedBills = excelExportService.importBillsFromExcel(file);

            if (importedBills.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("No valid bill data found in the Excel file");
            }

            List<Bill> billsToSave = importedBills.stream()
                    .map(dto -> com.jaya.mapper.BillMapper.toEntity(dto, targetUser.getId()))
                    .toList();

            List<Bill> savedBills = billService.addMultipleBills(billsToSave, targetUser.getId());

            List<BillResponseDTO> savedBillDTOs = savedBills.stream()
                    .map(com.jaya.mapper.BillMapper::toDto)
                    .toList();

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bills imported and saved successfully");
            response.put("totalImported", importedBills.size());
            response.put("totalSaved", savedBills.size());
            response.put("savedBills", savedBillDTOs);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error reading Excel file: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Invalid Excel file format: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    @PostMapping("/scan-receipt")
    public ResponseEntity<?> scanReceipt(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String jwt) {

        try {
            UserDTO user = IUserServiceClient.getUserProfile(jwt);
            log.info("Receipt scan requested by user: {}", user.getEmail());

            if (!receiptOcrService.isServiceAvailable()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "OCR service is not available");
                errorResponse.put("message", "Please ensure Tesseract OCR is properly configured");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
            }

            OcrReceiptResponseDTO result = receiptOcrService.processReceipt(file);

            log.info("Receipt scanned successfully for user: {}. Provider: {}, Confidence: {}%",
                    user.getEmail(), receiptOcrService.getActiveProvider(), result.getOverallConfidence());

            return ResponseEntity.ok(result);

        } catch (InvalidImageException e) {
            log.warn("Invalid image uploaded: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid image");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);

        } catch (OcrProcessingException e) {
            log.error("OCR processing failed: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "OCR processing failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);

        } catch (Exception e) {
            log.error("Unexpected error during receipt scan", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Unexpected error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @PostMapping("/scan-receipt/multiple")
    public ResponseEntity<?> scanMultipleReceipts(
            @RequestParam("files") MultipartFile[] files,
            @RequestHeader("Authorization") String jwt) {

        try {
            UserDTO user = IUserServiceClient.getUserProfile(jwt);
            log.info("Multiple receipt scan requested by user: {}. Files: {}", user.getEmail(), files.length);

            if (!receiptOcrService.isServiceAvailable()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "OCR service is not available");
                errorResponse.put("message", "Please ensure Tesseract OCR is properly configured");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
            }

            if (files == null || files.length == 0) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "No files provided",
                        "message", "Please upload at least one receipt image"));
            }

            if (files.length > 10) {
                return ResponseEntity.badRequest().body(Map.of(
                        "error", "Too many files",
                        "message", "Maximum 10 images can be processed at once"));
            }

            OcrReceiptResponseDTO mergedResult = receiptOcrService.processMultipleReceipts(files);

            log.info("Multiple receipts scanned successfully for user: {}. Files: {}, Confidence: {}%",
                    user.getEmail(), files.length, mergedResult.getOverallConfidence());

            return ResponseEntity.ok(mergedResult);

        } catch (InvalidImageException e) {
            log.warn("Invalid image uploaded: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Invalid image",
                    "message", e.getMessage()));

        } catch (OcrProcessingException e) {
            log.error("OCR processing failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "OCR processing failed",
                    "message", e.getMessage()));

        } catch (Exception e) {
            log.error("Unexpected error during multiple receipt scan", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "error", "Unexpected error",
                    "message", e.getMessage()));
        }
    }

    @GetMapping("/ocr/status")
    public ResponseEntity<?> getOcrStatus(@RequestHeader("Authorization") String jwt) {
        try {
            IUserServiceClient.getUserProfile(jwt);

            boolean isAvailable = receiptOcrService.isServiceAvailable();
            String provider = receiptOcrService.getActiveProvider();

            Map<String, Object> status = new HashMap<>();
            status.put("available", isAvailable);
            status.put("provider", provider);
            status.put("supportedFormats", "jpg, jpeg, png, gif, bmp, tiff");
            status.put("maxFileSize", "10MB");

            if (!isAvailable) {
                status.put("message", "Tesseract OCR is not installed or configured. " +
                        "Please install Tesseract: " +
                        "Windows: https://github.com/UB-Mannheim/tesseract/wiki, " +
                        "Linux: sudo apt-get install tesseract-ocr, " +
                        "Mac: brew install tesseract");
            }

            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchBills(
            @RequestParam String query,
            @RequestParam(defaultValue = "20") int limit,
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) Integer targetId) {
        try {
            UserDTO reqUser = IUserServiceClient.getUserProfile(jwt);
            UserDTO targetUser = getTargetUserWithReadAccess(targetId, reqUser);
            List<BillSearchDTO> bills = billService.searchBills(targetUser.getId(), query, limit);
            return ResponseEntity.ok(bills);
        } catch (Exception e) {
            Error error = new Error();
            error.setMessage("Error searching bills: " + e.getMessage());
            return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
