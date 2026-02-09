package com.jaya.models;

public enum GroupRole {
    ADMIN("Admin", "Full control over the group"),
    MODERATOR("Moderator", "Can manage members and expenses"),
    MEMBER("Member", "Can view and add expenses"),
    VIEWER("Viewer", "Can only view expenses");

    private final String displayName;
    private final String description;

    GroupRole(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }

    public boolean canDeleteGroup() {
        return this == ADMIN;
    }

    public boolean canEditGroupSettings() {
        return this == ADMIN;
    }

    public boolean canManageMembers() {
        return this == ADMIN || this == MODERATOR;
    }

    public boolean canManageExpenses() {
        return this == ADMIN || this == MODERATOR || this == MEMBER;
    }

    public boolean canViewExpenses() {
        return true;
    }

    public boolean canAddExpenses() {
        return this == ADMIN || this == MODERATOR || this == MEMBER;
    }

    public boolean canEditExpenses() {
        return this == ADMIN || this == MODERATOR;
    }

    public boolean canDeleteExpenses() {
        return this == ADMIN || this == MODERATOR;
    }

    public boolean canPromoteMembers() {
        return this == ADMIN;
    }

    public boolean canDemoteMembers() {
        return this == ADMIN;
    }
}