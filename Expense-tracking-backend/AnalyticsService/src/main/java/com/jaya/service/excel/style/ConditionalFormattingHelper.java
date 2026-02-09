package com.jaya.service.excel.style;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ConditionalFormattingHelper {

    private final XSSFWorkbook workbook;
    private final XSSFSheet sheet;

    public ConditionalFormattingHelper(XSSFWorkbook workbook, XSSFSheet sheet) {
        this.workbook = workbook;
        this.sheet = sheet;
    }

    public void applyTrafficLightColorScale(int startRow, int endRow, int column) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        ConditionalFormattingRule rule = formatting.createConditionalFormattingColorScaleRule();
        ColorScaleFormatting colorScale = rule.getColorScaleFormatting();

        colorScale.getThresholds()[0].setRangeType(ConditionalFormattingThreshold.RangeType.MIN);
        colorScale.getThresholds()[1].setRangeType(ConditionalFormattingThreshold.RangeType.PERCENTILE);
        colorScale.getThresholds()[1].setValue(50d);
        colorScale.getThresholds()[2].setRangeType(ConditionalFormattingThreshold.RangeType.MAX);

        CellRangeAddress[] regions = { new CellRangeAddress(startRow, endRow, column, column) };
        formatting.addConditionalFormatting(regions, rule);
    }

    public void applyDataBars(int startRow, int endRow, int column, byte[] color) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(new XSSFColor(color, null));
        DataBarFormatting dataBar = rule.getDataBarFormatting();

        if (dataBar != null) {
            dataBar.getMinThreshold().setRangeType(ConditionalFormattingThreshold.RangeType.MIN);
            dataBar.getMaxThreshold().setRangeType(ConditionalFormattingThreshold.RangeType.MAX);
        }

        CellRangeAddress[] regions = { new CellRangeAddress(startRow, endRow, column, column) };
        formatting.addConditionalFormatting(regions, rule);
    }

    public void applyFormulaRule(int startRow, int endRow, int startColumn, int endColumn,
            String formula, byte[] bgColor) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(formula);
        PatternFormatting patternFmt = rule.createPatternFormatting();
        patternFmt.setFillBackgroundColor(new XSSFColor(bgColor, null));
        patternFmt.setFillPattern(PatternFormatting.SOLID_FOREGROUND);

        CellRangeAddress[] regions = { new CellRangeAddress(startRow, endRow, startColumn, endColumn) };
        formatting.addConditionalFormatting(regions, rule);
    }

    public void applyBudgetStatusRules(int startRow, int endRow, int percentageColumn) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        CellRangeAddress[] regions = { new CellRangeAddress(startRow, endRow, percentageColumn, percentageColumn) };

        ConditionalFormattingRule rule1 = formatting.createConditionalFormattingRule(ComparisonOperator.GE, "1");
        PatternFormatting pf1 = rule1.createPatternFormatting();
        pf1.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_RED, null));
        pf1.setFillPattern(PatternFormatting.SOLID_FOREGROUND);

        ConditionalFormattingRule rule2 = formatting.createConditionalFormattingRule(ComparisonOperator.GE, "0.8");
        PatternFormatting pf2 = rule2.createPatternFormatting();
        pf2.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_YELLOW, null));
        pf2.setFillPattern(PatternFormatting.SOLID_FOREGROUND);

        ConditionalFormattingRule rule3 = formatting.createConditionalFormattingRule(ComparisonOperator.LT, "0.8");
        PatternFormatting pf3 = rule3.createPatternFormatting();
        pf3.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_GREEN, null));
        pf3.setFillPattern(PatternFormatting.SOLID_FOREGROUND);

        ConditionalFormattingRule[] rules = { rule1, rule2, rule3 };
        formatting.addConditionalFormatting(regions, rules);
    }

    public void applyAlternatingRowColors(int startRow, int endRow, int startColumn, int endColumn) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        String formula = "MOD(ROW(),2)=1";
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(formula);
        PatternFormatting patternFmt = rule.createPatternFormatting();
        patternFmt.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_LIGHT_GRAY, null));
        patternFmt.setFillPattern(PatternFormatting.SOLID_FOREGROUND);

        CellRangeAddress[] regions = { new CellRangeAddress(startRow, endRow, startColumn, endColumn) };
        formatting.addConditionalFormatting(regions, rule);
    }

    public void highlightHighAmounts(int startRow, int endRow, int column, double threshold) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(ComparisonOperator.GT,
                String.valueOf(threshold));
        PatternFormatting patternFmt = rule.createPatternFormatting();
        patternFmt.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_ORANGE, null));
        patternFmt.setFillPattern(PatternFormatting.SOLID_FOREGROUND);
        FontFormatting fontFmt = rule.createFontFormatting();
        fontFmt.setFontStyle(false, true);

        CellRangeAddress[] regions = { new CellRangeAddress(startRow, endRow, column, column) };
        formatting.addConditionalFormatting(regions, rule);
    }

    public void highlightNegativeAmounts(int startRow, int endRow, int column) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(ComparisonOperator.LT, "0");
        FontFormatting fontFmt = rule.createFontFormatting();
        fontFmt.setFontColorIndex(IndexedColors.RED.getIndex());

        CellRangeAddress[] regions = { new CellRangeAddress(startRow, endRow, column, column) };
        formatting.addConditionalFormatting(regions, rule);
    }

    private String getColumnLetter(int columnIndex) {
        StringBuilder sb = new StringBuilder();
        int index = columnIndex;
        while (index >= 0) {
            sb.insert(0, (char) ('A' + (index % 26)));
            index = index / 26 - 1;
        }
        return sb.toString();
    }
}
