package com.jaya.service.excel.chart;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.*;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTDLbls;

public abstract class ExcelChartBuilder {

    protected final XSSFSheet sheet;
    protected final String title;
    protected final ChartPosition position;
    protected final ChartDataRange dataRange;

    protected ExcelChartBuilder(XSSFSheet sheet, String title, ChartPosition position, ChartDataRange dataRange) {
        this.sheet = sheet;
        this.title = title;
        this.position = position;
        this.dataRange = dataRange;
    }

    public XSSFChart build() {
        XSSFDrawing drawing = sheet.createDrawingPatriarch();
        XSSFClientAnchor anchor = drawing.createAnchor(
                0, 0, 0, 0,
                position.getCol1(), position.getRow1(),
                position.getCol2(), position.getRow2());
        XSSFChart chart = drawing.createChart(anchor);
        chart.setTitleText(title);
        chart.setTitleOverlay(false);
        createChart(chart);

        return chart;
    }

    protected abstract void createChart(XSSFChart chart);

    protected XDDFDataSource<String> createCategoryDataSource() {
        return XDDFDataSourcesFactory.fromStringCellRange(
                sheet, dataRange.getCategoryRange());
    }

    protected XDDFNumericalDataSource<Double> createValueDataSource() {
        return XDDFDataSourcesFactory.fromNumericCellRange(
                sheet, dataRange.getValueRange());
    }

    protected void addLegendAtBottom(XSSFChart chart) {
        XDDFChartLegend legend = chart.getOrAddLegend();
        legend.setPosition(LegendPosition.BOTTOM);
    }

    protected void addLegendAtRight(XSSFChart chart) {
        XDDFChartLegend legend = chart.getOrAddLegend();
        legend.setPosition(LegendPosition.RIGHT);
    }
}
