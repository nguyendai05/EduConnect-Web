/* Trang kết quả thanh toán (demo).
 * ?status= / ?view= CHỈ chọn cách trình bày. Bằng chứng thanh toán là bản ghi `verified`
 * trong EduStore — không có bản ghi đó thì trang không được nói "đã ký quỹ", không cộng ví,
 * không kích hoạt hợp đồng (§5 nhiệm vụ).
 * Trước đây trang cất bảng riêng theo mã hợp đồng: 3 mã trong đó không tồn tại trong dữ liệu
 * dùng chung, số liệu sai (HD-20260926-025 ghi 8 buổi/220.000 ₫ thay vì 20/280.000 ₫), và
 * liên kết thật từ trang checkout (?id=PAY-…) không tra được vì bảng chỉ khóa theo mã HD-…. */
(() => {
    const Route = window.EduRoute;
    const Store = window.EduStore;
    if (!Route || !Store) return;

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
        expired: {
            title: "Phiên thanh toán đã hết hạn",
            description: "Vui lòng mở lại từ đơn đăng ký để kiểm tra và tạo phiên thanh toán mới.",
            badge: "Đã hết hạn",
            action: "Quay lại thanh toán",
        },
        refund_pending: {
            title: "Giao dịch đang chờ hoàn tiền",
            description: "Theo dõi tiến độ xử lý hoàn tiền trong đơn đăng ký.",
            badge: "Chờ hoàn tiền",
            action: "Xem thông tin hợp đồng",
        },
        refunded: {
            title: "Giao dịch đã xử lý hoàn tiền",
            description: "Xem số tiền và kết quả hoàn trong chi tiết đơn đăng ký.",
            badge: "Đã xử lý hoàn tiền",
            action: "Xem thông tin hợp đồng",
        },
    };

    const byId = (id) => document.getElementById(id);
    const money = (value) => Store.formatMoney(value);
    const { CONTRACT_STATUS, PAYMENT_STATUS, ORDER_STATUS, statusOf } = Store;

    const query = new URLSearchParams(location.search);
    const requested = Route.param("status", "paymentResult") || Route.param("view", "paymentResult");

    /* checkout/qr chuyển `?id=PAY-…`; liên kết cũ chuyển mã HD-… — cả hai đều phải đọc được. */
    const rawId = Route.param("id", "paymentResult") || Route.param("payment", "paymentResult");
    const looksLikePayment = /^PAY-/.test(String(rawId || ""));
    let payment = looksLikePayment ? Store.payment(rawId) : null;
    let contract = payment && payment.contractId ? Store.contract(payment.contractId) : null;
    if (!contract && payment && payment.orderId) contract = Store.contractByOrder(payment.orderId);
    if (!contract && rawId && !looksLikePayment) contract = Store.contract(rawId);
    if (!payment && contract) {
        const orderPayments = contract.orderId ? Store.paymentsByOrder(contract.orderId) : [];
        const newest = orderPayments.slice().sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
        /* Ưu tiên phiên đã xác nhận, rồi phiên đang mở (pending/refund_pending):
           chọn đại phiên mới nhất sẽ lấy phải một phiên đã failed và mô tả sai hiện trạng. */
        payment = orderPayments.find((entry) => entry.status === "verified")
            || newest.find((entry) => ["pending", "refund_pending"].includes(entry.status))
            || newest[0] || null;
    }

    const verification = Store.resolvePaymentResult({ paymentId: payment ? payment.id : null, queryStatus: requested });
    const verified = Boolean(verification.verified);
    const received = Boolean(payment && Store.RECEIVED_STATES.includes(payment.status));
    const state = verified ? "success" : payment && Object.hasOwn(views, payment.status) ? payment.status : "pending";
    const view = views[state];

    const order = contract ? Store.order(contract.orderId) : null;
    const learner = contract ? Store.learner(contract.learnerId) : null;
    const tutor = contract ? Store.tutor(contract.tutorId) : null;
    const item = order && Array.isArray(order.items) ? order.items[0] : null;
    const offering = item && item.offeringId ? Store.offering(item.offeringId) : null;
    const course = (offering && offering.subjectLabel) || (item && item.offeringTitle) || "";

    /* Chia khoản lấy đúng bản ghi phiên; chưa có phiên nào thì là DỰ KIẾN theo số dư ví,
       và nhãn trên màn hình phải nói rõ là dự kiến. */
    const total = contract ? Store.toInteger(contract.total) : 0;
    const available = contract ? Store.toInteger(Store.walletSummary(contract.learnerId).availableToUse) : 0;
    const plannedWallet = Math.min(available, total);
    const plannedPayos = total - plannedWallet;
    const walletUsed = payment ? Store.toInteger(payment.walletUsed) : plannedWallet;
    const payosDue = payment ? Store.toInteger(payment.payosDue) : plannedPayos;

    const header = document.querySelector(".user-header");
    const roleText = (((header && header.dataset.profileRole) || "") + " " + ((header && header.dataset.userVariant) || ""));
    const isTutor = /gia s\u01b0|tutor/i.test(roleText);
    const detailHref = contract
        ? Route.page(isTutor ? "contractTutorDetail" : "contractStudentDetail", { id: contract.id })
        : Route.page("walletOverview");
    const checkoutHref = contract
        ? Route.page("paymentCheckout", { contract: contract.id, from: "contract-detail" })
        : Route.page("paymentCheckout");

    const resultHost = byId("payment-result");
    resultHost.dataset.state = state;
    resultHost.dataset.verified = String(verified);

    byId("result-title").textContent = view.title;
    byId("result-description").textContent = view.description;
    byId("result-badge").textContent = view.badge;
    byId("result-primary").textContent = view.action;
    const navigates = ["failed", "cancelled", "expired"].includes(state);
    byId("result-primary").hidden = navigates;
    byId("result-action").hidden = !navigates;
    if (navigates) {
        byId("result-action").href = checkoutHref;
        byId("result-action").textContent = view.action;
    }
    byId("breadcrumb-checkout").href = checkoutHref;

    if (requested === "success" && !verified) {
        const notice = document.createElement("p");
        notice.className = "alert alert--warning";
        notice.setAttribute("role", "status");
        notice.textContent = "Giao dịch chưa được xác nhận thành công. Thông tin trên liên kết không thay đổi kết quả thanh toán đang được hiển thị.";
        resultHost.insertBefore(notice, resultHost.firstChild);
    }

    const moneySection = byId("money-section");
    const detailsSection = byId("details-section");
    if (!contract) {
        byId("result-contract").hidden = true;
        byId("contract-not-found").hidden = false;
        moneySection.hidden = true;
        detailsSection.hidden = true;
        byId("not-found-message").textContent = rawId
            ? "Không tìm thấy hợp đồng hoặc phiên thanh toán nào khớp “" + rawId + "” trong dữ liệu dùng chung. Liên kết có thể đã cũ — hãy mở lại từ trang hợp đồng, lịch sử đơn hoặc trang ví."
            : "Liên kết kết quả thiếu mã hợp đồng hoặc mã phiên. Vui lòng mở lại liên kết từ trang hợp đồng hoặc trang thanh toán.";
        byId("result-feedback").textContent = "Trang này là bản xem trước giao diện. Chưa có dịch vụ đối soát nào được gọi và chưa có số dư nào thay đổi.";
        return;
    }

    byId("result-contract").hidden = false;
    byId("result-contract").href = detailHref;
    byId("result-contract").textContent = "Xem chi tiết hợp đồng";
    byId("contract-not-found").hidden = true;
    moneySection.hidden = false;
    detailsSection.hidden = false;

    const statusLine = statusOf(CONTRACT_STATUS, contract.status).label
        + (order ? " · đơn " + statusOf(ORDER_STATUS, order.status).label : "")
        + (payment ? " · phiên " + statusOf(PAYMENT_STATUS, payment.status).label : "");

    byId("contract-code").textContent = contract.id;
    byId("contract-learner").textContent = (course || "Dịch vụ đã đặt") + " · " + (learner ? learner.studentName : contract.learnerId);
    byId("contract-tutor").textContent = tutor ? tutor.name : contract.tutorId;
    byId("transaction-reference").textContent = payment ? payment.id : "chưa có phiên thanh toán";
    byId("scale-label").textContent = "Học phí " + (received ? "đã ký quỹ" : "cần ký quỹ") + " · " + contract.sessions + " buổi";
    byId("money-total").textContent = money(total);
    byId("money-wallet").textContent = money(walletUsed);
    byId("money-payos").textContent = money(payosDue);
    byId("money-grand-total").textContent = money(total);
    byId("total-note").textContent = money(contract.unitPrice) + " × " + contract.sessions + " buổi học";
    byId("contract-status").textContent = statusLine;
    byId("wallet-label").textContent = received ? "Đã sử dụng từ ví Edu Connect" : "Dự kiến dùng từ ví Edu Connect";
    byId("payos-label").textContent = received ? "Đã thanh toán qua cổng" : "Dự kiến thanh toán qua cổng";
    byId("total-label").firstChild.textContent = received ? "Tổng ký quỹ ban đầu" : "Tổng cần ký quỹ";
    byId("confirmation-time").textContent = received && payment
        ? Store.formatDate(payment.createdAt, true)
        : "Chưa có xác nhận từ cổng thanh toán";
    byId("guidance-title").textContent = "Ký quỹ theo từng buổi học";
    byId("guidance-description").textContent =
        "Học phí được giữ theo hợp đồng và giải ngân từng buổi " + money(contract.unitPrice)
        + " sau khi buổi học được xác nhận. Phí nền tảng demo "
        + Math.round((Number(contract.feeRate) || Store.DEMO_FEE_RATE) * 100)
        + "% khấu trừ từ thù lao gia sư — giả định mẫu chưa được chốt.";
    byId("money-note").textContent = received && !verified
        ? "Khoản thanh toán đã được ghi nhận trước khi xử lý hoàn tiền. Theo dõi số tiền và tiến độ hoàn trong đơn đăng ký " + (order ? order.id : "") + "."
        : verified
        ? "Đã sử dụng " + money(walletUsed) + " từ ví và " + money(payosDue) + " qua cổng cho phiên " + payment.id + ". Hợp đồng: " + statusOf(CONTRACT_STATUS, contract.status).label + "."
        : payment
            ? "Phiên " + payment.id + " đang ở trạng thái " + statusOf(PAYMENT_STATUS, payment.status).label + " — chưa có tiền vào ký quỹ. Chia khoản hiển thị ở trên lấy đúng theo bản ghi phiên (" + money(walletUsed) + " từ ví + " + money(payosDue) + " qua cổng)."
            : "Chưa có phiên thanh toán nào cho hợp đồng này. Chia khoản ở trên là DỰ KIẾN theo số dư khả dụng hiện tại (" + money(walletUsed) + " từ ví + " + money(payosDue) + " qua cổng).";
    byId("result-feedback").textContent = "Bản xem trước: không có dịch vụ đối soát nào được gọi; số dư và hợp đồng chỉ thay đổi qua các thao tác trong dữ liệu mẫu.";

    byId("result-primary").addEventListener("click", () => {
        if (state === "pending") {
            byId("result-feedback").textContent =
                "Chưa kết nối được dịch vụ đối soát. Vui lòng kiểm tra lại sau; không thanh toán thêm nếu ngân hàng đã trừ tiền.";
            return;
        }
        window.EduModal.open("shared-modal", {
            title: "Hợp đồng " + contract.id,
            message:
                byId("contract-learner").textContent + " · Gia sư " + (tutor ? tutor.name : contract.tutorId) + ". "
                + contract.sessions + " buổi × " + money(contract.unitPrice) + " = " + money(total) + ". "
                + (verified ? "Đã ghi nhận: " : "Dự kiến: ") + money(walletUsed) + " từ ví + " + money(payosDue) + " qua cổng. "
                + "Trạng thái: " + statusLine + ". "
                + (verified ? "Phiên " + payment.id + " ở trạng thái verified trong dữ liệu mẫu." : "Chưa có phiên nào verified; tham số URL không phải bằng chứng thanh toán."),
            variant: "info",
        });
    });

    byId("copy-reference").addEventListener("click", async () => {
        if (!payment) {
            byId("result-feedback").textContent = "Chưa có phiên thanh toán nào để lấy mã tham chiếu.";
            return;
        }
        const reference = payment.id;
        try {
            await navigator.clipboard.writeText(reference);
            window.EduToast.show({
                type: "success",
                title: "Đã sao chép mã tham chiếu",
                message: "Dùng mã này khi cần đối chiếu giao dịch.",
            });
        } catch {
            byId("result-feedback").textContent = "Không thể sao chép tự động. Mã tham chiếu: " + reference;
        }
    });
})();
