package com.jaya.service.excel.sheet;

public interface SheetCreator {

    String getSheetName();

    default int getOrder() {
        return 100;
    }

    boolean shouldCreate(SheetContext context);

    void create(SheetContext context);
}
