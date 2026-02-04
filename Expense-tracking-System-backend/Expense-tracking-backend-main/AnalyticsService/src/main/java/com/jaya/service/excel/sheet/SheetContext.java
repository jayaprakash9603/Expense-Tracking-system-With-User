package com.jaya.service.excel.sheet;

import com.jaya.dto.report.ReportData;
import com.jaya.service.excel.style.ExcelStyleFactory;
import lombok.Builder;
import lombok.Getter;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * Context object containing all dependencies needed for sheet creation.
 * Follows Dependency Injection pattern - sheets receive what they need rather
 * than creating it.
 */
@Getter
@Builder
public class SheetContext {
    private final XSSFWorkbook workbook;
    private final ReportData data;
    private final ExcelStyleFactory styleFactory;
    private final boolean includeCharts;
    private final boolean includeFormulas;
    private final boolean includeConditionalFormatting;
}
