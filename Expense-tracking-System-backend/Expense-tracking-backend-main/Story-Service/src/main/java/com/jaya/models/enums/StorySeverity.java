package com.jaya.models.enums;





public enum StorySeverity {
    INFO("#3B82F6"), 
    SUCCESS("#10B981"), 
    WARNING("#F59E0B"), 
    CRITICAL("#EF4444"); 

    private final String colorCode;

    StorySeverity(String colorCode) {
        this.colorCode = colorCode;
    }

    public String getColorCode() {
        return colorCode;
    }
}
