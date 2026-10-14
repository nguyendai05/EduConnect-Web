-- Kiểm chỉ đọc. Chạy trên schema development đã nạp seed; không sửa dữ liệu.
-- Mọi truy vấn EXPECT_ZERO phải trả 0 dòng. Số đối chiếu dành cho seed nguyên trạng.
SET NAMES utf8mb4 COLLATE utf8mb4_0900_ai_ci;
SET time_zone = '+00:00';
SET @seed_as_of='2026-10-15 00:00:00.000000';
SELECT VERSION() AS server_version, DATABASE() AS current_schema, @@sql_mode AS sql_mode,
       @@character_set_connection AS connection_charset, @@collation_connection AS connection_collation, @@time_zone AS time_zone;

-- EXPECT_ZERO: tổng đơn khác tổng item.
SELECT o.id,o.total_amount,SUM(i.line_total) AS calculated_total
FROM orders o LEFT JOIN order_items i ON i.order_id=o.id
GROUP BY o.id,o.total_amount HAVING COUNT(i.id)=0 OR o.total_amount<>SUM(i.line_total);

-- EXPECT_ZERO: nguồn có người học/tutor sai, invitation chưa chấp nhận hoặc selection không thuộc tin.
SELECT s.id
FROM registration_sources s
JOIN order_items i ON i.registration_source_id=s.id JOIN orders o ON o.id=i.order_id
LEFT JOIN invitations v ON v.id=s.invitation_id
LEFT JOIN job_selections x ON x.job_id=s.job_id AND x.application_id=s.application_id
LEFT JOIN job_posts p ON p.id=s.job_id
LEFT JOIN offerings f ON f.id=s.offering_id
WHERE s.learner_id<>o.learner_id OR s.tutor_id<>i.tutor_id
   OR (s.source_kind='INVITATION' AND (v.id IS NULL OR v.status<>'ACCEPTED'))
   OR (s.source_kind='JOB_APPLICATION' AND (x.application_id IS NULL OR p.learner_id<>s.learner_id OR x.tutor_id<>s.tutor_id))
   OR (s.source_kind='CATALOG' AND (f.id IS NULL OR f.tutor_id<>s.tutor_id));

-- EXPECT_ZERO: contract không cùng item/owner/snapshot.
SELECT c.id FROM contracts c JOIN order_items i ON i.id=c.order_item_id JOIN orders o ON o.id=i.order_id
WHERE c.learner_id<>o.learner_id OR c.tutor_id<>i.tutor_id
   OR c.agreed_terms_text<>i.terms_text_snapshot OR c.agreed_terms_hash<>i.terms_hash
   OR i.terms_hash<>UNHEX(SHA2(i.terms_text_snapshot,256));

-- EXPECT_ZERO: payment intent hoặc allocation lệch item/order.
SELECT p.id FROM payments p JOIN orders o ON o.id=p.order_id
LEFT JOIN payment_allocations a ON a.payment_id=p.id
GROUP BY p.id,p.amount,p.wallet_amount,p.provider_amount,o.total_amount
HAVING p.amount<>o.total_amount OR p.amount<>COALESCE(SUM(a.amount),0)
    OR p.wallet_amount<>COALESCE(SUM(a.wallet_amount),0) OR p.provider_amount<>COALESCE(SUM(a.provider_amount),0);

-- EXPECT_ZERO: allocation gắn contract của order khác hoặc tổng line sai.
SELECT a.payment_id,a.contract_id FROM payment_allocations a JOIN payments p ON p.id=a.payment_id
JOIN contracts c ON c.id=a.contract_id JOIN order_items i ON i.id=c.order_item_id
WHERE i.order_id<>p.order_id OR i.line_total<>a.amount;

-- EXPECT_ZERO: attempt thành công không khớp provider amount/verification.
SELECT t.id FROM payment_attempts t JOIN payments p ON p.id=t.payment_id
WHERE t.amount<>p.provider_amount OR (t.status='SUCCEEDED' AND t.verified_at IS NULL);

-- EXPECT_ZERO: payment đã thu nhưng thiếu số tiền post trong escrow journals.
SELECT p.id,p.amount,COALESCE(SUM(e.amount),0) AS actual_funded
FROM payments p LEFT JOIN money_journals j ON j.payment_id=p.id AND j.journal_kind IN ('WALLET_PAYMENT','PROVIDER_PAYMENT')
LEFT JOIN ledger_entries e ON e.journal_id=j.id AND e.entry_side='CREDIT'
GROUP BY p.id,p.status,p.amount
HAVING (p.status IN ('FUNDED','REFUND_PENDING','PARTIALLY_REFUNDED','REFUNDED') AND actual_funded<>p.amount)
    OR (p.status IN ('PENDING','FAILED','CANCELLED') AND actual_funded<>0);

-- EXPECT_ZERO: provider-funded intent cần một attempt đã xác minh đủ tiền.
SELECT p.id FROM payments p LEFT JOIN payment_attempts t ON t.payment_id=p.id AND t.status='SUCCEEDED'
WHERE p.provider_amount>0 AND p.status IN ('FUNDED','REFUND_PENDING','PARTIALLY_REFUNDED','REFUNDED')
GROUP BY p.id,p.provider_amount HAVING COUNT(t.id)<>1 OR SUM(t.amount)<>p.provider_amount;

