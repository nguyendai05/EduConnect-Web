/* Static UI fixtures: ?status=pending|success|failed|cancelled (legacy ?view= still works).
 * This parameter selects a presentation only. Never use URL parameters as proof
 * of payment. JSP must obtain verified status and amounts from the server.
 * This page never updates a wallet or activates a contract.
 */
(() => {
    const views = {
        pending: {
            title: "Đang chờ xác nhận thanh toán",
            description:
                "Giao dịch đang được đối soát. Vui lòng không thanh toán lại trong lúc chờ kết quả.",
            badge: "Chờ đối soát",
            action: "Kiểm tra trạng thái",
        },
        success: {
            title: "Thanh toán ký quỹ thành công",
            description: "Khoản thanh toán đã được ghi nhận vào quỹ ký quỹ của hợp đồng.",
            badge: "Đã ký quỹ đủ",
            action: "Xem thông tin hợp đồng",
        },
        failed: {
            title: "Thanh toán chưa thành công",
            description:
                "Chưa thể hoàn tất ký quỹ cho hợp đồng. Vui lòng kiểm tra giao dịch trước khi thử lại.",
            badge: "Chưa hoàn tất",
            action: "Quay lại thanh toán",
        },
        cancelled: {
            title: "Phiên thanh toán đã hủy",
            description: "Phiên thanh toán đã kết thúc. Hợp đồng vẫn đang chờ hoàn tất ký quỹ.",
            badge: "Đã hủy phiên",
            action: "Quay lại thanh toán",
        },
    };
    // Page-only payment records; amounts mirror the wallet statement.
    // Fee, scale and tutor come from contract/confirm.js; total = fee × sessions.
    const contracts = {
        "HD-20260926-025": {
            learner: "Toán lớp 11 · Trần Gia Huy",
            tutor: "Nguyễn Minh Anh",
            sessions: 8,
            fee: 220000,
            total: 1760000,
            wallet: 340000,
            payos: 1420000,
            reference: "PAY-20260926-025",
            idleStatus: "Chờ ký quỹ",
            activeStatus: "Đang thực hiện",
        },
        "HD-20260926-018": {
            learner: "Tiếng Anh lớp 11 · Trần Gia Huy",
            tutor: "Trần Quốc Huy",
            sessions: 10,
            fee: 270000,
            total: 2700000,
            wallet: 340000,
            payos: 2360000,
            reference: "PAY-20260926-018",
            idleStatus: "Chờ ký quỹ",
            activeStatus: "Đang thực hiện",
        },
        "HD-20260926-011": {
            learner: "Ngữ văn lớp 8 · Trần Gia Huy",
            tutor: "Lê Thảo Vy",
            sessions: 12,
            fee: 180000,
            total: 2160000,
            wallet: 340000,
            payos: 1820000,
            reference: "PAY-20260926-011",
            idleStatus: "Chờ ký quỹ",
            activeStatus: "Đang thực hiện",
        },
        "HD-20260926-005": {
            learner: "Toán · Luyện thi · Trần Gia Huy",
            tutor: "Phạm Hoàng Long",
            sessions: 10,
            fee: 320000,
            total: 3200000,
            wallet: 340000,
            payos: 2860000,
            reference: "PAY-20260926-005",
            idleStatus: "Chờ ký quỹ",
            activeStatus: "Đang thực hiện",
        },
        "HD-20260919-024": {
            learner: "Toán lớp 11 · Trần Gia Huy",
            tutor: "Nguyễn Minh Anh",
            sessions: 8,
            fee: 220000,
            total: 1760000,
            wallet: 600000,
            payos: 1160000,
            reference: "PAYOS-260919-8F4K2",
            idleStatus: "Chờ ký quỹ",
            activeStatus: "Đang thực hiện",
        },
    };
    // Codes each contract detail page can actually render (mirrors the fixtures in those pages).
    const detailPages = {
        student: {
            href: "../contract/student-detail.html",
            ids: ["HD-20260715-012", "HD-20260810-018", "HD-20260919-024", "HD-20260926-025"],
        },
        tutor: {
            href: "../contract/tutor-detail.html",
            ids: ["HD-20260905-019", "HD-20260919-024", "HD-20260926-025", "HD-20260928-027"],
        },
    };
    const query = new URLSearchParams(location.search);
    const requested = query.get("status") || query.get("view");
    const state = Object.hasOwn(views, requested) ? requested : "pending";
    const view = views[state];
    const byId = (id) => document.getElementById(id);
    const money = (value) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
    const rawId = query.get("id") || query.get("contract");
    const contractId = Object.hasOwn(contracts, rawId) ? rawId : null;
    const contract = contracts[contractId];
    // The page renders the parent persona; a tutor session header switches the detail page instead.
    const header = document.querySelector(".user-header");
    const role = ((header?.dataset.profileRole || "") + " " + (header?.dataset.userVariant || "")).toLowerCase();
    const persona = role.includes("gia sư") || role.includes("tutor") ? "tutor" : "student";
    const detailPage = detailPages[persona];
    const renderable = Boolean(contractId) && detailPage.ids.includes(contractId);
    const walletHref = "../wallet/overview.html#transactions";
    const detailHref = renderable
        ? `${detailPage.href}?id=${encodeURIComponent(contractId)}`
        : walletHref;
    const linkId = contractId || rawId;
    const checkoutHref = `checkout.html${linkId ? `?contract=${encodeURIComponent(linkId)}` : ""}${
        query.get("from") ? `${linkId ? "&" : "?"}from=${encodeURIComponent(query.get("from"))}` : ""
    }`;
    byId("payment-result").dataset.state = state;
    byId("result-title").textContent = view.title;
    byId("result-description").textContent = view.description;
    byId("result-badge").textContent = view.badge;
    byId("result-primary").textContent = view.action;
    byId("breadcrumb-checkout").href = checkoutHref;
    const navigates = state === "failed" || state === "cancelled";
    byId("result-primary").hidden = navigates;
    byId("result-action").hidden = !navigates;
    if (navigates) {
        byId("result-action").href = checkoutHref;
        byId("result-action").textContent = view.action;
    }
    byId("result-contract").hidden = !contractId;
    if (contractId) {
        byId("result-contract").href = detailHref;
        byId("result-contract").textContent = renderable
            ? "Xem chi tiết hợp đồng"
            : "Xem giao dịch ký quỹ trong ví";
    }
    byId("contract-not-found").hidden = Boolean(contractId);
    for (const id of ["money-section", "details-section"]) byId(id).hidden = !contractId;
    if (!contractId) {
        byId("not-found-message").textContent = rawId
            ? `Không tìm thấy hợp đồng ${rawId} trong danh sách ký quỹ của bạn. Vui lòng mở lại liên kết từ trang hợp đồng hoặc kiểm tra lịch sử ví.`
            : "Liên kết kết quả thiếu mã hợp đồng. Vui lòng mở lại liên kết từ trang hợp đồng hoặc kiểm tra lịch sử ví.";
    }
    if (contract) {
        byId("contract-code").textContent = contractId;
        byId("contract-learner").textContent = contract.learner;
        byId("contract-tutor").textContent = contract.tutor;
        byId("transaction-reference").textContent = contract.reference;
        byId("scale-label").textContent = `Học phí cần ký quỹ · ${contract.sessions} buổi`;
        byId("money-total").textContent = money(contract.total);
        byId("money-wallet").textContent = money(contract.wallet);
        byId("money-payos").textContent = money(contract.payos);
        byId("money-grand-total").textContent = money(contract.total);
        byId("total-note").textContent = `${money(contract.fee)} × ${contract.sessions} buổi học`;
        byId("contract-status").textContent =
            state === "success" ? contract.activeStatus : contract.idleStatus;
    }
    if (state === "success" && contract) {
        byId("wallet-label").textContent = "Đã sử dụng từ ví Edu Connect";
        byId("payos-label").textContent = "Đã thanh toán qua PayOS";
        byId("total-label").firstChild.textContent = "Tổng tiền đã ký quỹ";
        byId("money-note").textContent = `Đã sử dụng ${money(
            contract.wallet,
        )} từ ví. Khoản ${money(
            contract.payos,
        )} qua PayOS được chuyển vào ký quỹ hợp đồng. Học phí chưa chuyển ngay cho gia sư.`;
        byId("confirmation-time").textContent = "26/09/2026 · 21:15";
        byId("guidance-title").textContent = "Ký quỹ theo từng buổi học";
        byId("guidance-description").textContent = `Học phí được giữ theo hợp đồng và giải ngân từng buổi ${money(
            contract.fee,
        )} sau khi buổi học được xác nhận.`;
    }
    if (state === "cancelled" && contract) {
        byId("money-note").textContent = `Theo luồng thanh toán, ${money(
            contract.wallet,
        )} tạm giữ được trả về số dư khả dụng khi phiên bị hủy mà chưa đủ ký quỹ.`;
    }
    if (query.get("preview") === "1") {
        byId("result-feedback").textContent =
            "Kết quả giả lập · Chưa cập nhật ví hoặc hợp đồng thật.";
        try {
            const attempt = JSON.parse(sessionStorage.getItem("edu-payment-preview"));
            if (attempt && attempt.state === state && (!contractId || attempt.contract === contractId)) {
                byId("transaction-reference").textContent = attempt.reference;
                if (state === "success" && Number.isFinite(attempt.completedAt)) {
                    byId("confirmation-time").textContent = new Date(
                        attempt.completedAt,
                    ).toLocaleString("vi-VN");
                }
            }
        } catch {
            // The result remains a static preview when storage is unavailable.
        }
    }
    byId("result-primary").addEventListener("click", () => {
        if (state === "pending") {
            byId("result-feedback").textContent =
                "Chưa kết nối được dịch vụ đối soát. Vui lòng kiểm tra lại sau; không thanh toán thêm nếu ngân hàng đã trừ tiền.";
            return;
        }
        window.EduModal.open("shared-modal", {
            title: `Hợp đồng ${contractId || "chưa xác định"}`,
            message: contract
                ? `${contract.learner} · Gia sư ${contract.tutor}. ${contract.sessions} buổi. Học phí ${money(
                      contract.fee,
                  )}/buổi. Tổng ký quỹ ${money(contract.total)}, trong đó ${money(
                      contract.wallet,
                  )} từ ví và ${money(contract.payos)} qua PayOS. Trạng thái: ${
                      state === "success" ? contract.activeStatus : contract.idleStatus
                  }.`
                : "Không xác định được hợp đồng cho giao dịch này.",
            variant: "info",
        });
    });
    byId("copy-reference").addEventListener("click", async () => {
        try {
            await navigator.clipboard.writeText(byId("transaction-reference").textContent);
            window.EduToast.show({
                type: "success",
                title: "Đã sao chép mã tham chiếu",
                message: "Dùng mã này khi cần đối chiếu giao dịch.",
            });
        } catch {
            byId("result-feedback").textContent =
                "Không thể sao chép tự động. Mã tham chiếu: " +
                byId("transaction-reference").textContent;
        }
    });
})();
