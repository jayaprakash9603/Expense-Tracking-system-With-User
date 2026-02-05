package com.jaya.service.excel.chart;

import org.apache.poi.xddf.usermodel.*;
import org.apache.poi.xddf.usermodel.chart.*;
import org.apache.poi.xssf.usermodel.XSSFChart;
import org.apache.poi.xssf.usermodel.XSSFSheet;

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

    public LineChartBuilder withMarkers(boolean show) {
        this.showMarkers = show;
        return this;
    }

    public LineChartBuilder smooth(boolean isSmooth) {
        this.smooth = isSmooth;
        return this;
    }

    public LineChartBuilder fillArea(boolean fill) {
        this.fillArea = fill;
        return this;
    }

    public LineChartBuilder withCategoryAxisTitle(String title) {
        this.categoryAxisTitle = title;
        return this;
    }

    public LineChartBuilder withValueAxisTitle(String title) {
        this.valueAxisTitle = title;
        return this;
    }

    public LineChartBuilder withColor(int red, int green, int blue) {
        this.lineColor = XDDFColor.from(new byte[] { (byte) red, (byte) green, (byte) blue });
        return this;
    }

    @Override
    protected void createChart(XSSFChart chart) {
        addLegendAtBottom(chart);
        XDDFCategoryAxis categoryAxis = chart.createCategoryAxis(AxisPosition.BOTTOM);
        if (categoryAxisTitle != null && !categoryAxisTitle.isEmpty()) {
            categoryAxis.setTitle(categoryAxisTitle);
        }

        XDDFValueAxis valueAxis = chart.createValueAxis(AxisPosition.LEFT);
        if (valueAxisTitle != null && !valueAxisTitle.isEmpty()) {
            valueAxis.setTitle(valueAxisTitle);
        }
        valueAxis.setCrossBetween(AxisCrossBetween.BETWEEN);
        XDDFDataSource<String> categories = createCategoryDataSource();
        XDDFNumericalDataSource<Double> values = createValueDataSource();
        XDDFChartData data;
        if (fillArea) {
            data = chart.createData(ChartTypes.AREA, categoryAxis, valueAxis);
        } else {
            data = chart.createData(ChartTypes.LINE, categoryAxis, valueAxis);
        }
        XDDFChartData.Series series = data.addSeries(categories, values);
        series.setTitle(title, null);
        if (!fillArea && data instanceof XDDFLineChartData) {
            XDDFLineChartData lineData = (XDDFLineChartData) data;
            XDDFLineChartData.Series lineSeries = (XDDFLineChartData.Series) series;
            lineSeries.setSmooth(smooth);
        }
        if (lineColor != null && series instanceof XDDFLineChartData.Series) {
            XDDFLineProperties lineProps = new XDDFLineProperties();
            lineProps.setFillProperties(new XDDFSolidFillProperties(lineColor));
            ((XDDFLineChartData.Series) series).setLineProperties(lineProps);
        }
        chart.plot(data);
    }

    public static XSSFChart create(XSSFSheet sheet, String title,
            ChartPosition position, ChartDataRange dataRange,
            String categoryAxisTitle, String valueAxisTitle) {
        return new LineChartBuilder(sheet, title, position, dataRange)
                .withCategoryAxisTitle(categoryAxisTitle)
                .withValueAxisTitle(valueAxisTitle)
                .build();
    }

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
