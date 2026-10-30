-- Buổi học của hợp đồng: ký quỹ chia theo buổi, giải ngân từng buổi sau khi học viên xác nhận.
CREATE TABLE contract_sessions (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    contract_id BIGINT NOT NULL COMMENT 'Hợp đồng sở hữu buổi.',
    session_number INT NOT NULL COMMENT 'Số thứ tự buổi, bắt đầu từ 1.',
    amount DECIMAL(19,0) NOT NULL COMMENT 'Phần tiền ký quỹ của buổi: đơn giá x số chỗ.',
    status VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL COMMENT 'Trạng thái: HELD, ATTENDED, RELEASED, REFUNDED.',
    attended_at DATETIME(6) NULL COMMENT 'Gia sư điểm danh lúc nào.',
    confirmed_at DATETIME(6) NULL COMMENT 'Học viên (hoặc hệ thống) xác nhận và giải ngân lúc nào.',
    release_id BIGINT NULL COMMENT 'Lần giải ngân của buổi, mỗi buổi tối đa một lần.',
    version BIGINT NOT NULL DEFAULT 0 COMMENT 'JPA @Version.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_session_number UNIQUE (contract_id, session_number),
    CONSTRAINT uq_session_release UNIQUE (release_id),
    CONSTRAINT fk_session_contract FOREIGN KEY (contract_id) REFERENCES contracts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_session_release FOREIGN KEY (release_id) REFERENCES releases (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_session_status CHECK (status IN ('HELD','ATTENDED','RELEASED','REFUNDED')),
    CONSTRAINT ck_session_amount CHECK (amount > 0 AND session_number > 0),
    CONSTRAINT ck_session_attended CHECK (status IN ('HELD','REFUNDED') OR attended_at IS NOT NULL),
    CONSTRAINT ck_session_released CHECK ((status = 'RELEASED') = (release_id IS NOT NULL)),
    INDEX ix_session_status (status, attended_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Buổi học của hợp đồng; ký quỹ và giải ngân theo từng buổi.';
