-- Chỉ kiểm thử cố ý vi phạm trên seed thử. Không thuộc seed hợp lệ.
-- DML rollback hoàn toàn; procedure helper có DDL riêng, không DROP/TRUNCATE bảng.
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone='+00:00';
DROP PROCEDURE IF EXISTS educonnect_constraint_checks;
DELIMITER $$
CREATE PROCEDURE educonnect_constraint_checks()
SQL SECURITY INVOKER
BEGIN
    DECLARE v_errno INT DEFAULT 0;
    DECLARE v_count INT DEFAULT 0;
    DECLARE EXIT HANDLER FOR SQLEXCEPTION BEGIN ROLLBACK; RESIGNAL; END;
    IF DATABASE() NOT REGEXP '^educonnect_test(_[a-z0-9_]+)?$' THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Chi chay constraint checks tren schema test.';
    END IF;
    START TRANSACTION;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO user_accounts SELECT 39001,'TEST-CONSTRAINT','admin@example.test',password_hash,status,email_verified_at,display_name,phone,bio,authentication_version,version,created_at,updated_at FROM user_accounts WHERE id=100;
    END;
    IF v_errno<>1062 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='unique_email: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'unique_email' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO private_files (id,owner_user_id,storage_key,purpose,original_name,mime_type,byte_size,sha256,created_at) VALUES (39002,999999,'test-only/private','REPORT_EVIDENCE','TEST.png','image/png',100,UNHEX(SHA2('test',256)),'2026-10-15 00:00:00');
    END;
    IF v_errno<>1452 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='fk_owner: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'fk_owner' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO ledger_entries (id,journal_id,line_number,ledger_account_id,entry_side,amount) VALUES (39003,20001,99,301,'CREDIT',-1);
    END;
    IF v_errno<>3819 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='check_money: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'check_money' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO job_selections SELECT job_id,application_id,tutor_id,selected_by,terms_version,terms_text,selected_at FROM job_selections WHERE job_id=13009;
    END;
    IF v_errno<>1062 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='selection_one_per_job: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'selection_one_per_job' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO job_selections (job_id,application_id,tutor_id,selected_by,terms_version,terms_text,selected_at) VALUES (13901,14109,202,302,1,'TEST','2026-10-15 00:00:00');
    END;
    IF v_errno<>1452 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='selection_wrong_job: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'selection_wrong_job' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO registration_sources (id,source_kind,learner_id,tutor_id,invitation_id,job_id,application_id,offering_id,created_at) VALUES (39006,'INVITATION',301,201,12001,NULL,NULL,2001,'2026-10-15 00:00:00');
    END;
    IF v_errno<>1062 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='invitation_not_reused: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'invitation_not_reused' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO payment_webhook_events SELECT 39007,provider,event_key,payment_attempt_id,payload_hash,signature_verified,status,received_at,processed_at,error_code FROM payment_webhook_events WHERE id=16001;
    END;
    IF v_errno<>1062 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='webhook_not_reused: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'webhook_not_reused' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO releases (id,contract_id,release_key,reason_code,gross_amount,fee_rate_snapshot,fee_amount,tutor_net_amount,fee_policy_version,rounding_mode,approved_by,released_at) VALUES (39008,6001,'TEST-FEE','COMPLETION',1000,0.1,110,890,'TEST','HALF_UP',100,'2026-10-15 00:00:00');
    END;
    IF v_errno<>3819 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='check_fee_snapshot: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'check_fee_snapshot' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO refunds (id,payment_id,contract_id,request_key,basis_amount_snapshot,refund_rate_snapshot,amount,policy_version,destination,status,requested_by,reason,requested_at) SELECT 39009,payment_id,contract_id,'TEST-PENDING-REFUND',basis_amount_snapshot,refund_rate_snapshot,amount,policy_version,destination,'REQUESTED',requested_by,'TEST','2026-10-15 00:00:00' FROM refunds WHERE status='PROCESSING' LIMIT 1;
    END;
    IF v_errno<>1062 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='one_pending_refund: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'one_pending_refund' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO reviews (id,contract_id,reviewer_user_id,rating,comment,status,created_at) VALUES (39010,6002,302,0,'TEST','PUBLISHED','2026-10-15 00:00:00');
    END;
    IF v_errno<>3819 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='check_rating: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'check_rating' AS check_name,'PASS' AS result, v_errno AS mysql_errno;
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO order_status_history (id,order_id,from_status,to_status,actor_user_id,reason,entity_version,changed_at,actor_role_code) VALUES (39011,9007,'AWAITING_PAYMENT','COMPLETED',307,'TEST',999,'2026-10-15 00:00:00','LEARNER');
    END;
    IF v_errno<>1452 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='history_invalid_transition: rang buoc khong tra errno mong doi'; END IF;
    SELECT 'history_invalid_transition' AS check_name,'PASS' AS result, v_errno AS mysql_errno;

    -- Khóa lạc quan: update với version cũ phải 0 rows; rollback về fixture.
    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO offerings (id, public_code, tutor_id, offering_type, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, unit_price, currency, session_count, duration_minutes, capacity, starts_on, ends_on, status, first_published_at, published_at, reviewed_by, reviewed_at, review_note, terms_version, terms_text, version, created_at, updated_at) SELECT 39910, 'TEST-GROUP-CAPACITY', tutor_id, offering_type, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, unit_price, currency, session_count, duration_minutes, NULL, starts_on, ends_on, status, first_published_at, published_at, reviewed_by, reviewed_at, review_note, terms_version, terms_text, version, created_at, updated_at FROM offerings WHERE id=2013;
    END;
    IF v_errno<>3819 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Group missing capacity khong bi CHECK chan'; END IF;
    SELECT 'group_capacity_required' AS check_name,'PASS' AS result,v_errno AS mysql_errno;

    SET v_errno=0;
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION GET DIAGNOSTICS CONDITION 1 v_errno=MYSQL_ERRNO;
        INSERT INTO offerings (id, public_code, tutor_id, offering_type, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, unit_price, currency, session_count, duration_minutes, capacity, starts_on, ends_on, status, first_published_at, published_at, reviewed_by, reviewed_at, review_note, terms_version, terms_text, version, created_at, updated_at) SELECT 39910, 'TEST-GROUP-ENDS_ON', tutor_id, offering_type, title, description, subject_id, grade_level_id, area_id, delivery_mode_id, unit_price, currency, session_count, duration_minutes, capacity, starts_on, NULL, status, first_published_at, published_at, reviewed_by, reviewed_at, review_note, terms_version, terms_text, version, created_at, updated_at FROM offerings WHERE id=2013;
    END;
    IF v_errno<>3819 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Group missing ends_on khong bi CHECK chan'; END IF;
    SELECT 'group_ends_on_required' AS check_name,'PASS' AS result,v_errno AS mysql_errno;


    SAVEPOINT optimistic_check;
    UPDATE user_accounts SET version=version+1 WHERE id=301 AND version=0;
    IF ROW_COUNT()<>1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='CAS first update sai'; END IF;
    UPDATE user_accounts SET version=version+1 WHERE id=301 AND version=0;
    IF ROW_COUNT()<>0 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='CAS stale update khong bi chan'; END IF;
    ROLLBACK TO SAVEPOINT optimistic_check;
    SELECT 'optimistic_version' AS check_name,'PASS' AS result;

    -- Database KHÔNG thể kiểm eligibility liên bảng chỉ bằng FK/CHECK.
    SAVEPOINT service_boundary;
    INSERT INTO reviews (id,contract_id,reviewer_user_id,rating,comment,status,created_at)
    VALUES (39901,6007,307,4,'TEST: chua thanh toan, service phai tu choi.','PUBLISHED','2026-10-15 00:00:00');
    SELECT COUNT(*) INTO v_count FROM reviews r JOIN contracts c ON c.id=r.contract_id
    WHERE r.id=39901 AND c.status<>'COMPLETED';
    IF v_count<>1 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Review boundary khong duoc phat hien'; END IF;
    ROLLBACK TO SAVEPOINT service_boundary;
    SELECT 'review_requires_service' AS check_name,'DB_ALLOWS_SERVICE_MUST_REJECT' AS result;

    -- Sức chứa tổng cần transaction lock/service. Rollback bản ghi kiểm cố ý sai.
    SAVEPOINT capacity_boundary;
    INSERT INTO enrollments (id,contract_id,offering_id,learner_id,seat_count,status,confirmed_at,created_at)
    VALUES (39902,6007,2013,307,1,'CONFIRMED','2026-10-15 00:00:00','2026-10-15 00:00:00');
    SELECT SUM(seat_count) INTO v_count FROM enrollments WHERE offering_id=2013 AND status IN ('CONFIRMED','COMPLETED');
    IF v_count<>3 THEN SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT='Capacity boundary khong phat hien vuot 2 cho'; END IF;
    ROLLBACK TO SAVEPOINT capacity_boundary;
    SELECT 'capacity_requires_service' AS check_name,'DB_ALLOWS_SERVICE_MUST_REJECT' AS result;
    ROLLBACK;
END$$
DELIMITER ;
CALL educonnect_constraint_checks();
DROP PROCEDURE educonnect_constraint_checks;

