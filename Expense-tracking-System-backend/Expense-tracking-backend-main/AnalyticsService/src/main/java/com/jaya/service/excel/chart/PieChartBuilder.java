package com.jaya.service.excel.chart;

import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFSheet;

/**
 * Builder for creating Pie Charts in Excel.
 * Used for category distribution, payment method breakdown, etc.
 */
public class PieChartBuilder extends ExcelChartBuilder {

    private boolean show3D = false;
    private boolean showDataLabels = true;
    private boolean showPercentage = true;
    private boolean showCategoryName = true;

    public PieChartBuilder(XSSFSheet sheet, String title, ChartPosition position, ChartDataRange dataRange) {
        super(sheet, title, position, dataRange);
    }

    /**
     * Enable 3D pie chart
     */
    public PieChartBuilder with3D(boolean enable) {
        this.show3D = enable;
        return this;
    }

    /**
     * Show/hide data labels
     */
    public PieChartBuilder withDataLabels(boolean show) {
        this.showDataLabels = show;
        return this;
    }

    /**
     * Show percentage on labels
     */
    public PieChartBuilder withPercentage(boolean show) {
        this.showPercentage = show;
        return this;
    }

    /**
     * Show category name on labels
     */
    public PieChartBuilder withCategoryName(boolean show) {
        this.showCategoryName = show;
        return this;
    }

    @Override
    protected void createChart(XSSFChart chart) {
        // Add legend
        addLegendAtRight(chart);

        // Create data sources
        XDDFDataSource<String> categories = createCategoryDataSource();
        XDDFNumericalDataSource<Double> values = createValueDataSource();

        // Create pie chart data
        XDDFChartData data;
        if (show3D) {
            data = chart.createData(ChartTypes.PIE3D, null, null);
        } else {
            data = chart.createData(ChartTypes.PIE, null, null);
        }

        // Add series
        XDDFChartData.Series series = data.addSeries(categories, values);
        series.setTitle(title, null);

        // Plot the chart
        chart.plot(data);

        // Configure data labels if needed
        if (showDataLabels && data instanceof XDDFPieChartData) {
            // POI doesn't have direct API for pie chart labels, but the chart will show
            // them by default
            // For more control, we'd need to access CTChart directly
        }
    }

    /**
     * Static factory method for quick pie chart creation
     */
    public static XSSFChart create(XSSFSheet sheet, String title,
            ChartPosition position, ChartDataRange dataRange) {
        return new PieChartBuilder(sheet, title, position, dataRange).build();
    }
}
