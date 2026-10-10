/* Preview only. No bank payload, network payment or wallet mutation is performed. */
(() => {
    const key = "edu-payment-preview";
    const byId = (id) => document.getElementById(id);
    const money = (value) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
    // Page-only payment fixtures; amounts must match the checkout and wallet statement.
    // Totals come from contract/confirm.js (fee × sessions) minus the wallet deduction.
    const contracts = {
        "HD-20260926-025": {
            title: "Học Toán cùng Nguyễn Minh Anh",
            total: 1760000,
            wallet: 340000,
            due: 1420000,
            reference: "ECX 26092602501",
        },
        "HD-20260926-018": {
            title: "Luyện Tiếng Anh cùng Trần Quốc Huy",
            total: 2700000,
            wallet: 340000,
            due: 2360000,
            reference: "ECX 26092601801",
        },
        "HD-20260926-011": {
            title: "Học Ngữ văn cùng Lê Thảo Vy",
            total: 2160000,
            wallet: 340000,
            due: 1820000,
            reference: "ECX 26092601101",
        },
        "HD-20260926-005": {
            title: "Luyện thi Toán cùng Phạm Hoàng Long",
            total: 3200000,
            wallet: 340000,
            due: 2860000,
            reference: "ECX 26092600501",
        },
    };
    const params = new URLSearchParams(location.search);
    const requested = params.get("contract") || params.get("id");
    // No silent fallback: an unknown or missing code stops the flow instead of opening another contract.
    const contractId = requested && Object.hasOwn(contracts, requested) ? requested : null;
    const confirmHref = `../contract/confirm.html${
        contractId ? `?contract=${encodeURIComponent(contractId)}` : ""
    }`;
    const brand = document.querySelector(".merchant-brand");
    if (!contractId) {
        document.title = "Không tìm thấy hợp đồng — Edu Connect";
        byId("contract").textContent = requested
            ? `Không tìm thấy hợp đồng ${requested}`
            : "Liên kết thanh toán thiếu mã hợp đồng";
        byId("amount").textContent = "—";
        byId("reference").textContent = "—";
        document.querySelector(".instructions").textContent = requested
            ? `Không có phiên thanh toán nào cho hợp đồng ${requested}. Chưa có khoản tiền nào bị trừ.`
            : "Liên kết mở trang thanh toán thiếu mã hợp đồng. Chưa có khoản tiền nào bị trừ.";
        // Only the contract line stays: no QR, no account and no amount to transfer.
        document.querySelector(".qr-panel").hidden = true;
        document.querySelector(".bank-name").hidden = true;
        document.querySelectorAll(".bank-details dl > div").forEach((row, index) => {
            row.hidden = index > 0;
        });
        document.querySelector(".notice").hidden = true;
        byId("cancel").hidden = true;
        byId("reconcile").hidden = true;
        byId("status").textContent = requested
            ? `Không tìm thấy hợp đồng ${requested} trong danh sách ký quỹ của bạn.`
            : "Liên kết mở trang thanh toán thiếu mã hợp đồng.";
        const fromDetail = params.get("from") === "contract-detail";
        const restart = byId("restart");
        restart.hidden = false;
        restart.textContent = fromDetail ? "Quay lại hợp đồng" : "Về trang xác nhận hợp đồng";
        restart.href = fromDetail
            ? `../contract/student-detail.html?id=${encodeURIComponent(requested || "")}`
            : confirmHref;
        if (brand) brand.href = confirmHref;
        return;
    }
    const expected = contracts[contractId];
    const isMine = (value) =>
        value &&
        value.contract === contractId &&
        value.total === expected.total &&
        value.wallet === expected.wallet &&
        value.due === expected.due &&
        Number.isFinite(value.expiresAt) &&
        typeof value.reference === "string";
    let attempt;
    try {
        const stored = JSON.parse(sessionStorage.getItem(key) || "null");
        // A stored attempt is only reused when it matches this contract and its amounts.
        attempt = isMine(stored) ? stored : null;
    } catch {
        attempt = null;
    }
    if (!attempt) {
        attempt = {
            reference: expected.reference,
            contract: contractId,
            contractTitle: expected.title,
            total: expected.total,
            wallet: expected.wallet,
            due: expected.due,
            expiresAt: Date.now() + 15 * 60 * 1000,
            state: "pending",
            from: params.get("from"),
        };
        try {
            sessionStorage.setItem(key, JSON.stringify(attempt));
        } catch {
            // The page can still display its default payment information.
        }
    }
    if (!isMine(attempt)) {
        byId("status").textContent = "Không thể tải thông tin thanh toán.";
        return;
    }
    const resultUrl = (status) => {
        const query = new URLSearchParams({ status, id: contractId, preview: "1" });
        if (attempt.from) query.set("from", attempt.from);
        return `result.html?${query.toString()}`;
    };
    const checkoutUrl = () =>
        `checkout.html?contract=${encodeURIComponent(contractId)}${
            attempt.from ? `&from=${encodeURIComponent(attempt.from)}` : ""
        }`;
    document.title = `Thanh toán ký quỹ ${contractId} qua payOS | Edu Connect`;
    // The brand link must return to this contract's checkout step, not to a default one.
    if (brand) brand.href = checkoutUrl();
    byId("contract").textContent = `${contractId} · ${expected.title}`;
    byId("amount").textContent = money(attempt.due);
    byId("reference").textContent = attempt.reference;
    byId("reconcile").href = resultUrl("pending");
    // Decorative matrix deliberately contains no valid payment data.
    const svg = byId("qr-preview");
    const square = (x, y, size, fill) => {
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        Object.entries({ x, y, width: size, height: size, fill }).forEach(([name, value]) =>
            rect.setAttribute(name, value),
        );
        svg.append(rect);
    };
    for (let y = 2; y < 31; y++) {
        for (let x = 2; x < 31; x++) {
            if ((x * 17 + y * 11 + x * y) % 7 < 3) square(x, y, 1, "#172b40");
        }
    }
    [
        [2, 2],
        [24, 2],
        [2, 24],
    ].forEach(([x, y]) => {
        square(x - 1, y - 1, 9, "white");
        square(x, y, 7, "#172b40");
        square(x + 1, y + 1, 5, "white");
        square(x + 2, y + 2, 3, "#172b40");
    });
    square(11, 13, 11, "white");
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", "16.5");
    label.setAttribute("y", "19");
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "3");
    label.textContent = "DEMO";
    svg.append(label);
    const save = () => {
        try {
            sessionStorage.setItem(key, JSON.stringify(attempt));
        } catch {
            // Preview state is lost when storage is unavailable; nothing else changes.
        }
    };
    const disable = (message) => {
        document.querySelectorAll("button").forEach((button) => (button.disabled = true));
        byId("reconcile").hidden = true;
        byId("status").textContent = message;
        byId("restart").hidden = false;
        byId("restart").href = checkoutUrl();
    };
    const tick = () => {
        const seconds = Math.max(0, Math.ceil((attempt.expiresAt - Date.now()) / 1000));
        if (attempt.state !== "pending") {
            disable("Phiên thanh toán đã kết thúc.");
            return;
        }
        if (!seconds) {
            attempt.state = "expired";
            save();
            disable("Phiên đã hết hạn. Khoản ví tạm giữ được hoàn lại theo luồng thanh toán.");
        }
    };
    const finish = (state) => {
        tick();
        if (attempt.state !== "pending") return;
        attempt.state = state;
        attempt.completedAt = Date.now();
        save();
        location.href = resultUrl(state);
    };
    byId("cancel").addEventListener("click", () => finish("cancelled"));
    document.querySelectorAll("[data-copy]").forEach((button) => {
        button.addEventListener("click", async () => {
            const text = button.dataset.copy === "amount" ? String(attempt.due) : attempt.reference;
            try {
                await navigator.clipboard.writeText(text);
                byId("status").textContent = "Đã sao chép: " + text;
            } catch {
                byId("status").textContent = "Vui lòng sao chép thủ công: " + text;
            }
        });
    });
    tick();
    const timer = setInterval(tick, 1000);
    window.addEventListener("pagehide", () => clearInterval(timer), { once: true });
})();
