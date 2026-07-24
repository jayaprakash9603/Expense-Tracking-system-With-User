package com.jaya.task.user.service.config;

import com.jaya.task.user.service.modal.AccountStatus;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class DeletionAccessBlockFilterTest {

    @Test
    void allowsActiveAndGracePending() {
        assertThat(DeletionAccessBlockFilter.shouldBlockAccess(AccountStatus.ACTIVE)).isFalse();
        assertThat(DeletionAccessBlockFilter.shouldBlockAccess(AccountStatus.DELETION_PENDING)).isFalse();
        assertThat(DeletionAccessBlockFilter.shouldBlockAccess(null)).isFalse();
    }

    @Test
    void blocksPurgeAndTerminalStates() {
        assertThat(DeletionAccessBlockFilter.shouldBlockAccess(AccountStatus.PURGING)).isTrue();
        assertThat(DeletionAccessBlockFilter.shouldBlockAccess(AccountStatus.DELETED)).isTrue();
        assertThat(DeletionAccessBlockFilter.shouldBlockAccess(AccountStatus.FAILED)).isTrue();
    }
}
