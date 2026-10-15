/**
 * Trang QR DEMO: không payload ngân hàng dùng được, không link thanh toán thật,
 * không copy nội dung tài khoản ngân hàng thật (tài khoản/nội dung đều là giá trị DEMO).
 * Số tiền và reference đọc từ EduStore theo đúng contract/payment của URL.
 * Hủy ở đây CHỈ hủy PHIÊN QR (payment → cancelled), không đổi trạng thái order/contract.
 * Link "Tôi đã chuyển khoản" dẫn tới result với status=pending — status chỉ là presentation,
 * trang result tự đọc bản ghi thật trong store.
 */
(() => {
    const Route = window.EduRoute;
    const Store = window.EduStore;
    const byId = (id) => document.getElementById(id);

    const contractParam = Route.param("contract", "paymentQr");
    const paymentParam = Route.param("payment", "paymentQr");
    const statusEl = byId("status");
    const restart = byId("restart");
    const brand = document.querySelector(".merchant-brand");

    const contract = contractParam ? Store.contract(contractParam) : null;

    const fail = (message, backHref, backLabel) => {
        document.title = "Không mở được phiên thanh toán — Edu Connect";
        byId("contract").textContent = contractParam || "—";
        byId("payment-id").textContent = "—";
        byId("amount").textContent = "—";
        byId("reference").textContent = "—";
        byId("instructions").textContent = message;
        byId("demo-marker").hidden = true;
        document.querySelector(".qr-panel").hidden = true;
        document.querySelector(".bank-name").hidden = true;
        document.querySelectorAll(".bank-details dl > div").forEach((row) => {
            row.hidden = true;
        });
        byId("notice").hidden = true;
        byId("cancel-note").hidden = true;
        byId("session-timer").hidden = true;
        byId("cancel").hidden = true;
        byId("reconcile").hidden = true;
        statusEl.textContent = message;
        restart.hidden = false;
        restart.textContent = backLabel;
        restart.href = backHref;
        if (brand) brand.href = backHref;
    };

    if (!contract) {
        fail(
            contractParam
                ? `Không tìm thấy hợp đồng ${contractParam} trong dữ liệu mẫu. Trang không hiển thị hợp đồng khác thay thế; chưa có khoản tiền nào bị trừ.`
                : "Liên kết mở trang QR thiếu mã hợp đồng. Chưa có khoản tiền nào bị trừ.",
            contractParam
                ? Route.page("paymentCheckout", { contract: contractParam })
                : Route.page("contractConfirm"),
            contractParam ? "Quay lại trang thanh toán" : "Về trang xác nhận hợp đồng",
        );
        return;
    }

    const checkoutHref = Route.page("paymentCheckout", { contract: contract.id });
    if (brand) brand.href = checkoutHref;

    let paymentRecord = null;
    if (paymentParam) {
        paymentRecord = Store.payment(paymentParam);
        if (!paymentRecord || paymentRecord.contractId !== contract.id) {
            fail(
                paymentRecord
                    ? `Phiên thanh toán ${paymentRecord.id} không thuộc hợp đồng ${contract.id}. Trang không ghép chéo bản ghi.`
                    : `Không tìm thấy phiên thanh toán ${paymentParam} trong dữ liệu mẫu.`,
                checkoutHref,
                "Quay lại trang thanh toán hợp đồng",
            );
            return;
        }
    } else {
        const candidates = Store.list("payments").filter((item) => item.contractId === contract.id);
        paymentRecord =
            candidates.find((item) => item.status === "unpaid" || item.status === "pending") ||
            candidates[candidates.length - 1] ||
            null;
    }
    if (!paymentRecord) {
        fail(
            `Hợp đồng ${contract.id} chưa có phiên thanh toán nào trong dữ liệu mẫu. Chưa có khoản tiền nào bị trừ.`,
            checkoutHref,
            "Quay lại trang thanh toán hợp đồng",
        );
        return;
    }

    const order = contract.orderId ? Store.order(contract.orderId) : null;
    const item = order && Array.isArray(order.items) && order.items.length ? order.items[0] : null;
    const due = Store.toInteger(paymentRecord.payosDue);
    const reference = `EDU-DEMO ${paymentRecord.id}`;
    const paymentStatus = Store.statusOf(Store.PAYMENT_STATUS, paymentRecord.status);
    const live = paymentRecord.status === "unpaid" || paymentRecord.status === "pending";

    document.title = `Thanh toán ký quỹ ${contract.id} qua payOS (DEMO) | Edu Connect`;
    byId("contract").textContent = `${contract.id}${item ? ` · ${item.offeringTitle}` : ""}`;
    byId("payment-id").textContent = paymentRecord.id;
    byId("amount").textContent = Store.formatMoney(due);
    byId("reference").textContent = reference;
    byId("reconcile").href = Route.page("paymentResult", {
        id: paymentRecord.id,
        status: live ? "pending" : undefined,
    });

    // QR trang trí: ma trận sinh theo mã phiên, chỉ mang tính minh họa, KHÔNG phải payload VietQR/ngân hàng.
    const svg = byId("qr-preview");
    const NS = "http://www.w3.org/2000/svg";
    const seed = Array.from(paymentRecord.id).reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
    const square = (x, y, size, className) => {
        const rect = document.createElementNS(NS, "rect");
        rect.setAttribute("x", x);
        rect.setAttribute("y", y);
        rect.setAttribute("width", size);
        rect.setAttribute("height", size);
        rect.setAttribute("class", className);
        svg.append(rect);
    };
    for (let y = 2; y < 31; y++) {
        for (let x = 2; x < 31; x++) {
            if ((x * 17 + y * 11 + x * y + seed) % 7 < 3) square(x, y, 1, "qr-on");
        }
    }
    [
        [2, 2],
        [24, 2],
        [2, 24],
    ].forEach(([x, y]) => {
        square(x - 1, y - 1, 9, "qr-off");
        square(x, y, 7, "qr-on");
        square(x + 1, y + 1, 5, "qr-off");
        square(x + 2, y + 2, 3, "qr-on");
    });
    square(11, 13, 11, "qr-off");
    const label = document.createElementNS(NS, "text");
    label.setAttribute("x", "16.5");
    label.setAttribute("y", "19");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "3");
    label.setAttribute("class", "qr-label");
    label.textContent = "DEMO";
    svg.append(label);

    const dialog = byId("qr-modal");
    const timerEl = byId("session-timer");
    let timer = null;

    const endSessionView = (message) => {
        byId("cancel").hidden = true;
        timerEl.hidden = true;
        if (timer) clearInterval(timer);
        statusEl.textContent = message;
    };

    if (!live) {
        statusEl.textContent = `Phiên ${paymentRecord.id} đang ở trạng thái "${paymentStatus.label}". Không thể quét lại phiên này.`;
        byId("cancel").hidden = true;
        byId("reconcile").textContent = "Xem kết quả phiên";
        byId("reconcile").href = Route.page("paymentResult", { id: paymentRecord.id });
        timerEl.hidden = true;
    } else {
        if (due === 0) {
            statusEl.textContent =
                "Ví đã đủ chi trả: không phát sinh khoản trả ngoài, không cần chuyển khoản.";
        }
        // Đồng hồ phiên chỉ phục vụ trình diễn; hết giờ KHÔNG mutate store.
        const deadline = Date.now() + 15 * 60 * 1000;
        const renderTimer = () => {
            const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            timerEl.textContent = `Phiên mô phỏng còn lại ${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
            if (!seconds) {
                endSessionView(
                    "Phiên mô phỏng đã hết thời gian hiển thị. Bản ghi thanh toán không thay đổi; tải lại trang hoặc quay lại bước thanh toán để mở phiên mới.",
                );
            }
        };
        renderTimer();
        timer = setInterval(renderTimer, 1000);
        window.addEventListener("pagehide", () => clearInterval(timer), { once: true });

        byId("cancel").addEventListener("click", () => {
            window.EduModal.open(dialog, {
                title: "Hủy phiên thanh toán",
                message: `Chỉ hủy PHIÊN QR ${paymentRecord.id} của hợp đồng ${contract.id}. Đơn đăng ký và hợp đồng KHÔNG bị hủy; bạn có thể mở lại thanh toán sau.`,
                confirmText: "Hủy phiên QR",
                cancelText: "Giữ phiên",
                variant: "danger",
            });
        });
        dialog.addEventListener("modal:confirm", () => {
            const result = Store.once(`qr-session-cancel:${paymentRecord.id}`, () =>
                Store.mutate((draft) => {
                    const record = draft.payments.find((item2) => item2.id === paymentRecord.id);
                    if (!record) return { ok: false, reason: "unknown-payment" };
                    if (record.status !== "unpaid" && record.status !== "pending") {
                        return { ok: false, reason: "not-cancellable" };
                    }
                    record.status = "cancelled";
                    record.note = "Người dùng hủy PHIÊN QR — đơn và hợp đồng không bị hủy.";
                    return { data: { paymentId: record.id } };
                }),
            );
            if (result && result.ok) {
                Route.go("paymentResult", { id: paymentRecord.id, status: "cancelled" });
                return;
            }
            statusEl.textContent =
                result && result.duplicated
                    ? "Phiên này đã bị hủy trước đó; không ghi nhận thao tác trùng."
                    : "Không thể hủy phiên: bản ghi không còn ở trạng thái chờ.";
        });
    }

    document.querySelectorAll("[data-copy]").forEach((button) => {
        button.addEventListener("click", async () => {
            const value = button.dataset.copy === "amount" ? String(due) : reference;
            try {
                await navigator.clipboard.writeText(value);
                statusEl.textContent = `Đã sao chép nội dung demo: ${value}`;
            } catch {
                statusEl.textContent = `Vui lòng sao chép thủ công: ${value}`;
            }
        });
    });
})();