-- EXPECT_ZERO: journal không cân hoặc thiếu dòng.
SELECT j.id,SUM(CASE WHEN e.entry_side='CREDIT' THEN e.amount ELSE -e.amount END) AS imbalance
FROM money_journals j LEFT JOIN ledger_entries e ON e.journal_id=j.id
GROUP BY j.id HAVING COUNT(e.id)<2 OR imbalance<>0;

-- EXPECT_ZERO: account ví/escrow sai loại/owner hoặc số dư âm.
SELECT w.user_id FROM wallets w JOIN ledger_accounts a ON a.id=w.ledger_account_id
JOIN v_wallet_balances b ON b.user_id=w.user_id
WHERE a.account_kind<>'USER_WALLET' OR a.owner_user_id<>w.user_id OR b.available_balance<0;
-- EXPECT_ZERO: escrow cần đúng loại, không âm.
SELECT x.contract_id FROM escrow_accounts x JOIN ledger_accounts a ON a.id=x.ledger_account_id
JOIN v_escrow_balances b ON b.contract_id=x.contract_id
WHERE a.account_kind<>'ESCROW' OR b.held_amount<0;

-- EXPECT_ZERO: escrow thực khác tiền thu allocation - release - refund succeeded.
SELECT c.id,COALESCE(b.held_amount,0) AS held_amount,
       COALESCE(f.funded,0)-COALESCE(r.released,0)-COALESCE(q.refunded,0) AS expected_held
FROM contracts c LEFT JOIN v_escrow_balances b ON b.contract_id=c.id
LEFT JOIN (SELECT a.contract_id,SUM(a.amount) AS funded FROM payment_allocations a
           JOIN payments p ON p.id=a.payment_id WHERE p.status IN ('FUNDED','REFUND_PENDING','PARTIALLY_REFUNDED','REFUNDED')
           GROUP BY a.contract_id) f ON f.contract_id=c.id
LEFT JOIN (SELECT contract_id,SUM(gross_amount) AS released FROM releases GROUP BY contract_id) r ON r.contract_id=c.id
LEFT JOIN (SELECT contract_id,SUM(amount) AS refunded FROM refunds WHERE status='SUCCEEDED' GROUP BY contract_id) q ON q.contract_id=c.id
WHERE COALESCE(b.held_amount,0)<>COALESCE(f.funded,0)-COALESCE(r.released,0)-COALESCE(q.refunded,0)
   OR COALESCE(f.funded,0)<COALESCE(r.released,0)+COALESCE(q.refunded,0);

-- EXPECT_ZERO: release chưa có journal hoặc snapshot phí khác item.
SELECT r.id FROM releases r JOIN contracts c ON c.id=r.contract_id JOIN order_items i ON i.id=c.order_item_id
LEFT JOIN money_journals j ON j.release_id=r.id AND j.journal_kind='RELEASE'
WHERE j.id IS NULL OR r.fee_rate_snapshot<>i.fee_rate_snapshot OR r.fee_policy_version<>i.fee_policy_version;

-- EXPECT_ZERO: dòng escrow/tutor/phí của release không đúng.
SELECT r.id FROM releases r JOIN contracts c ON c.id=r.contract_id
JOIN escrow_accounts x ON x.contract_id=c.id JOIN wallets w ON w.user_id=c.tutor_id
LEFT JOIN money_journals j ON j.release_id=r.id LEFT JOIN ledger_entries e ON e.journal_id=j.id
LEFT JOIN ledger_accounts a ON a.id=e.ledger_account_id
GROUP BY r.id,r.gross_amount,r.tutor_net_amount,r.fee_amount,x.ledger_account_id,w.ledger_account_id
HAVING COALESCE(SUM(CASE WHEN e.entry_side='DEBIT' AND e.ledger_account_id=x.ledger_account_id THEN e.amount ELSE 0 END),0)<>r.gross_amount
    OR COALESCE(SUM(CASE WHEN e.entry_side='CREDIT' AND e.ledger_account_id=w.ledger_account_id THEN e.amount ELSE 0 END),0)<>r.tutor_net_amount
    OR COALESCE(SUM(CASE WHEN e.entry_side='CREDIT' AND a.account_kind='PLATFORM_REVENUE' THEN e.amount ELSE 0 END),0)<>r.fee_amount;

-- EXPECT_ZERO: refund chỉ succeeded mới post, snapshot basis không vượt tiền còn sau release.
SELECT q.id FROM refunds q
LEFT JOIN (SELECT contract_id,SUM(gross_amount) AS released FROM releases GROUP BY contract_id) r ON r.contract_id=q.contract_id
JOIN payment_allocations a ON a.payment_id=q.payment_id AND a.contract_id=q.contract_id
LEFT JOIN money_journals j ON j.refund_id=q.id
WHERE q.basis_amount_snapshot>a.amount-COALESCE(r.released,0)
   OR (q.status='SUCCEEDED' AND j.id IS NULL)
   OR (q.status<>'SUCCEEDED' AND j.id IS NOT NULL);

-- EXPECT_ZERO: review cần đúng người mua, completed, có tiền đã nhận và không hoàn toàn.
SELECT v.id FROM reviews v JOIN contracts c ON c.id=v.contract_id JOIN order_items i ON i.id=c.order_item_id
JOIN payment_allocations a ON a.contract_id=c.id JOIN payments p ON p.id=a.payment_id
LEFT JOIN (SELECT contract_id,SUM(amount) AS total FROM refunds WHERE status='SUCCEEDED' GROUP BY contract_id) r ON r.contract_id=c.id
WHERE c.status<>'COMPLETED' OR v.reviewer_user_id<>c.learner_id OR p.funded_at IS NULL OR COALESCE(r.total,0)>=i.line_total;

