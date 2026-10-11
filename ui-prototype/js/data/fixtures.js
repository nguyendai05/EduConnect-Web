/**
 * FIXTURE DÙNG CHUNG — nguồn chuẩn duy nhất cho các thực thể demo của prototype Edu Connect.
 *
 * Toàn bộ dữ liệu dưới đây là GIÁ TRỊ TỔNG HỢP phục vụ trình diễn giao diện:
 * không có tài khoản thật, không có email/số điện thoại/giấy tờ thật, không gọi mạng.
 * Email demo dùng domain `.test` theo RFC 6761. Token đều có tiền tố DEMO.
 *
 * Quy ước ID (giữ tương thích với các trang đã có trước đó):
 *   GS-xx            gia sư / hồ sơ gia sư
 *   OF-SVC-xxxx      dịch vụ (SERVICE)
 *   OF-GRP-xxxx      lớp nhóm (GROUP_CLASS)
 *   JOB-2026-xxxx    tin tìm gia sư
 *   INV-xxxxxxxx-xxx lời mời / đề xuất thương lượng
 *   OD-2026-xxxx     đơn đăng ký (order) — KHÁC hợp đồng
 *   HD-xxxxxxxx-xxx  hợp đồng (contract) — giữ nguyên ID các trang contract đang dùng
 *   PAY-2026-xxxx    phiên thanh toán (payment attempt)
 *   TT-xxxxx         bút toán ví (ledger / financial event)
 *   FE-2026-xxxx     sự kiện tài chính release/hold/refund
 *   RV-2026-xxxx     đánh giá (review)
 *   RP-2026-xxxx     báo cáo (report)
 *   EN-2026-xxxx     ghi danh lớp nhóm (enrollment)
 */
