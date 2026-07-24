package com.jaya.task.user.service.util;

import com.jaya.task.user.service.modal.AccountStatus;
import com.jaya.task.user.service.modal.User;
import com.jaya.task.user.service.response.AuthResponse;

public final class AuthDeletionMetadata {

    private AuthDeletionMetadata() {
    }

    public static void apply(AuthResponse response, User user) {
        if (response == null || user == null) {
            return;
        }
        boolean pending = user.getAccountStatus() == AccountStatus.DELETION_PENDING;
        response.setDeletionPending(pending);
        if (pending) {
            response.setAccountStatus(user.getAccountStatus().name());
            response.setDeletionScheduledPurgeAt(user.getDeletionScheduledPurgeAt());
        }
    }
}
