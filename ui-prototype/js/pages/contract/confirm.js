/* UI prototype only. Local confirmation is not a server signature or a payment. */
(() => {
    const byId = (id) => document.getElementById(id);
    const money = (value) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
    const formatTime = (value) => new Date(value).toLocaleString("vi-VN");
    const key = "edu-contract-confirmation";
    const now = Date.now();
    const defaultTerms = {
        invitation: "INV-20261009-024",
        version: 2,
        fee: 220000,
        sessions: 8,
        schedule: "Thứ Hai & Thứ Sáu · 19:00–20:30",
        message:
            "Chuẩn bị thêm tài liệu luyện tập chuyên sâu, củng cố kiến thức Toán lớp 11 cho Gia Huy.",
        start: new Date(now + 7 * 86400000).toLocaleDateString("vi-VN"),
        acceptedAt: now,
        tutorConfirmedAt: now,
    };
    let record;
    let storageAvailable = true;
    try {
        const proposal = JSON.parse(sessionStorage.getItem("edu-agreed-proposal") || "null");
        const previous = JSON.parse(sessionStorage.getItem(key) || "null");
        const valid =
            proposal &&
            proposal.invitation === defaultTerms.invitation &&
            proposal.version === 2 &&
            proposal.fee === 220000 &&
            proposal.sessions === 8 &&
            typeof proposal.schedule === "string" &&
            typeof proposal.message === "string" &&
            typeof proposal.start === "string" &&
            Number.isFinite(proposal.acceptedAt);
        const terms = valid ? proposal : defaultTerms;
        const same =
            previous &&
            previous.terms?.invitation === terms.invitation &&
            previous.terms?.fee === terms.fee &&
            previous.terms?.sessions === terms.sessions &&
            previous.terms?.schedule === terms.schedule &&
            (!valid || previous.terms?.acceptedAt === terms.acceptedAt);
        record =
            same && Number.isFinite(previous.deadline)
                ? previous
                : {
                      terms,
                      deadline: now + 72 * 3600000,
                      confirmedAt: null,
                      report: null,
                  };
        sessionStorage.setItem(key, JSON.stringify(record));
    } catch {
        storageAvailable = false;
        record = {
            terms: defaultTerms,
            deadline: now + 72 * 3600000,
            confirmedAt: null,
            report: null,
        };
    }
    const terms = record.terms;
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
            "Học viên: Trần Gia Huy · Toán lớp 11\nGia sư: Nguyễn Minh Anh\n" +
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
        window.location.href = "../payment/checkout.html?from=contract";
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
