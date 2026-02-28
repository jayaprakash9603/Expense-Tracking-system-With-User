package com.jaya.service.excel.style;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFCellStyle;
import org.apache.poi.xssf.usermodel.XSSFColor;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

public class ExcelStyleFactory {
    public static final byte[] COLOR_GREEN = new byte[] { (byte) 0, (byte) 176, (byte) 80 };
    public static final byte[] COLOR_YELLOW = new byte[] { (byte) 255, (byte) 192, (byte) 0 };
    public static final byte[] COLOR_RED = new byte[] { (byte) 255, (byte) 0, (byte) 0 };
    public static final byte[] COLOR_ORANGE = new byte[] { (byte) 255, (byte) 165, (byte) 0 };

    public static final byte[] COLOR_LIGHT_GRAY = new byte[] { (byte) 242, (byte) 242, (byte) 242 };
    public static final byte[] COLOR_DARK_GRAY = new byte[] { (byte) 89, (byte) 89, (byte) 89 };
    public static final byte[] COLOR_WHITE = new byte[] { (byte) 255, (byte) 255, (byte) 255 };

    public static final byte[] COLOR_PRIMARY = new byte[] { (byte) 79, (byte) 129, (byte) 189 };
    public static final byte[] COLOR_SECONDARY = new byte[] { (byte) 155, (byte) 187, (byte) 89 };
    public static final byte[] COLOR_ACCENT = new byte[] { (byte) 128, (byte) 100, (byte) 162 };

    private final XSSFWorkbook workbook;

    public ExcelStyleFactory(XSSFWorkbook workbook) {
        this.workbook = workbook;
    }

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

    public XSSFCellStyle createDataStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }

    public XSSFCellStyle createCurrencyStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("₹#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }

    public XSSFCellStyle createPercentageStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("0.00%"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }

    public XSSFCellStyle createDateStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        CreationHelper createHelper = workbook.getCreationHelper();
        style.setDataFormat(createHelper.createDataFormat().getFormat("yyyy-MM-dd"));
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }

    public XSSFCellStyle createIntegerStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }

    public XSSFCellStyle createDecimalStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("#,##0.00"));
        style.setAlignment(HorizontalAlignment.RIGHT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }

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

    public XSSFCellStyle getStatusStyle(double percentage) {
        if (percentage >= 100) {
            return createDangerStyle();
        } else if (percentage >= 80) {
            return createWarningStyle();
        } else {
            return createSuccessStyle();
        }
    }

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

    public XSSFCellStyle createKpiCurrencyStyle() {
        XSSFCellStyle style = createKpiValueStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("₹#,##0.00"));
        return style;
    }

    public XSSFCellStyle createEvenRowStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(COLOR_WHITE, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }

    public XSSFCellStyle createOddRowStyle() {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(COLOR_LIGHT_GRAY, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        addBorders(style);
        return style;
    }

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

    public XSSFCellStyle createTotalCurrencyStyle() {
        XSSFCellStyle style = createTotalRowStyle();
        DataFormat format = workbook.createDataFormat();
        style.setDataFormat(format.getFormat("₹#,##0.00"));
        return style;
    }

    private void addBorders(XSSFCellStyle style) {
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
    }

    public XSSFCellStyle createColoredStyle(byte[] rgbColor) {
        XSSFCellStyle style = workbook.createCellStyle();
        style.setFillForegroundColor(new XSSFColor(rgbColor, null));
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        addBorders(style);
        return style;
    }

    public XSSFCellStyle cloneWithFormat(XSSFCellStyle baseStyle, String formatString) {
        XSSFCellStyle newStyle = workbook.createCellStyle();
        newStyle.cloneStyleFrom(baseStyle);
        DataFormat format = workbook.createDataFormat();
        newStyle.setDataFormat(format.getFormat(formatString));
        return newStyle;
    }
}
