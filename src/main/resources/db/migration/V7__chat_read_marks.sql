-- Mốc đã đọc của từng bên để đếm tin chưa đọc.
ALTER TABLE chat_conversations
    ADD COLUMN learner_read_at DATETIME(6) NULL COMMENT 'Lần gần nhất người học xem cuộc trò chuyện; NULL là chưa xem lần nào.' AFTER last_message_at,
    ADD COLUMN tutor_read_at DATETIME(6) NULL COMMENT 'Lần gần nhất gia sư xem cuộc trò chuyện; NULL là chưa xem lần nào.' AFTER learner_read_at;
