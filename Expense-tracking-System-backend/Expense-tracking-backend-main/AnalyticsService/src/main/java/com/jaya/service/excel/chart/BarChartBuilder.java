package com.jaya.service.excel.chart;

import org.apache.poi.xddf.usermodel.*;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFSheet;

/**
 * Builder for creating Bar Charts in Excel.
 * Used for daily spending, monthly trends, payment method comparison, etc.
 */
public class BarChartBuilder extends ExcelChartBuilder {

    private boolean horizontal = false;
    private boolean stacked = false;
    private String categoryAxisTitle = "";
    private String valueAxisTitle = "";
    private XDDFColor barColor = null;

    public BarChartBuilder(XSSFSheet sheet, String title, ChartPosition position, ChartDataRange dataRange) {
        super(sheet, title, position, dataRange);
    }

    /**
     * Make bars horizontal (default is vertical)
     */
    public BarChartBuilder horizontal(boolean isHorizontal) {
        this.horizontal = isHorizontal;
        return this;
    }

    /**
     * Enable stacked bars
     */
    public BarChartBuilder stacked(boolean isStacked) {
        this.stacked = isStacked;
        return this;
    }

    /**
     * Set category axis title (X-axis for vertical bars)
     */
    public BarChartBuilder withCategoryAxisTitle(String title) {
        this.categoryAxisTitle = title;
        return this;
    }

    /**
     * Set value axis title (Y-axis for vertical bars)
     */
    public BarChartBuilder withValueAxisTitle(String title) {
        this.valueAxisTitle = title;
        return this;
    }

    /**
     * Set bar color using RGB
     */
    public BarChartBuilder withColor(int red, int green, int blue) {
        this.barColor = XDDFColor.from(new byte[] { (byte) red, (byte) green, (byte) blue });
        return this;
    }

    @Override
    protected void createChart(XSSFChart chart) {
        // Add legend
        addLegendAtBottom(chart);

        // Create axes
        XDDFCategoryAxis categoryAxis = chart.createCategoryAxis(
                horizontal ? AxisPosition.LEFT : AxisPosition.BOTTOM);
        if (categoryAxisTitle != null && !categoryAxisTitle.isEmpty()) {
            categoryAxis.setTitle(categoryAxisTitle);
        }

        XDDFValueAxis valueAxis = chart.createValueAxis(
                horizontal ? AxisPosition.BOTTOM : AxisPosition.LEFT);
        if (valueAxisTitle != null && !valueAxisTitle.isEmpty()) {
            valueAxis.setTitle(valueAxisTitle);
        }
        valueAxis.setCrossBetween(AxisCrossBetween.BETWEEN);

        // Create data sources
        XDDFDataSource<String> categories = createCategoryDataSource();
        XDDFNumericalDataSource<Double> values = createValueDataSource();

        // Create bar chart data
        XDDFBarChartData data = (XDDFBarChartData) chart.createData(
                ChartTypes.BAR, categoryAxis, valueAxis);

        // Set bar direction
        data.setBarDirection(horizontal ? BarDirection.BAR : BarDirection.COL);

        // Set grouping for stacked bars
        if (stacked) {
            data.setBarGrouping(BarGrouping.STACKED);
        } else {
            data.setBarGrouping(BarGrouping.CLUSTERED);
        }

        // Add series
        XDDFBarChartData.Series series = (XDDFBarChartData.Series) data.addSeries(categories, values);
        series.setTitle(title, null);

        // Apply color if set
        if (barColor != null) {
            XDDFSolidFillProperties fill = new XDDFSolidFillProperties(barColor);
            series.setFillProperties(fill);
        }

        // Plot the chart
        chart.plot(data);
    }

    /**
     * Static factory method for quick vertical bar chart creation
     */
    public static XSSFChart createVertical(XSSFSheet sheet, String title,
            ChartPosition position, ChartDataRange dataRange,
            String categoryAxisTitle, String valueAxisTitle) {
        return new BarChartBuilder(sheet, title, position, dataRange)
                .withCategoryAxisTitle(categoryAxisTitle)
                .withValueAxisTitle(valueAxisTitle)
                .build();
    }

    /**
     * Static factory method for quick horizontal bar chart creation
     */
    public static XSSFChart createHorizontal(XSSFSheet sheet, String title,
            ChartPosition position, ChartDataRange dataRange,
            String categoryAxisTitle, String valueAxisTitle) {
        return new BarChartBuilder(sheet, title, position, dataRange)
                .horizontal(true)
                .withCategoryAxisTitle(categoryAxisTitle)
                .withValueAxisTitle(valueAxisTitle)
                .build();
    }
}
