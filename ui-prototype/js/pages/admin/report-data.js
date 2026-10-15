/**
 * Façade EduReport — hàng đợi admin và trang chi tiết đọc/ghi CÙNG tập report với người gửi.
 * Nguồn dữ liệu duy nhất: EduStore, không còn fixture BC-* riêng.
 *
 * API giữ nguyên cho caller: statuses, severities, types, list, get, decide
 * (bổ sung reasons, bounds, resolutionLabel — caller cũ không bị ảnh hưởng).
 *
 * BẢNG ÁNH XẠ HAI CHIỀU store ↔ façade:
 *   state (REPORT_STATE)  → status:  open|investigating|resolved|dismissed (giữ nguyên khoá, 1-1)
 *                            label/badge/terminal/actions lấy thẳng từ EduStore.REPORT_STATE
 *   targetType            → type:    tutor|contract|order|offering|job (giữ nguyên khoá, 1-1)
 *   reason/reasonLabel    → reason/reasonLabel (từ EduStore.REPORT_REASONS) + severity DẪN XUẤT
 *   evidenceMeta          → evidenceCount (screenshots) + evidenceNote (note); KHÔNG bịa tệp thật
 *   resolution            → resolutionLabel/decisionNote/reviewedAt/assignee
 *   notices               → timeline (mốc createdAt + từng notice) và danh sách notices
 *
 * `severity` là trường DẪN XUẤT chỉ phục vụ hiển thị/sắp xếp ưu tiên (store không có):
 *   high   = conduct, payment        (an toàn / tiền bạc — ưu tiên xác minh trước)
 *   medium = no-show, content        (ảnh hưởng trực tiếp buổi học / chất lượng dịch vụ)
 *   low    = wrong-schedule, other   (lịch hẹn hoặc chưa phân loại)
 * Không ghi ngược severity vào store, không đổi nghiệp vụ theo nó.
 */
