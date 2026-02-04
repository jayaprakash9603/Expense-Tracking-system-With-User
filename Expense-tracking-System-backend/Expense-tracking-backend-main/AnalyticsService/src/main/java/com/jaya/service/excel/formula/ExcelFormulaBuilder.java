package com.jaya.service.excel.formula;

/**
 * Utility class for building Excel formulas programmatically.
 * Provides type-safe formula construction for common Excel functions.
 */
public class ExcelFormulaBuilder {
    
    private ExcelFormulaBuilder() {
        // Utility class - prevent instantiation
    }
    
    // ==================== BASIC AGGREGATION FORMULAS ====================
    
    /**
     * Create a SUM formula for a range
     * @param startCell e.g., "B2"
     * @param endCell e.g., "B100"
     * @return Formula string like "=SUM(B2:B100)"
     */
    public static String sum(String startCell, String endCell) {
        return String.format("SUM(%s:%s)", startCell, endCell);
    }
    
    /**
     * Create a SUM formula for a column range
     * @param column Column letter (e.g., "B")
     * @param startRow Start row number (1-based)
     * @param endRow End row number (1-based)
     */
    public static String sum(String column, int startRow, int endRow) {
        return String.format("SUM(%s%d:%s%d)", column, startRow, column, endRow);
    }
    
    /**
     * Create an AVERAGE formula for a range
     */
    public static String average(String startCell, String endCell) {
        return String.format("AVERAGE(%s:%s)", startCell, endCell);
    }
    
    /**
     * Create an AVERAGE formula for a column range
     */
    public static String average(String column, int startRow, int endRow) {
        return String.format("AVERAGE(%s%d:%s%d)", column, startRow, column, endRow);
    }
    
    /**
     * Create a COUNT formula for a range
     */
    public static String count(String startCell, String endCell) {
        return String.format("COUNT(%s:%s)", startCell, endCell);
    }
    
    /**
     * Create a COUNT formula for a column range
     */
    public static String count(String column, int startRow, int endRow) {
        return String.format("COUNT(%s%d:%s%d)", column, startRow, column, endRow);
    }
    
    /**
     * Create a COUNTA formula (counts non-empty cells)
     */
    public static String countA(String startCell, String endCell) {
        return String.format("COUNTA(%s:%s)", startCell, endCell);
    }
    
    /**
     * Create a MAX formula for a range
     */
    public static String max(String startCell, String endCell) {
        return String.format("MAX(%s:%s)", startCell, endCell);
    }
    
    /**
     * Create a MAX formula for a column range
     */
    public static String max(String column, int startRow, int endRow) {
        return String.format("MAX(%s%d:%s%d)", column, startRow, column, endRow);
    }
    
    /**
     * Create a MIN formula for a range
     */
    public static String min(String startCell, String endCell) {
        return String.format("MIN(%s:%s)", startCell, endCell);
    }
    
    /**
     * Create a MIN formula for a column range
     */
    public static String min(String column, int startRow, int endRow) {
        return String.format("MIN(%s%d:%s%d)", column, startRow, column, endRow);
    }
    
    // ==================== CONDITIONAL AGGREGATION FORMULAS ====================
    
    /**
     * Create a SUMIF formula
     * @param criteriaRange Range to check criteria (e.g., "A:A")
     * @param criteria Criteria to match (e.g., "Food" or ">100")
     * @param sumRange Range to sum (e.g., "B:B")
     */
    public static String sumIf(String criteriaRange, String criteria, String sumRange) {
        return String.format("SUMIF(%s,\"%s\",%s)", criteriaRange, criteria, sumRange);
    }
    
    /**
     * Create a SUMIF formula for column ranges
     */
    public static String sumIf(String criteriaColumn, int startRow, int endRow, 
                               String criteria, String sumColumn) {
        String criteriaRange = criteriaColumn + startRow + ":" + criteriaColumn + endRow;
        String sumRange = sumColumn + startRow + ":" + sumColumn + endRow;
        return String.format("SUMIF(%s,\"%s\",%s)", criteriaRange, criteria, sumRange);
    }
    
    /**
     * Create a COUNTIF formula
     */
    public static String countIf(String range, String criteria) {
        return String.format("COUNTIF(%s,\"%s\")", range, criteria);
    }
    
    /**
     * Create a COUNTIF formula for a column range
     */
    public static String countIf(String column, int startRow, int endRow, String criteria) {
        return String.format("COUNTIF(%s%d:%s%d,\"%s\")", column, startRow, column, endRow, criteria);
    }
    
    /**
     * Create an AVERAGEIF formula
     */
    public static String averageIf(String criteriaRange, String criteria, String avgRange) {
        return String.format("AVERAGEIF(%s,\"%s\",%s)", criteriaRange, criteria, avgRange);
    }
    
    // ==================== PERCENTAGE & RATIO FORMULAS ====================
    
    /**
     * Create a percentage formula: (value/total)*100
     * @param valueCell Cell containing the value (e.g., "B2")
     * @param totalCell Cell containing the total (e.g., "B$10") - use $ for absolute reference
     */
    public static String percentage(String valueCell, String totalCell) {
        return String.format("%s/%s*100", valueCell, totalCell);
    }
    
