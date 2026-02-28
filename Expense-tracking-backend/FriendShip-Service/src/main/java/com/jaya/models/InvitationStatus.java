
package com.jaya.models;

public enum InvitationStatus {
    PENDING("Pending"),
    ACCEPTED("Accepted"),
    DECLINED("Declined"),
    EXPIRED("Expired"),
    CANCELLED("Cancelled");

    private final String displayName;

    InvitationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}