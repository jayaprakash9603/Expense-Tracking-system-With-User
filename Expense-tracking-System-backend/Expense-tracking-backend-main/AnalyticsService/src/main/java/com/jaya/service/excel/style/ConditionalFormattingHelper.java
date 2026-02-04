package com.jaya.service.excel.style;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * Utility for applying Excel conditional formatting rules.
 * Supports data bars, color scales, icon sets, and formula-based rules.
 */
public class ConditionalFormattingHelper {
    
    private final XSSFWorkbook workbook;
    private final XSSFSheet sheet;
    
    public ConditionalFormattingHelper(XSSFWorkbook workbook, XSSFSheet sheet) {
        this.workbook = workbook;
        this.sheet = sheet;
    }
    
    /**
     * Apply traffic light color scale (green-yellow-red) to a range
     * Low values = green, Middle = yellow, High = red
     * 
     * @param startRow Start row (0-based)
     * @param endRow End row (0-based)
     * @param column Column index (0-based)
     */
    public void applyTrafficLightColorScale(int startRow, int endRow, int column) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        
        ConditionalFormattingRule rule = formatting.createConditionalFormattingColorScaleRule();
        ColorScaleFormatting colorScale = rule.getColorScaleFormatting();
        
        // Set 3 thresholds
        colorScale.getThresholds()[0].setRangeType(ConditionalFormattingThreshold.RangeType.MIN);
        colorScale.getThresholds()[1].setRangeType(ConditionalFormattingThreshold.RangeType.PERCENTILE);
        colorScale.getThresholds()[1].setValue(50d);
        colorScale.getThresholds()[2].setRangeType(ConditionalFormattingThreshold.RangeType.MAX);
        
        // Set colors (green -> yellow -> red)
        colorScale.getColors()[0] = new ExtendedColor() {
            @Override public boolean isAuto() { return false; }
            @Override public void setAuto(boolean auto) {}
            @Override public boolean isIndexed() { return false; }
            @Override public short getIndex() { return 0; }
            @Override public void setIndex(int index) {}
            @Override public byte[] getRGB() { return ExcelStyleFactory.COLOR_GREEN; }
            @Override public byte[] getARGB() { return new byte[]{(byte)255, 0, (byte)176, 80}; }
            @Override public void setRGB(byte[] rgb) {}
            @Override public int getTheme() { return 0; }
            @Override public void setTheme(int idx) {}
            @Override public double getTint() { return 0; }
            @Override public void setTint(double tint) {}
            @Override protected byte[] getIndexedRGB() { return null; }
            @Override public boolean isThemed() { return false; }
        };
        
