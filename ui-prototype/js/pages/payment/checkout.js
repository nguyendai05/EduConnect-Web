/**
 * Trang thanh toán ký quỹ DEMO.
 * Mọi số liệu (total, availableToUse, escrowHeld, walletUsed, payosDue, feeRate) đọc từ
 * EduStore/EduFixtures — không hard-code, không fallback sang bản ghi khác khi ID lạ.
 * `from` chỉ nhận giá trị trong allowlist của EduRoute.safeReturn (chống open redirect).
 * Trang này không ghi paid/credit ví/activate hợp đồng; nó chỉ mở phiên QR mô phỏng.
 */
(() => {
    const Route = window.EduRoute;
    const Store = window.EduStore;
    const byId = (id) => document.getElementById(id);
    const setText = (id, value) => Store.text(byId(id), value);
    const setAll = (selector, value) =>
        document.querySelectorAll(selector).forEach((node) => {
            node.textContent = value;
        });

    const contractParam = Route.param("contract", "paymentCheckout");
    const orderParam = Route.param("order", "paymentCheckout");
    const paymentParam = Route.param("payment", "paymentCheckout");
    const from = Route.safeReturn(Route.param("from", "paymentCheckout"));

    const RETURN_TARGETS = {
        contract: (id) => Route.page("contractConfirm", id ? { contract: id } : undefined),
        "contract-detail": (id) => Route.page("contractStudentDetail", id ? { id } : undefined),
        cart: () => Route.page("cart"),
        "order-history": () => Route.page("orderHistory"),
    };
    const returnHref = (RETURN_TARGETS[from] || RETURN_TARGETS.contract)(contractParam);

    const back = byId("back-to-contract");
    back.href = returnHref;
    back.textContent = from === "contract-detail" ? "Quay lại hợp đồng" : "Quay lại bước xác nhận";
    back.hidden = false;

    const fail = (title, message) => {
        document.title = `${title} — Edu Connect`;
        byId("payment-layout").hidden = true;
        setText("page-status", "Không mở được phiên");
        setText("contract-line", message);
        setText("page-error-title", title);
        setText("page-error-message", message);
        const actions = byId("page-error-actions");
        actions.replaceChildren();
        const backLink = document.createElement("a");
        backLink.className = "payment-link";
        backLink.href = returnHref;
        backLink.textContent = from ? "Quay lại trang vừa mở" : "Mở trang xác nhận hợp đồng";
        const walletLink = document.createElement("a");
        walletLink.className = "payment-link";
        walletLink.href = Route.page("walletOverview", { hash: "transactions" });
        walletLink.textContent = "Xem lịch sử ví Edu Connect";
        actions.append(backLink, walletLink);
        byId("page-error").hidden = false;
    };

    const contract = contractParam ? Store.contract(contractParam) : null;
    if (!contract) {
        fail(
            "Không tìm thấy hợp đồng",
            contractParam
                ? `Không có hợp đồng ${contractParam} trong dữ liệu mẫu. Trang không hiển thị hợp đồng khác thay thế; chưa có khoản tiền nào bị trừ.`
                : "Liên kết mở trang thanh toán thiếu mã hợp đồng. Trang không tự chọn hợp đồng khác; chưa có khoản tiền nào bị trừ.",
        );
        return;
    }

    let order = null;
    if (orderParam) {
        order = Store.order(orderParam);
        if (!order || order.contractId !== contract.id) {
            fail(
                "Đơn không khớp hợp đồng",
                order
                    ? `Đơn ${order.id} không thuộc hợp đồng ${contract.id}. Trang không ghép chéo bản ghi; chưa có khoản tiền nào bị trừ.`
                    : `Không tìm thấy đơn ${orderParam} trong dữ liệu mẫu.`,
            );
            return;
        }
    } else if (contract.orderId) {
        order = Store.order(contract.orderId);
    }
    if (order && Store.toInteger(order.total) !== Store.toInteger(contract.total)) {
        fail(
            "Dữ liệu không nhất quán",
            `Tổng của hợp đồng ${contract.id} (${Store.formatMoney(contract.total)}) khác tổng đơn ${order.id} (${Store.formatMoney(order.total)}). Trang dừng lại thay vì hiển thị số tiền mâu thuẫn.`,
        );
        return;
    }

    const contractPayments = Store.list("payments").filter((item) => item.contractId === contract.id);
    let paymentRecord = null;
    if (paymentParam) {
        paymentRecord = Store.payment(paymentParam);
        if (!paymentRecord || paymentRecord.contractId !== contract.id) {
            fail(
                "Phiên thanh toán không khớp",
                paymentRecord
                    ? `Phiên ${paymentRecord.id} không thuộc hợp đồng ${contract.id}.`
                    : `Không tìm thấy phiên thanh toán ${paymentParam} trong dữ liệu mẫu.`,
            );
            return;
        }
    } else if (contractPayments.length) {
        const open = contractPayments.filter(
            (item) => item.status === "unpaid" || item.status === "pending",
        );
        paymentRecord = open[0] || contractPayments[contractPayments.length - 1];
    }

    // Ví đọc theo chủ sở hữu hợp đồng để khớp với trang ví/lịch sử của CÙNG bản ghi;
    // sessionLearnerId() chỉ là fallback khi hợp đồng thiếu learnerId.
    const walletOwnerId = contract.learnerId || Store.sessionLearnerId();
    const wallet = Store.walletSummary(walletOwnerId);

    const total = Store.toInteger(contract.total);
    const walletUsed = paymentRecord
        ? Store.toInteger(paymentRecord.walletUsed)
        : Math.min(wallet.availableToUse, total);
    const payosDue = paymentRecord ? Store.toInteger(paymentRecord.payosDue) : total - walletUsed;
    const verified = Boolean(paymentRecord && paymentRecord.status === "verified");

    const feeRate = Number.isFinite(Number(contract.feeRate))
        ? Number(contract.feeRate)
        : Store.DEMO_FEE_RATE;

    const item = order && Array.isArray(order.items) && order.items.length ? order.items[0] : null;
    const tutor = Store.tutor(contract.tutorId);
    const learner = Store.learner(contract.learnerId);
    const contractStatus = Store.statusOf(Store.CONTRACT_STATUS, contract.status);

    document.title = `Thanh toán ký quỹ ${contract.id} — Edu Connect`;
    setText("page-status", contractStatus.label);
    setText(
        "contract-line",
        `${contract.id} · ${item ? item.offeringTitle : "Hợp đồng ký quỹ học phí"}`,
    );

    setText("breakdown-scale", `${contract.sessions} buổi × ${Store.formatMoney(contract.unitPrice)}`);
    setText(
        "breakdown-wallet-note",
        walletUsed > 0
            ? `Từ số dư khả dụng ${Store.formatMoney(wallet.availableToUse)}`
            : "Phiên này không dùng số dư ví",
    );
    setText(
        "breakdown-due-note",
        payosDue === 0
            ? "Ví đủ chi trả — không phát sinh khoản trả ngoài"
            : "Qua cổng PayOS (DEMO)",
    );
    setAll("[data-total]", Store.formatMoney(total));
    setAll("[data-wallet-used]", `${walletUsed > 0 ? "−" : ""}${Store.formatMoney(walletUsed)}`);
    setAll("[data-due]", Store.formatMoney(payosDue));
    setText(
        "breakdown-identity",
        `${Store.formatMoney(walletUsed)} (ví) + ${Store.formatMoney(payosDue)} (PayOS) = ${Store.formatMoney(total)} (tổng học phí của hợp đồng).`,
    );
    setText(
        "fee-note",
        `Phí nền tảng hiển thị cho demo là ${Math.round(feeRate * 100)}% trên phần giải ngân cho gia sư, đọc từ feeRate của hợp đồng / DEMO_FEE_RATE. Đây là giả định mẫu chưa được nhóm chốt, không phải chính sách production.`,
    );

    setText("wallet-available", Store.formatMoney(wallet.availableToUse));
    setText("wallet-escrow", Store.formatMoney(Store.escrowOf(contract.id)));
    if (payosDue === 0) {
        setText("wallet-available-note", "Ví đủ chi trả hợp đồng này, không cần trả thêm ngoài.");
    }

    setText("sidebar-contract", contract.id);
    setText("sidebar-initials", tutor ? tutor.initials : "—");
    setText("sidebar-tutor", tutor ? tutor.name : contract.tutorId);
    setText(
        "sidebar-tutor-note",
        tutor && tutor.profileStatus === "approved" ? "Gia sư đã xác minh" : "Gia sư phụ trách",
    );
    setText(
        "sidebar-student",
        learner
            ? learner.studentName && learner.studentName !== learner.name
                ? `${learner.name} · Học viên: ${learner.studentName}`
                : learner.name
            : contract.learnerId || "—",
    );
    setText("sidebar-order", order ? order.id : "—");
    setText("sidebar-course", item ? item.offeringTitle : "—");
    setText(
        "sidebar-scale",
        `${contract.sessions} buổi${item && item.durationMinutes ? ` · ${item.durationMinutes} phút/buổi` : ""}`,
    );
    setText("sidebar-fee", `${Store.formatMoney(contract.unitPrice)}/buổi`);
    setText("sidebar-schedule", item && item.scheduleText ? item.scheduleText : "—");
    setText(
        "projection-available",
        Store.formatMoney(Math.max(0, wallet.availableToUse - walletUsed)),
    );
    setText("projection-escrow", Store.formatMoney(total));

    const consent = byId("payment-consent");
    const payButton = byId("pay-button");
    payButton.textContent = verified
        ? "Xem kết quả thanh toán"
        : payosDue > 0
          ? `Thanh toán qua PayOS (DEMO) · ${Store.formatMoney(payosDue)}`
          : "Xác nhận dùng ví · Không phát sinh khoản trả ngoài";
    consent.addEventListener("change", () => {
        payButton.disabled = !consent.checked;
    });

    byId("payment-form").addEventListener("submit", (event) => {
        event.preventDefault();
        if (!consent.checked) {
            consent.focus();
            return;
        }
        byId("payment-loading").hidden = false;
        payButton.disabled = true;
        if (verified) {
            Route.go("paymentResult", { id: paymentRecord.id, status: "success" });
            return;
        }
        Route.go(
            "paymentQr",
            paymentRecord
                ? { contract: contract.id, payment: paymentRecord.id }
                : { contract: contract.id },
        );
    });

    byId("view-terms").addEventListener("click", () => {
        const policy = Store.DEMO_REFUND_POLICY.beforeFirstSession;
        window.EduModal.open("shared-modal", {
            title: "Điều khoản ký quỹ (demo)",
            message: `Tổng ký quỹ là ${Store.formatMoney(total)} cho ${contract.sessions} buổi học. Phiên này dùng ${Store.formatMoney(walletUsed)} từ ví và ${Store.formatMoney(payosDue)} qua PayOS (DEMO). Tiền được giữ ký quỹ và giải ngân từng buổi sau khi buổi học được xác nhận; phí nền tảng demo ${Math.round(feeRate * 100)}% là giả định chưa chốt. Chính sách hoàn hủy demo "${policy.label}": ${policy.note}`,
            variant: "info",
        });
    });

    byId("view-contract").addEventListener("click", () => {
        window.EduModal.open("shared-modal", {
            title: `Hợp đồng ${contract.id}`,
            message: `Người học: ${learner ? learner.name : contract.learnerId} · Gia sư: ${tutor ? tutor.name : contract.tutorId}. ${item ? `${item.offeringTitle}. ` : ""}${contract.sessions} buổi × ${Store.formatMoney(contract.unitPrice)}. Tổng ký quỹ ${Store.formatMoney(total)}, trong đó ${Store.formatMoney(walletUsed)} từ ví và ${Store.formatMoney(payosDue)} qua PayOS (DEMO). Trạng thái hợp đồng: ${contractStatus.label}.`,
            variant: "info",
        });
    });
})();
