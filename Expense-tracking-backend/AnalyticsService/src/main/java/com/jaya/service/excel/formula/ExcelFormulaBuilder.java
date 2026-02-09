package com.jaya.service.excel.formula;

public class ExcelFormulaBuilder {

    private ExcelFormulaBuilder() {
    }

    public static String sum(String startCell, String endCell) {
        return String.format("SUM(%s:%s)", startCell, endCell);
    }

    public static String sum(String column, int startRow, int endRow) {
        return String.format("SUM(%s%d:%s%d)", column, startRow, column, endRow);
    }

    public static String average(String startCell, String endCell) {
        return String.format("AVERAGE(%s:%s)", startCell, endCell);
    }

    public static String average(String column, int startRow, int endRow) {
        return String.format("AVERAGE(%s%d:%s%d)", column, startRow, column, endRow);
    }

    public static String count(String startCell, String endCell) {
        return String.format("COUNT(%s:%s)", startCell, endCell);
    }

    public static String count(String column, int startRow, int endRow) {
        return String.format("COUNT(%s%d:%s%d)", column, startRow, column, endRow);
    }

    public static String countA(String startCell, String endCell) {
        return String.format("COUNTA(%s:%s)", startCell, endCell);
    }

    public static String max(String startCell, String endCell) {
        return String.format("MAX(%s:%s)", startCell, endCell);
    }

    public static String max(String column, int startRow, int endRow) {
        return String.format("MAX(%s%d:%s%d)", column, startRow, column, endRow);
    }

    public static String min(String startCell, String endCell) {
        return String.format("MIN(%s:%s)", startCell, endCell);
    }

    public static String min(String column, int startRow, int endRow) {
        return String.format("MIN(%s%d:%s%d)", column, startRow, column, endRow);
    }

    public static String sumIf(String criteriaRange, String criteria, String sumRange) {
        return String.format("SUMIF(%s,\"%s\",%s)", criteriaRange, criteria, sumRange);
    }

    public static String sumIf(String criteriaColumn, int startRow, int endRow,
            String criteria, String sumColumn) {
        String criteriaRange = criteriaColumn + startRow + ":" + criteriaColumn + endRow;
        String sumRange = sumColumn + startRow + ":" + sumColumn + endRow;
        return String.format("SUMIF(%s,\"%s\",%s)", criteriaRange, criteria, sumRange);
    }

    public static String countIf(String range, String criteria) {
        return String.format("COUNTIF(%s,\"%s\")", range, criteria);
    }

    public static String countIf(String column, int startRow, int endRow, String criteria) {
        return String.format("COUNTIF(%s%d:%s%d,\"%s\")", column, startRow, column, endRow, criteria);
    }

    public static String averageIf(String criteriaRange, String criteria, String avgRange) {
        return String.format("AVERAGEIF(%s,\"%s\",%s)", criteriaRange, criteria, avgRange);
    }

    public static String percentage(String valueCell, String totalCell) {
        return String.format("%s/%s*100", valueCell, totalCell);
    }

    public static String percentageOfSum(String valueCell, String sumRange) {
        return String.format("%s/SUM(%s)*100", valueCell, sumRange);
    }

    public static String variancePercentage(String currentCell, String previousCell) {
        return String.format("IF(%s=0,0,((%s-%s)/%s)*100)", previousCell, currentCell, previousCell, previousCell);
    }

    public static String ifFormula(String condition, String trueValue, String falseValue) {
        return String.format("IF(%s,%s,%s)", condition, trueValue, falseValue);
    }

    public static String ifFormulaText(String condition, String trueText, String falseText) {
        return String.format("IF(%s,\"%s\",\"%s\")", condition, trueText, falseText);
    }

    public static String statusClassification(String valueCell,
            double highThreshold, String highLabel,
            double mediumThreshold, String mediumLabel,
            String lowLabel) {
        return String.format("IF(%s>%s,\"%s\",IF(%s>%s,\"%s\",\"%s\"))",
                valueCell, highThreshold, highLabel,
                valueCell, mediumThreshold, mediumLabel, lowLabel);
    }

    public static String budgetStatus(String usedCell, String allocatedCell) {
        return String.format("IF(%s/%s>=1,\"EXCEEDED\",IF(%s/%s>=0.8,\"WARNING\",\"OK\"))",
                usedCell, allocatedCell, usedCell, allocatedCell);
    }

    public static String concatenate(String... values) {
        return String.format("CONCATENATE(%s)", String.join(",", values));
    }

    public static String text(String valueCell, String format) {
        return String.format("TEXT(%s,\"%s\")", valueCell, format);
    }

    public static String currencyFormat(String valueCell) {
        return String.format("TEXT(%s,\"₹#,##0.00\")", valueCell);
    }

    public static String percentageFormat(String valueCell) {
        return String.format("TEXT(%s,\"0.00%%\")", valueCell);
    }

    public static String monthName(String dateCell) {
        return String.format("TEXT(%s,\"MMMM\")", dateCell);
    }

    public static String year(String dateCell) {
        return String.format("YEAR(%s)", dateCell);
    }

    public static String month(String dateCell) {
        return String.format("MONTH(%s)", dateCell);
    }

    public static String dayOfWeek(String dateCell) {
        return String.format("TEXT(%s,\"dddd\")", dateCell);
    }

    public static String vlookup(String lookupValue, String tableRange, int colIndex, boolean exactMatch) {
        return String.format("VLOOKUP(%s,%s,%d,%s)",
                lookupValue, tableRange, colIndex, exactMatch ? "FALSE" : "TRUE");
    }

    public static String indexMatch(String returnRange, String lookupRange, String lookupValue) {
        return String.format("INDEX(%s,MATCH(%s,%s,0))", returnRange, lookupValue, lookupRange);
    }

    public static String cellRef(String column, int row) {
        return column + row;
    }

    public static String absoluteCellRef(String column, int row) {
        return "$" + column + "$" + row;
    }

    public static String columnLockedRef(String column, int row) {
        return "$" + column + row;
    }

    public static String rowLockedRef(String column, int row) {
        return column + "$" + row;
    }

    public static String rangeRef(String startCell, String endCell) {
        return startCell + ":" + endCell;
    }

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
