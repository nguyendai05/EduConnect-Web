/**
 * Façade MỎNG cho hai trang kiểm duyệt tin tìm gia sư (admin/job-review-queue.html,
 * admin/job-review-detail.html). Không còn một bảng fixture `TT-*` riêng ở đây:
 * hàng đợi, số đếm, người đăng, chi tiết và quyết định đều đọc/ghi EduStore —
 * cùng một nguồn với bảng tin công khai `job/*` và trang Tổng quan.
 *
 * Trang phải chạy được khi EduStore vắng mặt: façade báo `available:false` và các
 * hàm trả rỗng thay vì ném lỗi; chính trang sẽ ẩn nội dung và hiện thông báo.
 *
 * Khoá quyết định cũ `educonnect:job-review-decisions:v1` (nguồn thứ hai, song song
 * với EduStore) được xoá có kiểm soát khi khởi tạo — KHÔNG dùng sessionStorage.clear().
 */
(() => {
  const LEGACY_DECISIONS_KEY = 'educonnect:job-review-decisions:v1';
  const Store = window.EduStore;

  const dropLegacyDecisionKey = () => {
    try {
      /* removeItem idempotent: xoá thẳng, không đọc giá trị cũ làm dữ liệu. */
      window.sessionStorage.removeItem(LEGACY_DECISIONS_KEY);
    } catch { /* storage bị chặn: khoá cũ vốn không còn được đọc ở bất kỳ đâu */ }
  };

  /* Từ vựng nhãn/badge hàng đợi đang có — khoá đúng bằng Store.JOB_QUEUE_BUCKETS. */
  const BUCKET_TEXT = Object.freeze({
    pending: Object.freeze({ label: 'Chờ duyệt', summary: 'chờ duyệt', badge: 'badge--warning' }),
    hiring: Object.freeze({ label: 'Đang tuyển', summary: 'đang tuyển', badge: 'badge--success' }),
    closed: Object.freeze({ label: 'Đã đóng', summary: 'đã đóng', badge: 'badge--neutral' }),
    rejected: Object.freeze({ label: 'Bị từ chối', summary: 'bị từ chối', badge: 'badge--danger' }),
  });

  const bucketInfo = key => {
    const text = BUCKET_TEXT[key];
    if (text) return text;
    const label = String(key || 'không xác định');
    return Object.freeze({ label, summary: label.toLowerCase(), badge: 'badge--neutral' });
  };

  const available = Boolean(Store
    && typeof Store.jobQueue === 'function'
    && typeof Store.jobQueueCounts === 'function'
    && typeof Store.jobBucket === 'function'
    && typeof Store.decideJob === 'function');

  dropLegacyDecisionKey();

  /* ---------------- Người đăng: Suy ra từ learner, không viết tay ở trang admin ---------------- */

  const NO_POSTER = Object.freeze({
    name: 'Người đăng không có trong dữ liệu mẫu',
    initials: '—',
    role: 'Không xác định',
    district: '',
    responseRate: null,
    learnerId: null,
  });

  const posterOf = job => {
    const poster = Store.jobPoster(job.id);
    if (poster) return poster;
    return Object.freeze({ ...NO_POSTER, learnerId: job.learnerId || null });
  };

  /* ---------------- Hàng đợi ---------------- */

  const safeBucket = bucket => (Store.JOB_QUEUE_BUCKETS.includes(bucket) ? bucket : 'all');

  /** Một hàng đợi = jobQueue(bucket) của store, kèm người đăng và số hồ sơ dẫn xuất. */
  const queue = (bucket = 'all') => {
    if (!available) return [];
    return Store.jobQueue(safeBucket(bucket)).map(job => Object.freeze({
      job,
      bucket: Store.jobBucket(job),
      poster: posterOf(job),
      applicationCount: Store.applicationsOfJob(job.id).length,
    }));
  };

  const counts = () => {
    if (!available) return { all: 0, total: 0, pending: 0, hiring: 0, closed: 0, rejected: 0 };
    return Store.jobQueueCounts();
  };

  /* ---------------- Chi tiết ---------------- */

  /** detail(id) — id thiếu/sai trả null; trang phải hiện not-found, KHÔNG chọn bản ghi khác. */
  const detail = id => {
    if (!available || !id) return null;
    const job = Store.job(String(id));
    if (!job) return null;
    const learner = job.learnerId ? Store.learner(job.learnerId) : null;
    return Object.freeze({
      job,
      bucket: Store.jobBucket(job),
      poster: posterOf(job),
      learner: learner || null,
      applicationCount: Store.applicationsOfJob(job.id).length,
    });
  };

  /* ---------------- Quyết định kiểm duyệt: ghi thẳng vào store ---------------- */

  const reviewerId = () => {
    const persona = available && typeof Store.getPersona === 'function' ? Store.getPersona() : null;
    /* Chỉ persona role 'admin' được đứng tên quyết định; phiên phụ huynh/gia sư trả null để store
       chặn và trang hiện lý do — không ghi audit log sai người. */
    return (persona && persona.role === 'admin' && persona.id) || null;
  };

  const REASON_MESSAGES = Object.freeze({
    'job-not-found': 'Tin không còn trong dữ liệu dùng chung — có thể tin đã bị xoá. Hàng đợi sẽ được đọc lại từ store.',
    'invalid-decision': 'Quyết định kiểm duyệt không hợp lệ. Hệ thống chỉ nhận: duyệt, từ chối, đóng tin, mở lại.',
    'invalid-transition': 'Tin đang ở trạng thái khác nên thao tác này bị chặn; không có gì thay đổi.',
    'reason-required': 'Lý do từ chối cần tối thiểu 10 ký tự để người đăng biết cách chỉnh sửa và gửi lại.',
    duplicated: 'Quyết định này đã được ghi trước đó — bấm lặp không tạo lần xử lý thứ hai.',
    'storage-failed': 'Trình duyệt không lưu được dữ liệu demo, nên quyết định chưa được ghi. Trạng thái tin giữ nguyên.',
    'invalid-state': 'Không lưu được quyết định vì dữ liệu không hợp lệ. Trạng thái tin giữ nguyên.',
    'store-unavailable': 'Không đọc được EduStore (js/data/store.js) trên trang này, nên quyết định chưa được ghi.',
    'reviewer-not-admin': 'Phiên đang mở không phải quản trị viên nên không được ghi quyết định kiểm duyệt — tránh vết kiểm toán đứng tên sai người. Đăng nhập persona ADMIN-01 để duyệt tin.',
  });

  /** Câu tiếng Việt cho từng `reason` store trả về (invalid-transition kèm nhãn nhóm hiện tại). */
  const reasonMessage = result => {
    if (!result || result.ok) return '';
    if (result.reason === 'invalid-transition') {
      const bucket = bucketInfo(result.bucket);
      return `Tin đang ở nhóm “${bucket.label}” nên không thực hiện được thao tác này. Trạng thái tin giữ nguyên.`;
    }
    return REASON_MESSAGES[result.reason] || `Không ghi được quyết định (mã ${result.reason || 'unknown'}). Trạng thái tin giữ nguyên.`;
  };

  /** decide({ jobId, decision, note }) — gọi THẬT Store.decideJob, có idempotency chống bấm đúp. */
  const decide = ({ jobId, decision, note = '' } = {}) => {
    if (!available) return Object.freeze({ ok: false, reason: 'store-unavailable', message: REASON_MESSAGES['store-unavailable'] });
    const reviewer = reviewerId();
    const result = Store.decideJob({
      jobId,
      decision,
      reviewerId: reviewer,
      note,
      idempotency: `job-review:${jobId}:${decision}`,
    });
    return Object.freeze({
      ...result,
      reviewerId: reviewer,
      message: result && result.ok ? '' : reasonMessage(result),
    });
  };

  const frozenBuckets = (() => {
    const keys = available ? Store.JOB_QUEUE_BUCKETS.slice() : Object.keys(BUCKET_TEXT);
    return Object.freeze(keys.reduce((acc, key) => {
      acc[key] = bucketInfo(key);
      return acc;
    }, {}));
  })();

  window.EduJobReview = Object.freeze({
    available,
    buckets: frozenBuckets,
    bucketInfo,
    queue,
    counts,
    detail,
    decide,
    reasonMessage,
    reviewerId,
    LEGACY_DECISIONS_KEY,
  });
})();
