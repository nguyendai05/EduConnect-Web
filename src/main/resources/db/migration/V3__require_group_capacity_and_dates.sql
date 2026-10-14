-- MySQL CHECK chấp nhận UNKNOWN (NULL). Không sửa V1/V2 đã áp dụng.
-- Siết trường bắt buộc theo loại lớp, không bổ sung nghiệp vụ hoặc bảng mới.
ALTER TABLE offerings
    DROP CHECK ck_off_capacity,
    ADD CONSTRAINT ck_off_capacity_present CHECK (
        (offering_type='SERVICE' AND capacity IS NULL)
        OR
        (offering_type='GROUP_CLASS' AND capacity IS NOT NULL AND capacity>0
         AND starts_on IS NOT NULL AND ends_on IS NOT NULL AND ends_on>=starts_on)
    );
