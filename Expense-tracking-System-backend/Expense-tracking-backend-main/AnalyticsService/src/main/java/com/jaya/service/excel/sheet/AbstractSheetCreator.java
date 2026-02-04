package com.jaya.service.excel.sheet;

import com.jaya.service.excel.style.ExcelStyleFactory;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFSheet;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.function.Function;

/**
 * Abstract base class for sheet creators with common functionality.
 * Follows Template Method pattern - defines algorithm structure, subclasses fill details.
 * Implements DRY principle - common operations extracted to reusable methods.
 */
public abstract class AbstractSheetCreator implements SheetCreator {
    
    protected static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    protected static final int CHART_START_COL = 5;
    
    /**
     * Template method defining the sheet creation algorithm
     */
    @Override
    public void create(SheetContext context) {
        XSSFSheet sheet = context.getWorkbook().createSheet(getSheetName());
        
        int rowIdx = createTitle(sheet, context);
        rowIdx = createContent(sheet, context, rowIdx);
        
        configureSheet(sheet);
    }
    
    /**
     * Create the title section. Override for custom title behavior.
     */
    protected int createTitle(XSSFSheet sheet, SheetContext context) {
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue(getTitleText(context));
        titleCell.setCellStyle(context.getStyleFactory().createTitleStyle());
        
        int mergeColumns = getTitleMergeColumns();
        if (mergeColumns > 1) {
            sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, mergeColumns - 1));
        }
        
        return 2; // Return next row index
    }
    
    /**
     * Create the main content of the sheet. Subclasses must implement.
     */
    protected abstract int createContent(XSSFSheet sheet, SheetContext context, int startRow);
    
    /**
     * Get the title text for this sheet. Override for custom title.
     */
    protected String getTitleText(SheetContext context) {
        return getSheetName();
    }
    
    /**
     * Number of columns to merge for the title. Override if needed.
     */
    protected int getTitleMergeColumns() {
        return 4;
    }
    
    /**
     * Configure sheet settings after content creation
     */
    protected void configureSheet(XSSFSheet sheet) {
        PrintSetup printSetup = sheet.getPrintSetup();
        printSetup.setFitWidth((short) 1);
        printSetup.setFitHeight((short) 0);
        sheet.setFitToPage(true);
        sheet.setDefaultColumnWidth(15);
        sheet.createFreezePane(0, 1);
        sheet.setZoom(100);
        
        if (sheet.getRow(0) != null) {
            for (int i = 0; i < sheet.getRow(0).getLastCellNum(); i++) {
                sheet.autoSizeColumn(i);
                if (sheet.getColumnWidth(i) < 3000) {
                    sheet.setColumnWidth(i, 3000);
                }
                if (sheet.getColumnWidth(i) > 15000) {
                    sheet.setColumnWidth(i, 15000);
                }
            }
        }
    }
    
    // ==================== REUSABLE HELPER METHODS (DRY) ====================
    
    /**
     * Create a section header row
     */
    protected int createSectionHeader(XSSFSheet sheet, int rowIdx, String title, 
                                       ExcelStyleFactory styleFactory, int mergeColumns) {
        Row row = sheet.createRow(rowIdx);
        Cell cell = row.createCell(0);
        cell.setCellValue(title);
        cell.setCellStyle(styleFactory.createSectionHeaderStyle());
        if (mergeColumns > 1) {
            sheet.addMergedRegion(new CellRangeAddress(rowIdx, rowIdx, 0, mergeColumns - 1));
        }
        return rowIdx + 1;
    }
    
    /**
     * Create table headers from string array
     */
    protected int createTableHeaders(XSSFSheet sheet, int rowIdx, String[] headers, 
                                      ExcelStyleFactory styleFactory) {
        Row headerRow = sheet.createRow(rowIdx);
        XSSFCellStyle headerStyle = styleFactory.createTableHeaderStyle();
        
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        return rowIdx + 1;
    }
    
    /**
     * Add a KPI row with label and currency value
     */
    protected int addKpiRow(Sheet sheet, int rowIdx, String label, double value,
                            CellStyle labelStyle, CellStyle valueStyle) {
        Row row = sheet.createRow(rowIdx);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(valueStyle);
        
        return rowIdx + 1;
    }
    
    /**
     * Add a KPI row with label and integer value
     */
    protected int addKpiRowInt(Sheet sheet, int rowIdx, String label, int value,
                               CellStyle labelStyle, CellStyle valueStyle) {
        Row row = sheet.createRow(rowIdx);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(labelStyle);
        
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(valueStyle);
        
        return rowIdx + 1;
    }
    
    /**
     * Auto-size columns in a range
     */
    protected void autoSizeColumns(XSSFSheet sheet, int columnCount) {
        for (int i = 0; i < columnCount; i++) {
            sheet.autoSizeColumn(i);
        }
    }
    
    /**
     * Set specific column widths
     */
    protected void setColumnWidths(XSSFSheet sheet, int... widths) {
        for (int i = 0; i < widths.length; i++) {
            sheet.setColumnWidth(i, widths[i]);
        }
    }
    
    /**
     * Create a generic data table from a list of objects
     * Uses functional programming to extract cell values
     */
    protected <T> int createDataTable(XSSFSheet sheet, int startRow, List<T> items,
                                       String[] headers, ExcelStyleFactory styleFactory,
                                       List<CellValueExtractor<T>> extractors) {
        int rowIdx = createTableHeaders(sheet, startRow, headers, styleFactory);
        
        for (T item : items) {
            Row row = sheet.createRow(rowIdx++);
            for (int col = 0; col < extractors.size(); col++) {
                CellValueExtractor<T> extractor = extractors.get(col);
                Cell cell = row.createCell(col);
                extractor.apply(item, cell, styleFactory);
            }
        }
        
        return rowIdx;
    }
    
    /**
     * Functional interface for extracting cell values from data objects
     */
    @FunctionalInterface
    public interface CellValueExtractor<T> {
        void apply(T item, Cell cell, ExcelStyleFactory styleFactory);
    }
    
    // ==================== COMMON CELL VALUE SETTERS ====================
    
    /**
     * Create a text cell extractor
     */
    protected <T> CellValueExtractor<T> textCell(Function<T, String> getter) {
        return (item, cell, sf) -> cell.setCellValue(getter.apply(item) != null ? getter.apply(item) : "");
    }
    
    /**
     * Create a currency cell extractor
     */
    protected <T> CellValueExtractor<T> currencyCell(Function<T, Double> getter) {
        return (item, cell, sf) -> {
            cell.setCellValue(getter.apply(item));
            cell.setCellStyle(sf.createCurrencyStyle());
        };
    }
    
    /**
     * Create a percentage cell extractor
     */
    protected <T> CellValueExtractor<T> percentCell(Function<T, Double> getter) {
        return (item, cell, sf) -> {
            cell.setCellValue(getter.apply(item) / 100.0);
            cell.setCellStyle(sf.createPercentageStyle());
        };
    }
    
    /**
     * Create an integer cell extractor
     */
    protected <T> CellValueExtractor<T> intCell(Function<T, Integer> getter) {
        return (item, cell, sf) -> cell.setCellValue(getter.apply(item));
    }
    
    /**
     * Create a date cell extractor
     */
    protected <T> CellValueExtractor<T> dateCell(Function<T, LocalDate> getter) {
        return (item, cell, sf) -> {
            LocalDate date = getter.apply(item);
            cell.setCellValue(date != null ? date.format(DATE_FORMATTER) : "");
            cell.setCellStyle(sf.createDateStyle());
        };
    }
}
