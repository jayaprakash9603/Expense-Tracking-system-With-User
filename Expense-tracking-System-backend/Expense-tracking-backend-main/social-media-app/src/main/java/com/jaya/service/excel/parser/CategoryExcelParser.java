package com.jaya.service.excel.parser;

import com.jaya.models.Category;
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

/**
 * Parser for Category entities from Excel files
 * Follows Single Responsibility Principle - only handles Category parsing
 */
@Component
public class CategoryExcelParser {

    /**
     * Parse categories from the "Category Summary" sheet
     */
    public List<Category> parseCategories(MultipartFile file) throws IOException {
        List<Category> categories = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheet("Category Summary");
            if (sheet == null) {
                return categories; // No such sheet
            }

            FormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

            // Map column headers
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                return categories;
            }

            ExcelColumnMapper columnMapper = new ExcelColumnMapper(headerRow, evaluator);

            // Parse each row
            int lastRow = sheet.getLastRowNum();
            for (int r = 1; r <= lastRow; r++) {
                Row row = sheet.getRow(r);
                if (row == null)
                    continue;

                Category category = parseCategoryRow(row, columnMapper, evaluator);
                if (category != null) {
                    categories.add(category);
                }
            }
        }

        return categories;
    }

    /**
     * Parse a single category from a row
     */
    private Category parseCategoryRow(Row row, ExcelColumnMapper columnMapper, FormulaEvaluator evaluator) {
        Category category = new Category();

        // Parse ID
        Cell idCell = columnMapper.getCell(row, "Category ID", "CategoryId", "Category_Id");
        category.setId(ExcelCellReader.getCellValueAsInteger(idCell, evaluator));

        // Parse Name
        category.setName(columnMapper.getCellValue(row, evaluator,
                "Category Name", "CategoryName", "Name"));

        // Parse Color
        category.setColor(columnMapper.getCellValue(row, evaluator,
                "Category Color", "Color"));

        // Parse Icon
        category.setIcon(columnMapper.getCellValue(row, evaluator,
                "Category Icon", "Icon"));

        // Parse Description
        category.setDescription(columnMapper.getCellValue(row, evaluator,
                "Category Description", "Description"));

        // Parse Global flag
        Cell globalCell = columnMapper.getCell(row, "Is Global", "Global");
        Boolean isGlobal = ExcelCellReader.getCellValueAsBoolean(globalCell, evaluator);
        category.setGlobal(isGlobal != null ? isGlobal : false);

        // Parse User IDs
        String userIdsStr = columnMapper.getCellValue(row, evaluator,
                "User Ids", "UserIds", "Users");
        Set<Integer> userIds = DataParser.parseIntegerSet(userIdsStr);
        if (!userIds.isEmpty()) {
            category.setUserIds(userIds);
        }

        // Parse Edited User IDs
        String editUserIdsStr = columnMapper.getCellValue(row, evaluator,
                "Edited UserIds", "Edit UserIds", "EditedUsers");
        Set<Integer> editUserIds = DataParser.parseIntegerSet(editUserIdsStr);
        if (!editUserIds.isEmpty()) {
            category.setEditUserIds(editUserIds);
        }

        return category;
    }
}
