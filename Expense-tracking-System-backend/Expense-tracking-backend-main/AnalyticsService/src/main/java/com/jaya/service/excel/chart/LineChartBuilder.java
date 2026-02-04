package com.jaya.service.excel.chart;

import org.apache.poi.xddf.usermodel.*;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFSheet;

/**
 * Builder for creating Line Charts in Excel.
 * Used for spending trends over time, monthly comparisons, etc.
 */
public class LineChartBuilder extends ExcelChartBuilder {
    
    private boolean showMarkers = true;
    private boolean smooth = false;
    private boolean fillArea = false;
    private String categoryAxisTitle = "";
    private String valueAxisTitle = "";
    private XDDFColor lineColor = null;
    
    public LineChartBuilder(XSSFSheet sheet, String title, ChartPosition position, ChartDataRange dataRange) {
        super(sheet, title, position, dataRange);
    }
    
    /**
     * Show/hide data point markers
     */
    public LineChartBuilder withMarkers(boolean show) {
        this.showMarkers = show;
        return this;
    }
    
    /**
     * Enable smooth lines (spline)
     */
    public LineChartBuilder smooth(boolean isSmooth) {
        this.smooth = isSmooth;
        return this;
    }
    
    /**
     * Fill area under the line (area chart)
     */
    public LineChartBuilder fillArea(boolean fill) {
        this.fillArea = fill;
        return this;
    }
    
    /**
     * Set category axis title (X-axis)
     */
    public LineChartBuilder withCategoryAxisTitle(String title) {
        this.categoryAxisTitle = title;
        return this;
    }
    
    /**
     * Set value axis title (Y-axis)
     */
    public LineChartBuilder withValueAxisTitle(String title) {
        this.valueAxisTitle = title;
        return this;
    }
    
    /**
     * Set line color using RGB
     */
    public LineChartBuilder withColor(int red, int green, int blue) {
        this.lineColor = XDDFColor.from(new byte[]{(byte)red, (byte)green, (byte)blue});
        return this;
    }
    
    @Override
    protected void createChart(XSSFChart chart) {
        // Add legend
        addLegendAtBottom(chart);
        
        // Create axes
        XDDFCategoryAxis categoryAxis = chart.createCategoryAxis(AxisPosition.BOTTOM);
        if (categoryAxisTitle != null && !categoryAxisTitle.isEmpty()) {
            categoryAxis.setTitle(categoryAxisTitle);
        }
        
        XDDFValueAxis valueAxis = chart.createValueAxis(AxisPosition.LEFT);
        if (valueAxisTitle != null && !valueAxisTitle.isEmpty()) {
            valueAxis.setTitle(valueAxisTitle);
        }
        valueAxis.setCrossBetween(AxisCrossBetween.BETWEEN);
        
        // Create data sources
        XDDFDataSource<String> categories = createCategoryDataSource();
        XDDFNumericalDataSource<Double> values = createValueDataSource();
        
        // Create line chart data (use area chart if fillArea is true)
        XDDFChartData data;
        if (fillArea) {
            data = chart.createData(ChartTypes.AREA, categoryAxis, valueAxis);
        } else {
            data = chart.createData(ChartTypes.LINE, categoryAxis, valueAxis);
        }
        
        // Add series
        XDDFChartData.Series series = data.addSeries(categories, values);
        series.setTitle(title, null);
        
        // Configure line-specific properties
        if (!fillArea && data instanceof XDDFLineChartData) {
            XDDFLineChartData lineData = (XDDFLineChartData) data;
            XDDFLineChartData.Series lineSeries = (XDDFLineChartData.Series) series;
            
            // Set smooth lines
            lineSeries.setSmooth(smooth);
            
            // Set marker style
            if (showMarkers) {
                lineSeries.setMarkerStyle(MarkerStyle.CIRCLE);
                lineSeries.setMarkerSize((short) 6);
            } else {
                lineSeries.setMarkerStyle(MarkerStyle.NONE);
            }
        }
        
        // Apply line color if set
        if (lineColor != null && series instanceof XDDFLineChartData.Series) {
            XDDFLineProperties lineProps = new XDDFLineProperties();
            lineProps.setFillProperties(new XDDFSolidFillProperties(lineColor));
            ((XDDFLineChartData.Series) series).setLineProperties(lineProps);
        }
        
        // Plot the chart
        chart.plot(data);
    }
    
    /**
     * Static factory method for quick line chart creation
     */
    public static XSSFChart create(XSSFSheet sheet, String title,
                                   ChartPosition position, ChartDataRange dataRange,
                                   String categoryAxisTitle, String valueAxisTitle) {
        return new LineChartBuilder(sheet, title, position, dataRange)
                .withCategoryAxisTitle(categoryAxisTitle)
                .withValueAxisTitle(valueAxisTitle)
                .build();
    }
    
    /**
     * Static factory method for area chart creation
     */
    public static XSSFChart createArea(XSSFSheet sheet, String title,
                                       ChartPosition position, ChartDataRange dataRange,
                                       String categoryAxisTitle, String valueAxisTitle) {
        return new LineChartBuilder(sheet, title, position, dataRange)
                .fillArea(true)
                .withCategoryAxisTitle(categoryAxisTitle)
                .withValueAxisTitle(valueAxisTitle)
                .build();
    }
}
