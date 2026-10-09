/* Preview only. No bank payload, network payment or wallet mutation is performed. */
(() => {
    const key = "edu-payment-preview";
    const byId = (id) => document.getElementById(id);
    const money = (value) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
    let attempt;
    try {
        attempt = JSON.parse(sessionStorage.getItem(key));
    } catch {
        attempt = null;
    }
    const hasValidAttempt =
        attempt &&
        attempt.contract === "HD-20260926-025" &&
        attempt.total === 1760000 &&
        attempt.wallet === 340000 &&
        attempt.due === 1420000 &&
        Number.isFinite(attempt.expiresAt) &&
        typeof attempt.reference === "string";
    if (!hasValidAttempt) {
        attempt = {
            reference: "ECX 26092602501",
            contract: "HD-20260926-025",
            total: 1760000,
            wallet: 340000,
            due: 1420000,
            expiresAt: Date.now() + 15 * 60 * 1000,
            state: "pending",
        };
        try {
            sessionStorage.setItem(key, JSON.stringify(attempt));
        } catch {
            // The page can still display its default payment information.
        }
    }
    if (
        !attempt ||
        attempt.contract !== "HD-20260926-025" ||
        attempt.total !== 1760000 ||
        attempt.wallet !== 340000 ||
        attempt.due !== 1420000 ||
        !Number.isFinite(attempt.expiresAt) ||
        typeof attempt.reference !== "string"
    ) {
        byId("status").textContent = "Không thể tải thông tin thanh toán.";
        return;
    }
    byId("amount").textContent = money(attempt.due);
    byId("reference").textContent = attempt.reference;
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
    const save = () => sessionStorage.setItem(key, JSON.stringify(attempt));
    const disable = (message) => {
        document.querySelectorAll("button").forEach((button) => (button.disabled = true));
        byId("status").textContent = message;
        byId("restart").hidden = false;
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
        location.href = `result.html?view=${state}&preview=1`;
    };
    byId("cancel").addEventListener("click", () => finish("cancelled"));
    byId("simulate-success").addEventListener("click", () => finish("success"));
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