-- EXPECT_ZERO: enrollment phải group class của đúng item/learner và trạng thái tương thích.
SELECT e.id FROM enrollments e JOIN offerings f ON f.id=e.offering_id
JOIN contracts c ON c.id=e.contract_id JOIN order_items i ON i.id=c.order_item_id
JOIN registration_sources s ON s.id=i.registration_source_id
WHERE f.offering_type<>'GROUP_CLASS' OR i.offering_type_snapshot<>'GROUP_CLASS' OR s.offering_id<>e.offering_id
   OR c.learner_id<>e.learner_id OR i.seat_count<>e.seat_count
   OR (c.status='COMPLETED' AND e.status<>'COMPLETED')
   OR (c.status='CANCELLED' AND e.status NOT IN ('CANCELLED','EXPIRED'));

-- EXPECT_ZERO: capacity chỉ tính chỗ đang giữ còn hạn/confirmed/completed.
SELECT f.id,f.capacity,SUM(e.seat_count) AS occupied
FROM offerings f JOIN enrollments e ON e.offering_id=f.id
WHERE e.status IN ('CONFIRMED','COMPLETED') OR (e.status='RESERVED' AND e.reserved_until>@seed_as_of)
GROUP BY f.id,f.capacity HAVING occupied>f.capacity;

-- EXPECT_ZERO: order/contract current status không khớp history cuối theo version.
SELECT o.id FROM orders o LEFT JOIN order_status_history h ON h.order_id=o.id AND h.entity_version=o.version
WHERE h.id IS NULL OR h.to_status<>o.status;
-- EXPECT_ZERO: contract/history.
SELECT c.id FROM contracts c LEFT JOIN contract_status_history h ON h.contract_id=c.id AND h.entity_version=c.version
WHERE h.id IS NULL OR h.to_status<>c.status;

-- EXPECT_ZERO: group class không thiếu capacity/date, kể cả CHECK UNKNOWN của schema cũ.
SELECT id FROM offerings WHERE offering_type='GROUP_CLASS' AND (capacity IS NULL OR capacity<=0 OR starts_on IS NULL OR ends_on IS NULL OR ends_on<starts_on);

-- EXPECT_ZERO: public offering phải tutor approved/account active/email verified.
SELECT f.id FROM offerings f JOIN tutor_profiles t ON t.user_id=f.tutor_id JOIN user_accounts u ON u.id=t.user_id
WHERE f.status='PUBLISHED' AND (t.review_status<>'APPROVED' OR u.status<>'ACTIVE' OR u.email_verified_at IS NULL);

-- EXPECT_ZERO: chứng cứ profile/report phải đúng chủ và purpose.
SELECT x.file_id FROM tutor_profile_evidence x JOIN private_files f ON f.id=x.file_id
WHERE f.owner_user_id<>x.tutor_id OR f.purpose<>'TUTOR_EVIDENCE';
-- EXPECT_ZERO: chứng cứ report.
SELECT e.file_id FROM report_evidence e JOIN reports r ON r.id=e.report_id JOIN private_files f ON f.id=e.file_id
WHERE f.owner_user_id<>r.reporter_user_id OR f.purpose<>'REPORT_EVIDENCE';

-- EXPECT_ZERO: quyết định/approval do admin, không chỉ tài khoản tồn tại.
SELECT r.id FROM reports r LEFT JOIN user_roles a ON a.user_id=r.resolved_by AND a.role_code='ADMIN'
WHERE r.status IN ('RESOLVED','DISMISSED') AND a.user_id IS NULL;
-- EXPECT_ZERO: token không có plaintext (length digest=32), expiry hợp lệ; DB CHECK bổ sung.
SELECT id FROM auth_tokens WHERE OCTET_LENGTH(token_hash)<>32 OR expires_at<=created_at;

-- EXPECT_ZERO: khoảng tháng 08/2026 không có revenue.
SELECT id FROM releases WHERE released_at>='2026-08-01 00:00:00' AND released_at<'2026-09-01 00:00:00';

-- Đối chiếu tiền: xem số mong đợi tại README/TEST_RESULTS; không lấy held làm doanh thu.

-- EXPECT_ZERO: status order và child contracts không tương thích.
SELECT o.id,c.id AS contract_id FROM orders o JOIN order_items i ON i.order_id=o.id JOIN contracts c ON c.order_item_id=i.id
WHERE (o.status='COMPLETED' AND c.status<>'COMPLETED')
   OR (o.status='CANCELLED' AND c.status<>'CANCELLED')
   OR (o.status='CANCELLATION_PENDING' AND c.status<>'CANCELLATION_PENDING')
   OR (o.status='AWAITING_PAYMENT' AND c.status<>'AWAITING_PAYMENT')
   OR (o.status IN ('PAID','IN_PROGRESS') AND c.status<>'ACTIVE');