        CellRangeAddress[] regions = {new CellRangeAddress(startRow, endRow, column, column)};
        formatting.addConditionalFormatting(regions, rule);
    }
    
    /**
     * Apply data bars to a numeric column
     * 
     * @param startRow Start row (0-based)
     * @param endRow End row (0-based)
     * @param column Column index (0-based)
     * @param color Data bar color (RGB bytes)
     */
    public void applyDataBars(int startRow, int endRow, int column, byte[] color) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(
                new XSSFColor(color, null));
        DataBarFormatting dataBar = rule.getDataBarFormatting();
        
        if (dataBar != null) {
            dataBar.getMinThreshold().setRangeType(ConditionalFormattingThreshold.RangeType.MIN);
            dataBar.getMaxThreshold().setRangeType(ConditionalFormattingThreshold.RangeType.MAX);
        }
        
        CellRangeAddress[] regions = {new CellRangeAddress(startRow, endRow, column, column)};
        formatting.addConditionalFormatting(regions, rule);
    }
    
    /**
     * Apply formula-based conditional formatting
     * 
     * @param startRow Start row (0-based)
     * @param endRow End row (0-based)
     * @param startColumn Start column (0-based)
     * @param endColumn End column (0-based)
     * @param formula Formula that returns TRUE for cells to format
     * @param bgColor Background color (RGB bytes)
     */
    public void applyFormulaRule(int startRow, int endRow, int startColumn, int endColumn,
                                  String formula, byte[] bgColor) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(formula);
        PatternFormatting patternFmt = rule.createPatternFormatting();
        patternFmt.setFillBackgroundColor(new XSSFColor(bgColor, null));
        patternFmt.setFillPattern(PatternFormatting.SOLID_FOREGROUND);
        
        CellRangeAddress[] regions = {new CellRangeAddress(startRow, endRow, startColumn, endColumn)};
        formatting.addConditionalFormatting(regions, rule);
    }
    
    /**
     * Apply budget status highlighting
     * - Green: < 80% used
     * - Yellow: 80-99% used
     * - Red: >= 100% used (exceeded)
     * 
     * @param startRow Start row (0-based)
     * @param endRow End row (0-based)
     * @param percentageColumn Column containing percentage values (0-based)
     */
    public void applyBudgetStatusRules(int startRow, int endRow, int percentageColumn) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        
        String colLetter = getColumnLetter(percentageColumn);
        CellRangeAddress[] regions = {new CellRangeAddress(startRow, endRow, percentageColumn, percentageColumn)};
        
        // Rule 1: Exceeded (>= 100%) - Red
        ConditionalFormattingRule rule1 = formatting.createConditionalFormattingRule(
                ComparisonOperator.GE, "1"); // 1 = 100%
        PatternFormatting pf1 = rule1.createPatternFormatting();
        pf1.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_RED, null));
        pf1.setFillPattern(PatternFormatting.SOLID_FOREGROUND);
        
        // Rule 2: Warning (>= 80%) - Yellow
        ConditionalFormattingRule rule2 = formatting.createConditionalFormattingRule(
                ComparisonOperator.GE, "0.8"); // 0.8 = 80%
        PatternFormatting pf2 = rule2.createPatternFormatting();
        pf2.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_YELLOW, null));
        pf2.setFillPattern(PatternFormatting.SOLID_FOREGROUND);
        
        // Rule 3: OK (< 80%) - Green
        ConditionalFormattingRule rule3 = formatting.createConditionalFormattingRule(
                ComparisonOperator.LT, "0.8");
        PatternFormatting pf3 = rule3.createPatternFormatting();
        pf3.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_GREEN, null));
        pf3.setFillPattern(PatternFormatting.SOLID_FOREGROUND);
        
        // Apply rules in order (first matching rule wins)
        formatting.addConditionalFormatting(regions, rule1, rule2, rule3);
    }
    
    /**
     * Apply alternating row colors (zebra striping)
     * 
     * @param startRow Start row (0-based)
     * @param endRow End row (0-based)
     * @param startColumn Start column (0-based)
     * @param endColumn End column (0-based)
     */
    public void applyAlternatingRowColors(int startRow, int endRow, int startColumn, int endColumn) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        
        // Apply light gray to odd rows
        String formula = "MOD(ROW(),2)=1";
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(formula);
        PatternFormatting patternFmt = rule.createPatternFormatting();
        patternFmt.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_LIGHT_GRAY, null));
        patternFmt.setFillPattern(PatternFormatting.SOLID_FOREGROUND);
        
        CellRangeAddress[] regions = {new CellRangeAddress(startRow, endRow, startColumn, endColumn)};
        formatting.addConditionalFormatting(regions, rule);
    }
    
    /**
     * Highlight high expense amounts
     * 
     * @param startRow Start row (0-based)
     * @param endRow End row (0-based)
     * @param column Column index (0-based)
     * @param threshold Amount threshold
     */
    public void highlightHighAmounts(int startRow, int endRow, int column, double threshold) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(
                ComparisonOperator.GT, String.valueOf(threshold));
        
        PatternFormatting patternFmt = rule.createPatternFormatting();
        patternFmt.setFillBackgroundColor(new XSSFColor(ExcelStyleFactory.COLOR_ORANGE, null));
        patternFmt.setFillPattern(PatternFormatting.SOLID_FOREGROUND);
        
        FontFormatting fontFmt = rule.createFontFormatting();
        fontFmt.setFontStyle(false, true); // not italic, bold
        
        CellRangeAddress[] regions = {new CellRangeAddress(startRow, endRow, column, column)};
        formatting.addConditionalFormatting(regions, rule);
    }
    
    /**
     * Highlight negative amounts (e.g., for variance)
     */
    public void highlightNegativeAmounts(int startRow, int endRow, int column) {
        SheetConditionalFormatting formatting = sheet.getSheetConditionalFormatting();
        
        ConditionalFormattingRule rule = formatting.createConditionalFormattingRule(
                ComparisonOperator.LT, "0");
        
        FontFormatting fontFmt = rule.createFontFormatting();
        fontFmt.setFontColorIndex(IndexedColors.RED.getIndex());
        
        CellRangeAddress[] regions = {new CellRangeAddress(startRow, endRow, column, column)};
        formatting.addConditionalFormatting(regions, rule);
    }
    
    /**
     * Helper to convert column index to letter (0 = A, 1 = B, etc.)
     */
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
