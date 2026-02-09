package com.jaya.service.excel.chart;

import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFSheet;

public class PieChartBuilder extends ExcelChartBuilder {

    private boolean show3D = false;
    private boolean showDataLabels = true;
    private boolean showPercentage = true;
    private boolean showCategoryName = true;

    public PieChartBuilder(XSSFSheet sheet, String title, ChartPosition position, ChartDataRange dataRange) {
        super(sheet, title, position, dataRange);
    }

    public PieChartBuilder with3D(boolean enable) {
        this.show3D = enable;
        return this;
    }

    public PieChartBuilder withDataLabels(boolean show) {
        this.showDataLabels = show;
        return this;
    }

    public PieChartBuilder withPercentage(boolean show) {
        this.showPercentage = show;
        return this;
    }

    public PieChartBuilder withCategoryName(boolean show) {
        this.showCategoryName = show;
        return this;
    }

    @Override
    protected void createChart(XSSFChart chart) {
        addLegendAtRight(chart);
        XDDFDataSource<String> categories = createCategoryDataSource();
        XDDFNumericalDataSource<Double> values = createValueDataSource();
        XDDFChartData data;
        if (show3D) {
            data = chart.createData(ChartTypes.PIE3D, null, null);
        } else {
            data = chart.createData(ChartTypes.PIE, null, null);
        }
        XDDFChartData.Series series = data.addSeries(categories, values);
        series.setTitle(title, null);
        chart.plot(data);
        if (showDataLabels && data instanceof XDDFPieChartData) {
        }
    }

    public static XSSFChart create(XSSFSheet sheet, String title,
            ChartPosition position, ChartDataRange dataRange) {
        return new PieChartBuilder(sheet, title, position, dataRange).build();
    }
}