-- EXPECT_ZERO: funding phải đi đúng escrow và đúng ví người mua/clearing.
SELECT j.id FROM money_journals j JOIN payments p ON p.id=j.payment_id JOIN orders o ON o.id=p.order_id
JOIN payment_allocations a ON a.payment_id=p.id AND a.contract_id=j.contract_id
JOIN escrow_accounts x ON x.contract_id=j.contract_id JOIN wallets w ON w.user_id=o.learner_id
LEFT JOIN ledger_entries e ON e.journal_id=j.id LEFT JOIN ledger_accounts l ON l.id=e.ledger_account_id
WHERE j.journal_kind IN ('WALLET_PAYMENT','PROVIDER_PAYMENT')
GROUP BY j.id,j.journal_kind,a.wallet_amount,a.provider_amount,x.ledger_account_id,w.ledger_account_id
HAVING SUM(CASE WHEN e.entry_side='CREDIT' AND e.ledger_account_id=x.ledger_account_id THEN e.amount ELSE 0 END)
           <>CASE WHEN j.journal_kind='WALLET_PAYMENT' THEN a.wallet_amount ELSE a.provider_amount END
    OR SUM(CASE WHEN e.entry_side='DEBIT' AND
                ((j.journal_kind='WALLET_PAYMENT' AND e.ledger_account_id=w.ledger_account_id)
                 OR (j.journal_kind='PROVIDER_PAYMENT' AND l.account_kind='PROVIDER_CLEARING')) THEN e.amount ELSE 0 END)
           <>CASE WHEN j.journal_kind='WALLET_PAYMENT' THEN a.wallet_amount ELSE a.provider_amount END;

-- EXPECT_ZERO: refund journal phải đúng contract/escrow và destination.
SELECT q.id,q.contract_id AS refund_contract_id,j.contract_id AS journal_contract_id
FROM refunds q JOIN contracts c ON c.id=q.contract_id JOIN escrow_accounts x ON x.contract_id=c.id
JOIN wallets w ON w.user_id=c.learner_id
LEFT JOIN money_journals j ON j.refund_id=q.id LEFT JOIN ledger_entries e ON e.journal_id=j.id
LEFT JOIN ledger_accounts a ON a.id=e.ledger_account_id
WHERE q.status='SUCCEEDED'
GROUP BY q.id,q.amount,q.destination,q.contract_id,j.contract_id,x.ledger_account_id,w.ledger_account_id
HAVING journal_contract_id<>refund_contract_id
    OR COALESCE(SUM(CASE WHEN e.entry_side='DEBIT' AND e.ledger_account_id=x.ledger_account_id THEN e.amount ELSE 0 END),0)<>q.amount
    OR COALESCE(SUM(CASE WHEN e.entry_side='CREDIT' AND
              ((q.destination='WALLET' AND e.ledger_account_id=w.ledger_account_id)
               OR (q.destination='ORIGINAL_PROVIDER' AND a.account_kind='PROVIDER_CLEARING')) THEN e.amount ELSE 0 END),0)<>q.amount;

-- UTF-8 phải giữ đúng tên tiếng Việt, không chỉ terminal hiển thị.
SELECT display_name='Nguyễn Minh Anh' AS vietnamese_roundtrip_ok FROM user_accounts WHERE id=201;

SELECT (SELECT SUM(amount) FROM payments WHERE funded_at IS NOT NULL) AS received,
       (SELECT SUM(gross_amount) FROM releases) AS gross_released,
       (SELECT SUM(fee_amount) FROM releases) AS platform_fee,
       (SELECT SUM(tutor_net_amount) FROM releases) AS tutor_net,
       (SELECT SUM(amount) FROM refunds WHERE status='SUCCEEDED') AS refunded,
       (SELECT SUM(held_amount) FROM v_escrow_balances) AS held;
SELECT user_id,available_balance FROM v_wallet_balances ORDER BY user_id;
SELECT * FROM v_tutor_revenue ORDER BY tutor_id;

-- BB09: chỉ lịch sử của learner 301; service dùng principal thay literal id.
SELECT o.public_code,o.status,o.total_amount,o.created_at FROM orders o WHERE o.learner_id=301 ORDER BY o.created_at DESC,o.id DESC;
-- BB13: item/contract và tiền của tutor 201, một order nhiều tutor không gán toàn bộ cho tutor đầu.
SELECT o.public_code,i.id AS order_item_id,c.public_code AS contract_code,i.line_total,c.status
FROM order_items i JOIN orders o ON o.id=i.order_id JOIN contracts c ON c.order_item_id=i.id
WHERE i.tutor_id=201 ORDER BY o.created_at DESC,o.id DESC;

-- TC06/07: lọc môn/cấp/khu vực/hình thức/giá từ cùng một tập.
SELECT f.public_code,f.title,f.unit_price FROM offerings f
JOIN tutor_profiles t ON t.user_id=f.tutor_id JOIN user_accounts u ON u.id=t.user_id
WHERE f.status='PUBLISHED' AND t.review_status='APPROVED' AND u.status='ACTIVE' AND u.email_verified_at IS NOT NULL
  AND f.subject_id IN (1,3) AND f.grade_level_id IN (1,2,3,4,5,6,7)
  AND f.area_id IN (1,2,3,4) AND f.delivery_mode_id IN (1,2,3)
  AND f.unit_price BETWEEN 150000 AND 400000 ORDER BY f.unit_price ASC,f.id ASC;

