package com.jaya.dto;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum AnalyticsEntityType {
    CATEGORY,
    PAYMENT_METHOD,
    BILL;

    @JsonCreator
    public static AnalyticsEntityType fromValue(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase().replace('-', '_').replace(' ', '_');
        for (AnalyticsEntityType type : values()) {
            if (type.name().equals(normalized)) {
                return type;
            }
        }
        return null;
    }
}
