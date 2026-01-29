package com.jaya.models;

/**
 * Defines the permission level for shared resources.
 * VIEW: Read-only access to shared data
 * EDIT: Can add/update but NEVER delete shared data
 */
public enum SharePermission {
    VIEW, // Read-only access
    EDIT // Add/Update only (never delete)
}
