/* UI prototype only. Local confirmation is not a server signature or a payment. */
(() => {
    const byId = (id) => document.getElementById(id);
    const money = (value) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
    const formatTime = (value) => new Date(value).toLocaleString("vi-VN");
    const key = "edu-contract-confirmation";
    const now = Date.now();
    const defaultStart = new Date(now + 7 * 86400000).toLocaleDateString("vi-VN");

    // Fixture hợp đồng theo mã ?contract=. Trùng khớp với dữ liệu lời mời ở negotiation.
    const CONTRACTS = {
        "HD-20260926-025": {
            code: "HD-20260926-025",
            invitation: "INV-20261009-024",
            version: 2,
            tutor: "Nguyễn Minh Anh",
            initials: "MA",
            qualification: "Cử nhân Sư phạm Toán",
            subject: "Toán · Lớp 11",
            fee: 220000,
            sessions: 8,
            schedule: "Thứ Hai & Thứ Sáu · 19:00–20:30",
            message: "Củng cố kiến thức Toán lớp 11 và rèn luyện kỹ năng giải bài tập.",
        },
        "HD-20260926-018": {
            code: "HD-20260926-018",
            invitation: "INV-20261009-018",
            version: 2,
            tutor: "Trần Quốc Huy",
            initials: "QH",
            qualification: "Cử nhân Sư phạm Tiếng Anh · IELTS 8.0",
            subject: "Tiếng Anh · Lớp 11",
            fee: 270000,
            sessions: 10,
            schedule: "Thứ Ba & Thứ Bảy · 19:00–20:30",
            message: "Luyện phát âm, Writing và giải đề IELTS theo từng tuần.",
        },
        "HD-20260926-011": {
            code: "HD-20260926-011",
            invitation: "INV-20261009-011",
            version: 2,
            tutor: "Lê Thảo Vy",
            initials: "TV",
            qualification: "Cử nhân Ngữ văn",
            subject: "Ngữ văn · Lớp 8",
            fee: 180000,
            sessions: 12,
            schedule: "Thứ Năm & Thứ Bảy · 08:00–09:30",
            message: "Rèn nghị luận văn học và kỹ năng lập dàn ý cho đề bài.",
        },
        "HD-20260926-005": {
            code: "HD-20260926-005",
            invitation: "INV-20261009-005",
            version: 2,
            tutor: "Phạm Hoàng Long",
            initials: "PL",
            qualification: "Thạc sĩ Toán ứng dụng",
            subject: "Toán · Luyện thi",
            fee: 320000,
            sessions: 10,
            schedule: "Thứ Tư & Thứ Bảy · 09:00–10:30",
            message: "Luyện các đề vận dụng cao trước kỳ thi tốt nghiệp THPT.",
        },
    };

    const requestedContract = new URLSearchParams(window.location.search).get("contract");
    const base = CONTRACTS[requestedContract] || CONTRACTS["HD-20260926-025"];
    const contractCode = CONTRACTS[requestedContract] ? requestedContract : base.code;

    const baseTerms = () => ({
        contract: base.code,
        invitation: base.invitation,
        version: base.version,
        tutor: base.tutor,
        initials: base.initials,
        qualification: base.qualification,
        subject: base.subject,
        fee: base.fee,
        sessions: base.sessions,
        schedule: base.schedule,
        message: base.message,
        start: defaultStart,
        acceptedAt: now,
        tutorConfirmedAt: now,
    });

    const agreed = (() => {
        try {
            const proposal = JSON.parse(sessionStorage.getItem("edu-agreed-proposal") || "null");
            if (!proposal || proposal.contract !== base.code) return null;
            return {
                contract: base.code,
                invitation: typeof proposal.invitation === "string" ? proposal.invitation : base.invitation,
                version: Number.isFinite(proposal.version) ? proposal.version : base.version,
                tutor: typeof proposal.tutor === "string" ? proposal.tutor : base.tutor,
                initials: base.initials,
                qualification: base.qualification,
                subject: base.subject,
                fee: Number.isFinite(proposal.fee) ? proposal.fee : base.fee,
                sessions: Number.isFinite(proposal.sessions) ? proposal.sessions : base.sessions,
                schedule: typeof proposal.schedule === "string" ? proposal.schedule : base.schedule,
                message: typeof proposal.message === "string" ? proposal.message : base.message,
                start: typeof proposal.start === "string" ? proposal.start : defaultStart,
                acceptedAt: Number.isFinite(proposal.acceptedAt) ? proposal.acceptedAt : now,
                tutorConfirmedAt: Number.isFinite(proposal.tutorConfirmedAt) ? proposal.tutorConfirmedAt : now,
            };
        } catch {
            return null;
        }
    })();

    const incomingTerms = agreed || baseTerms();

    let record;
    let storageAvailable = true;
    try {
        const previous = JSON.parse(sessionStorage.getItem(key) || "null");
        const same =
            previous &&
            previous.terms?.contract === incomingTerms.contract &&
            previous.terms?.fee === incomingTerms.fee &&
            previous.terms?.sessions === incomingTerms.sessions &&
            previous.terms?.schedule === incomingTerms.schedule &&
            previous.terms?.acceptedAt === incomingTerms.acceptedAt;
        record =
            same && Number.isFinite(previous.deadline)
                ? previous
                : {
                      terms: incomingTerms,
                      deadline: now + 72 * 3600000,
                      confirmedAt: null,
                      report: null,
                  };
        sessionStorage.setItem(key, JSON.stringify(record));
    } catch {
        storageAvailable = false;
        record = {
            terms: incomingTerms,
            deadline: now + 72 * 3600000,
            confirmedAt: null,
            report: null,
        };
    }
    const terms = record.terms;
    const checkoutHref = `../payment/checkout.html?from=contract&contract=${encodeURIComponent(contractCode)}`;
    const checks = [...document.querySelectorAll("[data-consent]")];
    const all = byId("select-all");
    const expired = () => !record.confirmedAt && Date.now() >= record.deadline;
    const save = () => {
        try {
            sessionStorage.setItem(key, JSON.stringify(record));
            return true;
        } catch {
            window.EduToast.show({
                type: "error",
                message: "Không lưu được xác nhận trong trình duyệt. Vui lòng thử lại.",
            });
            return false;
        }
    };
    const setStatus = (tone, text, title, message) => {
        ["confirm-status", "summary-status", "parent-status"].forEach((id) => {
            byId(id).className = "badge badge--" + tone;
            byId(id).textContent = text;
        });
        byId("confirm-alert").className = "alert alert--" + (tone === "danger" ? "error" : tone);
        byId("confirm-alert-title").textContent = title;
        byId("confirm-alert-message").textContent = message;
    };
    function updateConsent() {
        const count = checks.filter((field) => field.checked).length;
        all.checked = count === checks.length;
        all.indeterminate = count > 0 && count < checks.length;
        byId("consent-count").textContent = "Đã chọn " + count + "/5 điều khoản";
        byId("confirm-button").disabled =
            count !== 5 ||
            Boolean(record.confirmedAt || record.report) ||
            expired() ||
            !storageAvailable;
    }
    function renderIdentity() {
        document.title = `Xác nhận hợp đồng ${terms.contract} — Edu Connect`;
        const nameNode = document.querySelector("[data-contract-tutor]");
        if (nameNode) nameNode.textContent = terms.tutor;
        const avatarNode = document.querySelector("[data-contract-tutor-avatar]");
        if (avatarNode) {
            avatarNode.textContent = terms.initials;
            avatarNode.setAttribute("aria-label", terms.tutor);
        }
        const qualificationNode = document.querySelector("[data-contract-qualification]");
        if (qualificationNode) qualificationNode.textContent = terms.qualification;
        const signatureNode = document.querySelector("[data-contract-signature]");
        if (signatureNode) signatureNode.textContent = "Gia sư · " + terms.tutor;
    }
    function render() {
        const values = {
            ...terms,
            fee: money(terms.fee),
            total: money(terms.fee * terms.sessions),
            platform: money(terms.fee * 0.1),
            net: money(terms.fee * 0.9),
        };
        document.querySelectorAll("[data-contract]").forEach((node) => {
            node.textContent = values[node.dataset.contract];
        });
        byId("checkout-link").href = checkoutHref;
        byId("tutor-confirmed-at").textContent =
            "Điều khoản xác nhận lúc " + formatTime(terms.tutorConfirmedAt || terms.acceptedAt);
        const deadlineNode = byId("confirm-deadline");
        if (deadlineNode) deadlineNode.textContent = formatTime(record.deadline);
        byId("checkout-link").hidden = !record.confirmedAt;
        byId("confirm-button").hidden = Boolean(record.confirmedAt);
        byId("report-button").disabled = Boolean(record.confirmedAt || record.report) || expired();
        checks.forEach((field) => {
            field.disabled = Boolean(record.confirmedAt || record.report) || expired();
            if (record.confirmedAt) field.checked = true;
        });
        all.disabled = checks[0].disabled;
        if (record.confirmedAt) {
            setStatus(
                "success",
                "Đã xác nhận",
                "Hợp đồng đang chờ hoàn tất ký quỹ",
                "Điều khoản đã được xác nhận. Chuyển sang thanh toán để kiểm tra số dư và hoàn tất ký quỹ.",
            );
            byId("parent-confirmed-at").textContent =
                "Đã xác nhận lúc " + formatTime(record.confirmedAt);
            byId("confirm-hint").textContent = "Bạn chưa bị trừ tiền. Tiếp tục ở bước ký quỹ.";
        } else if (record.report) {
            setStatus("warning", "Cần kiểm tra lại", "Đang tạm dừng xác nhận", record.report);
            byId("confirm-hint").textContent =
                "Quay lại lời mời để hai bên thống nhất lại điều khoản.";
        } else if (expired()) {
            setStatus(
                "neutral",
                "Hết hạn xác nhận",
                "Đã hết thời hạn phản hồi",
                "Vui lòng quay lại lời mời để thống nhất lại thời hạn với gia sư.",
            );
            byId("confirm-hint").textContent = "Hợp đồng này không còn nhận xác nhận.";
        } else if (!storageAvailable) {
            setStatus(
                "danger",
                "Chưa thể xác nhận",
                "Không thể lưu dữ liệu",
                "Hãy cho phép lưu trữ trong trình duyệt và tải lại trang trước khi xác nhận.",
            );
        }
        updateConsent();
    }
    renderIdentity();
    checks.forEach((field) => field.addEventListener("change", updateConsent));
    all.addEventListener("change", () => {
        checks.forEach((field) => {
            field.checked = all.checked;
        });
        updateConsent();
    });
    byId("confirm-button").addEventListener("click", () => {
        render();
        if (byId("confirm-button").disabled) return;
        byId("confirm-modal-summary").textContent =
            "Học viên: Trần Gia Huy · " +
            terms.subject +
            "\nGia sư: " +
            terms.tutor +
            "\n" +
            terms.sessions +
            " buổi × " +
            money(terms.fee) +
            "\n" +
            terms.schedule +
            "\nTổng ký quỹ: " +
            money(terms.fee * terms.sessions);
        window.EduModal.open("confirm-modal", {
            title: "Xác nhận hợp đồng dạy – học",
            message:
                "Bạn đồng ý với điều khoản đã kiểm tra và 5 cam kết đã chọn. Sau bước này, bạn chuyển sang thanh toán ký quỹ.",
            confirmText: "Tôi đồng ý xác nhận",
            cancelText: "Xem lại",
        });
    });
    byId("confirm-modal").addEventListener("modal:confirm", (event) => {
        if (
            record.confirmedAt ||
            record.report ||
            expired() ||
            !checks.every((field) => field.checked)
        ) {
            event.preventDefault();
            render();
            return;
        }
        record.confirmedAt = Date.now();
        if (!save()) {
            record.confirmedAt = null;
            event.preventDefault();
            return;
        }
        window.location.href = checkoutHref;
    });
    byId("report-button").addEventListener("click", () => {
        if (record.confirmedAt || record.report || expired()) return;
        window.EduModal.open("report-modal", {
            title: "Yêu cầu kiểm tra điều khoản",
            message:
                "Nêu rõ thông tin chưa đúng. Bước xác nhận sẽ tạm dừng để hai bên kiểm tra lại.",
        });
    });
    byId("report-message").addEventListener("input", () =>
        byId("report-message").setCustomValidity(""),
    );
    byId("report-form").addEventListener("submit", (event) => {
        event.preventDefault();
        if (record.confirmedAt || record.report || expired()) {
            window.EduModal.close("report-modal");
            render();
            return;
        }
        const input = byId("report-message");
        if (!input.value.trim()) {
            input.setCustomValidity("Vui lòng nhập nội dung cần kiểm tra.");
            input.reportValidity();
            return;
        }
        record.report = input.value.trim();
        if (!save()) {
            record.report = null;
            return;
        }
        window.EduModal.close("report-modal");
        render();
        window.EduToast.show({
            type: "info",
            message:
                "Đã ghi nhận nội dung cần kiểm tra. Vui lòng trao đổi lại với gia sư trước khi xác nhận.",
        });
    });
    byId("print-button").addEventListener("click", () => {
        const details = [...document.querySelectorAll(".confirm-rule")];
        const previous = details.map((detail) => detail.open);
        details.forEach((detail) => {
            detail.open = true;
        });
        window.addEventListener(
            "afterprint",
            () =>
                details.forEach((detail, index) => {
                    detail.open = previous[index];
                }),
            { once: true },
        );
        window.print();
    });
    const header = document.querySelector(".user-header");
    [
        ["1", "../contract/student-detail.html"],
        ["2", "../wallet/overview.html"],
        ["4", "../wallet/overview.html#transactions"],
    ].forEach(([key, href]) => {
        const link = header.querySelector('[data-menu-item="' + key + '"]');
        if (link) link.href = href;
    });
    const label = header.querySelector('[data-menu-item="2"] [data-menu-label]');
    if (label) label.textContent = "Ví Edu Connect";
    header.querySelector('[aria-label="Tin nhắn"]')?.addEventListener("click", () => {
        location.href = "../chat/messages.html";
    });
    render();
    const timer = setInterval(() => {
        if (expired()) {
            window.EduModal.close();
            render();
            clearInterval(timer);
        }
    }, 30000);
})();