(() => {
  const Store = window.EduStore;
  if (!Store) throw new Error('EduReport: cần nạp js/data/fixtures.js và js/data/store.js trước js/pages/admin/report-data.js');

  /* Migrate có kiểm soát khoá cũ `educonnect:report-decisions:v1` (nguồn sự thật cũ của fixture BC-*).
     Quyết định cũ gắn với ID BC-2026-0xx không tồn tại trong store RP-*; nếu trùng ID hiếm hoi
     thì áp lại một lần qua decideReport, sau đó XOÁ khoá cũ. Không dùng sessionStorage.clear(). */
  const LEGACY_DECISIONS_KEY = 'educonnect:report-decisions:v1';
  const LEGACY_STATUS_TO_DECISION = { investigating: 'investigate', resolved: 'resolve', dismissed: 'dismiss' };
  const migrateLegacyDecisions = () => {
    try {
      const raw = window.sessionStorage.getItem(LEGACY_DECISIONS_KEY);
      if (raw === null) return;
      let saved = null;
      try { saved = JSON.parse(raw); } catch { saved = null; }
      if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        Object.keys(saved).forEach(oldId => {
          const decision = saved[oldId];
          const record = Store.report(oldId);
          if (!decision || typeof decision !== 'object' || !record) return;
          const mapped = LEGACY_STATUS_TO_DECISION[decision.status];
          if (!mapped || Store.REPORT_STATE[record.state].terminal) return;
          Store.decideReport({ reportId: oldId, decision: mapped, summary: String(decision.note || ''), decidedBy: 'admin.educonnect' });
        });
      }
      window.sessionStorage.removeItem(LEGACY_DECISIONS_KEY);
    } catch { /* storage bị chặn: bỏ qua, khoá cũ không còn là nguồn sự thật */ }
  };
  migrateLegacyDecisions();

  const summaryText = Object.freeze({
    open: 'mới tiếp nhận',
    investigating: 'đang xác minh',
    resolved: 'đã xử lý',
    dismissed: 'đã từ chối',
  });

  /** status của façade = REPORT_STATE của store (khoá 1-1), kèm `summary` cho câu chữ hàng đợi. */
  const statuses = Object.freeze(Object.keys(Store.REPORT_STATE).reduce((acc, key) => {
    const state = Store.REPORT_STATE[key];
    acc[key] = Object.freeze({
      key,
      label: state.label,
      summary: summaryText[key] || state.label,
      badge: state.badge,
      terminal: state.terminal,
      actions: Object.freeze(state.actions.slice()),
    });
    return acc;
  }, {}));

  const severities = Object.freeze({
    high: Object.freeze({ label: 'Cao', short: 'Mức độ cao', rank: 3, badge: 'badge--danger' }),
    medium: Object.freeze({ label: 'Trung bình', short: 'Mức độ trung bình', rank: 2, badge: 'badge--warning' }),
    low: Object.freeze({ label: 'Thấp', short: 'Mức độ thấp', rank: 1, badge: 'badge--neutral' }),
  });

  const SEVERITY_BY_REASON = Object.freeze({
    conduct: 'high',
    payment: 'high',
    'no-show': 'medium',
    content: 'medium',
    'wrong-schedule': 'low',
    other: 'low',
  });

  /** type của façade = targetType của store (khoá 1-1). */
  const types = Object.freeze({
    tutor: Object.freeze({ label: 'Gia sư' }),
    contract: Object.freeze({ label: 'Hợp đồng' }),
    order: Object.freeze({ label: 'Đơn đăng ký' }),
    offering: Object.freeze({ label: 'Dịch vụ/Lớp' }),
    job: Object.freeze({ label: 'Tin tìm gia sư' }),
  });

  const reasons = Object.freeze(Store.REPORT_REASONS.map(reason => Object.freeze({ code: reason.code, label: reason.label })));

  /** Giới hạn summary theo validate của EduStore.decideReport. */
  const bounds = Object.freeze({ summaryMin: 10, summaryMax: 600 });

  const RESOLUTION_LABELS = Object.freeze({
    resolved: 'Đã xử lý báo cáo',
    'insufficient-evidence': 'Từ chối: không đủ căn cứ',
    warned: 'Đã nhắc nhở bên vi phạm',
  });
  const resolutionLabel = code => RESOLUTION_LABELS[code] || code || '';

  const severityOf = reason => severities[SEVERITY_BY_REASON[reason] ? SEVERITY_BY_REASON[reason] : 'low'];

  const initialsOf = name => {
    const words = String(name || '').trim().split(/\s+/).filter(Boolean);
    if (!words.length) return '?';
    return words.slice(-2).map(word => word[0].toUpperCase()).join('');
  };

  const reporterRoleOf = reporterId => {
    const learnerRecord = Store.FIXTURES.learners.find(item => item.id === reporterId);
    const persona = learnerRecord ? Store.FIXTURES.personas.find(item => item.id === learnerRecord.personaId) : null;
    return persona ? persona.label : 'Người báo cáo (dữ liệu demo)';
  };

  const noticeEvent = notice => {
    const text = String(notice.text || '');
    let title = 'Cập nhật xử lý từ quản trị';
    if (text.startsWith('Đã chuyển sang xác minh')) title = 'Hồ sơ chuyển sang đang xác minh';
    else if (text.startsWith('Báo cáo đã xử lý')) title = 'Quản trị kết luận: đã xử lý';
    else if (text.startsWith('Báo cáo bị từ chối')) title = 'Quản trị kết luận: từ chối';
    return { title, at: notice.at, actor: 'Quản trị Edu Connect (demo)', detail: text };
  };

  /** Map một record của EduStore.reports sang view-model mà hai trang admin đang dùng. */
  const mapRecord = record => {
    const state = Store.statusOf(Store.REPORT_STATE, record.state);
    const typeLabel = types[record.targetType] ? types[record.targetType].label : record.targetType;
    const evidenceMeta = record.evidenceMeta || { screenshots: 0, note: '' };
    const note = String(evidenceMeta.note || '').trim();
    const reporterRole = reporterRoleOf(record.reporterId);
    return {
      id: record.id,
      title: `${record.reasonLabel} — ${record.targetLabel}`,
      type: record.targetType,
      severity: (SEVERITY_BY_REASON[record.reason] || 'low'),
      status: record.state,
      state: record.state,
      terminal: state.terminal,
      allowedActions: state.actions.slice(),
      reporter: record.reporterName,
      reporterId: record.reporterId,
      reporterRole,
      initials: initialsOf(record.reporterName),
      reported: record.targetLabel,
      reportedRole: `${typeLabel} · ${record.targetId}`,
      targetType: record.targetType,
      targetId: record.targetId,
      targetLabel: record.targetLabel,
      typeLabel,
      reference: record.targetId,
      referenceLabel: typeLabel,
      heldAmount: 0,
      moneyLock: false,
      reason: record.reason,
      reasonLabel: record.reasonLabel,
      scope: record.reasonLabel,
      summary: note || 'Người báo cáo chưa kèm mô tả bổ sung.',
      description: note || 'Người báo cáo chỉ chọn lý do, không kèm mô tả.',
      // API cũ của trang dùng mảng `evidence`; giữ nguyên nhưng chỉ là metadata, không bịa tệp thật.
      evidence: Array.from({ length: Math.max(0, Number(evidenceMeta.screenshots) || 0) }, (_, index) => ({
        name: `Minh chứng ${index + 1}`,
        kind: 'Ảnh chụp (metadata)',
        meta: note || 'Bản xem trước chỉ lưu mô tả minh chứng, chưa có tệp tải lên.'
      })),
      evidenceCount: Number(evidenceMeta.screenshots) || 0,
      evidenceNote: note,
      evidenceMeta: { screenshots: Number(evidenceMeta.screenshots) || 0, note },
      created: record.createdAt,
      assignee: record.resolution ? record.resolution.decidedBy : '',
      resolution: record.resolution ? { ...record.resolution } : null,
      resolutionLabel: record.resolution ? resolutionLabel(record.resolution.code) : '',
      decisionNote: record.resolution ? record.resolution.summary : '',
      reviewedAt: record.resolution ? record.resolution.decidedAt : null,
      notices: (record.notices || []).map(notice => ({ at: notice.at, text: notice.text })),
      timeline: [
        { title: 'Người báo cáo gửi báo cáo', at: record.createdAt, actor: `${record.reporterName} · ${reporterRole}`, detail: `Lý do: ${record.reasonLabel}. Đối tượng: ${typeLabel} ${record.targetId}.` },
        ...(record.notices || []).map(noticeEvent),
      ],
      excerpt: [],
      resolutions: [{ key: 'resolved', label: 'Ghi nhận đã xử lý', detail: 'Lưu kết luận và thông báo cho người gửi. Thao tác này không chuyển tiền hoặc hoàn tiền.' }],
      parties: [
        { name: record.reporterName, role: `Người báo cáo · ${reporterRole}`, initials: initialsOf(record.reporterName) },
        { name: record.targetLabel, role: `Bị báo cáo · ${typeLabel} ${record.targetId}`, initials: initialsOf(record.targetLabel) },
      ],
    };
  };

  /**
   * list(filter?) — đọc EduStore.list('reports') (cùng tập với người gửi).
   * filter.status: 'all' | 'unresolved' (chưa terminal) | một khoá của statuses.
   */
  const list = (filter = {}) => {
    const items = Store.list('reports').map(mapRecord);
    const status = filter && filter.status ? String(filter.status) : 'all';
    if (status === 'all') return items;
    if (status === 'unresolved') return items.filter(item => !item.terminal);
    return items.filter(item => item.status === status);
  };

  /** get(id) — ID không tồn tại trả null; trang phải hiện empty/error, KHÔNG fallback bản ghi khác. */
  const get = id => {
    const record = id ? Store.report(String(id)) : null;
    return record ? mapRecord(record) : null;
  };

  /**
   * decide(id, payload) — payload nhận {decision} mới hoặc {status} cũ của façade:
   * investigating→investigate, resolved→resolve, dismissed→dismiss.
   * Trả {ok:true, report} hoặc {ok:false, reason} với reason của EduStore.decideReport:
   * unknown-report | terminal-state | invalid-decision | summary-too-short | summary-too-long
   * | duplicated | storage-failed. Không ném exception.
   */
  const decide = (id, payload = {}) => {
    const decision = payload.decision || LEGACY_STATUS_TO_DECISION[payload.status] || null;
    if (!decision) return { ok: false, reason: 'invalid-decision' };
    const summary = String(payload.summary !== undefined ? payload.summary : (payload.note || ''));
    const result = Store.decideReport({ reportId: String(id), decision, summary, decidedBy: 'admin.educonnect' });
    if (!result.ok) return result;
    return { ok: true, report: get(id) };
  };

  window.EduReport = Object.freeze({
    statuses,
    severities,
    types,
    reasons,
    bounds,
    resolutionLabel,
    list,
    get,
    decide,
  });
})();
