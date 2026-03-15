package com.jaya.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jaya.common.dto.UserDTO;
import com.jaya.common.service.client.IUserServiceClient;
import com.jaya.dto.BillRequestDTO;
import com.jaya.dto.BillSearchDTO;
import com.jaya.dto.ProgressStatus;
import com.jaya.dto.ocr.OcrReceiptResponseDTO;
import com.jaya.models.Bill;
import com.jaya.service.BillService;
import com.jaya.service.ExcelExportService;
import com.jaya.service.FriendShipService;
import com.jaya.service.ocr.ReceiptOcrService;
import com.jaya.testutil.BillTestDataFactory;
import com.jaya.util.BillServiceHelper;
import com.jaya.util.BulkProgressTracker;
import com.jaya.kafka.service.UnifiedActivityService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.core.task.TaskExecutor;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Map;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class BillControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BillService billService;

    @MockBean
    private IUserServiceClient userServiceClient;

    @MockBean
    private BillServiceHelper helper;

    @MockBean
    private FriendShipService friendshipService;

    @MockBean
    private BulkProgressTracker progressTracker;

    @MockBean
    private TaskExecutor billTaskExecutor;

    @MockBean
    private ExcelExportService excelExportService;

    @MockBean
    private UnifiedActivityService unifiedActivityService;

    @MockBean
    private ReceiptOcrService receiptOcrService;

    @MockBean
    private JavaMailSender javaMailSender;

    private UserDTO reqUser;

    @BeforeEach
    void setUp() {
        reqUser = BillTestDataFactory.buildUser();
    }

    @Nested
    @DisplayName("POST /api/bills")
    class CreateBillTests {

        @Test
        @DisplayName("should create bill for self")
        void shouldCreateBill() throws Exception {
            BillRequestDTO request = BillTestDataFactory.buildBillRequestDTO();
            Bill created = BillTestDataFactory.buildBill();

            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.createBill(any(Bill.class), eq(reqUser.getId()))).thenReturn(created);

            mockMvc.perform(post("/api/bills")
                            .header("Authorization", BillTestDataFactory.TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1001))
                    .andExpect(jsonPath("$.name").value("Electricity Bill"));
        }

        @Test
        @DisplayName("should fail when target user modify permission denied")
        void shouldFailWhenModifyPermissionDenied() throws Exception {
            BillRequestDTO request = BillTestDataFactory.buildBillRequestDTO();
            UserDTO target = new UserDTO();
            target.setId(BillTestDataFactory.TARGET_USER_ID);

            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(helper.validateUser(BillTestDataFactory.TARGET_USER_ID)).thenReturn(target);
            when(friendshipService.canUserModifyExpenses(BillTestDataFactory.TARGET_USER_ID, reqUser.getId()))
                    .thenReturn(false);

            mockMvc.perform(post("/api/bills")
                            .param("targetId", String.valueOf(BillTestDataFactory.TARGET_USER_ID))
                            .header("Authorization", BillTestDataFactory.TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isInternalServerError());
        }
    }

    @Nested
    @DisplayName("GET/PUT/DELETE /api/bills/{id}")
    class SingleBillEndpointTests {

        @Test
        @DisplayName("should get bill by id")
        void shouldGetBillById() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.getByBillId(1001, reqUser.getId())).thenReturn(BillTestDataFactory.buildBill());

            mockMvc.perform(get("/api/bills/1001")
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1001));
        }

        @Test
        @DisplayName("should return not found when get fails")
        void shouldReturnNotFoundWhenGetFails() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.getByBillId(1001, reqUser.getId())).thenThrow(new RuntimeException("not found"));

            mockMvc.perform(get("/api/bills/1001")
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isNotFound());
        }

        @Test
        @DisplayName("should update bill")
        void shouldUpdateBill() throws Exception {
            BillRequestDTO request = BillTestDataFactory.buildBillRequestDTO();
            Bill oldBill = BillTestDataFactory.buildBill();
            Bill updated = BillTestDataFactory.buildGainBill();

            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.getByBillId(1001, reqUser.getId())).thenReturn(oldBill);
            when(billService.updateBill(any(Bill.class), eq(reqUser.getId()))).thenReturn(updated);

            mockMvc.perform(put("/api/bills/1001")
                            .header("Authorization", BillTestDataFactory.TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.id").value(1002));
        }

        @Test
        @DisplayName("should delete bill")
        void shouldDeleteBill() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.getByBillId(1001, reqUser.getId())).thenReturn(BillTestDataFactory.buildBill());

            mockMvc.perform(delete("/api/bills/1001")
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isNoContent());
        }
    }

    @Nested
    @DisplayName("GET /api/bills")
    class GetAllBillsTests {

        @Test
        @DisplayName("should return all bills for user")
        void shouldReturnAllBills() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.getAllBillsForUser(reqUser.getId())).thenReturn(List.of(BillTestDataFactory.buildBill()));

            mockMvc.perform(get("/api/bills")
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("should route month year offset branch")
        void shouldRouteMonthYearOffset() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.getAllBillsForUser(reqUser.getId(), 3, 2026, 2))
                    .thenReturn(List.of(BillTestDataFactory.buildBill()));

            mockMvc.perform(get("/api/bills")
                            .header("Authorization", BillTestDataFactory.TEST_JWT)
                            .param("month", "3")
                            .param("year", "2026")
                            .param("offset", "2"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }

        @Test
        @DisplayName("should apply type and date filter")
        void shouldApplyTypeAndDateFilter() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.getAllBillsForUser(reqUser.getId())).thenReturn(List.of(BillTestDataFactory.buildBill()));
            when(billService.filterBillsByTypeAndRange(eq(reqUser.getId()), any(), eq("loss"), any(), any()))
                    .thenReturn(List.of(BillTestDataFactory.buildBill()));

            mockMvc.perform(get("/api/bills")
                            .header("Authorization", BillTestDataFactory.TEST_JWT)
                            .param("type", "loss")
                            .param("fromDate", "2026-03-01")
                            .param("toDate", "2026-03-31"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)));
        }
    }

    @Nested
    @DisplayName("tracked bulk")
    class TrackedBulkTests {

        @Test
        @DisplayName("should return accepted with job id")
        void shouldReturnAcceptedWithJobId() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(progressTracker.start(eq(reqUser.getId()), eq(1), any())).thenReturn("job-123");
            doAnswer(invocation -> {
                Runnable runnable = invocation.getArgument(0);
                runnable.run();
                return null;
            }).when(billTaskExecutor).execute(any(Runnable.class));
            when(billService.addMultipleBillsWithProgress(any(), eq(reqUser.getId()), eq("job-123")))
                    .thenReturn(List.of(BillTestDataFactory.buildBill()));

            mockMvc.perform(post("/api/bills/add-multiple/tracked")
                            .header("Authorization", BillTestDataFactory.TEST_JWT)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(List.of(BillTestDataFactory.buildBillRequestDTO()))))
                    .andExpect(status().isAccepted())
                    .andExpect(jsonPath("$.jobId").value("job-123"));
        }

        @Test
        @DisplayName("should fetch progress by job id")
        void shouldGetProgress() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            ProgressStatus status = new ProgressStatus("job-123", 10, reqUser.getId());
            status.setProcessed(5);
            status.setPercent(50);
            status.setStatus("IN_PROGRESS");
            when(progressTracker.get("job-123")).thenReturn(status);

            mockMvc.perform(get("/api/bills/add-multiple/progress/job-123")
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.jobId").value("job-123"))
                    .andExpect(jsonPath("$.percent").value(50));
        }
    }

    @Nested
    @DisplayName("excel import")
    class ExcelImportTests {

        @Test
        @DisplayName("should return bad request for empty file")
        void shouldRejectEmptyExcelFile() throws Exception {
            MockMultipartFile file = new MockMultipartFile("file", "bills.xlsx",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", new byte[0]);

            mockMvc.perform(multipart("/api/bills/import/excel")
                            .file(file)
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("should reject non-excel file")
        void shouldRejectNonExcelFile() throws Exception {
            MockMultipartFile file = new MockMultipartFile("file", "bills.txt", "text/plain", "x".getBytes());

            mockMvc.perform(multipart("/api/bills/import/excel")
                            .file(file)
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isBadRequest());
        }
    }

    @Nested
    @DisplayName("ocr endpoints")
    class OcrEndpointTests {

        @Test
        @DisplayName("should return service unavailable when OCR is down")
        void shouldReturnServiceUnavailable() throws Exception {
            MockMultipartFile file = new MockMultipartFile("file", "bill.png", "image/png", "img".getBytes());
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(receiptOcrService.isServiceAvailable()).thenReturn(false);

            mockMvc.perform(multipart("/api/bills/scan-receipt")
                            .file(file)
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.error").value("OCR service is not available"));
        }

        @Test
        @DisplayName("should scan receipt successfully")
        void shouldScanReceiptSuccessfully() throws Exception {
            MockMultipartFile file = new MockMultipartFile("file", "bill.png", "image/png", "img".getBytes());
            OcrReceiptResponseDTO response = BillTestDataFactory.buildOcrReceiptResponse();

            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(receiptOcrService.isServiceAvailable()).thenReturn(true);
            when(receiptOcrService.getActiveProvider()).thenReturn("Tesseract");
            when(receiptOcrService.processReceipt(file)).thenReturn(response);

            mockMvc.perform(multipart("/api/bills/scan-receipt")
                            .file(file)
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.merchant").value("Sample Store"));
        }

        @Test
        @DisplayName("should return ocr status")
        void shouldReturnOcrStatus() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(receiptOcrService.isServiceAvailable()).thenReturn(true);
            when(receiptOcrService.getActiveProvider()).thenReturn("Tesseract");

            mockMvc.perform(get("/api/bills/ocr/status")
                            .header("Authorization", BillTestDataFactory.TEST_JWT))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.available").value(true))
                    .andExpect(jsonPath("$.provider").value("Tesseract"));
        }
    }

    @Nested
    @DisplayName("search")
    class SearchTests {

        @Test
        @DisplayName("should search bills")
        void shouldSearchBills() throws Exception {
            BillSearchDTO dto = new BillSearchDTO(1001, "Electricity Bill", "Monthly", 2500.0,
                    "UPI", "loss", BillTestDataFactory.buildBill().getDate(), 2600.0, "Utilities", 11,
                    reqUser.getId());

            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.searchBills(reqUser.getId(), "elec", 20)).thenReturn(List.of(dto));

            mockMvc.perform(get("/api/bills/search")
                            .header("Authorization", BillTestDataFactory.TEST_JWT)
                            .param("query", "elec"))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", hasSize(1)))
                    .andExpect(jsonPath("$[0].id").value(1001));
        }

        @Test
        @DisplayName("should map search error to 500")
        void shouldReturn500OnSearchError() throws Exception {
            when(userServiceClient.getUserProfile(BillTestDataFactory.TEST_JWT)).thenReturn(reqUser);
            when(billService.searchBills(reqUser.getId(), "elec", 20)).thenThrow(new RuntimeException("error"));

            mockMvc.perform(get("/api/bills/search")
                            .header("Authorization", BillTestDataFactory.TEST_JWT)
                            .param("query", "elec"))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.message").value("Error searching bills: error"));
        }
    }
}
