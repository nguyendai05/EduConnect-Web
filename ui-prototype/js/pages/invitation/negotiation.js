/* Trang thương lượng: toàn bộ dữ liệu đọc/ghi qua EduStore (một nguồn). Không gọi API thật. */
(() => {
    const Store = window.EduStore;
    if (!Store) return;

    const byId = (id) => document.getElementById(id);
    const money = (value) => Store.formatMoney(value);
    const dateTime = (value) => {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "—";
        return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
    };

    const PROPOSAL_STATUS = {
        pending: { label: "Đang chờ phản hồi", badge: "warning" },
        countered: { label: "Đã bị đề xuất thay thế", badge: "neutral" },
        accepted: { label: "Đã chấp nhận", badge: "success" },
        declined: { label: "Đã từ chối", badge: "danger" },
        expired: { label: "Hết hạn", badge: "neutral" },
    };
    const INVITATION_STATUS = {
        pending: { label: "Chờ phản hồi", tone: "warning" },
        negotiating: { label: "Đang thương lượng", tone: "info" },
        accepted: { label: "Đã chấp nhận", tone: "success" },
        declined: { label: "Đã từ chối", tone: "danger" },
        expired: { label: "Đã hết hạn", tone: "neutral" },
    };
    const REASON_MESSAGES = {
        "invitation-not-found": "Lời mời không còn tồn tại trong dữ liệu.",
        "invalid-side": "Bạn không phải một trong hai bên của lời mời này.",
        "no-active-proposal": "Không còn đề xuất nào đang chờ phản hồi.",
        "cannot-answer-own-proposal":
            "Bạn không thể tự duyệt hoặc phản hồi đề xuất của chính mình. Vui lòng chờ phía còn lại trả lời.",
        "invalid-proposal": "Đề xuất lại chưa hợp lệ: học phí, số buổi và thời lượng phải lớn hơn 0.",
        "invalid-decision": "Quyết định không hợp lệ.",
        "duplicated": "Yêu cầu đã được gửi; đang tải lại dữ liệu mới nhất…",
        "storage-failed": "Không lưu được thay đổi do bộ nhớ trình duyệt bị chặn.",
        "invalid-state": "Dữ liệu lời mời không hợp lệ, vui lòng tải lại trang.",
        "mutation-failed": "Không thực hiện được thao tác do lỗi dữ liệu nội bộ.",
    };

    /* ---------- Đọc lời mời thật từ store ---------- */
    const params = new URLSearchParams(window.location.search);
    const requestedId = params.get("id") || params.get("invite");
    const invitation = requestedId ? Store.invitation(requestedId) : null;

    const notFound = document.querySelector("[data-neg-not-found]");
    const notFoundMessage = document.querySelector("[data-neg-not-found-message]");
    const pageHeader = document.querySelector(".page-header");
    const statusAlert = byId("status-alert");
    const layout = document.querySelector(".negotiation-layout");

    if (!invitation) {
        if (pageHeader) pageHeader.hidden = true;
        if (statusAlert) statusAlert.hidden = true;
        if (layout) layout.hidden = true;
        if (notFound) {
            notFound.hidden = false;
            if (notFoundMessage) {
                notFoundMessage.textContent = requestedId
                    ? `Không tìm thấy lời mời mang mã “${requestedId}” trong dữ liệu mẫu.`
                    : "Thiếu tham số ?id= trên đường dẫn. Vui lòng mở lời mời từ trang gửi lời mời hoặc danh sách của bạn.";
            }
        }
        return;
    }

    /* ---------- Xác định bên hiện tại từ persona ---------- */
    const persona = Store.getPersona();
    const role = persona ? persona.role : null;
    const currentLearnerId = Store.sessionLearnerId();
    const currentTutorId = Store.sessionTutorId();
    let mySide = null;
    if (role === "learner" && currentLearnerId && currentLearnerId === invitation.learnerId) mySide = "learner";
    else if (role === "tutor" && currentTutorId && currentTutorId === invitation.tutorId) mySide = "tutor";

    const viewOnlyReason = (() => {
        if (mySide) return "";
        if (role === "admin") return "Bạn đang xem với vai trò quản trị; chỉ hai bên trong lời mời mới phản hồi được.";
        if (role === "learner") return "Bạn đang đăng nhập bằng tài khoản học viên không phải người gửi lời mời này.";
        if (role === "tutor") return "Bạn đang đăng nhập bằng tài khoản gia sư không phải người nhận lời mời này.";
        return "Không xác định được vai trò của bạn trong lời mời này.";
    })();

    const learnerRecord = Store.learner(invitation.learnerId);
    const tutorRecord = Store.tutor(invitation.tutorId);
    const offeringRecord = Store.offering(invitation.offeringId);
    const learnerName = learnerRecord ? learnerRecord.name : invitation.learnerId;
    const tutorName = tutorRecord ? tutorRecord.name : invitation.tutorId;
    const authorName = (by) => (by === "learner" ? learnerName : tutorName);

    const terminal = Store.INVITATION_TERMINAL.includes(invitation.status);
    const proposals = invitation.proposals.slice().sort((a, b) => a.version - b.version);
    const current = Store.currentProposal(invitation);
    const accepted = Store.acceptedProposal(invitation.id);

    /* ---------- Khối hai bên tham gia ---------- */
    function renderParticipants() {
        const set = (selector, value) => {
            const node = document.querySelector(selector);
            if (node) node.textContent = value;
        };
        const title = document.querySelector("[data-neg-title]");
        if (title) title.textContent = `Lời mời học với ${tutorName}`;
        const desc = document.querySelector("[data-neg-desc]");
        if (desc) {
            const subject = offeringRecord ? `${offeringRecord.subjectLabel} · ${offeringRecord.gradeLabel}` : "";
            desc.textContent = subject ? `${invitation.id} · ${subject}` : invitation.id;
        }
        set("[data-neg-learner]", learnerName);
        const learnerAvatar = document.querySelector("[data-neg-learner-avatar]");
        if (learnerAvatar) {
            learnerAvatar.textContent = learnerRecord ? learnerRecord.initials : "–";
            learnerAvatar.setAttribute("aria-label", learnerName);
        }
        set(
            "[data-neg-learner-student]",
            learnerRecord ? `Học sinh: ${learnerRecord.studentName} · ${learnerRecord.grade}` : "Học sinh: —",
        );
        set("[data-neg-tutor]", tutorName);
        const tutorAvatar = document.querySelector("[data-neg-tutor-avatar]");
        if (tutorAvatar) {
            tutorAvatar.textContent = tutorRecord ? tutorRecord.initials : "–";
            tutorAvatar.setAttribute("aria-label", tutorName);
        }
        set("[data-neg-rating]", tutorRecord ? Store.formatNumber(tutorRecord.rating) : "—");
        set("[data-neg-rating-count]", tutorRecord ? `${tutorRecord.reviewCount} đánh giá` : "Chưa có đánh giá");
        set(
            "[data-neg-subject]",
            offeringRecord ? `${offeringRecord.subjectLabel} · ${offeringRecord.gradeLabel}` : "—",
        );
        const MODE_LABEL = { online: "Trực tuyến", home: "Dạy tại nhà", both: "Tại nhà & trực tuyến" };
        set(
            "[data-neg-format]",
            offeringRecord
                ? `${MODE_LABEL[offeringRecord.mode] || "Linh hoạt"} · ${offeringRecord.district}`
                : "—",
        );
    }

    /* ---------- Điều khoản hiện tại + dòng phí demo ---------- */
    function renderTerms() {
        if (!current) return;
        const total = current.pricePerSession * current.sessions;
        const set = (selector, value) => {
            document.querySelectorAll(selector).forEach((node) => { node.textContent = value; });
        };
        set('[data-value="fee"]', money(current.pricePerSession));
        set('[data-value="sessions"]', `${current.sessions} buổi · ${current.durationMinutes} phút/buổi`);
        set('[data-value="total"]', money(total));
        set('[data-value="schedule"]', current.scheduleText || "—");
        byId("proposal-author").textContent = `${authorName(current.by)} đề xuất · Phiên bản ${current.version}`;
        byId("round-label").textContent = `Phiên bản hiện hành: ${current.version}`;
        byId("price-detail").textContent = `${current.sessions} buổi × ${money(current.pricePerSession)}`;
        byId("start-date").textContent = "Chưa thống nhất trong đề xuất";
        byId("proposal-message").textContent = current.note || invitation.message || "—";

        const split = Store.splitRelease(total);
        const feeNote = document.querySelector("[data-fee-note]");
        if (feeNote) {
            feeNote.textContent =
                `Tạm tính ${money(total)} · phí nền tảng demo ${money(split.platformFeeReleased)} · ` +
                `gia sư nhận dự kiến ${money(split.tutorNetReleased)} (chưa trừ hoàn/hủy).`;
        }

        const previous = current.version > 1 ? proposals.find((item) => item.version === current.version - 1) : null;
        const changes = [];
        if (!previous) {
            changes.push("Đây là đề xuất đầu tiên, chưa có thay đổi so với bản trước.");
        } else {
            if (current.pricePerSession !== previous.pricePerSession)
                changes.push(`Học phí: ${money(previous.pricePerSession)} → ${money(current.pricePerSession)} /buổi.`);
            if (current.sessions !== previous.sessions)
                changes.push(`Số buổi: ${previous.sessions} → ${current.sessions}.`);
            if (current.durationMinutes !== previous.durationMinutes)
                changes.push(`Thời lượng: ${previous.durationMinutes} → ${current.durationMinutes} phút/buổi.`);
            if (current.scheduleText !== previous.scheduleText)
                changes.push(`Lịch học: ${previous.scheduleText || "—"} → ${current.scheduleText || "—"}.`);
            if (!changes.length) changes.push("Giữ nguyên điều khoản; cập nhật lời nhắn.");
        }
        byId("change-list").replaceChildren(
            ...changes.map((text) => {
                const li = document.createElement("li");
                li.textContent = text;
                return li;
            }),
        );
    }

    /* ---------- Timeline mọi phiên bản (từ invitation.proposals) ---------- */
    function proposalSummary(version) {
        return (
            `${money(version.pricePerSession)}/buổi × ${version.sessions} buổi (${version.durationMinutes} phút/buổi)\n` +
            `${version.scheduleText || "—"}\nTổng dự kiến: ${money(version.pricePerSession * version.sessions)}`
        );
    }
    function renderHistory() {
        const list = byId("proposal-history");
        const template = document.querySelector("[data-proposal-item-template]");
        list.replaceChildren();
        proposals.slice().reverse().forEach((version) => {
            const item = template.content.firstElementChild.cloneNode(true);
            const isCurrent = current && version.version === current.version;
            const status = PROPOSAL_STATUS[version.status] || { label: version.status, badge: "neutral" };
            const fill = (selector, value) => {
                const node = item.querySelector(selector);
                if (node) node.textContent = value;
            };
            const badge = item.querySelector('[data-proposal-status]');
            if (badge) badge.className = "badge badge--" + status.badge;
            fill("[data-proposal-status]", status.label);
            fill("[data-proposal-version]", `Phiên bản ${version.version}`);
            fill("[data-proposal-author]", `${authorName(version.by)}${version.by === mySide ? " (bạn)" : ""}`);
            fill("[data-proposal-time]", dateTime(version.createdAt));
            fill("[data-proposal-summary]", proposalSummary(version));
            const note = item.querySelector("[data-proposal-note]");
            if (note) {
                if (version.note) { note.textContent = "Ghi chú: " + version.note; note.hidden = false; }
                else note.hidden = true;
            }
            const button = item.querySelector("[data-proposal-detail]");
            if (button) button.addEventListener("click", () => showVersion(version, isCurrent));
            list.append(item);
        });
        byId("history-count").textContent = `${proposals.length} phiên bản`;
    }

    function showVersion(version, isCurrent) {
        pendingDecision = null;
        byId("reject-reason-field").hidden = true;
        const summary = byId("decision-summary");
        summary.className = "negotiation-dialog-terms";
        summary.textContent =
            proposalSummary(version) + "\nTrạng thái: " + (PROPOSAL_STATUS[version.status] || {}).label +
            (version.note ? "\nGhi chú: " + version.note : "") +
            (isCurrent ? "\n\nĐây là phiên bản hiện hành." : "");
        window.EduModal.open("decision-modal", {
            title: `Chi tiết đề xuất · Phiên bản ${version.version}`,
            message: `Người đề xuất: ${authorName(version.by)} · ${dateTime(version.createdAt)}`,
            variant: "info",
        });
    }

    /* ---------- Trạng thái tổng + khả năng thao tác ---------- */
    let pendingDecision = null;

    function setStatus() {
        const status = INVITATION_STATUS[invitation.status] || { label: invitation.status, tone: "neutral" };
        const badge = byId("invitation-status");
        badge.className = "badge badge--" + status.tone;
        badge.textContent = status.label;

        const alert = byId("status-alert");
        alert.className = "alert alert--" + status.tone;
        const messages = {
            pending: ["Đang chờ phản hồi", "Một đề xuất đang chờ bên còn lại trả lời."],
            negotiating: ["Hai bên đang thương lượng", "Lời mời đã có nhiều phiên bản đề xuất."],
            accepted: ["Đã chốt điều khoản", "Bước tiếp theo là tạo đơn. Chưa phát sinh thanh toán ở bước này."],
            declined: ["Lời mời đã bị từ chối", "Quá trình thương lượng đã kết thúc, không còn thao tác."],
            expired: ["Lời mời đã hết hạn", "Đề xuất không còn nhận phản hồi. Bạn vẫn xem lại được lịch sử."],
        };
        const [title, message] = messages[invitation.status] || [status.label, ""];
        byId("status-title").textContent = title;
        byId("status-message").textContent = message;
        byId("deadline-label").textContent = "Trạng thái lời mời";
        byId("deadline-value").textContent = status.label;

        const responseTitle = byId("response-title");
        const responseDesc = byId("response-description");
        const actions = byId("response-actions");
        const agreed = byId("agreed-button");
        const contractNext = byId("contract-next");
        const viewOnlyNote = document.querySelector("[data-viewonly-note]");
        const responseError = document.querySelector("[data-response-error]");

        agreed.hidden = invitation.status !== "accepted";
        contractNext.hidden = invitation.status !== "accepted";
        if (invitation.status === "accepted") {
            contractNext.href = "../payment/checkout.html";
            contractNext.textContent = "Tạo đơn / tới trang thanh toán";
        }

        const actionable = mySide && !terminal && Boolean(current);
        if (responseError) { responseError.hidden = true; responseError.textContent = ""; }

        if (invitation.status === "accepted") {
            responseTitle.textContent = "Đã chốt, chờ tạo đơn";
            responseDesc.textContent =
                `Phiên bản ${accepted ? accepted.version : invitation.currentVersion} đã được chấp nhận bởi ${
                    invitation.resolvedBy ? authorName(invitation.resolvedBy) : "một bên"
                }.`;
            actions.hidden = true;
            if (viewOnlyNote) viewOnlyNote.hidden = true;
        } else if (terminal) {
            responseTitle.textContent = status.label;
            responseDesc.textContent = message || "Lời mời đã kết thúc, không cho thao tác thêm.";
            actions.hidden = true;
            if (viewOnlyNote) viewOnlyNote.hidden = true;
        } else if (!actionable) {
            responseTitle.textContent = "Chế độ chỉ xem";
            responseDesc.textContent = viewOnlyReason;
            actions.hidden = true;
            if (viewOnlyNote) {
                viewOnlyNote.hidden = false;
                viewOnlyNote.textContent = viewOnlyReason;
            }
        } else {
            responseTitle.textContent = "Phản hồi đề xuất";
            if (current.by === mySide) {
                const otherSide = mySide === "learner" ? "gia sư" : "người học";
                responseDesc.textContent =
                    `Bạn đã gửi đề xuất phiên bản ${current.version} và đang chờ ${otherSide} phản hồi. ` +
                    "Bạn không thể tự duyệt đề xuất của chính mình.";
            } else {
                responseDesc.textContent = `${authorName(current.by)} đang chờ bạn phản hồi phiên bản ${current.version}.`;
            }
            actions.hidden = false;
            if (viewOnlyNote) viewOnlyNote.hidden = true;
        }
    }

    function showResponseError(result) {
        let message = REASON_MESSAGES[result.reason] || `Không thực hiện được thao tác (${result.reason}).`;
        if (result.reason === "invitation-terminal") {
            const status = INVITATION_STATUS[result.status] || { label: result.status };
            message = `Lời mời đã ở trạng thái cuối (${status.label}); không thể thao tác thêm.`;
        }
        const node = document.querySelector("[data-response-error]");
        if (node) {
            node.textContent = message;
            node.hidden = false;
        }
        window.EduToast?.show({ type: "error", title: "Chưa ghi nhận được", message });
    }

    function respond(decision, extra = {}) {
        if (!mySide) return;
        const idempotency = `invite:${invitation.id}:${decision}:${invitation.currentVersion}`;
        const result = Store.respondInvitation({
            invitationId: invitation.id,
            by: mySide,
            decision,
            proposal: extra.proposal || null,
            note: extra.note || "",
            idempotency,
        });
        if (result.ok) {
            const node = document.querySelector("[data-response-error]");
            if (node) {
                node.hidden = false;
                node.textContent = "Đã ghi nhận. Đang tải lại dữ liệu mới nhất…";
            }
            window.setTimeout(() => window.location.reload(), 900);
            return true;
        }
        showResponseError(result);
        return false;
    }

    /* ---------- Nút Chấp nhận / Từ chối ---------- */
    function openDecision(action) {
        if (!mySide || terminal || !current) return;
        pendingDecision = action;
        byId("reject-reason-field").hidden = action !== "reject";
        byId("reject-reason").value = "";
        const summary = byId("decision-summary");
        summary.className = "negotiation-dialog-terms";
        summary.textContent = proposalSummary(current);
        window.EduModal.open("decision-modal", {
            title: action === "accept" ? "Chấp nhận đề xuất này?" : "Từ chối lời mời này?",
            message:
                action === "accept"
                    ? "Bạn đồng ý với các điều khoản hiện tại. Chưa cần thanh toán ở bước này."
                    : "Quá trình thương lượng sẽ kết thúc. Bạn có thể để lại lý do cho phía còn lại.",
            confirmText: action === "accept" ? "Chấp nhận đề xuất" : "Xác nhận từ chối",
            variant: action === "accept" ? "confirm" : "danger",
        });
    }

    byId("accept-button").addEventListener("click", () => openDecision("accept"));
    byId("reject-button").addEventListener("click", () => openDecision("reject"));
    byId("agreed-button").addEventListener("click", () => current && showVersion(current, true));

    byId("decision-modal").addEventListener("modal:confirm", () => {
        if (!mySide || terminal || !["accept", "reject"].includes(pendingDecision)) {
            pendingDecision = null;
            return;
        }
        const decision = pendingDecision === "accept" ? "accept" : "decline";
        const note = pendingDecision === "reject" ? byId("reject-reason").value.trim() : "";
        pendingDecision = null;
        respond(decision, { note });
    });

    /* ---------- Nút Đề xuất lại (counter) ---------- */
    const fields = ["fee", "sessions", "schedule", "message"];
    function clearError(name) {
        const field = byId("counter-" + name);
        if (!field) return;
        field.removeAttribute("aria-invalid");
        field.closest(".form-field")?.classList.remove("is-error");
        byId("counter-" + name + "-error").hidden = true;
    }
    function updateTotal() {
        const fee = Number(byId("counter-fee").value);
        const sessions = Number(byId("counter-sessions").value);
        byId("counter-total").textContent =
            fee > 0 && fee <= 10000000 && sessions > 0 && sessions <= 100 ? money(fee * sessions) : "—";
        byId("message-count").textContent = byId("counter-message").value.length + " / 500 ký tự";
    }
    fields.forEach((name) =>
        byId("counter-" + name).addEventListener("input", () => {
            clearError(name);
            updateTotal();
        }),
    );
    byId("counter-button").addEventListener("click", () => {
        if (!mySide || terminal || !current) return;
        byId("counter-fee").value = current.pricePerSession;
        byId("counter-sessions").value = current.sessions;
        byId("counter-schedule").value = current.scheduleText || "";
        byId("counter-message").value = "";
        fields.forEach((name) => clearError(name));
        updateTotal();
        window.EduModal.open("counter-modal", {
            title: `Đề xuất điều chỉnh · Phiên bản ${current.version + 1}`,
            message: "Điều chỉnh điều khoản và nêu lý do bạn muốn trao đổi với phía còn lại.",
        });
    });
    byId("counter-form").addEventListener("submit", (event) => {
        event.preventDefault();
        if (!mySide || terminal || !current) return;
        let firstInvalid;
        const data = {};
        fields.forEach((name) => {
            const field = byId("counter-" + name);
            data[name] = ["fee", "sessions"].includes(name) ? Number(field.value) : field.value.trim();
            const valid = field.checkValidity() && data[name] !== "";
            if (!valid) {
                const error = byId("counter-" + name + "-error");
                error.textContent = {
                    fee: "Nhập học phí từ 1.000 đến 10.000.000 ₫.",
                    sessions: "Nhập số nguyên từ 1 đến 100 buổi.",
                    schedule: "Vui lòng nhập ngày và khung giờ học.",
                    message: "Vui lòng nhập lý do điều chỉnh.",
                }[name];
                error.hidden = false;
                field.setAttribute("aria-invalid", "true");
                field.closest(".form-field")?.classList.add("is-error");
                firstInvalid ||= field;
            }
        });
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }
        if (
            data.fee === current.pricePerSession &&
            data.sessions === current.sessions &&
            data.schedule === current.scheduleText
        ) {
            window.EduToast?.show({ type: "warning", message: "Bạn chưa thay đổi điều khoản nào." });
            return;
        }
        const ok = respond("counter", {
            proposal: {
                pricePerSession: data.fee,
                sessions: data.sessions,
                durationMinutes: current.durationMinutes,
                scheduleText: data.schedule,
            },
            note: data.message,
        });
        if (ok) window.EduModal.close("counter-modal");
    });

    renderParticipants();
    renderTerms();
    renderHistory();
    setStatus();
})();
