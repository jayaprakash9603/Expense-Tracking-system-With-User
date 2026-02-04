package com.jaya.service.excel.style;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

/**
 * Factory for creating Excel cell styles with various formatting options.
 * Supports conditional formatting colors, currency, dates, and more.
 */
public class ExcelStyleFactory {
    
    // ==================== COLOR CONSTANTS ====================
    
    // Traffic light colors for conditional formatting
    public static final byte[] COLOR_GREEN = new byte[]{(byte)0, (byte)176, (byte)80};      // Success
    public static final byte[] COLOR_YELLOW = new byte[]{(byte)255, (byte)192, (byte)0};    // Warning
    public static final byte[] COLOR_RED = new byte[]{(byte)255, (byte)0, (byte)0};         // Danger/Exceeded
    public static final byte[] COLOR_ORANGE = new byte[]{(byte)255, (byte)165, (byte)0};    // Alert
    
    // Neutral colors
    public static final byte[] COLOR_LIGHT_GRAY = new byte[]{(byte)242, (byte)242, (byte)242};
    public static final byte[] COLOR_DARK_GRAY = new byte[]{(byte)89, (byte)89, (byte)89};
    public static final byte[] COLOR_WHITE = new byte[]{(byte)255, (byte)255, (byte)255};
    
    // Brand/Accent colors
    public static final byte[] COLOR_PRIMARY = new byte[]{(byte)79, (byte)129, (byte)189};  // Blue
    public static final byte[] COLOR_SECONDARY = new byte[]{(byte)155, (byte)187, (byte)89}; // Green
    public static final byte[] COLOR_ACCENT = new byte[]{(byte)128, (byte)100, (byte)162};  // Purple
    
    private final XSSFWorkbook workbook;
    
    public ExcelStyleFactory(XSSFWorkbook workbook) {
        this.workbook = workbook;
    }
    
    // ==================== HEADER STYLES ====================
    
    /**
     * Create main title style (large, bold, centered)
     */
    public XSSFCellStyle createTitleStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setColor(new XSSFColor(COLOR_PRIMARY, null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    /**
     * Create section header style
     */
    public XSSFCellStyle createSectionHeaderStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        font.setColor(new XSSFColor(COLOR_WHITE, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(COLOR_PRIMARY, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Create table header style (column headers)
     */
    public XSSFCellStyle createTableHeaderStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(COLOR_LIGHT_GRAY, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    // ==================== DATA STYLES ====================
    
    /**
     * Create default data cell style
     */
    public XSSFCellStyle createDataStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Create currency data style
     */
    public XSSFCellStyle createCurrencyStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("$#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Create percentage style
     */
    public XSSFCellStyle createPercentageStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("0.00%"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Create date style
     */
    public XSSFCellStyle createDateStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-MM-dd"));
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Create number style (no decimals)
     */
    public XSSFCellStyle createIntegerStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Create decimal style (2 decimal places)
     */
    public XSSFCellStyle createDecimalStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    // ==================== CONDITIONAL FORMATTING STYLES ====================
    
    /**
     * Create success/good status style (green background)
     */
    public XSSFCellStyle createSuccessStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setColor(new XSSFColor(COLOR_WHITE, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(COLOR_GREEN, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Create warning status style (yellow/orange background)
     */
    public XSSFCellStyle createWarningStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(COLOR_YELLOW, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Create danger/exceeded status style (red background)
     */
    public XSSFCellStyle createDangerStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setColor(new XSSFColor(COLOR_WHITE, null));
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(COLOR_RED, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Get status style based on percentage threshold
     * @param percentage 0-100 percentage value
     * @return Appropriate style (green < 80%, yellow 80-99%, red >= 100%)
     */
    public XSSFCellStyle getStatusStyle(double percentage) {
        if (percentage >= 100) {
            return createDangerStyle();
        } else if (percentage >= 80) {
            return createWarningStyle();
        } else {
            return createSuccessStyle();
        }
    }
    
    // ==================== KPI/METRIC STYLES ====================
    
    /**
     * Create KPI label style
     */
    public XSSFCellStyle createKpiLabelStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 10);
        font.setColor(new XSSFColor(COLOR_DARK_GRAY, null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    /**
     * Create KPI value style (large, bold)
     */
    public XSSFCellStyle createKpiValueStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 14);
        font.setColor(new XSSFColor(COLOR_PRIMARY, null));
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }
    
    /**
     * Create KPI value style with currency format
     */
    public XSSFCellStyle createKpiCurrencyStyle() {
        XSSFCellStyle style = createKpiValueStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("$#,##0.00"));
        return style;
    }
    
    // ==================== ALTERNATING ROW STYLES ====================
    
    /**
     * Create style for even rows (white background)
     */
    public XSSFCellStyle createEvenRowStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(COLOR_WHITE, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    /**
     * Create style for odd rows (light gray background)
     */
    public XSSFCellStyle createOddRowStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(COLOR_LIGHT_GRAY, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }
    
    // ==================== SUMMARY/TOTAL STYLES ====================
    
    /**
     * Create total row style (bold with top border)
     */
    public XSSFCellStyle createTotalRowStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        XSSFFont font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        style.setFont(font);
        style.setFillForegroundColor(new XSSFColor(COLOR_LIGHT_GRAY, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderTop(BorderStyle.DOUBLE);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setAlignment(HorizontalAlignment.RIGHT);
        return style;
    }
    
    /**
     * Create total row style with currency format
     */
    public XSSFCellStyle createTotalCurrencyStyle() {
        XSSFCellStyle style = createTotalRowStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("$#,##0.00"));
        return style;
    }
    
    // ==================== HELPER METHODS ====================
    
    /**
     * Add thin borders to all sides of a cell style
     */
    private void addBorders(XSSFCellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }
    
    /**
     * Create a custom colored style
     */
    public XSSFCellStyle createColoredStyle(byte[] rgbColor) {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(rgbColor, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addBorders(style);
        return style;
    }
    
    /**
     * Clone and modify a style with a different format
     */
    public XSSFCellStyle cloneWithFormat(XSSFCellStyle baseStyle, String formatString) {
        XSSFCellStyle newStyle = workbook.createCellStyle();
        newStyle.cloneStyleFrom(baseStyle);
        DataFormat format = workbook.createDataFormat();
        newStyle.setDataFormat(format.getFormat(formatString));
        return newStyle;
    }
}
