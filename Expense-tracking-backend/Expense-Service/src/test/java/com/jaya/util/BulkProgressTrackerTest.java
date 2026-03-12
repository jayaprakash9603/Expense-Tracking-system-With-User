package com.jaya.util;

import com.jaya.dto.ProgressStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BulkProgressTrackerTest {

    private BulkProgressTracker tracker;

    @BeforeEach
    void setUp() {
        tracker = new BulkProgressTracker();
    }

    @Test
    void shouldStartAndReturnInitialStatus() {
        String jobId = tracker.start(1, 100, "Processing");

        assertThat(jobId).isNotNull();
        ProgressStatus status = tracker.get(jobId);
        assertThat(status).isNotNull();
        assertThat(status.getTotal()).isEqualTo(100);
        assertThat(status.getProcessed()).isEqualTo(0);
        assertThat(status.getPercent()).isEqualTo(0);
        assertThat(status.getStatus()).isEqualTo("IN_PROGRESS");
    }

    @Test
    void shouldIncrementAndUpdatePercent() {
        String jobId = tracker.start(1, 100, "Processing");
        tracker.increment(jobId, 25);

        ProgressStatus status = tracker.get(jobId);
        assertThat(status.getProcessed()).isEqualTo(25);
        assertThat(status.getPercent()).isEqualTo(25);
    }

    @Test
    void shouldCompleteJob() {
        String jobId = tracker.start(1, 100, "Processing");
        tracker.complete(jobId, "Done");

        ProgressStatus status = tracker.get(jobId);
        assertThat(status.getStatus()).isEqualTo("COMPLETED");
        assertThat(status.getPercent()).isEqualTo(100);
        assertThat(status.getProcessed()).isEqualTo(100);
    }

    @Test
    void shouldFailJob() {
        String jobId = tracker.start(1, 100, "Processing");
        tracker.fail(jobId, "Error occurred");

        ProgressStatus status = tracker.get(jobId);
        assertThat(status.getStatus()).isEqualTo("FAILED");
        assertThat(status.getMessage()).isEqualTo("Error occurred");
    }

    @Test
    void shouldReturnNullForUnknownJob() {
        ProgressStatus status = tracker.get("unknown-job-id");

        assertThat(status).isNull();
    }
}
