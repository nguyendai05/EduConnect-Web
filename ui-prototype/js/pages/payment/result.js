/* Static UI fixtures: ?view=success|failed|cancelled|pending.
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
    const requested = new URLSearchParams(location.search).get("view");
    const state = Object.hasOwn(views, requested) ? requested : "pending";
    const view = views[state];
    const byId = (id) => document.getElementById(id);
    byId("payment-result").dataset.state = state;
    byId("result-title").textContent = view.title;
    byId("result-description").textContent = view.description;
    byId("result-badge").textContent = view.badge;
    byId("result-primary").textContent = view.action;
    if (state === "success") {
        byId("wallet-label").textContent = "Đã sử dụng từ ví Edu Connect";
        byId("payos-label").textContent = "Đã thanh toán qua PayOS";
        byId("total-label").firstChild.textContent = "Tổng tiền đã ký quỹ";
        byId("money-note").textContent =
            "Đã sử dụng 340.000 ₫ từ ví. Số dư khả dụng còn lại: 0 ₫. Khoản 1.420.000 ₫ qua PayOS được chuyển vào ký quỹ hợp đồng.";
        byId("confirmation-time").textContent = "26/09/2026 · 21:15";
        byId("contract-status").textContent = "Đang thực hiện";
        byId("guidance-title").textContent = "Ký quỹ theo từng buổi học";
        byId("guidance-description").textContent =
            "Học phí được giữ theo hợp đồng và giải ngân từng buổi 220.000 ₫ sau khi buổi học được xác nhận.";
    }
    if (state === "cancelled") {
        byId("money-note").textContent =
            "Theo luồng thanh toán, 340.000 ₫ tạm giữ được trả về số dư khả dụng khi phiên bị hủy mà chưa đủ ký quỹ.";
    }
    if (new URLSearchParams(location.search).get("preview") === "1") {
        byId("result-feedback").textContent =
            "Kết quả giả lập · Chưa cập nhật ví hoặc hợp đồng thật.";
        try {
            const attempt = JSON.parse(sessionStorage.getItem("edu-payment-preview"));
            if (attempt && attempt.state === state) {
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
        if (state === "failed" || state === "cancelled") {
            location.href = "checkout.html";
            return;
        }
        if (state === "pending") {
            byId("result-feedback").textContent =
                "Chưa kết nối được dịch vụ đối soát. Vui lòng kiểm tra lại sau; không thanh toán thêm nếu ngân hàng đã trừ tiền.";
            return;
        }
        window.EduModal.open("shared-modal", {
            title: "Hợp đồng HD-20260926-025",
            message:
                "Học viên Trần Gia Huy · Gia sư Nguyễn Minh Anh. Toán lớp 11, 8 buổi × 90 phút. Lịch dự kiến Thứ Hai và Thứ Sáu, 19:00–20:30. Học phí 220.000 ₫/buổi. Tổng ký quỹ 1.760.000 ₫.",
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
    const wallet = document.querySelector('[data-menu-item="2"]');
    wallet.href = "../wallet/overview.html";
    wallet.querySelector("[data-menu-label]").textContent = "Ví Edu Connect";
    document.querySelector('[data-menu-item="1"]').href = "../contract/student-detail.html";
    document.querySelector('[data-menu-item="4"]').href = "../wallet/overview.html#transactions";
})();
