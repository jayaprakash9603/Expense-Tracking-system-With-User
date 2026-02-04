package com.jaya.service.excel;

import com.jaya.dto.report.ReportData;
import com.jaya.service.excel.sheet.SheetContext;
import com.jaya.service.excel.sheet.SheetCreator;
import com.jaya.service.excel.style.ExcelStyleFactory;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.Comparator;
import java.util.List;

/**
 * Generates comprehensive Excel reports with charts, formulas, and conditional formatting.
 * 
 * <p>This generator follows SOLID principles:</p>
 * <ul>
 *   <li><b>Single Responsibility</b>: Orchestrates sheet creation, delegates actual creation to SheetCreators</li>
 *   <li><b>Open/Closed</b>: New sheets can be added by creating new SheetCreator implementations without modifying this class</li>
 *   <li><b>Liskov Substitution</b>: All SheetCreators are interchangeable via the interface</li>
 *   <li><b>Interface Segregation</b>: SheetCreator interface has focused, minimal methods</li>
 *   <li><b>Dependency Inversion</b>: Depends on SheetCreator abstraction, not concrete implementations</li>
 * </ul>
 * 
 * <p>Also follows DRY principle - common functionality extracted to AbstractSheetCreator</p>
 * 
 * @see SheetCreator
 * @see com.jaya.service.excel.sheet.AbstractSheetCreator
 */
@Slf4j
@Component
public class VisualReportGenerator {

    /**
     * All sheet creators are automatically injected by Spring.
     * New creators are automatically included when added to the application context.
     */
    private final List<SheetCreator> sheetCreators;
    
    @Autowired
    public VisualReportGenerator(List<SheetCreator> sheetCreators) {
        this.sheetCreators = sheetCreators;
        log.info("VisualReportGenerator initialized with {} sheet creators", sheetCreators.size());
    }

    /**
     * Generate a comprehensive visual Excel report.
     * 
     * <p>Delegates to individual SheetCreators using Strategy pattern.
     * Creators are filtered, sorted, and executed in order.</p>
     * 
     * @param data                         Report data containing all analytics
     * @param includeCharts                Whether to include charts
     * @param includeFormulas              Whether to include dynamic formulas
     * @param includeConditionalFormatting Whether to include conditional formatting
     * @return ByteArrayInputStream containing the Excel file
     * @throws IOException if workbook cannot be written
     */
    public ByteArrayInputStream generateReport(ReportData data,
            boolean includeCharts,
            boolean includeFormulas,
            boolean includeConditionalFormatting) throws IOException {

        log.info("Generating visual report: {} to {}", data.getStartDate(), data.getEndDate());

        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            ExcelStyleFactory styleFactory = new ExcelStyleFactory(workbook);

            // Build context with all dependencies and feature flags
            SheetContext context = SheetContext.builder()
                    .workbook(workbook)
                    .data(data)
                    .styleFactory(styleFactory)
                    .includeCharts(includeCharts)
                    .includeFormulas(includeFormulas)
                    .includeConditionalFormatting(includeConditionalFormatting)
                    .build();

            // Execute sheet creators in order
            sheetCreators.stream()
                    .filter(creator -> creator.shouldCreate(context))
                    .sorted(Comparator.comparingInt(SheetCreator::getOrder))
                    .forEach(creator -> {
                        log.debug("Creating sheet: {} (order={})", creator.getSheetName(), creator.getOrder());
                        creator.create(context);
                    });

            // Apply fit-to-page settings to all sheets
            applyViewSettings(workbook);

            workbook.write(out);
            log.info("Visual report generated successfully with {} sheets", workbook.getNumberOfSheets());
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    /**
     * Apply view settings to all sheets for better readability
     */
    private void applyViewSettings(XSSFWorkbook workbook) {
        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            var sheet = workbook.getSheetAt(i);
            sheet.setFitToPage(true);
            var printSetup = sheet.getPrintSetup();
            printSetup.setFitWidth((short) 1);
            printSetup.setFitHeight((short) 0);
        }
    }
}
