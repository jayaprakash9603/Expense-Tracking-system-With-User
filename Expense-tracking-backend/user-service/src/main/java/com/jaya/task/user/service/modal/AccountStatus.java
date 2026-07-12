package com.jaya.task.user.service.modal;

/**
 * Lifecycle states for an account under the five-day deletion policy.
 *
 * <pre>
 * ACTIVE --request--> DELETION_PENDING --grace elapsed--> PURGING --success--> DELETED
 *                              |                             |
 *                              +---cancel--> ACTIVE          +---exhausted--> FAILED
 *                                                                             |
 *                                                                             +--admin retry--> PURGING
 * </pre>
 */
public enum AccountStatus {
    ACTIVE,
    DELETION_PENDING,
    PURGING,
    FAILED,
    DELETED
}
