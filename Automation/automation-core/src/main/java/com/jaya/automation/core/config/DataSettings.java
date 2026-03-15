package com.jaya.automation.core.config;

public record DataSettings(
        String workbookPath,
        String sheetName,
        int iteration,
        int partitionIndex,
        int partitions
) {
    public boolean isEnabled() {
        return workbookPath != null && !workbookPath.isBlank();
    }
}