-- TC08: tìm tên gia sư không phân biệt dấu/hoa theo collation; service bind parameter.
SELECT u.public_code,u.display_name FROM user_accounts u JOIN tutor_profiles t ON t.user_id=u.id
WHERE t.review_status='APPROVED' AND u.status='ACTIVE' AND u.email_verified_at IS NOT NULL AND u.display_name LIKE '%minh%';
-- TC09: công khai theo tutor.
SELECT public_code,title FROM offerings WHERE tutor_id=201 AND status='PUBLISHED' ORDER BY published_at DESC,id DESC;
-- TC10: newest có tie-break id; chỉ current public/read eligible.
SELECT f.public_code,f.title,f.published_at FROM offerings f JOIN tutor_profiles t ON t.user_id=f.tutor_id
JOIN user_accounts u ON u.id=t.user_id
WHERE f.status='PUBLISHED' AND t.review_status='APPROVED' AND u.status='ACTIVE' AND u.email_verified_at IS NOT NULL
ORDER BY f.published_at DESC,f.id DESC LIMIT 6;

-- BB10: bar theo ngày UTC, [from,to) tránh biên ngày cuối.
SET @from_utc='2026-05-01 00:00:00';
SET @to_utc='2026-11-01 00:00:00';
SELECT DATE_FORMAT(r.released_at,'%Y-%m') AS month_utc,SUM(r.gross_amount) AS gross,
       SUM(r.fee_amount) AS platform_fee,SUM(r.tutor_net_amount) AS tutor_net
FROM releases r JOIN money_journals j ON j.release_id=r.id
WHERE r.released_at>=@from_utc AND r.released_at<@to_utc GROUP BY month_utc ORDER BY month_utc;
-- BB11: pie = số order theo trạng thái, mẫu số COUNT(order), không COUNT(item).
SELECT status,COUNT(*) AS orders_count,ROUND(COUNT(*)*100.0/(SELECT COUNT(*) FROM orders),2) AS percent
FROM orders GROUP BY status ORDER BY status;
-- Ba nguồn: count line để giữ nguồn hỗn hợp; không ép order có một channel.
SELECT source_kind,COUNT(*) AS item_count FROM registration_sources GROUP BY source_kind ORDER BY source_kind;

-- Số mong đợi cố định seed nguyên trạng:

-- EXPECT_ZERO: đối chiếu số liệu cố định, chỉ dành cho bộ seed chưa có hoạt động nghiệp vụ mới.
SELECT 'seed_totals_mismatch' AS error
WHERE (SELECT COUNT(*) FROM user_accounts WHERE public_code LIKE 'DEMO-%')<>17
   OR (SELECT COUNT(*) FROM offerings WHERE public_code LIKE 'DEMO-%')<>18
   OR (SELECT COUNT(*) FROM orders WHERE public_code LIKE 'DEMO-%')<>24
   OR (SELECT COUNT(*) FROM order_items i JOIN orders o ON o.id=i.order_id WHERE o.public_code LIKE 'DEMO-%')<>26
   OR (SELECT SUM(amount) FROM payments WHERE funded_at IS NOT NULL)<>24550550
   OR (SELECT SUM(gross_amount) FROM releases)<>9920260
   OR (SELECT SUM(fee_amount) FROM releases)<>992031
   OR (SELECT SUM(tutor_net_amount) FROM releases)<>8928229
   OR (SELECT SUM(amount) FROM refunds WHERE status='SUCCEEDED')<>2330040
   OR (SELECT SUM(held_amount) FROM v_escrow_balances)<>12300250;


