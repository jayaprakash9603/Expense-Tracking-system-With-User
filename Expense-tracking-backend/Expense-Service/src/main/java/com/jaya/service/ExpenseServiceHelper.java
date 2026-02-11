package com.jaya.service;

import com.jaya.common.dto.UserDTO;
import com.jaya.util.ServiceHelper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.Year;
import java.time.DayOfWeek;
import java.time.format.DateTimeParseException;
import java.util.Map;
import java.util.HashMap;
import java.util.Arrays;
import java.util.List;
import java.util.function.Supplier;
import java.util.function.Function;

@Component
public class ExpenseServiceHelper {

    @Autowired
    private IUserServiceClient IUserServiceClient;


    @Autowired
    private ServiceHelper helper;


    
    public static class RequestContext {
        private final UserDTO reqUser;
        private final UserDTO targetUser;
        private final String auditMessage;

        public RequestContext(UserDTO reqUser, UserDTO targetUser, String auditMessage) {
            this.reqUser = reqUser;
            this.targetUser = targetUser;
            this.auditMessage = auditMessage;
        }

        public UserDTO getReqUser() { return reqUser; }
        public UserDTO getTargetUser() { return targetUser; }
        public String getAuditMessage() { return auditMessage; }
    }

    
    public static class EmailReportContext {
        private final UserDTO reqUser;
        private final UserDTO targetUser;
        private final String email;
        private final String reportType;

        public EmailReportContext(UserDTO reqUser, UserDTO targetUser, String email, String reportType) {
            this.reqUser = reqUser;
            this.targetUser = targetUser;
            this.email = email;
            this.reportType = reportType;
        }

        public UserDTO getReqUser() { return reqUser; }
        public UserDTO getTargetUser() { return targetUser; }
        public String getEmail() { return email; }
        public String getReportType() { return reportType; }
    }

    
    public ResponseEntity<Map<String, Object>> validateYear(int year) {
        if (year != 0 && (year < 2000 || year > 2100)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Year must be between 2000 and 2100"));
        }
        return null; 
    }

    public int normalizeYear(int year) {
        return year == 0 ? Year.now().getValue() : year;
    }

    public ResponseEntity<Map<String, Object>> validatePositiveInteger(Integer value, String fieldName) {
        if (value != null && value <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", fieldName + " must be greater than zero"));
        }
        return null;
    }

