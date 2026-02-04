package com.jaya.service.excel.chart;

import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.*;
import org.openxmlformats.schemas.drawingml.x2006.chart.CTDLbls;

/**
 * Base class for Excel chart builders.
 * Provides common functionality for creating charts with Apache POI.
 * Follows Template Method pattern - subclasses implement specific chart types.
 */
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
    
    /**
     * Build and add the chart to the sheet
     * @return The created XSSFChart
     */
    public XSSFChart build() {
        // Create drawing patriarch
        XSSFDrawing drawing = sheet.createDrawingPatriarch();
        
        // Create anchor for chart position
        XSSFClientAnchor anchor = drawing.createAnchor(
                0, 0, 0, 0,
                position.getCol1(), position.getRow1(),
                position.getCol2(), position.getRow2()
        );
        
        // Create chart
        XSSFChart chart = drawing.createChart(anchor);
        chart.setTitleText(title);
        chart.setTitleOverlay(false);
        
        // Let subclass create specific chart type
        createChart(chart);
        
        return chart;
    }
    
    /**
     * Abstract method for subclasses to implement specific chart creation
     */
    protected abstract void createChart(XSSFChart chart);
    
    /**
     * Create data source for category (labels) axis
     */
    protected XDDFDataSource<String> createCategoryDataSource() {
        return XDDFDataSourcesFactory.fromStringCellRange(
                sheet, dataRange.getCategoryRange()
        );
    }
    
    /**
     * Create data source for numeric values
     */
    protected XDDFNumericalDataSource<Double> createValueDataSource() {
        return XDDFDataSourcesFactory.fromNumericCellRange(
                sheet, dataRange.getValueRange()
        );
    }
    
    /**
     * Helper to create a legend at bottom position
     */
    protected void addLegendAtBottom(XSSFChart chart) {
        XDDFChartLegend legend = chart.getOrAddLegend();
        legend.setPosition(LegendPosition.BOTTOM);
    }
    
    /**
     * Helper to create a legend at right position
     */
    protected void addLegendAtRight(XSSFChart chart) {
        XDDFChartLegend legend = chart.getOrAddLegend();
        legend.setPosition(LegendPosition.RIGHT);
    }
}