    /**
     * Create a percentage formula with SUM as total
     */
    public static String percentageOfSum(String valueCell, String sumRange) {
        return String.format("%s/SUM(%s)*100", valueCell, sumRange);
    }
    
    /**
     * Create a variance percentage formula: ((current-previous)/previous)*100
     */
    public static String variancePercentage(String currentCell, String previousCell) {
        return String.format("IF(%s=0,0,((%s-%s)/%s)*100)", previousCell, currentCell, previousCell, previousCell);
    }
    
    // ==================== CONDITIONAL FORMULAS ====================
    
    /**
     * Create an IF formula
     */
    public static String ifFormula(String condition, String trueValue, String falseValue) {
        return String.format("IF(%s,%s,%s)", condition, trueValue, falseValue);
    }
    
    /**
     * Create an IF formula with string values
     */
    public static String ifFormulaText(String condition, String trueText, String falseText) {
        return String.format("IF(%s,\"%s\",\"%s\")", condition, trueText, falseText);
    }
    
    /**
     * Create a nested IF formula for status classification
     * e.g., High (>1000), Medium (>500), Low
     */
    public static String statusClassification(String valueCell, 
                                              double highThreshold, String highLabel,
                                              double mediumThreshold, String mediumLabel,
                                              String lowLabel) {
        return String.format("IF(%s>%s,\"%s\",IF(%s>%s,\"%s\",\"%s\"))",
                valueCell, highThreshold, highLabel,
                valueCell, mediumThreshold, mediumLabel, lowLabel);
    }
    
    /**
     * Create a budget status formula
     */
    public static String budgetStatus(String usedCell, String allocatedCell) {
        return String.format("IF(%s/%s>=1,\"EXCEEDED\",IF(%s/%s>=0.8,\"WARNING\",\"OK\"))",
                usedCell, allocatedCell, usedCell, allocatedCell);
    }
    
    // ==================== TEXT FORMULAS ====================
    
    /**
     * Create a CONCATENATE formula
     */
    public static String concatenate(String... values) {
        return String.format("CONCATENATE(%s)", String.join(",", values));
    }
    
    /**
     * Create a TEXT formula for number formatting
     */
    public static String text(String valueCell, String format) {
        return String.format("TEXT(%s,\"%s\")", valueCell, format);
    }
    
    /**
     * Currency format using TEXT
     */
    public static String currencyFormat(String valueCell) {
        return String.format("TEXT(%s,\"$#,##0.00\")", valueCell);
    }
    
    /**
     * Percentage format using TEXT
     */
    public static String percentageFormat(String valueCell) {
        return String.format("TEXT(%s,\"0.00%%\")", valueCell);
    }
    
    // ==================== DATE FORMULAS ====================
    
    /**
     * Get month name from date
     */
    public static String monthName(String dateCell) {
        return String.format("TEXT(%s,\"MMMM\")", dateCell);
    }
    
    /**
     * Get year from date
     */
    public static String year(String dateCell) {
        return String.format("YEAR(%s)", dateCell);
    }
    
    /**
     * Get month number from date
     */
    public static String month(String dateCell) {
        return String.format("MONTH(%s)", dateCell);
    }
    
    /**
     * Get day of week name
     */
    public static String dayOfWeek(String dateCell) {
        return String.format("TEXT(%s,\"dddd\")", dateCell);
    }
    
    // ==================== LOOKUP FORMULAS ====================
    
    /**
     * Create a VLOOKUP formula
     */
    public static String vlookup(String lookupValue, String tableRange, int colIndex, boolean exactMatch) {
        return String.format("VLOOKUP(%s,%s,%d,%s)", 
                lookupValue, tableRange, colIndex, exactMatch ? "FALSE" : "TRUE");
    }
    
    /**
     * Create an INDEX/MATCH formula (more flexible than VLOOKUP)
     */
    public static String indexMatch(String returnRange, String lookupRange, String lookupValue) {
        return String.format("INDEX(%s,MATCH(%s,%s,0))", returnRange, lookupValue, lookupRange);
    }
    
    // ==================== HELPER METHODS ====================
    
    /**
     * Create a cell reference from column and row
     */
    public static String cellRef(String column, int row) {
        return column + row;
    }
    
    /**
     * Create an absolute cell reference (locked with $)
     */
    public static String absoluteCellRef(String column, int row) {
        return "$" + column + "$" + row;
    }
    
    /**
     * Create a mixed reference (column locked)
     */
    public static String columnLockedRef(String column, int row) {
        return "$" + column + row;
    }
    
    /**
     * Create a mixed reference (row locked)
     */
    public static String rowLockedRef(String column, int row) {
        return column + "$" + row;
    }
    
    /**
     * Create a range reference
     */
    public static String rangeRef(String startCell, String endCell) {
        return startCell + ":" + endCell;
    }
    
    /**
     * Convert column index (0-based) to letter
     */
    public static String columnLetter(int columnIndex) {
        StringBuilder sb = new StringBuilder();
        int index = columnIndex;
        while (index >= 0) {
            sb.insert(0, (char) ('A' + (index % 26)));
            index = index / 26 - 1;
        }
        return sb.toString();
    }
}
