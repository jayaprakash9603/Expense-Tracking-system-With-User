// File: com.jaya.models.AccessLevel.java
package com.jaya.models;

public enum AccessLevel {
    NONE,
    READ,
    WRITE,
    READ_WRITE,
    LIMITED,    // Basic access (only totals)
    SUMMARY,    // Summary access (monthly summaries)
    FULL
}