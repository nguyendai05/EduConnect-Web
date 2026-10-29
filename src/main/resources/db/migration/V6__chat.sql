-- Nhắn tin giữa người học và gia sư trước khi chốt lời mời/hợp đồng.
CREATE TABLE chat_conversations (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long.',
    learner_id BIGINT NOT NULL COMMENT 'Người học.',
    tutor_id BIGINT NOT NULL COMMENT 'Gia sư.',
    last_message_at DATETIME(6) NULL COMMENT 'Tin nhắn gần nhất; dùng để sắp xếp danh sách.',
    created_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT uq_chat_pair UNIQUE (learner_id, tutor_id),
    CONSTRAINT fk_chat_learner FOREIGN KEY (learner_id) REFERENCES learner_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_chat_tutor FOREIGN KEY (tutor_id) REFERENCES tutor_profiles (user_id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_chat_distinct CHECK (learner_id <> tutor_id),
    INDEX ix_chat_learner (learner_id, last_message_at),
    INDEX ix_chat_tutor (tutor_id, last_message_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Mỗi cặp người học - gia sư có một cuộc trò chuyện.';

CREATE TABLE chat_messages (
    id BIGINT NOT NULL AUTO_INCREMENT COMMENT 'Khóa kỹ thuật Java Long; tăng dần theo thời gian gửi.',
    conversation_id BIGINT NOT NULL COMMENT 'Cuộc trò chuyện.',
    sender_id BIGINT NOT NULL COMMENT 'Người gửi, service kiểm là một trong hai bên.',
    body VARCHAR(1000) NOT NULL COMMENT 'Nội dung văn bản.',
    sent_at DATETIME(6) NOT NULL COMMENT 'Thời điểm UTC, độ chính xác microsecond.',
    PRIMARY KEY (id),
    CONSTRAINT fk_msg_conversation FOREIGN KEY (conversation_id) REFERENCES chat_conversations (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT fk_msg_sender FOREIGN KEY (sender_id) REFERENCES user_accounts (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
    CONSTRAINT ck_msg_body CHECK (CHAR_LENGTH(TRIM(body)) > 0),
    INDEX ix_msg_conversation (conversation_id, id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci COMMENT='Tin nhắn văn bản trong một cuộc trò chuyện.';
