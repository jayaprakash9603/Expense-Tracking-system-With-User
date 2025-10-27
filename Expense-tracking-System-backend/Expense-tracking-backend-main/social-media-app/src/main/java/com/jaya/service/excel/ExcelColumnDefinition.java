package com.jaya.service.excel;

import java.util.List;

/**
 * Defines the column structure for a specific entity type in Excel
 * 
 * @param <T> The entity type
 */
public interface ExcelColumnDefinition<T> {
    /**
     * Get the sheet name for this entity type
     */
    String getSheetName();

    /**
     * Get the list of columns to be rendered
     */
    List<ExcelColumn<T>> getColumns();
}
