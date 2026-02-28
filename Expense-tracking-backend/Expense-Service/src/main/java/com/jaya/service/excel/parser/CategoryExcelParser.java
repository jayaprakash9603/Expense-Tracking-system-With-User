package com.jaya.service.excel.parser;

import com.jaya.models.ExpenseCategory;
import com.jaya.service.excel.util.DataParser;
import com.jaya.service.excel.util.ExcelCellReader;
import com.jaya.service.excel.util.ExcelColumnMapper;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;





@Component
public class CategoryExcelParser {

    


    public List<ExpenseCategory> parseCategories(MultipartFile file) throws IOException {
        List<ExpenseCategory> categories = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheet("ExpenseCategory Summary");
            if (sheet == null) {
                return categories; 
            }

            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

            
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                return categories;
            }

            ExcelColumnMapper columnMapper = new ExcelColumnMapper(headerRow, evaluator);

            
            int lastRow = sheet.getLastRowNum();
            for (int r = 1; r <= lastRow; r++) {
                Row row = sheet.getRow(r);
                if (row == null)
                    continue;

                ExpenseCategory category = parseCategoryRow(row, columnMapper, evaluator);
                if (category != null) {
                    categories.add(category);
                }
            }
        }

        return categories;
    }

    


    private ExpenseCategory parseCategoryRow(Row row, ExcelColumnMapper columnMapper, FormulaEvaluator evaluator) {
        ExpenseCategory category = new ExpenseCategory();

        
        Cell idCell = columnMapper.getCell(row, "ExpenseCategory ID", "CategoryId", "Category_Id");
        category.setId(ExcelCellReader.getCellValueAsInteger(idCell, evaluator));

        
        category.setName(columnMapper.getCellValue(row, evaluator,
                "ExpenseCategory Name", "CategoryName", "Name"));

        
        category.setColor(columnMapper.getCellValue(row, evaluator,
                "ExpenseCategory Color", "Color"));

        
        category.setIcon(columnMapper.getCellValue(row, evaluator,
                "ExpenseCategory Icon", "Icon"));

        
        category.setDescription(columnMapper.getCellValue(row, evaluator,
                "ExpenseCategory Description", "Description"));

        
        Cell globalCell = columnMapper.getCell(row, "Is Global", "Global");
        Boolean isGlobal = ExcelCellReader.getCellValueAsBoolean(globalCell, evaluator);
        category.setGlobal(isGlobal != null ? isGlobal : false);

        
        String userIdsStr = columnMapper.getCellValue(row, evaluator,
                "UserDTO Ids", "UserIds", "Users");
        Set<Integer> userIds = DataParser.parseIntegerSet(userIdsStr);
        if (!userIds.isEmpty()) {
            category.setUserIds(userIds);
        }

        
        String editUserIdsStr = columnMapper.getCellValue(row, evaluator,
                "Edited UserIds", "Edit UserIds", "EditedUsers");
        Set<Integer> editUserIds = DataParser.parseIntegerSet(editUserIdsStr);
        if (!editUserIds.isEmpty()) {
            category.setEditUserIds(editUserIds);
        }

        return category;
    }
}

