-- Five-day account-deletion saga: adds lifecycle columns to users and creates
-- saga / step / outbox tables. Safe to run against MySQL 8+.

ALTER TABLE users
    ADD COLUMN account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN deletion_initiator VARCHAR(16) NULL,
    ADD COLUMN deletion_initiator_user_id INT NULL,
    ADD COLUMN deletion_requested_at TIMESTAMP NULL,
    ADD COLUMN deletion_scheduled_purge_at TIMESTAMP NULL,
    ADD COLUMN deletion_correlation_id VARCHAR(64) NULL,
    ADD COLUMN lock_version BIGINT NOT NULL DEFAULT 0,
    ADD INDEX idx_users_account_status (account_status),
    ADD INDEX idx_users_deletion_scheduled_purge_at (deletion_scheduled_purge_at);

CREATE TABLE IF NOT EXISTS deletion_saga (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    correlation_id VARCHAR(64) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    user_email VARCHAR(255) NULL,
    state VARCHAR(32) NOT NULL,
    initiator VARCHAR(16) NOT NULL,
    initiator_user_id INT NULL,
    requested_at TIMESTAMP NOT NULL,
    scheduled_purge_at TIMESTAMP NOT NULL,
    purge_started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    cancelled_at TIMESTAMP NULL,
    cancelled_by INT NULL,
    failure_reason VARCHAR(1024) NULL,
    lock_version BIGINT NOT NULL DEFAULT 0,
    INDEX idx_deletion_saga_user_id (user_id),
    INDEX idx_deletion_saga_state_purge_at (state, scheduled_purge_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deletion_step (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    saga_id BIGINT NOT NULL,
    service_name VARCHAR(64) NOT NULL,
    idempotency_key VARCHAR(96) NOT NULL UNIQUE,
    status VARCHAR(16) NOT NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    last_error VARCHAR(1024) NULL,
    next_attempt_at TIMESTAMP NULL,
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL,
    lock_version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_deletion_step_saga FOREIGN KEY (saga_id) REFERENCES deletion_saga(id) ON DELETE CASCADE,
    UNIQUE KEY uk_deletion_step_saga_service (saga_id, service_name),
    INDEX idx_deletion_step_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS deletion_outbox (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    aggregate_id VARCHAR(64) NOT NULL,
    topic VARCHAR(128) NOT NULL,
    message_key VARCHAR(128) NULL,
    payload LONGTEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    next_attempt_at TIMESTAMP NOT NULL,
    published_at TIMESTAMP NULL,
    attempt_count INT NOT NULL DEFAULT 0,
    last_error VARCHAR(1024) NULL,
    INDEX idx_deletion_outbox_pending (published_at, next_attempt_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
