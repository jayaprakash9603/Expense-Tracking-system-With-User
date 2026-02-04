package com.jaya.service.excel;

import com.jaya.dto.report.ReportData;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.sheet.SheetCreator;
import com.jaya.service.excel.style.ExcelStyleFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;

/**
 * Generates comprehensive Excel reports with charts, formulas, and conditional
 * formatting.
 * 
 * <p>
 * This generator follows SOLID principles:
 * </p>
 * <ul>
 * <li><b>Single Responsibility</b>: Orchestrates sheet creation, delegates
 * actual creation to SheetCreators</li>
 * <li><b>Open/Closed</b>: New sheets can be added by creating new SheetCreator
 * implementations without modifying this class</li>
 * <li><b>Liskov Substitution</b>: All SheetCreators are interchangeable via the
 * interface</li>
 * <li><b>Interface Segregation</b>: SheetCreator interface has focused, minimal
 * methods</li>
 * <li><b>Dependency Inversion</b>: Depends on SheetCreator abstraction, not
 * concrete implementations</li>
 * </ul>
 * 
 * <p>
 * Also follows DRY principle - common functionality extracted to
 * AbstractSheetCreator
 * </p>
 * 
 * @see SheetCreator
 * @see com.jaya.service.excel.sheet.AbstractSheetCreator
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ModularVisualReportGenerator {

    /**
     * All sheet creators are automatically injected by Spring.
     * New creators are automatically included when added to the application
     * context.
     */
    private final List<SheetCreator> sheetCreators;

    /**
     * Generate a comprehensive visual Excel report.
     * 
     * @param data                         Report data containing all analytics
     * @param includeCharts                Whether to include charts
     * @param includeFormulas              Whether to include dynamic formulas
     * @param includeConditionalFormatting Whether to include conditional formatting
     * @return ByteArrayInputStream containing the Excel file
     * @throws IOException if report generation fails
     */
    public ByteArrayInputStream generateReport(ReportData data,
            boolean includeCharts,
            boolean includeFormulas,
            boolean includeConditionalFormatting) throws IOException {

        log.info("Generating visual report: {} to {}", data.getStartDate(), data.getEndDate());

        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            ExcelStyleFactory styleFactory = new ExcelStyleFactory(workbook);

            // Build context with all dependencies
            SheetContext context = SheetContext.builder()
                    .workbook(workbook)
                    .data(data)
                    .styleFactory(styleFactory)
                    .includeCharts(includeCharts)
                    .includeFormulas(includeFormulas)
                    .includeConditionalFormatting(includeConditionalFormatting)
                    .build();

            // Create sheets in order, filtering by shouldCreate
            sheetCreators.stream()
                    .filter(creator -> creator.shouldCreate(context))
                    .sorted(Comparator.comparingInt(SheetCreator::getOrder))
                    .forEach(creator -> {
                        try {
                            log.debug("Creating sheet: {}", creator.getSheetName());
                            creator.create(context);
                        } catch (Exception e) {
                            log.error("Failed to create sheet: {}", creator.getSheetName(), e);
                            // Continue with other sheets even if one fails
                        }
                    });

            workbook.write(out);
            log.info("Visual report generated successfully with {} sheets", workbook.getNumberOfSheets());
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /**
     * Generate a simple report with all features enabled.
     */
    public ByteArrayInputStream generateReport(ReportData data) throws IOException {
        return generateReport(data, true, true, true);
    }
}
