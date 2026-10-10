/* Local checkout preview only; production sessions must be created by the server. */
(() => {
    const money = (value) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
    // Page-only payment fixtures. Amounts mirror the wallet statement; the server owns the real figures.
    // Tutor, subject, scale, fee and schedule come from contract/confirm.js so one contract reads the same everywhere.
    const contracts = {
        "HD-20260926-025": {
            title: "Học Toán cùng Nguyễn Minh Anh",
            tutor: "Nguyễn Minh Anh",
            tutorNote: "Gia sư Toán · Đã xác minh",
            initials: "MA",
            student: "Trần Gia Huy",
            guardian: "Chị Mai Lan",
            course: "Toán lớp 11",
            sessions: 8,
            minutes: 90,
            fee: 220000,
            schedule: ["Thứ Hai & Thứ Sáu", "19:00–20:30"],
            total: 1760000,
            wallet: 340000,
            due: 1420000,
            available: 340000,
            reference: "ECX 26092602501",
            status: "Chờ ký quỹ",
        },
        "HD-20260926-018": {
            title: "Luyện Tiếng Anh cùng Trần Quốc Huy",
            tutor: "Trần Quốc Huy",
            tutorNote: "Gia sư Tiếng Anh · Đã xác minh",
            initials: "QH",
            student: "Trần Gia Huy",
            guardian: "Chị Mai Lan",
            course: "Tiếng Anh lớp 11",
            sessions: 10,
            minutes: 90,
            fee: 270000,
            schedule: ["Thứ Ba & Thứ Bảy", "19:00–20:30"],
            total: 2700000,
            wallet: 340000,
            due: 2360000,
            available: 340000,
            reference: "ECX 26092601801",
            status: "Chờ ký quỹ",
        },
        "HD-20260926-011": {
            title: "Học Ngữ văn cùng Lê Thảo Vy",
            tutor: "Lê Thảo Vy",
            tutorNote: "Gia sư Ngữ văn · Đã xác minh",
            initials: "TV",
            student: "Trần Gia Huy",
            guardian: "Chị Mai Lan",
            course: "Ngữ văn lớp 8",
            sessions: 12,
            minutes: 90,
            fee: 180000,
            schedule: ["Thứ Năm & Thứ Bảy", "08:00–09:30"],
            total: 2160000,
            wallet: 340000,
            due: 1820000,
            available: 340000,
            reference: "ECX 26092601101",
            status: "Chờ ký quỹ",
        },
        "HD-20260926-005": {
            title: "Luyện thi Toán cùng Phạm Hoàng Long",
            tutor: "Phạm Hoàng Long",
            tutorNote: "Gia sư Toán · Đã xác minh",
            initials: "PL",
            student: "Trần Gia Huy",
            guardian: "Chị Mai Lan",
            course: "Toán · Luyện thi",
            sessions: 10,
            minutes: 90,
            fee: 320000,
            schedule: ["Thứ Tư & Thứ Bảy", "09:00–10:30"],
            total: 3200000,
            wallet: 340000,
            due: 2860000,
            available: 340000,
            reference: "ECX 26092600501",
            status: "Chờ ký quỹ",
        },
    };
    const params = new URLSearchParams(location.search);
    const requested = params.get("contract") || params.get("id");
    // No silent fallback: an unknown or missing code never renders another contract.
    const contractId = requested && Object.hasOwn(contracts, requested) ? requested : null;
    const contract = contractId ? contracts[contractId] : null;
    // ?from=contract is the return route set by the contract confirmation page.
    const from = params.get("from");
    const confirmHref = `../contract/confirm.html${
        contractId ? `?contract=${encodeURIComponent(contractId)}` : ""
    }`;
    const originRoutes = {
        contract: confirmHref,
        "contract-detail": `../contract/student-detail.html?id=${encodeURIComponent(
            contractId || requested || "",
        )}`,
    };
    const returnTo = originRoutes[from] || null;
    // When the code cannot be rendered, offer the page the user came from, else the confirmation page.
    const backHref = returnTo || "../contract/confirm.html";
    const back = document.getElementById("back-to-contract");
    back.href = backHref;
    back.textContent = from === "contract-detail" ? "Quay lại hợp đồng" : "Quay lại xác nhận hợp đồng";
    back.hidden = false;
    const byId = (id) => document.getElementById(id);
    const setText = (id, value) => {
        byId(id).textContent = value;
    };
    const setHtml = (id, lines) => {
        byId(id).replaceChildren();
        lines.forEach((line, index) => {
            if (index) byId(id).append(document.createElement("br"));
            byId(id).append(line);
        });
    };
    if (!contract) {
        document.title = "Không tìm thấy hợp đồng — Edu Connect";
        setText(
            "contract-line",
            requested
                ? `Không tìm thấy hợp đồng ${requested} trong danh sách ký quỹ`
                : "Liên kết thanh toán không kèm mã hợp đồng",
        );
        const headerStatus = document.querySelector(".page-header__status");
        if (headerStatus) headerStatus.textContent = "Chưa xác định hợp đồng";
        document.querySelector(".payment-layout").hidden = true;
        const notice = document.createElement("section");
        notice.className = "alert alert--error";
        notice.setAttribute("role", "alert");
        const icon = document.createElement("span");
        icon.className = "alert__icon";
        icon.setAttribute("aria-hidden", "true");
        const content = document.createElement("div");
        content.className = "alert__content";
        const noticeTitle = document.createElement("h3");
        noticeTitle.className = "alert__title";
        noticeTitle.textContent = "Không tìm thấy hợp đồng";
        const noticeMessage = document.createElement("p");
        noticeMessage.className = "alert__message";
        noticeMessage.textContent = requested
            ? `Không có hợp đồng ${requested} trong danh sách ký quỹ của bạn. Trang không hiển thị hợp đồng khác thay thế; chưa có khoản tiền nào bị trừ.`
            : "Liên kết mở trang thanh toán thiếu mã hợp đồng. Trang không tự chọn một hợp đồng khác; chưa có khoản tiền nào bị trừ.";
        const noticeActions = document.createElement("div");
        noticeActions.className = "payment-heading";
        const noticeBack = document.createElement("a");
        noticeBack.className = "payment-link";
        noticeBack.href = backHref;
        noticeBack.textContent = from ? "Quay lại trang vừa mở" : "Mở trang xác nhận hợp đồng";
        const noticeWallet = document.createElement("a");
        noticeWallet.className = "payment-link";
        noticeWallet.href = "../wallet/overview.html#transactions";
        noticeWallet.textContent = "Xem ký quỹ trong ví Edu Connect";
        noticeActions.append(noticeBack, noticeWallet);
        content.append(noticeTitle, noticeMessage, noticeActions);
        notice.append(icon, content);
        document.querySelector(".payment-layout").after(notice);
        return;
    }
    document.title = `Thanh toán ký quỹ ${contractId} — Edu Connect`;
    setText("contract-line", `${contractId} · ${contract.title}`);
    setText("breakdown-scale", `${contract.sessions} buổi × ${money(contract.fee)}`);
    setText("sidebar-contract", contractId);
    setText("sidebar-initials", contract.initials);
    setText("sidebar-tutor", contract.tutor);
    setText("sidebar-tutor-note", contract.tutorNote);
    setText("sidebar-student", contract.student);
    setText("sidebar-course", contract.course);
    setText("sidebar-scale", `${contract.sessions} buổi · ${contract.minutes} phút/buổi`);
    setText("sidebar-fee", `${money(contract.fee)}/buổi`);
    setHtml("sidebar-schedule", contract.schedule);
    setText("projection-available", money(contract.available - contract.wallet));
    setText("projection-escrow", money(contract.total));
    byId("balance-available").firstChild.textContent = contract.available.toLocaleString("vi-VN") + " ";
    document.querySelectorAll("[data-total]").forEach((node) => (node.textContent = money(contract.total)));
    document.querySelectorAll("[data-deduction]").forEach((node) => (node.textContent = "−" + money(contract.wallet)));
    document.querySelectorAll("[data-due]").forEach((node) => (node.textContent = money(contract.due)));
    const consent = document.getElementById("payment-consent");
    const button = document.getElementById("pay-button");
    const error = document.getElementById("payment-error");
    button.textContent = `Thanh toán qua PayOS · ${money(contract.due)}`;
    consent.addEventListener("change", () => {
        button.disabled = !consent.checked;
        error.hidden = true;
    });
    document.getElementById("payment-form").addEventListener("submit", (event) => {
        event.preventDefault();
        if (!consent.checked) {
            consent.reportValidity();
            return;
        }
        const attempt = {
            reference: contract.reference,
            contract: contractId,
            contractTitle: contract.title,
            total: contract.total,
            wallet: contract.wallet,
            due: contract.due,
            expiresAt: Date.now() + 15 * 60 * 1000,
            state: "pending",
            from: returnTo ? from : null,
        };
        try {
            const previous = JSON.parse(sessionStorage.getItem("edu-payment-preview") || "null");
            const reusable =
                previous?.state === "pending" &&
                previous.contract === contractId &&
                previous.expiresAt > Date.now();
            if (!reusable) sessionStorage.setItem("edu-payment-preview", JSON.stringify(attempt));
            // The contract code and the return route travel with the link so the QR step cannot drift.
            location.href =
                `qr.html?contract=${encodeURIComponent(contractId)}` +
                (returnTo ? `&from=${encodeURIComponent(from)}` : "");
        } catch {
            error.hidden = false;
        }
    });
    document.getElementById("view-terms").addEventListener("click", () => {
        window.EduModal.open("shared-modal", {
            title: "Điều khoản ký quỹ",
            message: `Tổng ký quỹ là ${money(contract.total)} cho ${contract.sessions} buổi học. Sử dụng ${money(
                contract.wallet,
            )} từ số dư ví và thanh toán ${money(contract.due)} qua PayOS. Tiền được giữ theo hợp đồng và giải ngân theo từng buổi đã được xác nhận. Yêu cầu thay đổi lịch hoặc hoàn tiền được xem xét theo điều khoản hai bên đã thống nhất.`,
            variant: "info",
        });
    });
    document.getElementById("view-contract").addEventListener("click", () => {
        window.EduModal.open("shared-modal", {
            title: `Hợp đồng ${contractId}`,
            message: `Phụ huynh: ${contract.guardian} · Học viên: ${contract.student} · Gia sư: ${
                contract.tutor
            }. ${contract.course}, học trực tiếp, ${contract.sessions} buổi × ${contract.minutes} phút. Lịch dự kiến: ${contract.schedule[0]}, ${contract.schedule[1]}. Học phí: ${money(
                contract.fee,
            )}/buổi. Trạng thái: ${contract.status}.`,
            variant: "info",
        });
    });
})();
