-- Registration is staged until mailbox ownership is proven. Existing accounts are untouched.
CREATE TABLE pending_registrations (
    email VARCHAR(254) CHARACTER SET ascii COLLATE ascii_general_ci NOT NULL,
    challenge_id CHAR(36) CHARACTER SET ascii COLLATE ascii_bin NULL,
    password_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NULL,
    display_name VARCHAR(120) NULL,
    phone VARCHAR(24) NULL,
    role_code VARCHAR(24) CHARACTER SET ascii COLLATE ascii_bin NULL,
    existing_user_id BIGINT NULL,
    otp_hash VARCHAR(255) CHARACTER SET ascii COLLATE ascii_bin NULL,
    expires_at DATETIME(6) NULL,
    last_sent_at DATETIME(6) NULL,
    send_window_started_at DATETIME(6) NULL,
    send_count INT NOT NULL DEFAULT 0,
    failed_attempts INT NOT NULL DEFAULT 0,
    completed_at DATETIME(6) NULL,
    PRIMARY KEY (email),
    CONSTRAINT uq_pending_challenge UNIQUE (challenge_id),
    CONSTRAINT fk_pending_existing_user FOREIGN KEY (existing_user_id) REFERENCES user_accounts (id) ON DELETE RESTRICT,
    CONSTRAINT ck_pending_role CHECK (role_code IS NULL OR role_code IN ('LEARNER', 'TUTOR')),
    CONSTRAINT ck_pending_counts CHECK (send_count >= 0 AND failed_attempts >= 0),
    CONSTRAINT ck_pending_email CHECK (BINARY email = BINARY LOWER(TRIM(email)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
