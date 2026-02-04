package com.jaya.service.excel.sheet;

/**
 * Strategy interface for Excel sheet creators.
 * Follows Single Responsibility Principle - each implementation handles one
 * sheet type.
 * Follows Open/Closed Principle - new sheets can be added without modifying
 * existing code.
 */
public interface SheetCreator {

    /**
     * @return The name of the sheet to be created
     */
    String getSheetName();

    /**
     * @return The order in which this sheet should appear (lower = earlier)
     */
    default int getOrder() {
        return 100;
    }

    /**
     * Check if this sheet should be created based on available data
     * 
     * @param context The sheet context with all data
     * @return true if the sheet has data and should be created
     */
    boolean shouldCreate(SheetContext context);

    /**
     * Create the sheet with all its content
     * 
     * @param context The sheet context with workbook, data, and styles
     */
    void create(SheetContext context);
}
