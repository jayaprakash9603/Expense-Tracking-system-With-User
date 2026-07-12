package com.jaya.common.deletion;

public final class AccountDeletionTopics {

    public static final String PURGE_COMMANDS = "user.deletion.purge.commands";
    public static final String PURGE_RESULTS = "user.deletion.purge.results";
    public static final String PURGE_DLQ = "user.deletion.purge.dlq";
    public static final String LIFECYCLE_EVENTS = "user.deletion.lifecycle";

    private AccountDeletionTopics() {
    }
}
