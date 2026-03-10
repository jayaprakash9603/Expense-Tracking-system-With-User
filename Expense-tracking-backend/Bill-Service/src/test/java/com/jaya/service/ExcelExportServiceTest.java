package com.jaya.service;

import com.jaya.dto.BillRequestDTO;
import com.jaya.models.Bill;
import com.jaya.testutil.BillTestDataFactory;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.file.Files;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ExcelExportServiceTest {

    private final ExcelExportService service = new ExcelExportService();

    @Test
    @DisplayName("should generate excel file with bill data")
    void shouldGenerateExcelFile() throws Exception {
        Bill bill = BillTestDataFactory.buildBill();
        File out = File.createTempFile("bill-export", ".xlsx");

        service.generateBillExcel(List.of(bill), out.getAbsolutePath());

        assertThat(out).exists();
        assertThat(Files.size(out.toPath())).isGreaterThan(0);
        out.delete();
    }

    @Test
    @DisplayName("should throw when bills summary sheet is missing")
    void shouldThrowWhenBillsSummaryMissing() throws Exception {
        byte[] bytes;
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            workbook.createSheet("Detailed Expenses");
            workbook.write(baos);
            bytes = baos.toByteArray();
        }

        MockMultipartFile file = new MockMultipartFile("file", "bills.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes);

        assertThatThrownBy(() -> service.importBillsFromExcel(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Bills Summary sheet not found");
    }

    @Test
    @DisplayName("should import bills from valid excel")
    void shouldImportBillsFromValidExcel() throws Exception {
        byte[] bytes;
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet bills = workbook.createSheet("Bills Summary");
            Row header = bills.createRow(0);
            header.createCell(0).setCellValue("Bill ID");
            header.createCell(1).setCellValue("Name");
            header.createCell(2).setCellValue("Description");
            header.createCell(3).setCellValue("Amount");
            header.createCell(4).setCellValue("Payment Method");
            header.createCell(5).setCellValue("Type");
            header.createCell(6).setCellValue("Credit Due");
            header.createCell(7).setCellValue("Date");
            header.createCell(8).setCellValue("Net Amount");
            header.createCell(9).setCellValue("Category");
            header.createCell(10).setCellValue("Category Id");
            header.createCell(11).setCellValue("Include in Budget");

            Row row = bills.createRow(1);
            row.createCell(0).setCellValue(1001);
            row.createCell(1).setCellValue("Electricity Bill");
            row.createCell(2).setCellValue("Monthly usage");
            row.createCell(3).setCellValue(2500.0);
            row.createCell(4).setCellValue("UPI");
            row.createCell(5).setCellValue("loss");
            row.createCell(6).setCellValue(100.0);
            row.createCell(7).setCellValue(LocalDate.now().toString());
            row.createCell(8).setCellValue(2600.0);
            row.createCell(9).setCellValue("Utilities");
            row.createCell(10).setCellValue(11);
            row.createCell(11).setCellValue("Yes");

            workbook.createSheet("Detailed Expenses");
            workbook.write(baos);
            bytes = baos.toByteArray();
        }

        MockMultipartFile file = new MockMultipartFile("file", "bills.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes);

        List<BillRequestDTO> result = service.importBillsFromExcel(file);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Electricity Bill");
    }

    @Test
    @DisplayName("should skip malformed rows and continue")
    void shouldSkipMalformedRows() throws Exception {
        byte[] bytes;
        try (Workbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Sheet bills = workbook.createSheet("Bills Summary");
            bills.createRow(0).createCell(0).setCellValue("Bill ID");

            Row badRow = bills.createRow(1);
            badRow.createCell(0).setCellValue("not-a-number");

            Row goodRow = bills.createRow(2);
            goodRow.createCell(0).setCellValue(1002);
            goodRow.createCell(1).setCellValue("Water Bill");
            goodRow.createCell(3).setCellValue(500.0);

            workbook.write(baos);
            bytes = baos.toByteArray();
        }

        MockMultipartFile file = new MockMultipartFile("file", "bills.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", bytes);

        List<BillRequestDTO> result = service.importBillsFromExcel(file);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Water Bill");
    }
}
