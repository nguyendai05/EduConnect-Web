-- Đánh dấu học viên vắng ở buổi của lớp nhóm: chỉ để hiển thị, buổi vẫn tính phí và đi theo luồng xác nhận thường.
ALTER TABLE contract_sessions
    ADD COLUMN absent BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Học viên vắng buổi lớp nhóm; vẫn giải ngân cho gia sư.' AFTER attended_at;