(() => {
  const CURRENCY = 'VND'

  /**
   * GIẢ ĐỊNH DEMO CHƯA ĐƯỢC NHÓM CHỐT: mức phí nền tảng dùng cho toàn bộ màn hình.
   * Chọn 0.10 vì khớp với ví dụ hợp đồng đang hiển thị ở contract detail.
   * Không phải chính sách production; mọi màn phải đọc giá trị này, không hard-code.
   */
  const DEMO_FEE_RATE = 0.10

  /**
   * GIẢ ĐỊNH DEMO CHƯA CHỐT: chính sách hoàn tiền khi hủy.
   * Không quảng cáo hoàn 100% cho mọi trường hợp.
   */
  const DEMO_REFUND_POLICY = Object.freeze({
    beforeFirstSession: { code: 'before-first-session', label: 'Hủy trước buổi đầu', refundRate: 1, note: 'Hoàn toàn bộ phần chưa sử dụng, trừ phí đã release.' },
    afterFirstSession: { code: 'after-first-session', label: 'Hủy sau khi đã học', refundRate: 0.5, note: 'Hoàn 50% phần buổi còn lại; phần đã release không hoàn.' },
    releasedNotRefundable: { code: 'released-not-refundable', label: 'Phần đã giải ngân', refundRate: 0, note: 'Tiền đã giải ngân cho gia sư không được hoàn theo demo policy.' },
    groupFullClosed: { code: 'group-full-closed', label: 'Lớp đã đầy/đóng', refundRate: 1, note: 'Hoàn toàn bộ nếu lớp không thể nhận thêm chỗ.' }
  })

  const personas = Object.freeze([
    { id: 'PARENT-01', role: 'learner', learnerKind: 'parent', name: 'Chị Mai Lan', initials: 'ML', email: 'mai.lan@demo.test', headerVariant: 'B', label: 'Phụ huynh', homePage: 'home' },
    { id: 'STUDENT-01', role: 'learner', learnerKind: 'student', name: 'Minh Quân', initials: 'MQ', email: 'minh.quan@demo.test', headerVariant: 'STUDENT', label: 'Học viên Lớp 12 - Tự nhiên', homePage: 'home' },
    { id: 'TUTOR-01', tutorId: 'GS-05', role: 'tutor', name: 'Lê Hoàng Yến', initials: 'LY', email: 'hoang.yen@demo.test', headerVariant: 'TUTOR', label: 'Gia sư Chuyên Toán', profileStatus: 'approved', verified: true, homePage: 'tutorManage' },
    { id: 'TUTOR-02', tutorId: 'GS-13', role: 'tutor', name: 'Đặng Quốc Bảo', initials: 'DB', email: 'quoc.bao@demo.test', headerVariant: 'TUTOR', label: 'Gia sư đang chờ duyệt', profileStatus: 'pending', verified: false, homePage: 'tutorManage' },
    { id: 'ADMIN-01', role: 'admin', name: 'Quản trị Edu Connect', initials: 'AD', email: 'admin@demo.test', headerVariant: 'ADMIN', label: 'Quản trị nền tảng', homePage: 'adminDashboard' }
  ])

  /**
   * Người học/phụ huynh (LEARNER). `responseRate` và `memberSince` là dữ liệu demo dùng cho
   * khối "phụ huynh đăng tin" trên trang chi tiết tin — trang đó không được tự viết bảng riêng.
   */
  const learners = Object.freeze([
    { id: 'HV-2001', personaId: 'PARENT-01', name: 'Chị Mai Lan', initials: 'ML', studentName: 'Nguyễn Khánh Vy', grade: 'Lớp 10', region: 'ho-chi-minh', district: 'Thủ Đức, TP.HCM', responseRate: 100, memberSince: 2024 },
    { id: 'HV-2002', personaId: 'STUDENT-01', name: 'Minh Quân', initials: 'MQ', studentName: 'Minh Quân', grade: 'Lớp 12', region: 'ho-chi-minh', district: 'Quận 3, TP.HCM', responseRate: 94, memberSince: 2024 },
    { id: 'HV-2003', personaId: null, name: 'Anh Tuấn Kiệt', initials: 'TK', studentName: 'Tuấn Kiệt', grade: 'Lớp 8', region: 'ha-noi', district: 'Cầu Giấy, Hà Nội', responseRate: 92, memberSince: 2025 },
    { id: 'HV-2004', personaId: null, name: 'Chị Thu Hằng', initials: 'TH', studentName: 'Bảo Trâm', grade: 'Lớp 10', region: 'ho-chi-minh', district: 'Bình Thạnh, TP.HCM', responseRate: 96, memberSince: 2023 },
    { id: 'HV-2005', personaId: null, name: 'Chị Ngọc Anh', initials: 'NA', studentName: 'Hải Yến', grade: 'Lớp 12', region: 'ha-noi', district: 'Cầu Giấy, Hà Nội', responseRate: 90, memberSince: 2025 },
    { id: 'HV-2006', personaId: null, name: 'Anh Đức Kiên', initials: 'DK', studentName: 'Gia Bảo', grade: 'Lớp 12', region: 'da-nang', district: 'Hải Châu, Đà Nẵng', responseRate: 88, memberSince: 2024 },
    { id: 'HV-2007', personaId: null, name: 'Anh Hoàng Phúc', initials: 'HP', studentName: 'Khánh Văn', grade: 'Người đi làm', region: 'toan-quoc', district: 'Trực tuyến toàn quốc', responseRate: 91, memberSince: 2025 },
    { id: 'HV-2008', personaId: null, name: 'Cô Mai Trang', initials: 'MT', studentName: 'Mai Trang', grade: 'Lớp 12', region: 'ho-chi-minh', district: 'Quận 7, TP.HCM', responseRate: 95, memberSince: 2023 },
    { id: 'HV-2009', personaId: null, name: 'Anh Tuấn An', initials: 'TA', studentName: 'Bảo Trâm', grade: 'Lớp 9', region: 'ho-chi-minh', district: 'Tân Bình, TP.HCM', responseRate: 97, memberSince: 2024 }
  ])

  const tutors = Object.freeze([
    { id: 'GS-01', personaId: null, name: 'Nguyễn Minh Anh', initials: 'MA', profileStatus: 'approved', verified: true, subjects: ['toan'], grades: ['10', 'luyen-thi'], region: 'ho-chi-minh', district: 'Thủ Đức, TP.HCM', delivery: 'both', rating: 4.9, reviewCount: 126, classesTaught: 84, experienceYears: 5, bio: 'Thạc sĩ Toán học, chuyên gia sư nền tảng và luyện thi.' },
    { id: 'GS-02', personaId: null, name: 'Trần Quốc Huy', initials: 'QH', profileStatus: 'approved', verified: true, subjects: ['tieng-anh'], grades: ['luyen-thi'], region: 'ho-chi-minh', district: 'Quận 7, TP.HCM', delivery: 'both', rating: 4.8, reviewCount: 89, classesTaught: 62, experienceYears: 4, bio: 'Cử nhân ĐH Sư phạm, IELTS 8.0. Chuyên luyện thi chứng chỉ và phát triển kỹ năng nghe nói.' },
    { id: 'GS-03', personaId: null, name: 'Lê Thảo Vy', initials: 'TV', profileStatus: 'approved', verified: true, subjects: ['ngu-van'], grades: ['thcs'], region: 'ho-chi-minh', district: 'Bình Thạnh, TP.HCM', delivery: 'home', rating: 4.9, reviewCount: 61, classesTaught: 45, experienceYears: 3, bio: 'Tốt nghiệp xuất sắc ĐH Khoa học Xã hội & Nhân văn, giúp học sinh nắm vững phương pháp làm bài.' },
    { id: 'GS-04', personaId: null, name: 'Phạm Hoàng Long', initials: 'PL', profileStatus: 'approved', verified: true, subjects: ['toan'], grades: ['10', 'luyen-thi'], region: 'ho-chi-minh', district: 'Quận 3, TP.HCM', delivery: 'both', rating: 5, reviewCount: 42, classesTaught: 110, experienceYears: 6, bio: 'Thạc sĩ Toán ứng dụng ĐH Bách Khoa. Chuyên bồi dưỡng học sinh giỏi và luyện thi THPT Quốc gia.' },
    { id: 'GS-05', personaId: 'TUTOR-01', name: 'Lê Hoàng Yến', initials: 'LY', profileStatus: 'approved', verified: true, subjects: ['toan', 'vat-ly'], grades: ['thcs', '10'], region: 'ho-chi-minh', district: 'Thủ Đức, TP.HCM', delivery: 'both', rating: 4.7, reviewCount: 38, classesTaught: 52, experienceYears: 5, bio: 'Cử nhân Sư phạm Toán, dạy kèm nhóm nhỏ và một-một tại Thủ Đức.' },
    { id: 'GS-13', personaId: 'TUTOR-02', name: 'Đặng Quốc Bảo', initials: 'DB', profileStatus: 'pending', verified: false, subjects: ['hoa-hoc'], grades: ['10'], region: 'ho-chi-minh', district: 'Quận 10, TP.HCM', delivery: 'online', rating: 0, reviewCount: 0, classesTaught: 0, experienceYears: 1, bio: 'Hồ sơ đang chờ Edu Connect xác minh bằng cấp.' },
    { id: 'GS-14', personaId: null, name: 'Võ Ngọc Hân', initials: 'NH', profileStatus: 'rejected', verified: false, subjects: ['tieng-anh'], grades: ['tieu-hoc'], region: 'da-nang', district: 'Hải Châu, Đà Nẵng', delivery: 'online', rating: 0, reviewCount: 0, classesTaught: 0, experienceYears: 0, bio: 'Hồ sơ bị từ chối: thiếu bằng cấp xác minh.' }
  ])

  /**
   * Offerings — một tập duy nhất cho cả hai loại SERVICE và GROUP_CLASS.
   * `termsVersion` là phiên bản điều khoản; đơn cũ giữ snapshot, không đổi theo khi gia sư sửa.
   */
  const offerings = Object.freeze([
    { id: 'OF-SVC-1001', type: 'SERVICE', tutorId: 'GS-01', title: 'Gia sư Toán THPT tại nhà', subject: 'toan', subjectLabel: 'Toán học', grade: '10', gradeLabel: 'THPT (Lớp 10 – 12)', sessions: 24, durationMinutes: 90, price: 200000, unit: 'per-session', unitLabel: '/buổi 90 phút', mode: 'both', region: 'ho-chi-minh', district: 'Thủ Đức, TP.HCM', status: 'published', availability: 'open', termsVersion: 'v2', publishedAt: '2026-09-18T08:00:00+07:00', description: 'Bám sát chương trình lớp 10, củng cố nền tảng hàm số – vectơ và luyện đề theo tuần.', options: [{ key: 'intensity', label: 'Cường độ', values: [{ id: 'std', label: '2 buổi/tuần', delta: 0 }, { id: 'intensive', label: '3 buổi/tuần', delta: 0 }] }], scheduleText: 'Thứ 3 & Thứ 5, 18:00 – 19:30' },
    { id: 'OF-SVC-1002', type: 'SERVICE', tutorId: 'GS-02', title: 'Luyện IELTS 1 kèm 1 (mục tiêu 6.5+)', subject: 'tieng-anh', subjectLabel: 'Tiếng Anh', grade: 'luyen-thi', gradeLabel: 'Luyện thi IELTS', sessions: 30, durationMinutes: 90, price: 250000, unit: 'per-session', unitLabel: '/buổi 90 phút', mode: 'both', region: 'ho-chi-minh', district: 'Quận 7, TP.HCM', status: 'published', availability: 'open', termsVersion: 'v1', publishedAt: '2026-10-02T09:30:00+07:00', description: 'Lộ trình 30 buổi chia 4 giai đoạn, chấm chữa Writing/Speaking trong 24 giờ.', options: [{ key: 'target', label: 'Mục tiêu', values: [{ id: '6.0', label: 'IELTS 6.0', delta: 0 }, { id: '6.5', label: 'IELTS 6.5', delta: 0 }, { id: '7.0', label: 'IELTS 7.0+', delta: 50000 }] }], scheduleText: 'Thứ 2 & Thứ 6, 19:00 – 20:30' },
    { id: 'OF-SVC-1003', type: 'SERVICE', tutorId: 'GS-03', title: 'Ngữ văn THCS – đọc hiểu & nghị luận', subject: 'ngu-van', subjectLabel: 'Ngữ văn', grade: 'thcs', gradeLabel: 'THCS (Lớp 6 – 9)', sessions: 20, durationMinutes: 90, price: 180000, unit: 'per-session', unitLabel: '/buổi 90 phút', mode: 'home', region: 'ho-chi-minh', district: 'Bình Thạnh, TP.HCM', status: 'published', availability: 'open', termsVersion: 'v1', publishedAt: '2026-09-25T14:00:00+07:00', description: 'Rèn kỹ năng đọc hiểu văn bản và viết bài nghị luận xã hội theo dàn ý chuẩn.', options: [], scheduleText: 'Thứ 4, 17:30 – 19:00' },
    { id: 'OF-SVC-1004', type: 'SERVICE', tutorId: 'GS-04', title: 'Bồi dưỡng Toán luyện thi THPT Quốc gia', subject: 'toan', subjectLabel: 'Toán học', grade: 'luyen-thi', gradeLabel: 'Luyện thi THPT Quốc gia', sessions: 40, durationMinutes: 120, price: 300000, unit: 'per-session', unitLabel: '/buổi 120 phút', mode: 'both', region: 'ho-chi-minh', district: 'Quận 3, TP.HCM', status: 'published', availability: 'open', termsVersion: 'v3', publishedAt: '2026-08-30T07:15:00+07:00', description: 'Tổng ôn 40 buổi, thi thử 6 đợt, phân tích lỗi sai theo từng chuyên đề.', options: [{ key: 'format', label: 'Hình thức', values: [{ id: 'online', label: 'Trực tuyến', delta: -30000 }, { id: 'home', label: 'Tại nhà học viên', delta: 0 }] }], scheduleText: 'Thứ 7 & Chủ nhật, 08:00 – 10:00' },
    { id: 'OF-SVC-1005', type: 'SERVICE', tutorId: 'GS-05', title: 'Toán lớp 10 – kèm một-một (gia sư demo)', subject: 'toan', subjectLabel: 'Toán học', grade: '10', gradeLabel: 'THPT (Lớp 10 – 12)', sessions: 16, durationMinutes: 90, price: 220000, unit: 'per-session', unitLabel: '/buổi 90 phút', mode: 'both', region: 'ho-chi-minh', district: 'Thủ Đức, TP.HCM', status: 'published', availability: 'open', termsVersion: 'v2', publishedAt: '2026-10-06T10:00:00+07:00', description: 'Dịch vụ thuộc gia sư demo đang đăng nhập, dùng để kiểm tra luồng quản lý của gia sư.', options: [{ key: 'intensity', label: 'Cường độ', values: [{ id: 'std', label: '2 buổi/tuần', delta: 0 }, { id: 'intensive', label: '3 buổi/tuần', delta: 20000 }] }], scheduleText: 'Thứ 3, 18:00 – 19:30' },
    { id: 'OF-SVC-1006', type: 'SERVICE', tutorId: 'GS-01', title: 'Toán THCS (đã đóng)', subject: 'toan', subjectLabel: 'Toán học', grade: 'thcs', gradeLabel: 'THCS (Lớp 6 – 9)', sessions: 12, durationMinutes: 90, price: 170000, unit: 'per-session', unitLabel: '/buổi 90 phút', mode: 'home', region: 'ho-chi-minh', district: 'Thủ Đức, TP.HCM', status: 'published', availability: 'closed', termsVersion: 'v1', publishedAt: '2026-07-01T08:00:00+07:00', description: 'Dịch vụ đã đóng, không nhận đăng ký mới. Giữ lại để kiểm tra trạng thái closed.', options: [], scheduleText: 'Đã kết thúc' },
    { id: 'OF-SVC-1007', type: 'SERVICE', tutorId: 'GS-13', title: 'Hóa học lớp 10 (chưa duyệt hồ sơ)', subject: 'hoa-hoc', subjectLabel: 'Hóa học', grade: '10', gradeLabel: 'THPT (Lớp 10 – 12)', sessions: 12, durationMinutes: 90, price: 150000, unit: 'per-session', unitLabel: '/buổi 90 phút', mode: 'online', region: 'ho-chi-minh', district: 'Quận 10, TP.HCM', status: 'draft', availability: 'open', termsVersion: 'v1', publishedAt: null, description: 'Bản nháp của gia sư chưa được duyệt — không hiển thị công khai.', options: [], scheduleText: 'Chưa xếp lịch' },
    { id: 'OF-GRP-2001', type: 'GROUP_CLASS', tutorId: 'GS-05', title: 'Lớp nhóm Toán 10 – tối T3&T5', subject: 'toan', subjectLabel: 'Toán học', grade: '10', gradeLabel: 'THPT (Lớp 10 – 12)', sessions: 24, durationMinutes: 120, price: 150000, unit: 'per-session', unitLabel: '/buổi 120 phút', mode: 'home', region: 'ho-chi-minh', district: 'Thủ Đức, TP.HCM', status: 'published', availability: 'open', termsVersion: 'v1', publishedAt: '2026-10-01T08:00:00+07:00', description: 'Lớp nhóm tối đa 8 học viên, học tại trung tâm Linh Chiểu.', capacity: 8, enrolled: 5, enrolledLearnerIds: ['HV-2002'], startDate: '2026-10-14', schedule: [{ day: 3, start: '18:30', end: '20:30' }, { day: 5, start: '18:30', end: '20:30' }], scheduleText: 'Thứ 3 & Thứ 5, 18:30 – 20:30', options: [] },
    { id: 'OF-GRP-2002', type: 'GROUP_CLASS', tutorId: 'GS-01', title: 'Lớp nhóm Toán 12 – sáng T7 (đã đủ chỗ)', subject: 'toan', subjectLabel: 'Toán học', grade: 'luyen-thi', gradeLabel: 'Luyện thi THPT Quốc gia', sessions: 20, durationMinutes: 150, price: 180000, unit: 'per-session', unitLabel: '/buổi 150 phút', mode: 'home', region: 'ho-chi-minh', district: 'Thủ Đức, TP.HCM', status: 'published', availability: 'open', termsVersion: 'v1', publishedAt: '2026-09-12T08:00:00+07:00', description: 'Lớp đã đủ 6/6 chỗ — dùng để kiểm tra chặn đăng ký khi full.', capacity: 6, enrolled: 6, enrolledLearnerIds: ['HV-2001', 'HV-2002'], startDate: '2026-10-11', schedule: [{ day: 7, start: '08:00', end: '10:30' }], scheduleText: 'Thứ 7, 08:00 – 10:30', options: [] },
    { id: 'OF-GRP-2003', type: 'GROUP_CLASS', tutorId: 'GS-02', title: 'Nhóm IELTS Speaking (đã đóng)', subject: 'tieng-anh', subjectLabel: 'Tiếng Anh', grade: 'luyen-thi', gradeLabel: 'Luyện thi IELTS', sessions: 12, durationMinutes: 90, price: 160000, unit: 'per-session', unitLabel: '/buổi 90 phút', mode: 'online', region: 'ho-chi-minh', district: 'Quận 7, TP.HCM', status: 'published', availability: 'closed', termsVersion: 'v1', publishedAt: '2026-06-20T08:00:00+07:00', description: 'Khóa đã kết thúc, không nhận thêm học viên.', capacity: 6, enrolled: 6, enrolledLearnerIds: [], startDate: '2026-07-05', schedule: [{ day: 4, start: '19:00', end: '20:30' }], scheduleText: 'Thứ 4, 19:00 – 20:30', options: [] },
    { id: 'OF-GRP-2004', type: 'GROUP_CLASS', tutorId: 'GS-05', title: 'Lớp nhóm Vật lý 10 – còn 1 chỗ', subject: 'vat-ly', subjectLabel: 'Vật lý', grade: '10', gradeLabel: 'THPT (Lớp 10 – 12)', sessions: 16, durationMinutes: 90, price: 140000, unit: 'per-session', unitLabel: '/buổi 90 phút', mode: 'home', region: 'ho-chi-minh', district: 'Thủ Đức, TP.HCM', status: 'published', availability: 'open', termsVersion: 'v1', publishedAt: '2026-10-08T16:00:00+07:00', description: 'Chỉ còn đúng 1 chỗ — dùng để kiểm tra tranh chỗ cuối.', capacity: 4, enrolled: 3, enrolledLearnerIds: [], startDate: '2026-10-20', schedule: [{ day: 2, start: '17:30', end: '19:00' }], scheduleText: 'Thứ 2, 17:30 – 19:00', options: [] },
    { id: 'OF-GRP-2005', type: 'GROUP_CLASS', tutorId: 'GS-03', title: 'Nhóm Ngữ văn 9 (chưa công khai)', subject: 'ngu-van', subjectLabel: 'Ngữ văn', grade: 'thcs', gradeLabel: 'THCS (Lớp 6 – 9)', sessions: 16, durationMinutes: 90, price: 130000, unit: 'per-session', unitLabel: '/buổi 90 phút', mode: 'home', region: 'ho-chi-minh', district: 'Bình Thạnh, TP.HCM', status: 'unpublished', availability: 'open', termsVersion: 'v1', publishedAt: null, description: 'Chưa công khai — không xuất hiện ở home/catalog công khai.', capacity: 5, enrolled: 0, enrolledLearnerIds: [], startDate: '2026-11-01', schedule: [{ day: 6, start: '09:00', end: '10:30' }], scheduleText: 'Thứ 6, 09:00 – 10:30', options: [] }
  ])

  /**
   * Tin tìm gia sư do học viên/phụ huynh đăng; gia sư ứng tuyển. KHÔNG phải offering của gia sư.
   * Đây là NGUỒN DUY NHẤT cho bảng tin (job/discover), chi tiết tin (job/detail), hồ sơ ứng tuyển
   * (job/applicants), "Tin của tôi" (job/my-job) và hàng đợi kiểm duyệt admin.
   * `level` là khóa bộ lọc công khai (thpt | thcs | adult); `grade` là mã cấp học dùng nội bộ.
   * `status` = kết quả kiểm duyệt (pending | approved | rejected); `availability` = tin còn nhận hồ sơ.
   */
  const jobs = Object.freeze([
    { id: 'TT-8833', learnerId: 'HV-2001', title: 'Tìm gia sư Toán lớp 10 tại TP. Thủ Đức', subject: 'toan', subjectLabel: 'Toán học', grade: '10', gradeLabel: 'Lớp 10 · THPT', level: 'thpt', sessionsPerWeek: 2, durationMinutes: 90, budgetPerSession: 200000, sessions: 20, mode: 'home', modeLabel: 'Tại nhà học sinh', region: 'ho-chi-minh', district: 'P. Linh Trung, TP. Thủ Đức', experienceYears: 3, experienceLabel: 'Kinh nghiệm từ 3 năm', gender: 'all', genderLabel: 'Không yêu cầu (Nam/Nữ)', status: 'approved', availability: 'closed', publishedAt: '2026-09-22T09:00:00+07:00', expiresAt: '2026-10-22T09:00:00+07:00', description: 'Con gái lớp 10 cần củng cố Hàm số và Hình học không gian theo chương trình trường. Gia đình mong muốn gia sư có kinh nghiệm dạy THPT, giảng dễ hiểu và có phương pháp sư phạm rõ ràng.', focus: ['Hàm số', 'Hình học không gian', 'Ôn kiểm tra giữa kỳ & học kỳ 1'], tutorNote: 'Ưu tiên gia sư dạy được buổi tối thứ Ba và thứ Năm.', submittedAt: '2026-09-22T09:00:00+07:00', scheduleText: 'Thứ 3 & Thứ 5, 18:00 – 19:30', qualification: 'Cử nhân Sư phạm Toán hoặc đã tốt nghiệp chuyên ngành Toán', signal: '', selectedApplicationId: 'APP-2026-0402' },
    { id: 'TT-8834', learnerId: 'HV-2006', title: 'Ôn tập Vật lý lớp 12 – luyện đề tốt nghiệp', subject: 'vat-ly', subjectLabel: 'Vật lý', grade: '12', gradeLabel: 'Lớp 12 · THPT', level: 'thpt', sessionsPerWeek: 2, durationMinutes: 90, budgetPerSession: 240000, sessions: 24, mode: 'home', modeLabel: 'Tại nhà học sinh', region: 'da-nang', district: 'Hải Châu, Đà Nẵng', experienceYears: 2, experienceLabel: 'Kinh nghiệm từ 2 năm', gender: 'all', genderLabel: 'Không yêu cầu (Nam/Nữ)', status: 'approved', availability: 'closed', publishedAt: '2026-10-07T10:00:00+07:00', expiresAt: '2026-11-07T10:00:00+07:00', description: 'Ôn tập Vật lý lớp 12 và luyện đề tốt nghiệp theo cấu trúc mới. Tin đã đóng vì phụ huynh đã chọn được gia sư phù hợp.', focus: ['Dao động & sóng cơ', 'Điện xoay chiều', 'Đề thi tốt nghiệp 30 câu'], tutorNote: 'Cần hệ thống bài tập từ cơ bản đến nâng cao.', submittedAt: '2026-10-07T10:00:00+07:00', scheduleText: 'Thứ 4 & Thứ 7, 19:00 – 20:30', qualification: 'Có kinh nghiệm luyện thi tốt nghiệp THPT môn Vật lý', signal: '', selectedApplicationId: 'APP-2026-0412' },
    { id: 'TT-8835', learnerId: 'HV-2007', title: 'Tiếng Anh giao tiếp cho người đi làm', subject: 'tieng-anh', subjectLabel: 'Tiếng Anh', grade: 'di-lam', gradeLabel: 'Người đi làm', level: 'adult', sessionsPerWeek: 2, durationMinutes: 90, budgetPerSession: 300000, sessions: 20, mode: 'online', modeLabel: 'Trực tuyến (Google Meet / Zoom)', region: 'toan-quoc', district: 'Trực tuyến toàn quốc', experienceYears: 2, experienceLabel: 'Ưu tiên có chứng chỉ quốc tế', gender: 'all', genderLabel: 'Không yêu cầu (Nam/Nữ)', status: 'approved', availability: 'open', publishedAt: '2026-10-08T14:00:00+07:00', expiresAt: '2026-11-08T14:00:00+07:00', description: 'Luyện giao tiếp tiếng Anh trong công việc, tập trung thuyết trình và trao đổi với đồng nghiệp nước ngoài. Học trực tuyến buổi tối.', focus: ['Phản xạ giao tiếp', 'Thuyết trình bằng tiếng Anh', 'Email & họp online'], tutorNote: 'Ưu tiên tình huống giao tiếp thực tế trong công sở.', submittedAt: '2026-10-08T14:00:00+07:00', scheduleText: 'Thứ 3 & Thứ 5, 20:00 – 21:30', qualification: 'Chứng chỉ IELTS 7.5+ hoặc trình độ tương đương', signal: '', selectedApplicationId: null },
    { id: 'TT-8836', learnerId: 'HV-2003', title: 'Gia sư Toán lớp 8 củng cố kiến thức', subject: 'toan', subjectLabel: 'Toán học', grade: 'thcs', gradeLabel: 'Lớp 8 · THCS', level: 'thcs', sessionsPerWeek: 2, durationMinutes: 90, budgetPerSession: 180000, sessions: 24, mode: 'home', modeLabel: 'Tại nhà học sinh', region: 'ha-noi', district: 'Cầu Giấy, Hà Nội', experienceYears: 1, experienceLabel: 'Kinh nghiệm từ 1 năm', gender: 'all', genderLabel: 'Không yêu cầu (Nam/Nữ)', status: 'approved', availability: 'open', publishedAt: '2026-10-08T15:15:00+07:00', expiresAt: '2026-11-08T15:15:00+07:00', description: 'Hỗ trợ học sinh lớp 8 củng cố kiến thức Toán đại số và hình học, luyện bài tập và chuẩn bị kiểm tra giữa kỳ. Lịch học vào tối thứ Ba và thứ Sáu.', focus: ['Đại số lớp 8', 'Hình học đường tròn', 'Ôn kiểm tra giữa kỳ'], tutorNote: 'Củng cố kiến thức nền và hướng dẫn phương pháp tự học.', submittedAt: '2026-10-08T15:15:00+07:00', scheduleText: 'Thứ 3 & Thứ 6, 19:30 – 21:00', qualification: 'Sinh viên hoặc cử nhân Sư phạm Toán, có kinh nghiệm giảng dạy THCS', signal: '', selectedApplicationId: null },
    { id: 'TT-8837', learnerId: 'HV-2008', title: 'Kèm Ngữ văn lớp 12 – luyện thi tốt nghiệp', subject: 'ngu-van', subjectLabel: 'Ngữ văn', grade: '12', gradeLabel: 'Lớp 12 · THPT', level: 'thpt', sessionsPerWeek: 1, durationMinutes: 120, budgetPerSession: 230000, sessions: 16, mode: 'home', modeLabel: 'Tại nhà học sinh', region: 'ho-chi-minh', district: 'P. Tân Phong, Quận 7, TP.HCM', experienceYears: 2, experienceLabel: 'Kinh nghiệm từ 2 năm', gender: 'female', genderLabel: 'Gia sư Nữ', status: 'approved', availability: 'open', publishedAt: '2026-10-09T10:10:00+07:00', expiresAt: '2026-11-09T10:10:00+07:00', description: 'Cần gia sư Ngữ văn lớp 12 hướng dẫn kỹ năng đọc hiểu, nghị luận xã hội và nghị luận văn học để chuẩn bị thi tốt nghiệp THPT. Học sáng Chủ nhật, mỗi buổi 120 phút.', focus: ['Nghị luận xã hội', 'Nghị luận văn học', 'Kỹ năng làm bài 120 phút'], tutorNote: 'Hướng dẫn xây dựng dàn ý và nhận xét bài viết sau mỗi buổi.', submittedAt: '2026-10-09T10:10:00+07:00', scheduleText: 'Chủ nhật, 08:00 – 10:00', qualification: 'Chuyên ngành Ngữ văn hoặc Sư phạm Ngữ văn', signal: '', selectedApplicationId: null },
    { id: 'TT-8838', learnerId: 'HV-2002', title: 'Luyện thi IELTS General 6.5 cấp tốc', subject: 'tieng-anh', subjectLabel: 'IELTS', grade: 'luyen-thi', gradeLabel: 'Người đi làm · IELTS', level: 'adult', sessionsPerWeek: 3, durationMinutes: 90, budgetPerSession: 350000, sessions: 20, mode: 'online', modeLabel: 'Trực tuyến (Google Meet)', region: 'toan-quoc', district: 'Toàn quốc', experienceYears: 3, experienceLabel: 'Kinh nghiệm luyện IELTS', gender: 'all', genderLabel: 'Không yêu cầu (Nam/Nữ)', status: 'approved', availability: 'closed', publishedAt: '2026-08-14T09:00:00+07:00', expiresAt: '2026-09-14T09:00:00+07:00', description: 'Tìm gia sư IELTS General với mục tiêu 6.5 trong 3 tháng. Trình độ hiện tại khoảng 5.0, cần cải thiện Writing và Speaking. Học trực tuyến sau 20 giờ.', focus: ['Writing Task 1 & 2', 'Speaking part 2–3', 'Chữa bài trong 24 giờ'], tutorNote: 'Có thể chữa bài Writing chi tiết và luyện Speaking theo tình huống thực tế.', submittedAt: '2026-08-14T09:00:00+07:00', scheduleText: 'Thứ 2 & Thứ 6, 20:00 – 21:30', qualification: 'IELTS 7.5 trở lên hoặc trình độ tương đương', signal: '', selectedApplicationId: 'APP-2026-0404' },
    { id: 'TT-8839', learnerId: 'HV-2009', title: 'Tìm gia sư Toán lớp 9 ôn thi vào 10', subject: 'toan', subjectLabel: 'Toán học', grade: 'thcs', gradeLabel: 'Lớp 9 · THCS', level: 'thcs', sessionsPerWeek: 2, durationMinutes: 90, budgetPerSession: 200000, sessions: 16, mode: 'home', modeLabel: 'Tại nhà học sinh', region: 'ho-chi-minh', district: 'P. 25, Quận Tân Bình, TP.HCM', experienceYears: 2, experienceLabel: 'Có kinh nghiệm ôn thi vào lớp 10', gender: 'all', genderLabel: 'Không yêu cầu (Nam/Nữ)', status: 'pending', availability: 'open', publishedAt: null, expiresAt: null, description: 'Cần gia sư Toán giúp học sinh lớp 9 ôn thi vào lớp 10, tập trung đại số và hình học đường tròn. Học tại nhà vào cuối tuần, mỗi buổi 90 phút. Tin đang chờ quản trị duyệt nên chưa nhận hồ sơ.', focus: ['Đại số ôn thi', 'Hình học đường tròn', 'Đề vào 10 các năm'], tutorNote: 'Kiên nhẫn, giải thích rõ từng bước và theo sát mức độ tiến bộ.', submittedAt: '2026-10-09T09:05:00+07:00', scheduleText: 'Thứ 7 & Chủ nhật, 09:00 – 10:30', qualification: 'Có kinh nghiệm ôn thi vào lớp 10', signal: '', selectedApplicationId: null },
    { id: 'TT-8840', learnerId: 'HV-2005', title: 'Gia sư Hóa học 11 ôn thi đánh giá năng lực', subject: 'hoa-hoc', subjectLabel: 'Hóa học', grade: '11', gradeLabel: 'Lớp 11 · THPT', level: 'thpt', sessionsPerWeek: 3, durationMinutes: 90, budgetPerSession: 220000, sessions: 30, mode: 'online', modeLabel: 'Trực tuyến (Google Meet)', region: 'ha-noi', district: 'Cầu Giấy, Hà Nội', experienceYears: 2, experienceLabel: 'Kinh nghiệm từ 2 năm', gender: 'all', genderLabel: 'Không yêu cầu (Nam/Nữ)', status: 'pending', availability: 'open', publishedAt: null, expiresAt: null, description: 'Tìm gia sư Hóa học lớp 11 để hệ thống kiến thức và luyện bài tập đánh giá năng lực. Học trực tuyến các tối thứ Hai, thứ Tư và thứ Sáu. Tin đang chờ kiểm duyệt vì ghi chú chứa tài khoản liên hệ ngoài.', focus: ['Hóa hữu cơ 11', 'Bài tập định lượng', 'Đề ĐGNL theo chuyên đề'], tutorNote: 'Có lộ trình ôn thi đánh giá năng lực và bài kiểm tra tiến bộ hàng tuần.', submittedAt: '2026-10-09T08:35:00+07:00', scheduleText: 'Thứ 2, Thứ 4 & Thứ 6, 19:30 – 21:00', qualification: 'Chuyên ngành Hóa học hoặc Sư phạm Hóa học', signal: 'Chứa từ khóa tài khoản liên hệ ngoài nền tảng', selectedApplicationId: null },
    { id: 'TT-8841', learnerId: 'HV-2004', title: 'Gia sư Tiếng Anh lớp 10 – ngữ pháp và giao tiếp', subject: 'tieng-anh', subjectLabel: 'Tiếng Anh', grade: '10', gradeLabel: 'Lớp 10 · THPT', level: 'thpt', sessionsPerWeek: 2, durationMinutes: 90, budgetPerSession: 250000, sessions: 20, mode: 'home', modeLabel: 'Tại nhà học sinh', region: 'ho-chi-minh', district: 'P. 25, Quận Bình Thạnh, TP.HCM', experienceYears: 2, experienceLabel: 'Tối thiểu 2 năm giảng dạy', gender: 'all', genderLabel: 'Không yêu cầu (Nam/Nữ)', status: 'approved', availability: 'open', publishedAt: '2026-10-09T09:05:00+07:00', expiresAt: '2026-11-09T09:05:00+07:00', description: 'Cần gia sư hỗ trợ học sinh lớp 10 củng cố ngữ pháp, luyện kỹ năng đọc hiểu và giao tiếp tiếng Anh. Học vào tối thứ Ba và thứ Năm, mỗi buổi 90 phút.', focus: ['Ngữ pháp nền tảng', 'Đọc hiểu theo chủ đề', 'Phản xạ giao tiếp'], tutorNote: 'Ưu tiên gia sư phát âm chuẩn, kiên nhẫn và có phương pháp tương tác.', privateNote: 'Ghi chú riêng của phụ huynh: buổi tối nếu đến ngõ thì gọi điện để mở cửa hầm.', submittedAt: '2026-10-09T08:20:00+07:00', scheduleText: 'Thứ 3 & Thứ 5, 19:00 – 20:30', qualification: 'Sinh viên Sư phạm hoặc đã tốt nghiệp chuyên ngành Tiếng Anh', signal: 'Phát hiện số điện thoại trong ghi chú riêng', selectedApplicationId: null }
  ])

  /**
   * Hồ sơ ứng tuyển (APPLICATION) gia sư nộp vào một tin.
   * Số "X gia sư đã ứng tuyển" trên bảng tin SUY RA từ danh sách này, không ghi tay.
   * `slots` là khung giờ gia sư đề xuất; `proposedRate` là mức học phí đề xuất.
   */
  const applications = Object.freeze([
    { id: 'APP-2026-0401', jobId: 'TT-8841', tutorId: 'GS-05', proposedRate: 210000, message: 'Mình dạy Toán và Tiếng Anh nền tảng cho lớp 10, có thể bắt đầu tuần này.', status: 'submitted', slots: [{ day: 'Thứ 2', time: '19:00 - 20:30' }, { day: 'Thứ 4', time: '19:00 - 20:30' }], createdAt: '2026-10-09T10:00:00+07:00' },
    { id: 'APP-2026-0402', jobId: 'TT-8833', tutorId: 'GS-04', proposedRate: 280000, message: 'Nhận bồi dưỡng Toán lớp 10 và định hướng luyện thi sớm.', status: 'selected', slots: [{ day: 'Thứ 3', time: '18:00 - 19:30' }, { day: 'Thứ 5', time: '18:00 - 19:30' }], createdAt: '2026-09-24T15:30:00+07:00' },
    { id: 'APP-2026-0403', jobId: 'TT-8841', tutorId: 'GS-02', proposedRate: 250000, message: 'Lộ trình Tiếng Anh lớp 10 bám sát chương trình mới, có kiểm tra đầu vào.', status: 'submitted', slots: [{ day: 'Thứ 3', time: '19:00 - 20:30' }], createdAt: '2026-10-09T11:20:00+07:00' },
    { id: 'APP-2026-0404', jobId: 'TT-8838', tutorId: 'GS-02', proposedRate: 330000, message: 'Lộ trình IELTS General cấp tốc 20 buổi, chấm chữa trong 24 giờ.', status: 'selected', slots: [{ day: 'Thứ 2', time: '20:00 - 21:30' }, { day: 'Thứ 6', time: '20:00 - 21:30' }], createdAt: '2026-08-16T10:00:00+07:00' },
    { id: 'APP-2026-0405', jobId: 'TT-8833', tutorId: 'GS-01', proposedRate: 200000, message: 'Nhận kèm Toán lớp 10 theo chương trình mới, có đề kiểm tra mỗi tuần.', status: 'rejected', slots: [{ day: 'Thứ 4', time: '18:00 - 19:30' }], createdAt: '2026-09-23T20:10:00+07:00' },
    { id: 'APP-2026-0406', jobId: 'TT-8833', tutorId: 'GS-03', proposedRate: 190000, message: 'Chuyên Ngữ văn nhưng nhận kèm Toán nền tảng lớp 10.', status: 'withdrawn', slots: [{ day: 'Thứ 7', time: '09:00 - 10:30' }], createdAt: '2026-09-23T09:40:00+07:00' },
    { id: 'APP-2026-0407', jobId: 'TT-8835', tutorId: 'GS-02', proposedRate: 290000, message: 'Giáo án giao tiếp công sở, luyện thuyết trình và xử lý tình huống họp.', status: 'submitted', slots: [{ day: 'Thứ 3', time: '20:00 - 21:30' }, { day: 'Thứ 5', time: '20:00 - 21:30' }], createdAt: '2026-10-09T08:30:00+07:00' },
    { id: 'APP-2026-0408', jobId: 'TT-8835', tutorId: 'GS-14', proposedRate: 260000, message: 'Luyện phát âm và phản xạ cho người đi làm, học linh hoạt cuối tuần.', status: 'submitted', slots: [{ day: 'Chủ nhật', time: '14:00 - 15:30' }], createdAt: '2026-10-09T21:05:00+07:00' },
    { id: 'APP-2026-0409', jobId: 'TT-8836', tutorId: 'GS-05', proposedRate: 170000, message: 'Dạy Toán lớp 8 theo sát sách giáo khoa, có phiếu bài tập mỗi buổi.', status: 'submitted', slots: [{ day: 'Thứ 3', time: '19:30 - 21:00' }, { day: 'Thứ 6', time: '19:30 - 21:00' }], createdAt: '2026-10-09T12:00:00+07:00' },
    { id: 'APP-2026-0410', jobId: 'TT-8836', tutorId: 'GS-01', proposedRate: 185000, message: 'Có kinh nghiệm bồi dưỡng học sinh THCS và luyện thi vào lớp 10.', status: 'shortlisted', slots: [{ day: 'Thứ 2', time: '18:00 - 19:30' }], createdAt: '2026-10-09T14:25:00+07:00' },
    { id: 'APP-2026-0411', jobId: 'TT-8837', tutorId: 'GS-03', proposedRate: 220000, message: 'Rèn nghị luận xã hội và cảm thụ tác phẩm, có dàn ý mẫu cho từng dạng đề.', status: 'submitted', slots: [{ day: 'Chủ nhật', time: '08:00 - 10:00' }], createdAt: '2026-10-09T16:40:00+07:00' },
    { id: 'APP-2026-0412', jobId: 'TT-8834', tutorId: 'GS-05', proposedRate: 235000, message: 'Luyện đề Vật lý 12 theo cấu trúc mới, có bảng theo dõi điểm từng chuyên đề.', status: 'selected', slots: [{ day: 'Thứ 4', time: '19:00 - 20:30' }, { day: 'Thứ 7', time: '08:00 - 09:30' }], createdAt: '2026-10-08T19:15:00+07:00' },
    { id: 'APP-2026-0413', jobId: 'TT-8834', tutorId: 'GS-04', proposedRate: 250000, message: 'Chuyên luyện thi THPT Quốc gia môn Toán – Vật lý.', status: 'rejected', slots: [{ day: 'Thứ 2', time: '20:00 - 21:30' }], createdAt: '2026-10-08T22:00:00+07:00' },
    { id: 'APP-2026-0414', jobId: 'TT-8841', tutorId: 'GS-03', proposedRate: 240000, message: 'Nhận kèm Tiếng Anh lớp 10 cơ bản, tập trung ngữ pháp và viết đoạn.', status: 'withdrawn', slots: [{ day: 'Thứ 5', time: '19:00 - 20:30' }], createdAt: '2026-10-09T18:05:00+07:00' }
  ])

  /** Lời mời + các phiên bản đề xuất thương lượng. Phiên bản accepted là nguồn snapshot cho order. */
  const invitations = Object.freeze([
    { id: 'INV-20261009-024', learnerId: 'HV-2001', tutorId: 'GS-01', offeringId: 'OF-SVC-1001', status: 'accepted', currentVersion: 2, createdAt: '2026-10-09T09:12:00+07:00', message: 'Nhờ thầy dạy Toán lớp 10 cho cháu, tuần 2 buổi buổi tối.', proposals: [
      { version: 1, pricePerSession: 200000, sessions: 24, durationMinutes: 90, scheduleText: 'Thứ 3 & Thứ 5, 18:00 – 19:30', by: 'learner', status: 'countered', createdAt: '2026-10-09T09:12:00+07:00' },
      { version: 2, pricePerSession: 210000, sessions: 24, durationMinutes: 90, scheduleText: 'Thứ 3 & Thứ 5, 18:00 – 19:30', by: 'tutor', status: 'accepted', createdAt: '2026-10-09T11:40:00+07:00', note: 'Điều chỉnh theo thời lượng chuẩn bị bài.' }
    ] },
    { id: 'INV-20261009-018', learnerId: 'HV-2002', tutorId: 'GS-02', offeringId: 'OF-SVC-1002', status: 'negotiating', currentVersion: 1, createdAt: '2026-10-09T08:00:00+07:00', message: 'Muốn luyện IELTS mục tiêu 6.5 trong 2 tháng.', proposals: [
      { version: 1, pricePerSession: 240000, sessions: 30, durationMinutes: 90, scheduleText: 'Thứ 2 & Thứ 6, 19:00 – 20:30', by: 'learner', status: 'pending', createdAt: '2026-10-09T08:00:00+07:00' }
    ] },
    { id: 'INV-20261009-011', learnerId: 'HV-2001', tutorId: 'GS-03', offeringId: 'OF-SVC-1003', status: 'declined', currentVersion: 1, createdAt: '2026-10-08T20:00:00+07:00', message: 'Cần gia sư Ngữ văn cho em lớp 8.', proposals: [
      { version: 1, pricePerSession: 180000, sessions: 20, durationMinutes: 90, scheduleText: 'Thứ 4, 17:30 – 19:00', by: 'learner', status: 'declined', createdAt: '2026-10-08T20:00:00+07:00' }
    ] },
    { id: 'INV-20261009-005', learnerId: 'HV-2002', tutorId: 'GS-04', offeringId: 'OF-SVC-1004', status: 'expired', currentVersion: 1, createdAt: '2026-09-30T10:00:00+07:00', message: 'Luyện thi THPT Quốc gia môn Toán.', proposals: [
      { version: 1, pricePerSession: 290000, sessions: 40, durationMinutes: 120, scheduleText: 'Thứ 7 & Chủ nhật, 08:00 – 10:00', by: 'learner', status: 'expired', createdAt: '2026-09-30T10:00:00+07:00' }
    ] }
  ])

  /**
   * Đơn đăng ký (ORDER) — tách khỏi hợp đồng và khỏi ledger ví.
   * items giữ snapshot bất biến về giá/điều khoản tại thời điểm tạo đơn.
   */
  const orders = Object.freeze([
    { id: 'OD-2026-0001', learnerId: 'HV-2001', tutorId: 'GS-01', channel: 'INVITATION', sourceRef: { type: 'invitation', id: 'INV-20261009-024', version: 2 }, status: 'active', paymentStatus: 'paid', contractId: 'HD-20260919-024', createdAt: '2026-09-19T10:05:00+07:00', updatedAt: '2026-09-20T09:00:00+07:00', items: [{ id: 'OI-0001-1', offeringId: 'OF-SVC-1001', offeringType: 'SERVICE', offeringTitle: 'Gia sư Toán THPT tại nhà', tutorId: 'GS-01', tutorName: 'Nguyễn Minh Anh', selection: { intensity: 'std' }, seats: 1, sessions: 24, durationMinutes: 90, unitPrice: 210000, unit: 'per-session', total: 5040000, termsVersion: 'v2', scheduleText: 'Thứ 3 & Thứ 5, 18:00 – 19:30', snapshotReason: 'Giá thương lượng phiên bản 2 của lời mời INV-20261009-024 (giá catalog hiện tại 200.000đ).' }], total: 5040000, cancellation: null, refund: null, reviewId: null },
    { id: 'OD-2026-0002', learnerId: 'HV-2001', tutorId: 'GS-04', channel: 'JOB', sourceRef: { type: 'application', id: 'APP-2026-0402', jobId: 'TT-8833' }, status: 'completed', paymentStatus: 'paid', contractId: 'HD-20260926-025', createdAt: '2026-09-26T14:20:00+07:00', updatedAt: '2026-10-08T18:00:00+07:00', items: [{ id: 'OI-0002-1', offeringId: null, offeringType: 'SERVICE', offeringTitle: 'Dạy theo tin TT-8833', tutorId: 'GS-04', tutorName: 'Phạm Hoàng Long', selection: {}, seats: 1, sessions: 20, durationMinutes: 120, unitPrice: 280000, unit: 'per-session', total: 5600000, termsVersion: 'v1', scheduleText: 'Thứ 7, 09:00 – 11:00', snapshotReason: 'Giá từ ứng tuyển được chọn APP-2026-0402.' }], total: 5600000, cancellation: null, refund: null, reviewId: null },
    { id: 'OD-2026-0003', learnerId: 'HV-2002', tutorId: 'GS-05', channel: 'GROUP_CLASS', sourceRef: { type: 'enrollment', id: 'EN-2026-0101' }, status: 'awaiting_payment', paymentStatus: 'unpaid', contractId: 'HD-20260928-027', enrollmentId: 'EN-2026-0101', createdAt: '2026-09-28T09:00:00+07:00', updatedAt: '2026-09-28T09:00:00+07:00', items: [{ id: 'OI-0003-1', offeringId: 'OF-GRP-2001', offeringType: 'GROUP_CLASS', offeringTitle: 'Lớp nhóm Toán 10 – tối T3&T5', tutorId: 'GS-05', tutorName: 'Lê Hoàng Yến', selection: {}, seats: 1, sessions: 24, durationMinutes: 120, unitPrice: 150000, unit: 'per-session', total: 3600000, termsVersion: 'v1', scheduleText: 'Thứ 3 & Thứ 5, 18:30 – 20:30', snapshotReason: 'Giá lớp nhóm tại thời điểm ghi danh.' }], total: 3600000, cancellation: null, refund: null, reviewId: null },
    { id: 'OD-2026-0004', learnerId: 'HV-2001', tutorId: 'GS-02', channel: 'INVITATION', sourceRef: { type: 'invitation', id: 'INV-20261009-018', version: 1 }, status: 'created', paymentStatus: 'unpaid', contractId: null, createdAt: '2026-10-09T08:30:00+07:00', updatedAt: '2026-10-09T08:30:00+07:00', items: [{ id: 'OI-0004-1', offeringId: 'OF-SVC-1002', offeringType: 'SERVICE', offeringTitle: 'Luyện IELTS 1 kèm 1 (mục tiêu 6.5+)', tutorId: 'GS-02', tutorName: 'Trần Quốc Huy', selection: { target: '6.5' }, seats: 1, sessions: 30, durationMinutes: 90, unitPrice: 240000, unit: 'per-session', total: 7200000, termsVersion: 'v1', scheduleText: 'Thứ 2 & Thứ 6, 19:00 – 20:30', snapshotReason: 'Đơn đã tạo nhưng chưa có hợp đồng.' }], total: 7200000, cancellation: null, refund: null, reviewId: null },
    { id: 'OD-2026-0005', learnerId: 'HV-2001', tutorId: 'GS-03', channel: 'INVITATION', sourceRef: { type: 'invitation', id: 'INV-20261009-011', version: 1 }, status: 'cancelled', paymentStatus: 'refunded', contractId: 'HD-20260905-019', createdAt: '2026-09-05T11:00:00+07:00', updatedAt: '2026-09-12T10:00:00+07:00', items: [{ id: 'OI-0005-1', offeringId: 'OF-SVC-1003', offeringType: 'SERVICE', offeringTitle: 'Ngữ văn THCS – đọc hiểu & nghị luận', tutorId: 'GS-03', tutorName: 'Lê Thảo Vy', selection: {}, seats: 1, sessions: 20, durationMinutes: 90, unitPrice: 180000, unit: 'per-session', total: 3600000, termsVersion: 'v1', scheduleText: 'Thứ 4, 17:30 – 19:00', snapshotReason: 'Giá catalog tại thời điểm đặt.' }], total: 3600000, cancellation: { code: 'learner-request', reason: 'Thay đổi lịch học của con', requestedAt: '2026-09-10T09:00:00+07:00', state: 'cancelled', policyCode: 'before-first-session' }, refund: { state: 'succeeded', amount: 3600000, policyCode: 'before-first-session', completedAt: '2026-09-12T10:00:00+07:00', paymentId: 'PAY-2026-0005', ledgerId: 'BT-87910' }, reviewId: null },
    { id: 'OD-2026-0006', learnerId: 'HV-2002', tutorId: 'GS-01', channel: 'GROUP_CLASS', sourceRef: { type: 'enrollment', id: 'EN-2026-0102' }, status: 'cancellation_pending', paymentStatus: 'refund_pending', contractId: 'HD-20260810-018', enrollmentId: 'EN-2026-0102', createdAt: '2026-08-10T09:00:00+07:00', updatedAt: '2026-10-09T16:00:00+07:00', items: [{ id: 'OI-0006-1', offeringId: 'OF-GRP-2002', offeringType: 'GROUP_CLASS', offeringTitle: 'Lớp nhóm Toán 12 – sáng T7 (đã đủ chỗ)', tutorId: 'GS-01', tutorName: 'Nguyễn Minh Anh', selection: {}, seats: 1, sessions: 20, durationMinutes: 150, unitPrice: 180000, unit: 'per-session', total: 3600000, termsVersion: 'v1', scheduleText: 'Thứ 7, 08:00 – 10:30', snapshotReason: 'Giá lớp nhóm tại thời điểm ghi danh.' }], total: 3600000, cancellation: { code: 'learner-request', reason: 'Trùng lịch học ở trường', requestedAt: '2026-10-09T16:00:00+07:00', state: 'pending', policyCode: 'after-first-session' }, refund: { state: 'pending', amount: 1440000, policyCode: 'after-first-session', requestedAt: '2026-10-09T16:00:00+07:00', paymentId: 'PAY-2026-0006' }, reviewId: null },
    { id: 'OD-2026-0007', learnerId: 'HV-2001', tutorId: 'GS-05', channel: 'INVITATION', sourceRef: { type: 'invitation', id: 'INV-20261009-005', version: 1 }, status: 'completed', paymentStatus: 'paid', contractId: 'HD-20260715-012', createdAt: '2026-07-15T09:00:00+07:00', updatedAt: '2026-09-01T09:00:00+07:00', items: [{ id: 'OI-0007-1', offeringId: 'OF-SVC-1005', offeringType: 'SERVICE', offeringTitle: 'Toán lớp 10 – kèm một-một (gia sư demo)', tutorId: 'GS-05', tutorName: 'Lê Hoàng Yến', selection: { intensity: 'std' }, seats: 1, sessions: 16, durationMinutes: 90, unitPrice: 220000, unit: 'per-session', total: 3520000, termsVersion: 'v2', scheduleText: 'Thứ 3, 18:00 – 19:30', snapshotReason: 'Giá catalog tại thời điểm đặt.' }], total: 3520000, cancellation: null, refund: null, reviewId: 'RV-2026-0001' },
    { id: 'OD-2026-0008', learnerId: 'HV-2001', tutorId: 'GS-01', channel: 'GROUP_CLASS', sourceRef: { type: 'enrollment', id: 'EN-2026-0103' }, status: 'completed', paymentStatus: 'paid', contractId: 'HD-20260820-013', enrollmentId: 'EN-2026-0103', createdAt: '2026-08-20T09:00:00+07:00', updatedAt: '2026-10-02T09:00:00+07:00', items: [{ id: 'OI-0008-1', offeringId: 'OF-GRP-2002', offeringType: 'GROUP_CLASS', offeringTitle: 'Lớp nhóm Toán 12 – sáng T7 (đã đủ chỗ)', tutorId: 'GS-01', tutorName: 'Nguyễn Minh Anh', selection: {}, seats: 1, sessions: 20, durationMinutes: 150, unitPrice: 180000, unit: 'per-session', total: 3600000, termsVersion: 'v1', scheduleText: 'Thứ 7, 08:00 – 10:30', snapshotReason: 'Giá lớp nhóm tại thời điểm ghi danh; lớp sau đó đã đóng.' }], total: 3600000, cancellation: null, refund: null, reviewId: 'RV-2026-0007' }
  ])

  const enrollments = Object.freeze([
    { id: 'EN-2026-0101', offeringId: 'OF-GRP-2001', learnerId: 'HV-2002', seats: 1, status: 'active', orderId: 'OD-2026-0003', createdAt: '2026-09-28T09:00:00+07:00' },
    { id: 'EN-2026-0102', offeringId: 'OF-GRP-2002', learnerId: 'HV-2001', seats: 1, status: 'cancelling', orderId: 'OD-2026-0006', createdAt: '2026-08-10T09:00:00+07:00' },
    { id: 'EN-2026-0103', offeringId: 'OF-GRP-2002', learnerId: 'HV-2001', seats: 1, status: 'completed', orderId: 'OD-2026-0008', createdAt: '2026-08-20T09:00:00+07:00' }
  ])

  const contracts = Object.freeze([
    {
      id: 'HD-20260919-024', orderId: 'OD-2026-0001', learnerId: 'HV-2001', tutorId: 'GS-01', status: 'active', sessions: 24, completedSessions: 7, unitPrice: 210000, total: 5040000, feeRate: DEMO_FEE_RATE, signedAt: '2026-09-20T09:00:00+07:00', termsVersion: 'v2',
      /* attendance là căn cứ của releaseSession: 6 buổi đã học VÀ đã giải ngân (FE-2026-0004),
         buổi 7 đã điểm danh nhưng chưa được học viên xác nhận → đó là "chờ xác nhận" thật,
         không phải trạng thái hard-code trong JS của trang. */
      attendance: [
        { lesson: 1, status: 'present', at: '2026-09-20T19:30:00+07:00', note: 'Ôn tập hàm số và tập xác định; học viên trả lời tốt.', homework: 'Bài 1-8 SGK trang 32.' },
        { lesson: 2, status: 'present', at: '2026-09-23T19:30:00+07:00', note: 'Hàm bậc nhất, đồ thị và bảng biến thiên.', homework: '10 câu trắc nghiệm hàm số.' },
        { lesson: 3, status: 'present', at: '2026-09-26T19:30:00+07:00', note: 'Phương trình quy về bậc hai; cần thêm bài tập bậc bốn.', homework: 'Bài 12-15 trang 45.' },
        { lesson: 4, status: 'late', at: '2026-09-29T19:45:00+07:00', note: 'Học viên đến muộn 15 phút, vẫn đủ thời lượng bù cuối buổi.', homework: 'Ôn hệ thức Vi-ét.' },
        { lesson: 5, status: 'present', at: '2026-10-02T19:30:00+07:00', note: 'Bất phương trình một ẩn và hệ hai bất phương trình.', homework: 'Bài 20-24 trang 58.' },
        { lesson: 6, status: 'present', at: '2026-10-05T19:30:00+07:00', note: 'Sign of quadratic expressions; học viên nắm công thức nhưng hay quên điều kiện.', homework: '5 bài nâng cao dấu nhị thức.' },
        { lesson: 7, status: 'present', at: '2026-10-08T19:30:00+07:00', note: 'Chương hàm số lượng giác: chu kỳ và tập xác định.', homework: 'Bài 1-6 trang 72.' }
      ]
    },
    { id: 'HD-20260926-025', orderId: 'OD-2026-0002', learnerId: 'HV-2001', tutorId: 'GS-04', status: 'completed', sessions: 20, completedSessions: 20, unitPrice: 280000, total: 5600000, feeRate: DEMO_FEE_RATE, signedAt: '2026-09-27T09:00:00+07:00', termsVersion: 'v1' },
    { id: 'HD-20260928-027', orderId: 'OD-2026-0003', learnerId: 'HV-2002', tutorId: 'GS-05', status: 'awaiting_payment', sessions: 24, completedSessions: 0, unitPrice: 150000, total: 3600000, feeRate: DEMO_FEE_RATE, signedAt: null, termsVersion: 'v1' },
    { id: 'HD-20260905-019', orderId: 'OD-2026-0005', learnerId: 'HV-2001', tutorId: 'GS-03', status: 'cancelled', sessions: 20, completedSessions: 0, unitPrice: 180000, total: 3600000, feeRate: DEMO_FEE_RATE, signedAt: '2026-09-06T09:00:00+07:00', termsVersion: 'v1' },
    { id: 'HD-20260810-018', orderId: 'OD-2026-0006', learnerId: 'HV-2002', tutorId: 'GS-01', status: 'cancellation_pending', sessions: 20, completedSessions: 4, unitPrice: 180000, total: 3600000, feeRate: DEMO_FEE_RATE, signedAt: '2026-08-11T09:00:00+07:00', termsVersion: 'v1' },
    { id: 'HD-20260715-012', orderId: 'OD-2026-0007', learnerId: 'HV-2001', tutorId: 'GS-05', status: 'completed', sessions: 16, completedSessions: 16, unitPrice: 220000, total: 3520000, feeRate: DEMO_FEE_RATE, signedAt: '2026-07-16T09:00:00+07:00', termsVersion: 'v2' },
    { id: 'HD-20260820-013', orderId: 'OD-2026-0008', learnerId: 'HV-2001', tutorId: 'GS-01', status: 'completed', sessions: 20, completedSessions: 20, unitPrice: 180000, total: 3600000, feeRate: DEMO_FEE_RATE, signedAt: '2026-08-21T09:00:00+07:00', termsVersion: 'v1' }
  ])

  /**
   * Phiên thanh toán. `status` của PAYMENT khác `status` của ORDER và của REFUND.
   * PAY-2026-0007 là bản ghi verified-success do fixture kiểm soát (không phải từ query URL).
   */
  const payments = Object.freeze([
    { id: 'PAY-2026-0001', orderId: 'OD-2026-0001', contractId: 'HD-20260919-024', learnerId: 'HV-2001', total: 5040000, walletUsed: 5040000, payosDue: 0, status: 'verified', method: 'wallet', createdAt: '2026-09-19T10:10:00+07:00', note: 'Số dư ví đủ, không phát sinh khoản phải trả ngoài.' },
    { id: 'PAY-2026-0002', orderId: 'OD-2026-0002', contractId: 'HD-20260926-025', learnerId: 'HV-2001', total: 5600000, walletUsed: 1600000, payosDue: 4000000, status: 'verified', method: 'wallet+payos', createdAt: '2026-09-26T14:30:00+07:00', note: 'Ví bù một phần, phần còn lại qua cổng thanh toán (DEMO).' },
    { id: 'PAY-2026-0003', orderId: 'OD-2026-0003', contractId: 'HD-20260928-027', learnerId: 'HV-2002', total: 3600000, walletUsed: 0, payosDue: 3600000, status: 'pending', method: 'payos', createdAt: '2026-09-28T09:10:00+07:00', note: 'Phiên QR đang chờ, chưa có xác nhận thành công.' },
    { id: 'PAY-2026-0004', orderId: 'OD-2026-0004', contractId: null, learnerId: 'HV-2001', total: 7200000, walletUsed: 0, payosDue: 7200000, status: 'expired', method: 'payos', createdAt: '2026-10-09T08:35:00+07:00', note: 'Phiên hết hạn, chưa phát sinh giao dịch.' },
    { id: 'PAY-2026-0005', orderId: 'OD-2026-0005', contractId: 'HD-20260905-019', learnerId: 'HV-2001', total: 3600000, walletUsed: 3600000, payosDue: 0, status: 'refunded', method: 'wallet', createdAt: '2026-09-05T11:10:00+07:00', note: 'Đã hoàn về ví theo chính sách hủy trước buổi đầu.' },
    { id: 'PAY-2026-0006', orderId: 'OD-2026-0006', contractId: 'HD-20260810-018', learnerId: 'HV-2002', total: 3600000, walletUsed: 0, payosDue: 3600000, status: 'refund_pending', method: 'payos', createdAt: '2026-08-10T09:10:00+07:00', note: 'Đang chờ xử lý hoàn một phần.' },
    { id: 'PAY-2026-0007', orderId: null, contractId: null, learnerId: 'HV-2001', total: 2000000, walletUsed: 0, payosDue: 2000000, status: 'verified', method: 'payos', createdAt: '2026-10-09T20:00:00+07:00', demoVerifiedSuccess: true, note: 'Bản ghi verified-success DEMO do fixture kiểm soát, dùng cho QA luồng result.' },
    { id: 'PAY-2026-0008', orderId: 'OD-2026-0003', contractId: 'HD-20260928-027', learnerId: 'HV-2002', total: 3600000, walletUsed: 0, payosDue: 3600000, status: 'failed', method: 'payos', createdAt: '2026-09-28T09:20:00+07:00', note: 'Giao dịch thất bại, không làm đổi trạng thái đơn.' },
    { id: 'PAY-2026-0009', orderId: 'OD-2026-0004', contractId: null, learnerId: 'HV-2001', total: 7200000, walletUsed: 0, payosDue: 7200000, status: 'cancelled', method: 'payos', createdAt: '2026-10-09T08:40:00+07:00', note: 'Người dùng hủy PHIÊN QR — đơn vẫn còn, không phải hủy đơn.' },
    { id: 'PAY-2026-0010', orderId: 'OD-2026-0007', contractId: 'HD-20260715-012', learnerId: 'HV-2001', total: 3520000, walletUsed: 0, payosDue: 3520000, status: 'verified', method: 'payos', createdAt: '2026-07-15T09:30:00+07:00', note: 'Bản ghi ký quỹ đã xác nhận — thiếu bản này thì hợp đồng giải ngân mà không có dòng tiền vào.' },
    { id: 'PAY-2026-0011', orderId: 'OD-2026-0008', contractId: 'HD-20260820-013', learnerId: 'HV-2001', total: 3600000, walletUsed: 0, payosDue: 3600000, status: 'verified', method: 'payos', createdAt: '2026-08-20T09:30:00+07:00', note: 'Bản ghi ký quỹ đã xác nhận của lớp nhóm đã hoàn tất.' }
  ])

  /**
   * Ví chỉ còn phần KHÔNG suy ra được: availableToUse.
   * escrowHeld và refunded trước đây là field cứng, trùng với đường tính từ
   * payment/release/refund (và lệch thật: HV-2001 ghi 5.040.000 trong khi hợp đồng
   * chỉ còn giữ 3.780.000). Giữ hai nguồn cùng một khái niệm là nguồn gốc số liệu
   * disagreement giữa trang ví, dashboard và checkout → store tính dẫn xuất một nơi.
   */
  const wallets = Object.freeze([
    { ownerId: 'HV-2001', ownerType: 'learner', availableToUse: 1250000, currency: CURRENCY },
    { ownerId: 'HV-2002', ownerType: 'learner', availableToUse: 300000, currency: CURRENCY },
    { ownerId: 'HV-2003', ownerType: 'learner', availableToUse: 0, currency: CURRENCY },
    { ownerId: 'GS-01', ownerType: 'tutor', availableToUse: 5022000, currency: CURRENCY },
    { ownerId: 'GS-03', ownerType: 'tutor', availableToUse: 0, currency: CURRENCY },
    { ownerId: 'GS-04', ownerType: 'tutor', availableToUse: 5040000, currency: CURRENCY },
    { ownerId: 'GS-05', ownerType: 'tutor', availableToUse: 1168000, currency: CURRENCY }
  ])

  /**
   * Sự kiện tài chính. BẤT BIẾN: grossReleased = tutorNetReleased + platformFeeReleased.
   * planned/KHÔNG phải doanh thu; withdrawal là chuyển số dư ra ngân hàng, không tạo doanh thu lần nữa.
   * tutorId của mọi event phải đúng bằng tutorId của hợp đồng nó tham chiếu —
   * bản trước ghi FE-0004 (HD-20260919-024) và FE-0009/0010 (HD-20260926-025) cho GS-05/GS-01
   * trong khi hợp đồng thuộc GS-01/GS-04, nên thống kê doanh thu sai người nhận.
   * Bỏ sự kiện type 'hold': ký quỹ dẫn từ payment − release − refund, không cần bản ghi hold
   * riêng (bản cũ FE-0005 giữ 3.168.000 cho hợp đồng chưa được thanh toán).
   */
  const financialEvents = Object.freeze([
    { id: 'FE-2026-0001', type: 'release', tutorId: 'GS-05', contractId: 'HD-20260715-012', orderId: 'OD-2026-0007', ledgerId: 'BT-8620', date: '2026-09-01', grossReleased: 440000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 396000, platformFeeReleased: 44000, sessionsReleased: 2 },
    { id: 'FE-2026-0002', type: 'release', tutorId: 'GS-05', contractId: 'HD-20260715-012', orderId: 'OD-2026-0007', ledgerId: 'BT-8750', date: '2026-08-15', grossReleased: 660000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 594000, platformFeeReleased: 66000, sessionsReleased: 3 },
    { id: 'FE-2026-0003', type: 'release', tutorId: 'GS-05', contractId: 'HD-20260715-012', orderId: 'OD-2026-0007', ledgerId: 'BT-8796', date: '2026-08-01', grossReleased: 880000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 792000, platformFeeReleased: 88000, sessionsReleased: 4 },
    { id: 'FE-2026-0004', type: 'release', tutorId: 'GS-01', contractId: 'HD-20260919-024', orderId: 'OD-2026-0001', ledgerId: 'BT-88209', date: '2026-10-05', grossReleased: 1260000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 1134000, platformFeeReleased: 126000, sessionsReleased: 6 },
    { id: 'FE-2026-0006', type: 'refund', tutorId: 'GS-03', contractId: 'HD-20260905-019', orderId: 'OD-2026-0005', ledgerId: 'BT-87910', date: '2026-09-12', grossReleased: 0, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 0, platformFeeReleased: 0, refunded: 3600000 },
    { id: 'FE-2026-0007', type: 'planned', tutorId: 'GS-01', contractId: 'HD-20260919-024', orderId: 'OD-2026-0001', ledgerId: null, date: '2026-10-20', grossReleased: 0, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 0, platformFeeReleased: 0, plannedAmount: 378000, note: 'Dự kiến giải ngân kỳ sau, chưa phải doanh thu.' },
    { id: 'FE-2026-0008', type: 'withdrawal', tutorId: 'GS-05', contractId: null, orderId: null, ledgerId: 'BT-88412', date: '2026-10-08', grossReleased: 0, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 0, platformFeeReleased: 0, withdrawn: 2000000, payoutId: 'PO-882877', note: 'Rút tiền từ số dư ra ngân hàng — KHÔNG tạo doanh thu lần nữa.' },
    { id: 'FE-2026-0009', type: 'release', tutorId: 'GS-04', contractId: 'HD-20260926-025', orderId: 'OD-2026-0002', ledgerId: 'BT-88590', date: '2026-10-08', grossReleased: 2800000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 2520000, platformFeeReleased: 280000, sessionsReleased: 10 },
    { id: 'FE-2026-0010', type: 'release', tutorId: 'GS-04', contractId: 'HD-20260926-025', orderId: 'OD-2026-0002', ledgerId: 'BT-8841', date: '2026-09-25', grossReleased: 1400000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 1260000, platformFeeReleased: 140000, sessionsReleased: 5 },
    { id: 'FE-2026-0011', type: 'release', tutorId: 'GS-05', contractId: 'HD-20260715-012', orderId: 'OD-2026-0007', ledgerId: null, date: '2026-10-06', grossReleased: 1540000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 1386000, platformFeeReleased: 154000, sessionsReleased: 7, note: 'Phần còn lại của hợp đồng đã hoàn tất (buổi 10–16).' },
    { id: 'FE-2026-0012', type: 'release', tutorId: 'GS-04', contractId: 'HD-20260926-025', orderId: 'OD-2026-0002', ledgerId: null, date: '2026-10-11', grossReleased: 1400000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 1260000, platformFeeReleased: 140000, sessionsReleased: 5, note: 'Phần còn lại của hợp đồng đã hoàn tất (buổi 16–20).' },
    { id: 'FE-2026-0013', type: 'release', tutorId: 'GS-01', contractId: 'HD-20260820-013', orderId: 'OD-2026-0008', ledgerId: null, date: '2026-10-02', grossReleased: 3600000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 3240000, platformFeeReleased: 360000, sessionsReleased: 20, note: 'Lớp nhóm đã đóng và hoàn tất toàn bộ 20 buổi.' },
    { id: 'FE-2026-0014', type: 'release', tutorId: 'GS-01', contractId: 'HD-20260810-018', orderId: 'OD-2026-0006', ledgerId: null, date: '2026-09-30', grossReleased: 720000, feeRateSnapshot: DEMO_FEE_RATE, tutorNetReleased: 648000, platformFeeReleased: 72000, sessionsReleased: 4, note: 'Bốn buổi đã học trước khi xin hủy — không hoàn theo demo policy.' }
  ])

  const ledger = Object.freeze([
    { id: 'BT-8620', ownerId: 'GS-05', ownerType: 'tutor', direction: 'in', amount: 396000, kind: 'release', label: 'Giải ngân buổi học', refType: 'contract', refId: 'HD-20260715-012', at: '2026-09-01T10:00:00+07:00', balanceAfter: 3200000 },
    { id: 'BT-8750', ownerId: 'GS-05', ownerType: 'tutor', direction: 'in', amount: 594000, kind: 'release', label: 'Giải ngân buổi học', refType: 'contract', refId: 'HD-20260715-012', at: '2026-08-15T10:00:00+07:00', balanceAfter: 2804000 },
    { id: 'BT-8796', ownerId: 'GS-05', ownerType: 'tutor', direction: 'in', amount: 792000, kind: 'release', label: 'Giải ngân buổi học', refType: 'contract', refId: 'HD-20260715-012', at: '2026-08-01T10:00:00+07:00', balanceAfter: 2210000 },
    { id: 'BT-88209', ownerId: 'HV-2001', ownerType: 'learner', direction: 'out', amount: 5040000, kind: 'escrow', label: 'Giữ tiền hợp đồng', refType: 'contract', refId: 'HD-20260919-024', at: '2026-09-19T10:12:00+07:00', balanceAfter: 1250000 },
    { id: 'BT-88412', ownerId: 'GS-05', ownerType: 'tutor', direction: 'out', amount: 2000000, kind: 'withdrawal', label: 'Rút tiền về ngân hàng', refType: 'payout', refId: 'PO-882877', at: '2026-10-08T15:00:00+07:00', balanceAfter: 4850000 },
    { id: 'BT-88590', ownerId: 'GS-01', ownerType: 'tutor', direction: 'in', amount: 2520000, kind: 'release', label: 'Giải ngân buổi học', refType: 'contract', refId: 'HD-20260926-025', at: '2026-10-08T10:00:00+07:00', balanceAfter: 2400000 },
    { id: 'BT-8841', ownerId: 'HV-2002', ownerType: 'learner', direction: 'out', amount: 3600000, kind: 'escrow', label: 'Giữ tiền lớp nhóm', refType: 'contract', refId: 'HD-20260810-018', at: '2026-08-10T09:12:00+07:00', balanceAfter: 300000 },
    { id: 'BT-87910', ownerId: 'HV-2001', ownerType: 'learner', direction: 'in', amount: 3600000, kind: 'refund', label: 'Hoàn tiền hủy lớp', refType: 'order', refId: 'OD-2026-0005', at: '2026-09-12T10:00:00+07:00', balanceAfter: 6290000 }
  ])

  const reviews = Object.freeze([
    { id: 'RV-2026-0001', orderId: 'OD-2026-0007', contractId: 'HD-20260715-012', learnerId: 'HV-2001', learnerName: 'Chị Mai Lan', tutorId: 'GS-05', offeringId: 'OF-SVC-1005', itemId: 'OI-0007-1', rating: 5, comment: 'Cô Yến giải thích rất dễ hiểu, con tiến bộ rõ sau 16 buổi.', createdAt: '2026-09-02T09:00:00+07:00', status: 'published', eligibility: 'eligible' },
    { id: 'RV-2026-0007', orderId: 'OD-2026-0008', contractId: 'HD-20260820-013', learnerId: 'HV-2001', learnerName: 'Chị Mai Lan', tutorId: 'GS-01', offeringId: 'OF-GRP-2002', itemId: 'OI-0008-1', rating: 4, comment: 'Lớp nhóm đông nhưng thầy vẫn theo sát từng bạn, tài liệu rõ ràng.', createdAt: '2026-10-03T09:00:00+07:00', status: 'published', eligibility: 'eligible' }
  ])

  /**
   * Report dùng chung cho người gửi và admin queue/detail — CÙNG report ID.
   * Không tự refund khi report được resolved.
   */
  const reports = Object.freeze([
    { id: 'RP-2026-0011', reporterId: 'HV-2001', reporterName: 'Chị Mai Lan', targetType: 'tutor', targetId: 'GS-03', targetLabel: 'Lê Thảo Vy', reason: 'wrong-schedule', reasonLabel: 'Sai lịch hẹn', evidenceMeta: { screenshots: 2, note: 'Đã đổi lịch 3 lần trong 1 tuần.' }, state: 'open', resolution: null, createdAt: '2026-10-08T20:30:00+07:00', notices: [] },
    { id: 'RP-2026-0010', reporterId: 'HV-2002', reporterName: 'Minh Quân', targetType: 'contract', targetId: 'HD-20260810-018', targetLabel: 'Hợp đồng HD-20260810-018', reason: 'no-show', reasonLabel: 'Gia sư vắng mặt không báo', evidenceMeta: { screenshots: 1, note: 'Vắng 2 buổi liên tiếp.' }, state: 'investigating', resolution: null, createdAt: '2026-10-05T11:00:00+07:00', notices: [{ at: '2026-10-06T09:00:00+07:00', text: 'Đã tiếp nhận và đang đối chiếu lịch buổi học.' }] },
    { id: 'RP-2026-0009', reporterId: 'HV-2001', reporterName: 'Chị Mai Lan', targetType: 'tutor', targetId: 'GS-02', targetLabel: 'Trần Quốc Huy', reason: 'content', reasonLabel: 'Nội dung không đúng mô tả', evidenceMeta: { screenshots: 0, note: '' }, state: 'resolved', resolution: { code: 'warned', decidedAt: '2026-09-20T10:00:00+07:00', decidedBy: 'admin.educonnect', summary: 'Đã nhắc nhở gia sư cập nhật mô tả khóa.' }, createdAt: '2026-09-15T10:00:00+07:00', notices: [{ at: '2026-09-20T10:05:00+07:00', text: 'Báo cáo đã xử lý: nhắc nhở gia sư cập nhật mô tả.' }] },
    { id: 'RP-2026-0008', reporterId: 'HV-2003', reporterName: 'Anh Tuấn Kiệt', targetType: 'tutor', targetId: 'GS-14', targetLabel: 'Võ Ngọc Hân', reason: 'other', reasonLabel: 'Khác', evidenceMeta: { screenshots: 0, note: 'Hồ sơ có dấu hiệu không đúng thông tin.' }, state: 'dismissed', resolution: { code: 'insufficient-evidence', decidedAt: '2026-09-10T10:00:00+07:00', decidedBy: 'admin.educonnect', summary: 'Không đủ bằng chứng, đã từ chối xử lý.' }, createdAt: '2026-09-08T10:00:00+07:00', notices: [{ at: '2026-09-10T10:05:00+07:00', text: 'Báo cáo bị từ chối do không đủ bằng chứng.' }] }
  ])

  /** Token DEMO cho luồng verify email / reset password. Không phải credential thật. */
  const authTokens = Object.freeze([
    { token: 'DEMO-VERIFY-VALID', kind: 'verify-email', state: 'valid', email: 'mai.lan@demo.test', personaId: 'PARENT-01', expiresAt: '2026-12-31T23:59:59+07:00' },
    { token: 'DEMO-VERIFY-EXPIRED', kind: 'verify-email', state: 'expired', email: 'minh.quan@demo.test', personaId: 'STUDENT-01', expiresAt: '2026-01-01T00:00:00+07:00' },
    { token: 'DEMO-VERIFY-USED', kind: 'verify-email', state: 'used', email: 'hoang.yen@demo.test', personaId: 'TUTOR-01', usedAt: '2026-09-30T10:00:00+07:00', expiresAt: '2026-12-31T23:59:59+07:00' },
    { token: 'DEMO-RESET-VALID', kind: 'reset-password', state: 'valid', email: 'mai.lan@demo.test', personaId: 'PARENT-01', expiresAt: '2026-12-31T23:59:59+07:00' },
    { token: 'DEMO-RESET-EXPIRED', kind: 'reset-password', state: 'expired', email: 'minh.quan@demo.test', personaId: 'STUDENT-01', expiresAt: '2026-01-01T00:00:00+07:00' },
    { token: 'DEMO-RESET-USED', kind: 'reset-password', state: 'used', email: 'hoang.yen@demo.test', personaId: 'TUTOR-01', usedAt: '2026-10-01T10:00:00+07:00', expiresAt: '2026-12-31T23:59:59+07:00' }
  ])

  /** Bản đồ ID cũ → nguồn chung, để các trang đã có không trỏ tới fixture không liên quan. */
  const legacyIdMap = Object.freeze({
    contract: { 'HD-20260919-024': 'HD-20260919-024', 'HD-20260926-025': 'HD-20260926-025', 'HD-20260928-027': 'HD-20260928-027', 'HD-20260905-019': 'HD-20260905-019', 'HD-20260810-018': 'HD-20260810-018', 'HD-20260715-012': 'HD-20260715-012' },
    tutor: { 'GS-01': 'GS-01', 'GS-02': 'GS-02', 'GS-03': 'GS-03', 'GS-04': 'GS-04', 'GS-05': 'GS-05' }
  })

  window.EduFixtures = Object.freeze({
    CURRENCY,
    DEMO_FEE_RATE,
    DEMO_REFUND_POLICY,
    personas,
    learners,
    tutors,
    offerings,
    jobs,
    applications,
    invitations,
    orders,
    enrollments,
    contracts,
    payments,
    wallets,
    financialEvents,
    ledger,
    reviews,
    reports,
    authTokens,
    legacyIdMap
  })
})()
