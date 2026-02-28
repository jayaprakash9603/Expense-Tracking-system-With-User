package com.jaya.service.excel;

import java.util.List;






public interface ExcelColumnDefinition<T> {
    


    String getSheetName();

    


    List<ExcelColumn<T>> getColumns();
}
