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

@Slf4j
@Component
@RequiredArgsConstructor
public class ModularVisualReportGenerator {

    private final List<SheetCreator> sheetCreators;

    public ByteArrayInputStream generateReport(ReportData data,
            boolean includeCharts,
            boolean includeFormulas,
            boolean includeConditionalFormatting) throws IOException {

        log.info("Generating visual report: {} to {}", data.getStartDate(), data.getEndDate());

        try (XSSFWorkbook workbook = new XSSFWorkbook();
                ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            ExcelStyleFactory styleFactory = new ExcelStyleFactory(workbook);

            SheetContext context = SheetContext.builder()
                    .workbook(workbook)
                    .data(data)
                    .styleFactory(styleFactory)
                    .includeCharts(includeCharts)
                    .includeFormulas(includeFormulas)
                    .includeConditionalFormatting(includeConditionalFormatting)
                    .build();

            sheetCreators.stream()
                    .filter(creator -> creator.shouldCreate(context))
                    .sorted(Comparator.comparingInt(SheetCreator::getOrder))
                    .forEach(creator -> {
                        try {
                            log.debug("Creating sheet: {}", creator.getSheetName());
                            creator.create(context);
                        } catch (Exception e) {
                            log.error("Failed to create sheet: {}", creator.getSheetName(), e);
                        }
                    });

            workbook.write(out);
            log.info("Visual report generated successfully with {} sheets", workbook.getNumberOfSheets());
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public ByteArrayInputStream generateReport(ReportData data) throws IOException {
        return generateReport(data, true, true, true);
    }
}