    public ResponseEntity<Map<String, Object>> validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "End date cannot be before start date"));
        }
        return null;
    }

    public ResponseEntity<Map<String, Object>> validateRangeType(String rangeType) {
        if (rangeType == null || rangeType.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Range type parameter is required"));
        }
        if (!Arrays.asList("week", "month", "year").contains(rangeType.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid rangeType parameter. Valid values are: week, month, year"));
        }
        return null;
    }

    public ResponseEntity<Map<String, Object>> validateSortOrder(String sortOrder) {
        if (!sortOrder.equalsIgnoreCase("asc") && !sortOrder.equalsIgnoreCase("desc")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid sortOrder parameter. Must be 'asc' or 'desc'"));
        }
        return null;
    }

    public ResponseEntity<Map<String, Object>> validateSortBy(String sortBy, List<String> validFields) {
        if (!validFields.contains(sortBy.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid sortBy parameter. Valid values are: " + String.join(", ", validFields)));
        }
        return null;
    }

    public ResponseEntity<Map<String, Object>> validatePagination(int page, int size) {
        if (page < 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Page number cannot be negative"));
        }
        if (size <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Page size must be greater than zero"));
        }
        return null;
    }

    public ResponseEntity<Map<String, Object>> validateEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Email parameter is required"));
        }
        if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid email format"));
        }
        return null;
    }

    

    public UserDTO authenticateUser(String jwt) {
        return IUserServiceClient.getUserProfile(jwt);
    }

    public ResponseEntity<Map<String, Object>> createUnauthorizedResponse() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid or expired token"));
    }

    public UserDTO getTargetUserWithPermissionCheck(Integer targetId, UserDTO reqUser, boolean requireWriteAccess) {
        if (targetId == null) {
            return reqUser;
        }

        if (!targetId.equals(reqUser.getId())) {
            
            try {
                UserDTO fetched = IUserServiceClient.findUserById(targetId);
                if (fetched == null) {
                    throw new RuntimeException("Target UserDTO not found with ID: " + targetId);
                }
                return fetched;
            } catch (Exception e) {
                throw new RuntimeException("Target UserDTO not found with ID: " + targetId);
            }
        }

        return reqUser;
    }

    
    public ResponseEntity<?> setupRequestContext(String jwt, Integer targetId, String auditMessageTemplate, Object... params) {
        UserDTO reqUser = authenticateUser(jwt);
        if (reqUser == null) {
            return createUnauthorizedResponse();
        }

        UserDTO targetUser;
        try {
            targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        } catch (RuntimeException e) {
            return handleRuntimeException(e);
        }
        if (targetUser == null) {
            return handleRuntimeException(new RuntimeException("Target UserDTO not found with ID: " + targetId));
        }

        String auditMessage = createAuditMessage(auditMessageTemplate, targetId, reqUser.getId(), params);
        return ResponseEntity.ok(new RequestContext(reqUser, targetUser, auditMessage));
    }

    
    public ResponseEntity<?> setupEmailReportContext(String jwt, Integer targetId, String email, String reportType) {
        ResponseEntity<Map<String, Object>> emailValidation = validateEmail(email);
        if (emailValidation != null) {
            return emailValidation;
        }

        UserDTO reqUser = authenticateUser(jwt);
        if (reqUser == null) {
            return createUnauthorizedResponse();
        }

        UserDTO targetUser;
        try {
            targetUser = getTargetUserWithPermissionCheck(targetId, reqUser, false);
        } catch (RuntimeException e) {
            return handleRuntimeException(e);
        }
        if (targetUser == null) {
            return handleRuntimeException(new RuntimeException("Target UserDTO not found with ID: " + targetId));
        }

        return ResponseEntity.ok(new EmailReportContext(reqUser, targetUser, email, reportType));
    }

    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException e) {
        if (e.getMessage().contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } else if (e.getMessage().contains("permission")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", e.getMessage()));
        } else {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    
    public Map<String, LocalDate> calculateDateRange(String rangeType, int offset) {
        LocalDate now = LocalDate.now();
        LocalDate startDate;
        LocalDate endDate;

        switch (rangeType.toLowerCase()) {
            case "week":
                startDate = now.with(DayOfWeek.MONDAY).plusWeeks(offset);
                endDate = startDate.plusDays(6);
                break;
            case "month":
                startDate = now.withDayOfMonth(1).plusMonths(offset);
                endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
                break;
            case "year":
                startDate = LocalDate.of(now.getYear(), 1, 1).plusYears(offset);
                endDate = LocalDate.of(now.getYear(), 12, 31).plusYears(offset);
                break;
            default:
                throw new IllegalArgumentException("Invalid range type: " + rangeType);
        }

        Map<String, LocalDate> dateRange = new HashMap<>();
        dateRange.put("startDate", startDate);
        dateRange.put("endDate", endDate);
        return dateRange;
    }

    
    public void logAudit(UserDTO UserDTO, Integer expenseId, String action, String message) {
        
    }

    public String createAuditMessage(String baseMessage, Integer targetId, Integer reqUserId, Object... params) {
        String formattedMessage = String.format(baseMessage, params);
        if (targetId != null && !targetId.equals(reqUserId)) {
            return formattedMessage + " for UserDTO ID: " + targetId;
        }
        return formattedMessage;
    }

    
    public <T> ResponseEntity<?> executeWithErrorHandling(Supplier<T> operation, String errorContext) {
        try {
            T result = operation.get();
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid request parameters: " + e.getMessage()));
        } catch (DateTimeParseException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Invalid date format. Please use yyyy-MM-dd format"));
        } catch (RuntimeException e) {
            return handleRuntimeException(e);
        } catch (Exception e) {
            System.out.println("Error " + errorContext + ": " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error " + errorContext + ": " + e.getMessage()));
        }
    }

    
    public <T> ResponseEntity<?> executeEmailReport(
            String jwt,
            Integer targetId,
            String email,
            String reportType,
            Function<UserDTO, T> dataExtractor,
            EmailReportProcessor<T> processor) {

        return executeWithErrorHandling(() -> {
            ResponseEntity<?> contextResponse = setupEmailReportContext(jwt, targetId, email, reportType);

            if (!(contextResponse.getBody() instanceof EmailReportContext)) {
                return contextResponse.getBody();
            }

            EmailReportContext context = (EmailReportContext) contextResponse.getBody();
            T data = dataExtractor.apply(context.getTargetUser());

            try {
                return processor.process(context, data);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }, "sending " + reportType + " email report");
    }

    @FunctionalInterface
    public interface EmailReportProcessor<T> {
        Object process(EmailReportContext context, T data) throws Exception;
    }

    
    public Map<String, Object> buildPaginatedResponse(Object data, int page, int size, String sortBy, String sortOrder) {
        Map<String, Object> response = new HashMap<>();
        response.put("data", data);
        response.put("pagination", Map.of(
                "page", page,
                "size", size,
                "sortBy", sortBy,
                "sortOrder", sortOrder
        ));
        return response;
    }

    
    public ResponseEntity<Map<String, Object>> validateYearAndNormalize(int year) {
        ResponseEntity<Map<String, Object>> validation = validateYear(year);
        return validation;
    }

    public ResponseEntity<Map<String, Object>> validatePaginationAndSort(int page, int size, String sortBy, String sortOrder, List<String> validSortFields) {
        ResponseEntity<Map<String, Object>> paginationValidation = validatePagination(page, size);
        if (paginationValidation != null) return paginationValidation;

        ResponseEntity<Map<String, Object>> sortOrderValidation = validateSortOrder(sortOrder);
        if (sortOrderValidation != null) return sortOrderValidation;

        return validateSortBy(sortBy, validSortFields);
    }

    
    public ResponseEntity<Map<String, Object>> validatePathParameter(String paramName, String value) {
        if (value == null || value.trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", paramName + " cannot be empty"));
        }
        return null;
    }

    public ResponseEntity<Map<String, Object>> validatePathParameter(String paramName, Integer value) {
        if (value == null || value <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", paramName + " must be a positive integer"));
        }
        return null;
    }

    
    public LocalDate parseDate(String dateString, String paramName) {
        try {
            return LocalDate.parse(dateString);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid " + paramName + " format. Please use yyyy-MM-dd format");
        }
    }
}