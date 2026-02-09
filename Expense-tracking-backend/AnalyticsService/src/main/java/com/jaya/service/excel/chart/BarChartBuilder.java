package com.jaya.service.excel.chart;

import org.apache.poi.xddf.usermodel.*;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFSheet;

public class BarChartBuilder extends ExcelChartBuilder {

    private boolean horizontal = false;
    private boolean stacked = false;
    private String categoryAxisTitle = "";
    private String valueAxisTitle = "";
    private XDDFColor barColor = null;

    public BarChartBuilder(XSSFSheet sheet, String title, ChartPosition position, ChartDataRange dataRange) {
        super(sheet, title, position, dataRange);
    }

    public BarChartBuilder horizontal(boolean isHorizontal) {
        this.horizontal = isHorizontal;
        return this;
    }

    public BarChartBuilder stacked(boolean isStacked) {
        this.stacked = isStacked;
        return this;
    }

    public BarChartBuilder withCategoryAxisTitle(String title) {
        this.categoryAxisTitle = title;
        return this;
    }

    public BarChartBuilder withValueAxisTitle(String title) {
        this.valueAxisTitle = title;
        return this;
    }

    public BarChartBuilder withColor(int red, int green, int blue) {
        this.barColor = XDDFColor.from(new byte[] { (byte) red, (byte) green, (byte) blue });
        return this;
    }

    @Override
    protected void createChart(XSSFChart chart) {
        addLegendAtBottom(chart);
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
        XDDFDataSource<String> categories = createCategoryDataSource();
        XDDFNumericalDataSource<Double> values = createValueDataSource();
        XDDFBarChartData data = (XDDFBarChartData) chart.createData(
                ChartTypes.BAR, categoryAxis, valueAxis);
        data.setBarDirection(horizontal ? BarDirection.BAR : BarDirection.COL);
        if (stacked) {
            data.setBarGrouping(BarGrouping.STACKED);
        } else {
            data.setBarGrouping(BarGrouping.CLUSTERED);
        }
        XDDFBarChartData.Series series = (XDDFBarChartData.Series) data.addSeries(categories, values);
        series.setTitle(title, null);
        if (barColor != null) {
            XDDFSolidFillProperties fill = new XDDFSolidFillProperties(barColor);
            series.setFillProperties(fill);
        }
        chart.plot(data);
    }

    public static XSSFChart createVertical(XSSFSheet sheet, String title,
            ChartPosition position, ChartDataRange dataRange,
            String categoryAxisTitle, String valueAxisTitle) {
        return new BarChartBuilder(sheet, title, position, dataRange)
                .withCategoryAxisTitle(categoryAxisTitle)
                .withValueAxisTitle(valueAxisTitle)
                .build();
    }

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