-- EXPECT_ZERO: quét mọi FK, không chỉ các entity mẫu.
SELECT 'fk_ur_user' AS constraint_name, CONCAT_WS('/',CAST(a.user_id AS CHAR),CAST(a.role_code AS CHAR)) AS orphan_key
FROM user_roles a LEFT JOIN user_accounts b ON a.user_id=b.id
WHERE a.user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_ur_role' AS constraint_name, CONCAT_WS('/',CAST(a.user_id AS CHAR),CAST(a.role_code AS CHAR)) AS orphan_key
FROM user_roles a LEFT JOIN roles b ON a.role_code=b.code
WHERE a.role_code IS NOT NULL AND b.code IS NULL
UNION ALL
SELECT 'fk_lp_user' AS constraint_name, CONCAT_WS('/',CAST(a.user_id AS CHAR)) AS orphan_key
FROM learner_profiles a LEFT JOIN user_accounts b ON a.user_id=b.id
WHERE a.user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_lp_grade' AS constraint_name, CONCAT_WS('/',CAST(a.user_id AS CHAR)) AS orphan_key
FROM learner_profiles a LEFT JOIN grade_levels b ON a.grade_level_id=b.id
WHERE a.grade_level_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_lp_area' AS constraint_name, CONCAT_WS('/',CAST(a.user_id AS CHAR)) AS orphan_key
FROM learner_profiles a LEFT JOIN areas b ON a.area_id=b.id
WHERE a.area_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_tp_user' AS constraint_name, CONCAT_WS('/',CAST(a.user_id AS CHAR)) AS orphan_key
FROM tutor_profiles a LEFT JOIN user_accounts b ON a.user_id=b.id
WHERE a.user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_tp_reviewer' AS constraint_name, CONCAT_WS('/',CAST(a.user_id AS CHAR)) AS orphan_key
FROM tutor_profiles a LEFT JOIN user_accounts b ON a.reviewed_by=b.id
WHERE a.reviewed_by IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_tutor_subjects_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.subject_id AS CHAR)) AS orphan_key
FROM tutor_subjects a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_tutor_subjects_ref' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.subject_id AS CHAR)) AS orphan_key
FROM tutor_subjects a LEFT JOIN subjects b ON a.subject_id=b.id
WHERE a.subject_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_tutor_grade_levels_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.grade_level_id AS CHAR)) AS orphan_key
FROM tutor_grade_levels a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_tutor_grade_levels_ref' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.grade_level_id AS CHAR)) AS orphan_key
FROM tutor_grade_levels a LEFT JOIN grade_levels b ON a.grade_level_id=b.id
WHERE a.grade_level_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_tutor_areas_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.area_id AS CHAR)) AS orphan_key
FROM tutor_areas a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_tutor_areas_ref' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.area_id AS CHAR)) AS orphan_key
FROM tutor_areas a LEFT JOIN areas b ON a.area_id=b.id
WHERE a.area_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_tutor_delivery_modes_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.delivery_mode_id AS CHAR)) AS orphan_key
FROM tutor_delivery_modes a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_tutor_delivery_modes_ref' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.delivery_mode_id AS CHAR)) AS orphan_key
FROM tutor_delivery_modes a LEFT JOIN delivery_modes b ON a.delivery_mode_id=b.id
WHERE a.delivery_mode_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_files_owner' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM private_files a LEFT JOIN user_accounts b ON a.owner_user_id=b.id
WHERE a.owner_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_tpe_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.file_id AS CHAR)) AS orphan_key
FROM tutor_profile_evidence a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_tpe_file' AS constraint_name, CONCAT_WS('/',CAST(a.tutor_id AS CHAR),CAST(a.file_id AS CHAR)) AS orphan_key
FROM tutor_profile_evidence a LEFT JOIN private_files b ON a.file_id=b.id
WHERE a.file_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_tokens_user' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM auth_tokens a LEFT JOIN user_accounts b ON a.user_id=b.id
WHERE a.user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_off_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM offerings a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_off_subject' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM offerings a LEFT JOIN subjects b ON a.subject_id=b.id
WHERE a.subject_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_off_grade' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM offerings a LEFT JOIN grade_levels b ON a.grade_level_id=b.id
WHERE a.grade_level_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_off_area' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM offerings a LEFT JOIN areas b ON a.area_id=b.id
WHERE a.area_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_off_mode' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM offerings a LEFT JOIN delivery_modes b ON a.delivery_mode_id=b.id
WHERE a.delivery_mode_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_off_reviewer' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM offerings a LEFT JOIN user_accounts b ON a.reviewed_by=b.id
WHERE a.reviewed_by IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_ots_offering' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM offering_time_slots a LEFT JOIN offerings b ON a.offering_id=b.id
WHERE a.offering_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_inv_learner' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM invitations a LEFT JOIN learner_profiles b ON a.learner_id=b.user_id
WHERE a.learner_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_inv_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM invitations a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_inv_offering' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM invitations a LEFT JOIN offerings b ON a.offering_id=b.id AND a.tutor_id=b.tutor_id
WHERE a.offering_id IS NOT NULL AND a.tutor_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_inv_subject' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM invitations a LEFT JOIN subjects b ON a.subject_id=b.id
WHERE a.subject_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_inv_grade' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM invitations a LEFT JOIN grade_levels b ON a.grade_level_id=b.id
WHERE a.grade_level_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_inv_area' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM invitations a LEFT JOIN areas b ON a.area_id=b.id
WHERE a.area_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_inv_mode' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM invitations a LEFT JOIN delivery_modes b ON a.delivery_mode_id=b.id
WHERE a.delivery_mode_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_jobs_learner' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM job_posts a LEFT JOIN learner_profiles b ON a.learner_id=b.user_id
WHERE a.learner_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_jobs_subject' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM job_posts a LEFT JOIN subjects b ON a.subject_id=b.id
WHERE a.subject_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_jobs_grade' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM job_posts a LEFT JOIN grade_levels b ON a.grade_level_id=b.id
WHERE a.grade_level_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_jobs_area' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM job_posts a LEFT JOIN areas b ON a.area_id=b.id
WHERE a.area_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_jobs_mode' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM job_posts a LEFT JOIN delivery_modes b ON a.delivery_mode_id=b.id
WHERE a.delivery_mode_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_apps_job' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM job_applications a LEFT JOIN job_posts b ON a.job_id=b.id
WHERE a.job_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_apps_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM job_applications a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_sel_application' AS constraint_name, CONCAT_WS('/',CAST(a.job_id AS CHAR)) AS orphan_key
FROM job_selections a LEFT JOIN job_applications b ON a.job_id=b.job_id AND a.application_id=b.id AND a.tutor_id=b.tutor_id
WHERE a.job_id IS NOT NULL AND a.application_id IS NOT NULL AND a.tutor_id IS NOT NULL AND b.job_id IS NULL
UNION ALL
SELECT 'fk_sel_actor' AS constraint_name, CONCAT_WS('/',CAST(a.job_id AS CHAR)) AS orphan_key
FROM job_selections a LEFT JOIN user_accounts b ON a.selected_by=b.id
WHERE a.selected_by IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_sources_learner' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM registration_sources a LEFT JOIN learner_profiles b ON a.learner_id=b.user_id
WHERE a.learner_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_sources_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM registration_sources a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_sources_invitation' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM registration_sources a LEFT JOIN invitations b ON a.invitation_id=b.id AND a.learner_id=b.learner_id AND a.tutor_id=b.tutor_id
WHERE a.invitation_id IS NOT NULL AND a.learner_id IS NOT NULL AND a.tutor_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_sources_selection' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM registration_sources a LEFT JOIN job_selections b ON a.job_id=b.job_id AND a.application_id=b.application_id AND a.tutor_id=b.tutor_id
WHERE a.job_id IS NOT NULL AND a.application_id IS NOT NULL AND a.tutor_id IS NOT NULL AND b.job_id IS NULL
UNION ALL
SELECT 'fk_sources_offering' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM registration_sources a LEFT JOIN offerings b ON a.offering_id=b.id AND a.tutor_id=b.tutor_id
WHERE a.offering_id IS NOT NULL AND a.tutor_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_carts_learner' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM carts a LEFT JOIN learner_profiles b ON a.learner_id=b.user_id
WHERE a.learner_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_ci_cart' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM cart_items a LEFT JOIN carts b ON a.cart_id=b.id
WHERE a.cart_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_ci_offering' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM cart_items a LEFT JOIN offerings b ON a.offering_id=b.id
WHERE a.offering_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_orders_learner' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM orders a LEFT JOIN learner_profiles b ON a.learner_id=b.user_id
WHERE a.learner_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_items_order' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM order_items a LEFT JOIN orders b ON a.order_id=b.id
WHERE a.order_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_items_source' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM order_items a LEFT JOIN registration_sources b ON a.registration_source_id=b.id
WHERE a.registration_source_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_items_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM order_items a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_contracts_item' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM contracts a LEFT JOIN order_items b ON a.order_item_id=b.id
WHERE a.order_item_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_contracts_learner' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM contracts a LEFT JOIN learner_profiles b ON a.learner_id=b.user_id
WHERE a.learner_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_contracts_tutor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM contracts a LEFT JOIN tutor_profiles b ON a.tutor_id=b.user_id
WHERE a.tutor_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_ost_role' AS constraint_name, CONCAT_WS('/',CAST(a.from_status AS CHAR),CAST(a.to_status AS CHAR),CAST(a.actor_role_code AS CHAR)) AS orphan_key
FROM order_status_transitions a LEFT JOIN roles b ON a.actor_role_code=b.code
WHERE a.actor_role_code IS NOT NULL AND b.code IS NULL
UNION ALL
SELECT 'fk_order_status_history_entity' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM order_status_history a LEFT JOIN orders b ON a.order_id=b.id
WHERE a.order_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_order_status_history_actor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM order_status_history a LEFT JOIN user_accounts b ON a.actor_user_id=b.id
WHERE a.actor_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_osh_transition' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM order_status_history a LEFT JOIN order_status_transitions b ON a.from_status=b.from_status AND a.to_status=b.to_status AND a.actor_role_code=b.actor_role_code
WHERE a.from_status IS NOT NULL AND a.to_status IS NOT NULL AND a.actor_role_code IS NOT NULL AND b.from_status IS NULL
UNION ALL
SELECT 'fk_contract_status_history_entity' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM contract_status_history a LEFT JOIN contracts b ON a.contract_id=b.id
WHERE a.contract_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_contract_status_history_actor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM contract_status_history a LEFT JOIN user_accounts b ON a.actor_user_id=b.id
WHERE a.actor_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_enroll_contract' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM enrollments a LEFT JOIN contracts b ON a.contract_id=b.id
WHERE a.contract_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_enroll_offering' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM enrollments a LEFT JOIN offerings b ON a.offering_id=b.id
WHERE a.offering_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_enroll_learner' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM enrollments a LEFT JOIN learner_profiles b ON a.learner_id=b.user_id
WHERE a.learner_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_pay_order' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM payments a LEFT JOIN orders b ON a.order_id=b.id
WHERE a.order_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_attempt_payment' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM payment_attempts a LEFT JOIN payments b ON a.payment_id=b.id
WHERE a.payment_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_webhook_attempt' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM payment_webhook_events a LEFT JOIN payment_attempts b ON a.payment_attempt_id=b.id
WHERE a.payment_attempt_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_alloc_payment' AS constraint_name, CONCAT_WS('/',CAST(a.payment_id AS CHAR),CAST(a.contract_id AS CHAR)) AS orphan_key
FROM payment_allocations a LEFT JOIN payments b ON a.payment_id=b.id
WHERE a.payment_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_alloc_contract' AS constraint_name, CONCAT_WS('/',CAST(a.payment_id AS CHAR),CAST(a.contract_id AS CHAR)) AS orphan_key
FROM payment_allocations a LEFT JOIN contracts b ON a.contract_id=b.id
WHERE a.contract_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_la_owner' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM ledger_accounts a LEFT JOIN user_accounts b ON a.owner_user_id=b.id
WHERE a.owner_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_wallet_user' AS constraint_name, CONCAT_WS('/',CAST(a.user_id AS CHAR)) AS orphan_key
FROM wallets a LEFT JOIN user_accounts b ON a.user_id=b.id
WHERE a.user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_wallet_account' AS constraint_name, CONCAT_WS('/',CAST(a.user_id AS CHAR)) AS orphan_key
FROM wallets a LEFT JOIN ledger_accounts b ON a.ledger_account_id=b.id
WHERE a.ledger_account_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_escrow_contract' AS constraint_name, CONCAT_WS('/',CAST(a.contract_id AS CHAR)) AS orphan_key
FROM escrow_accounts a LEFT JOIN contracts b ON a.contract_id=b.id
WHERE a.contract_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_escrow_account' AS constraint_name, CONCAT_WS('/',CAST(a.contract_id AS CHAR)) AS orphan_key
FROM escrow_accounts a LEFT JOIN ledger_accounts b ON a.ledger_account_id=b.id
WHERE a.ledger_account_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_release_contract' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM releases a LEFT JOIN contracts b ON a.contract_id=b.id
WHERE a.contract_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_release_actor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM releases a LEFT JOIN user_accounts b ON a.approved_by=b.id
WHERE a.approved_by IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_refund_allocation' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM refunds a LEFT JOIN payment_allocations b ON a.payment_id=b.payment_id AND a.contract_id=b.contract_id
WHERE a.payment_id IS NOT NULL AND a.contract_id IS NOT NULL AND b.payment_id IS NULL
UNION ALL
SELECT 'fk_refund_actor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM refunds a LEFT JOIN user_accounts b ON a.requested_by=b.id
WHERE a.requested_by IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_rh_refund' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM refund_status_history a LEFT JOIN refunds b ON a.refund_id=b.id
WHERE a.refund_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_rh_actor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM refund_status_history a LEFT JOIN user_accounts b ON a.actor_user_id=b.id
WHERE a.actor_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_journal_payment' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM money_journals a LEFT JOIN payments b ON a.payment_id=b.id
WHERE a.payment_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_journal_contract' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM money_journals a LEFT JOIN contracts b ON a.contract_id=b.id
WHERE a.contract_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_journal_release' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM money_journals a LEFT JOIN releases b ON a.release_id=b.id
WHERE a.release_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_journal_refund' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM money_journals a LEFT JOIN refunds b ON a.refund_id=b.id
WHERE a.refund_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_journal_wallet' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM money_journals a LEFT JOIN wallets b ON a.wallet_user_id=b.user_id
WHERE a.wallet_user_id IS NOT NULL AND b.user_id IS NULL
UNION ALL
SELECT 'fk_entry_journal' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM ledger_entries a LEFT JOIN money_journals b ON a.journal_id=b.id
WHERE a.journal_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_entry_account' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM ledger_entries a LEFT JOIN ledger_accounts b ON a.ledger_account_id=b.id
WHERE a.ledger_account_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_idem_actor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM idempotency_records a LEFT JOIN user_accounts b ON a.actor_user_id=b.id
WHERE a.actor_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_idem_order' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM idempotency_records a LEFT JOIN orders b ON a.order_id=b.id
WHERE a.order_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_review_contract' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM reviews a LEFT JOIN contracts b ON a.contract_id=b.id
WHERE a.contract_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_review_user' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM reviews a LEFT JOIN user_accounts b ON a.reviewer_user_id=b.id
WHERE a.reviewer_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_report_reporter' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM reports a LEFT JOIN user_accounts b ON a.reporter_user_id=b.id
WHERE a.reporter_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_report_target' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM reports a LEFT JOIN user_accounts b ON a.target_user_id=b.id
WHERE a.target_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_report_contract' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM reports a LEFT JOIN contracts b ON a.related_contract_id=b.id
WHERE a.related_contract_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_report_assigned' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM reports a LEFT JOIN user_accounts b ON a.assigned_admin_id=b.id
WHERE a.assigned_admin_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_report_resolved' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM reports a LEFT JOIN user_accounts b ON a.resolved_by=b.id
WHERE a.resolved_by IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_re_report' AS constraint_name, CONCAT_WS('/',CAST(a.report_id AS CHAR),CAST(a.file_id AS CHAR)) AS orphan_key
FROM report_evidence a LEFT JOIN reports b ON a.report_id=b.id
WHERE a.report_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_re_file' AS constraint_name, CONCAT_WS('/',CAST(a.report_id AS CHAR),CAST(a.file_id AS CHAR)) AS orphan_key
FROM report_evidence a LEFT JOIN private_files b ON a.file_id=b.id
WHERE a.file_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_notice_user' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM notifications a LEFT JOIN user_accounts b ON a.recipient_user_id=b.id
WHERE a.recipient_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_notice_order' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM notifications a LEFT JOIN orders b ON a.order_id=b.id
WHERE a.order_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_notice_refund' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM notifications a LEFT JOIN refunds b ON a.refund_id=b.id
WHERE a.refund_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_notice_report' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM notifications a LEFT JOIN reports b ON a.report_id=b.id
WHERE a.report_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_audit_actor' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM audit_logs a LEFT JOIN user_accounts b ON a.actor_user_id=b.id
WHERE a.actor_user_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_audit_order' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM audit_logs a LEFT JOIN orders b ON a.order_id=b.id
WHERE a.order_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_audit_report' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM audit_logs a LEFT JOIN reports b ON a.report_id=b.id
WHERE a.report_id IS NOT NULL AND b.id IS NULL
UNION ALL
SELECT 'fk_audit_target' AS constraint_name, CONCAT_WS('/',CAST(a.id AS CHAR)) AS orphan_key
FROM audit_logs a LEFT JOIN user_accounts b ON a.target_user_id=b.id
WHERE a.target_user_id IS NOT NULL AND b.id IS NULL;

-- accounts=17; offerings=18; orders=24; items=26; contracts=26; topup=40000000; received=24550550; walletFunding=11860270; providerFunding=12690280; released=9920260; fees=992031; tutorNet=8928229; refunded=2330040; held=12300250; journals=50; entries=111; releases=11; refunds=5; reviews=3

