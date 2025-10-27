package com.jaya.service.excel;

import java.util.function.Function;

/**
 * Represents a single column in an Excel sheet
 * 
 * @param <T> The entity type
 */
public class ExcelColumn<T> {
    private final String header;
    private final Function<T, Object> valueExtractor;
    private final CellStyleType styleType;

    public ExcelColumn(String header, Function<T, Object> valueExtractor) {
        this(header, valueExtractor, CellStyleType.DEFAULT);
    }

    public ExcelColumn(String header, Function<T, Object> valueExtractor, CellStyleType styleType) {
        this.header = header;
        this.valueExtractor = valueExtractor;
        this.styleType = styleType;
    }

    public String getHeader() {
        return header;
    }

    public Object extractValue(T entity) {
        return valueExtractor.apply(entity);
    }

    public CellStyleType getStyleType() {
        return styleType;
    }

    public enum CellStyleType {
        DEFAULT,
        CURRENCY,
        DATE,
        PERCENTAGE,
        BOLD_HEADER
    }
}
