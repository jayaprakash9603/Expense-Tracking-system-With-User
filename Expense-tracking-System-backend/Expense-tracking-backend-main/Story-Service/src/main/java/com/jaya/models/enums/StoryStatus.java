package com.jaya.models.enums;

/**
 * Story lifecycle states
 * CREATED → ACTIVE → EXPIRED → ARCHIVED
 */
public enum StoryStatus {
    CREATED, // Just created, not yet visible
    ACTIVE, // Visible to users
    EXPIRED, // Past expiration time, no longer shown
    ARCHIVED // Permanently stored but hidden
}
