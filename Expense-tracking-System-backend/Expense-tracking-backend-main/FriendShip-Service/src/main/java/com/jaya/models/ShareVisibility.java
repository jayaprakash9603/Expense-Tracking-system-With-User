package com.jaya.models;

/**
 * Enum representing the visibility level of a shared resource.
 * Controls who can access the shared data.
 */
public enum ShareVisibility {
    /**
     * Anyone with the link can access (discoverable in public shares).
     */
    PUBLIC,

    /**
     * Only the owner's friends can access.
     */
    FRIENDS_ONLY,

    /**
     * Only specific users (selected by owner) can access.
     */
    SPECIFIC_USERS,

    /**
     * Only users with the direct link can access (not discoverable).
     */
    LINK_ONLY
}
