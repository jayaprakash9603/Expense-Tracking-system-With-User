package com.jaya.automation.data.excel;

import com.jaya.automation.core.config.DataSettings;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Locale;
import java.util.Map;

public final class ExcelDatasetResolver {
    private final ExcelWorkbookReader workbookReader;

    public ExcelDatasetResolver() {
        this.workbookReader = new ExcelWorkbookReader();
    }

    public Map<String, String> resolveScenarioData(DataSettings settings, String scenarioName) {
        if (settings == null || !settings.isEnabled()) {
            return Map.of();
        }
        Path workbookPath = Path.of(settings.workbookPath());
        if (!Files.exists(workbookPath)) {
            throw new IllegalStateException("Data workbook does not exist: " + workbookPath);
        }
        List<ExcelRow> rows = workbookReader.readRows(workbookPath, settings.sheetName());
        List<ExcelRow> scopedRows = filterByScenario(rows, scenarioName);
        List<ExcelRow> partitionRows = filterByPartition(scopedRows, settings);
        if (partitionRows.isEmpty()) {
            return Map.of();
        }
        int selectedIndex = Math.floorMod(settings.iteration(), partitionRows.size());
        return partitionRows.get(selectedIndex).values();
    }

    private List<ExcelRow> filterByScenario(List<ExcelRow> rows, String scenarioName) {
        String normalizedScenario = normalize(scenarioName);
        return rows.stream()
                .filter(row -> matchesScenario(row.get("scenario"), normalizedScenario))
                .toList();
    }

    private List<ExcelRow> filterByPartition(List<ExcelRow> rows, DataSettings settings) {
        int partitions = settings.partitions();
        int partitionIndex = settings.partitionIndex();
        return rows.stream()
                .filter(row -> Math.floorMod(row.rowNumber(), partitions) == partitionIndex)
                .toList();
    }

    private boolean matchesScenario(String candidate, String normalizedScenario) {
        String normalizedCandidate = normalize(candidate);
        return "*".equals(normalizedCandidate) || normalizedCandidate.equals(normalizedScenario);
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return "";
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
