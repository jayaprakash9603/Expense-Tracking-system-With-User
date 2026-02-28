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

@Slf4j
@Component
public class VisualReportGenerator {
    private final List<SheetCreator> sheetCreators;

    @Autowired
    public VisualReportGenerator(List<SheetCreator> sheetCreators) {
        this.sheetCreators = sheetCreators;
        log.info("VisualReportGenerator initialized with {} sheet creators", sheetCreators.size());
    }

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
                        log.debug("Creating sheet: {} (order={})", creator.getSheetName(), creator.getOrder());
                        creator.create(context);
                    });
            applyViewSettings(workbook);

            workbook.write(out);
            log.info("Visual report generated successfully with {} sheets", workbook.getNumberOfSheets());
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

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
