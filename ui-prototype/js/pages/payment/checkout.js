/* Local checkout preview only; production sessions must be created by the server. */
(() => {
    const consent = document.getElementById("payment-consent");
    const button = document.getElementById("pay-button");
    const error = document.getElementById("payment-error");
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
            reference: "ECX " + Date.now(),
            contract: "HD-20260926-025",
            total: 1760000,
            wallet: 340000,
            due: 1420000,
            expiresAt: Date.now() + 15 * 60 * 1000,
            state: "pending",
        };
        try {
            const previous = JSON.parse(sessionStorage.getItem("edu-payment-preview") || "null");
            if (previous?.state === "pending" && previous.expiresAt > Date.now()) {
                location.href = "qr.html";
                return;
            }
            sessionStorage.setItem("edu-payment-preview", JSON.stringify(attempt));
            location.href = "qr.html";
        } catch {
            error.hidden = false;
        }
    });
    document.getElementById("view-terms").addEventListener("click", () => {
        window.EduModal.open("shared-modal", {
            title: "Điều khoản ký quỹ",
            message:
                "Tổng ký quỹ là 1.760.000 ₫ cho 8 buổi học. Sử dụng 340.000 ₫ từ số dư ví và thanh toán 1.420.000 ₫ qua PayOS. Tiền được giữ theo hợp đồng và giải ngân theo từng buổi đã được xác nhận. Yêu cầu thay đổi lịch hoặc hoàn tiền được xem xét theo điều khoản hai bên đã thống nhất.",
            variant: "info",
        });
    });
    document.getElementById("view-contract").addEventListener("click", () => {
        window.EduModal.open("shared-modal", {
            title: "Hợp đồng HD-20260926-025",
            message:
                "Phụ huynh: Chị Mai Lan · Học viên: Trần Gia Huy · Gia sư: Nguyễn Minh Anh. Toán lớp 11, học trực tiếp, 8 buổi × 90 phút. Lịch dự kiến: Thứ Hai và Thứ Sáu, 19:00–20:30. Học phí: 220.000 ₫/buổi. Trạng thái: Chờ ký quỹ.",
            variant: "info",
        });
    });
    const wallet = document.querySelector('[data-menu-item="2"]');
    wallet.href = "../wallet/overview.html";
    wallet.querySelector("[data-menu-label]").textContent = "Ví Edu Connect";
    document.querySelector('[data-menu-item="1"]').href = "../contract/student-detail.html";
    document.querySelector('[data-menu-item="4"]').href = "../wallet/overview.html#transactions";
})();
