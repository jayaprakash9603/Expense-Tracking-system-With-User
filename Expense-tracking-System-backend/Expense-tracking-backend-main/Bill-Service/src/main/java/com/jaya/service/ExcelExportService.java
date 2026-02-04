package com.jaya.service;

import com.jaya.dto.BillRequestDTO;
import com.jaya.dto.DetailedExpensesDTO;
import com.jaya.models.Bill;
import com.jaya.models.DetailedExpenses;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExcelExportService {

    public void generateBillExcel(List<Bill> bills, String filePath) throws IOException {
        Workbook workbook = new XSSFWorkbook();

        // Create Bills Summary Sheet
        Sheet billsSheet = workbook.createSheet("Bills Summary");
        createBillsSheet(billsSheet, bills, workbook);

        // Create Detailed Expenses Sheet
        Sheet expensesSheet = workbook.createSheet("Detailed Expenses");
        createExpensesSheet(expensesSheet, bills, workbook);

        // Write to file
        try (FileOutputStream fileOut = new FileOutputStream(filePath)) {
            workbook.write(fileOut);
        }

        workbook.close();
    }

    private void createBillsSheet(Sheet sheet, List<Bill> bills, Workbook workbook) {
        // Create header style
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);

        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = { "Bill ID", "Name", "Description", "Amount", "Payment Method",
                "Type", "Credit Due", "Date", "Net Amount", "Category", "Category Id", "Include in Budget" };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Create data rows
        int rowNum = 1;
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        for (Bill bill : bills) {
            Row row = sheet.createRow(rowNum++);

            createCell(row, 0, bill.getId() != null ? bill.getId().toString() : "", dataStyle);
            createCell(row, 1, bill.getName(), dataStyle);
            createCell(row, 2, bill.getDescription(), dataStyle);
            createCell(row, 3, bill.getAmount(), dataStyle);
            createCell(row, 4, bill.getPaymentMethod(), dataStyle);
            createCell(row, 5, bill.getType(), dataStyle);
            createCell(row, 6, bill.getCreditDue(), dataStyle);
            createCell(row, 7, bill.getDate() != null ? bill.getDate().format(dateFormatter) : "", dataStyle);
            createCell(row, 8, bill.getNetAmount(), dataStyle);
            createCell(row, 9, bill.getCategory(), dataStyle);
            createCell(row, 10, bill.getCategoryId() != null ? bill.getCategoryId().toString() : "", dataStyle);
            createCell(row, 11, bill.isIncludeInBudget() ? "Yes" : "No", dataStyle);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private void createExpensesSheet(Sheet sheet, List<Bill> bills, Workbook workbook) {
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle dataStyle = createDataStyle(workbook);

        // Create header row
        Row headerRow = sheet.createRow(0);
        String[] headers = { "Bill ID", "Bill Name", "Item Name", "Quantity", "Unit Price", "Total Price", "Comments" };

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Create data rows
        int rowNum = 1;

        for (Bill bill : bills) {
            if (bill.getExpenses() != null && !bill.getExpenses().isEmpty()) {
                for (DetailedExpenses expense : bill.getExpenses()) {
                    Row row = sheet.createRow(rowNum++);

                    createCell(row, 0, bill.getId() != null ? bill.getId().toString() : "", dataStyle);
                    createCell(row, 1, bill.getName(), dataStyle);
                    createCell(row, 2, expense.getItemName(), dataStyle);
                    createCell(row, 3, expense.getQuantity() != null ? expense.getQuantity().toString() : "",
                            dataStyle);
                    createCell(row, 4, expense.getUnitPrice() != null ? expense.getUnitPrice() : 0.0, dataStyle);
                    createCell(row, 5, expense.getTotalPrice() != null ? expense.getTotalPrice() : 0.0, dataStyle);
                    createCell(row, 6, expense.getComments(), dataStyle);
                }
            }
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private void createCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value != null ? value : "");
        cell.setCellStyle(style);
    }

    private void createCell(Row row, int column, double value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    public List<BillRequestDTO> importBillsFromExcel(MultipartFile file) throws IOException {
        List<BillRequestDTO> bills = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            // Read Bills Summary Sheet
            Sheet billsSheet = workbook.getSheet("Bills Summary");
            if (billsSheet == null) {
                throw new IllegalArgumentException("Bills Summary sheet not found in the Excel file");
            }

            // Read Detailed Expenses Sheet
            Sheet expensesSheet = workbook.getSheet("Detailed Expenses");
            Map<Integer, List<DetailedExpensesDTO>> expensesMap = new HashMap<>();

            if (expensesSheet != null) {
                expensesMap = readExpensesSheet(expensesSheet);
            }

            // Read bills from Bills Summary sheet
            bills = readBillsSheet(billsSheet, expensesMap);
        }

        return bills;
    }

    private List<BillRequestDTO> readBillsSheet(Sheet sheet, Map<Integer, List<DetailedExpensesDTO>> expensesMap) {
        List<BillRequestDTO> bills = new ArrayList<>();
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");

        // Skip header row (row 0)
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null)
                continue;

            try {
                BillRequestDTO bill = new BillRequestDTO();

                // Read bill data from columns
                String billIdStr = getCellValueAsString(row.getCell(0));
                Integer billId = billIdStr.isEmpty() ? null : Integer.parseInt(billIdStr);
                bill.setId(billId);

                bill.setName(getCellValueAsString(row.getCell(1)));
                bill.setDescription(getCellValueAsString(row.getCell(2)));
                bill.setAmount(getCellValueAsDouble(row.getCell(3)));
                bill.setPaymentMethod(getCellValueAsString(row.getCell(4)));
                bill.setType(getCellValueAsString(row.getCell(5)));
                bill.setCreditDue(getCellValueAsDouble(row.getCell(6)));
                bill.setCategoryId((int) getCellValueAsDouble(row.getCell(10)));

                // Parse date
                String dateStr = getCellValueAsString(row.getCell(7));
                if (!dateStr.isEmpty()) {
                    try {
                        bill.setDate(LocalDate.parse(dateStr, dateFormatter));
                    } catch (Exception e) {
                        // Try alternative date formats
                        try {
                            bill.setDate(LocalDate.parse(dateStr, DateTimeFormatter.ofPattern("yyyy-MM-dd")));
                        } catch (Exception ex) {
                            System.err.println("Could not parse date: " + dateStr);
                        }
                    }
                }

                bill.setNetAmount(getCellValueAsDouble(row.getCell(8)));
                bill.setCategory(getCellValueAsString(row.getCell(9)));

                String includeInBudgetStr = getCellValueAsString(row.getCell(10));
                bill.setIncludeInBudget(
                        "Yes".equalsIgnoreCase(includeInBudgetStr) || "true".equalsIgnoreCase(includeInBudgetStr));

                // Add expenses if available
                if (billId != null && expensesMap.containsKey(billId)) {
                    bill.setExpenses(expensesMap.get(billId));
                }

                bills.add(bill);

            } catch (Exception e) {
                System.err.println("Error reading row " + i + ": " + e.getMessage());
                // Continue with next row
            }
        }

        return bills;
    }

    private Map<Integer, List<DetailedExpensesDTO>> readExpensesSheet(Sheet sheet) {
        Map<Integer, List<DetailedExpensesDTO>> expensesMap = new HashMap<>();

        // Skip header row (row 0)
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null)
                continue;

            try {
                String billIdStr = getCellValueAsString(row.getCell(0));
                if (billIdStr.isEmpty())
                    continue;

                Integer billId = Integer.parseInt(billIdStr);

                DetailedExpensesDTO expense = new DetailedExpensesDTO();
                expense.setItemName(getCellValueAsString(row.getCell(2)));

                String quantityStr = getCellValueAsString(row.getCell(3));
                expense.setQuantity(quantityStr.isEmpty() ? null : Integer.parseInt(quantityStr));

                expense.setUnitPrice(getCellValueAsDouble(row.getCell(4)));
                expense.setTotalPrice(getCellValueAsDouble(row.getCell(5)));
                expense.setComments(getCellValueAsString(row.getCell(6)));

                expensesMap.computeIfAbsent(billId, k -> new ArrayList<>()).add(expense);

            } catch (Exception e) {
                System.err.println("Error reading expense row " + i + ": " + e.getMessage());
                // Continue with next row
            }
        }

        return expensesMap;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null)
            return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toLocalDate()
                            .format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                } else {
                    // Check if it's a whole number
                    double numValue = cell.getNumericCellValue();
                    if (numValue == Math.floor(numValue)) {
                        return String.valueOf((long) numValue);
                    } else {
                        return String.valueOf(numValue);
                    }
                }
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return String.valueOf(cell.getNumericCellValue());
                } catch (Exception e) {
                    return cell.getStringCellValue().trim();
                }
            default:
                return "";
        }
    }

    private double getCellValueAsDouble(Cell cell) {
        if (cell == null)
            return 0.0;

        switch (cell.getCellType()) {
            case NUMERIC:
                return cell.getNumericCellValue();
            case STRING:
                try {
                    String value = cell.getStringCellValue().trim();
                    return value.isEmpty() ? 0.0 : Double.parseDouble(value);
                } catch (NumberFormatException e) {
                    return 0.0;
                }
            case FORMULA:
                try {
                    return cell.getNumericCellValue();
                } catch (Exception e) {
                    return 0.0;
                }
            default:
                return 0.0;
        }
    }
}