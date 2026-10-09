/* Client-side interaction only. No invitation, contract or payment API is called. */
(() => {
    const byId = (id) => document.getElementById(id);
    const money = (value) => new Intl.NumberFormat("vi-VN").format(value) + " ₫";
    const dateTime = (value) =>
        new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(value);
    const now = Date.now();
    const deadline = now + 3 * 24 * 60 * 60 * 1000;
    const startDate = new Date(now + 7 * 24 * 60 * 60 * 1000);
    const versions = [
        {
            number: 1,
            author: "Bạn",
            fee: 200000,
            sessions: 8,
            schedule: "Thứ Hai & Thứ Tư · 19:00–20:30",
            message: "Mong thầy hỗ trợ Gia Huy củng cố kiến thức Toán lớp 11.",
            date: now - 24 * 60 * 60 * 1000,
        },
        {
            number: 2,
            author: "Nguyễn Minh Anh",
            fee: 220000,
            sessions: 8,
            schedule: "Thứ Hai & Thứ Sáu · 19:00–20:30",
            message:
                "Thứ Tư tôi đã có lịch dạy nên xin chuyển sang tối thứ Sáu. Với học phí 220.000 ₫/buổi, tôi sẽ chuẩn bị thêm tài liệu luyện tập chuyên sâu cho Gia Huy.",
            date: now,
        },
    ];
    let state = "pending";
    let decision = null;
    let terminalNote = "";
    const current = () => versions[versions.length - 1];
    const summary = (version) =>
        money(version.fee) +
        "/buổi × " +
        version.sessions +
        " buổi (90 phút/buổi)\n" +
        version.schedule +
        "\nTổng dự kiến: " +
        money(version.fee * version.sessions);
    const notify = (message, type = "success") => window.EduToast.show({ type, message });
    const expired = () => {
        if (["pending", "countered"].includes(state) && Date.now() >= deadline) {
            state = "expired";
            window.EduModal.close();
            render();
            return true;
        }
        return state === "expired";
    };
    function renderHistory() {
        const list = byId("proposal-history");
        list.replaceChildren();
        [...versions].reverse().forEach((version) => {
            const item = document.createElement("li");
            item.className = "negotiation-history-item";
            const title = document.createElement("h3");
            title.textContent =
                version.author +
                (version.number === 1 ? " gửi lời mời ban đầu" : " gửi đề xuất mới") +
                " · Phiên bản " +
                version.number;
            const time = document.createElement("time");
            time.dateTime = new Date(version.date).toISOString();
            time.textContent = dateTime(version.date);
            const detail = document.createElement("p");
            detail.textContent = summary(version);
            const status = document.createElement("span");
            status.className = "badge badge--neutral";
            status.textContent = version === current() ? "Phiên bản hiện tại" : "Đã có đề xuất mới";
            const button = document.createElement("button");
            button.type = "button";
            button.className = "button button--ghost button--small";
            button.textContent = "Xem chi tiết bản " + version.number;
            button.addEventListener("click", () => showVersion(version));
            item.append(title, time, status, detail, button);
            list.append(item);
        });
        byId("history-count").textContent = versions.length + " phiên bản";
    }
    function render() {
        const version = current();
        const labels = {
            pending: ["warning", "Chờ bạn phản hồi"],
            countered: ["info", "Chờ gia sư phản hồi"],
            accepted: ["success", "Đã thống nhất"],
            rejected: ["danger", "Đã từ chối"],
            expired: ["neutral", "Đã hết hạn"],
        };
        const [tone, label] = labels[state];
        byId("invitation-status").className = "badge badge--" + tone;
        byId("invitation-status").textContent = label;
        const messages = {
            pending: [
                "Gia sư đã gửi đề xuất điều chỉnh",
                "Xem kỹ các điều khoản và phản hồi trước " + dateTime(deadline) + ".",
            ],
            countered: [
                "Đã gửi đề xuất mới",
                "Đề xuất của bạn đang chờ Nguyễn Minh Anh phản hồi. Các phiên bản trước vẫn được giữ trong lịch sử.",
            ],
            accepted: [
                "Hai bên đã thống nhất điều khoản",
                "Bước tiếp theo là xác nhận hợp đồng. Chưa phát sinh thanh toán hoặc trừ tiền.",
            ],
            rejected: [
                "Lời mời đã kết thúc",
                terminalNote ||
                    "Bạn đã từ chối đề xuất. Các phiên bản vẫn có thể xem lại trong lịch sử.",
            ],
            expired: [
                "Lời mời đã hết hạn",
                "Đề xuất không còn nhận phản hồi. Bạn vẫn có thể xem lại nội dung và lịch sử.",
            ],
        };
        const [title, message] = messages[state];
        byId("status-alert").className =
            "alert alert--" +
            {
                pending: "warning",
                countered: "info",
                accepted: "success",
                rejected: "error",
                expired: "warning",
            }[state];
        byId("status-title").textContent = title;
        byId("status-message").textContent = message;
        byId("response-title").textContent = state === "pending" ? "Phản hồi đề xuất" : label;
        byId("response-description").textContent =
            state === "pending"
                ? "Nguyễn Minh Anh đang chờ bạn phản hồi phiên bản " + version.number + "."
                : message;
        byId("response-actions").hidden = state !== "pending";
        byId("agreed-button").hidden = state !== "accepted";
        byId("contract-next").hidden = state !== "accepted";
        byId("deadline-label").textContent = ["accepted", "rejected"].includes(state)
            ? "Đã kết thúc phản hồi"
            : "Hạn phản hồi";
        byId("deadline-value").textContent = dateTime(deadline);
        byId("proposal-author").textContent =
            version.author + " đề xuất · Phiên bản " + version.number;
        byId("round-label").textContent = "Thương lượng lượt " + (version.number - 1) + " / 3";
        byId("counter-button").textContent = "Thương lượng lại (Lượt " + version.number + "/3)";
        byId("counter-button").disabled = version.number > 3;
        document.querySelectorAll('[data-value="total"]').forEach((node) => {
            node.textContent = money(version.fee * version.sessions);
        });
        document.querySelector('[data-value="fee"]').textContent = money(version.fee);
        document.querySelector('[data-value="sessions"]').textContent =
            version.sessions + " buổi · 90 phút/buổi";
        document.querySelector('[data-value="schedule"]').textContent = version.schedule;
        byId("price-detail").textContent =
            version.sessions + " buổi × " + money(version.fee) + " · 90 phút/buổi";
        byId("start-date").textContent = new Intl.DateTimeFormat("vi-VN").format(startDate);
        byId("proposal-message").textContent = version.message;
        const previous = versions[versions.length - 2];
        const changes = [];
        if (version.fee !== previous.fee)
            changes.push("Học phí: " + money(previous.fee) + " → " + money(version.fee) + "/buổi.");
        if (version.sessions !== previous.sessions)
            changes.push("Số buổi: " + previous.sessions + " → " + version.sessions + ".");
        if (version.schedule !== previous.schedule)
            changes.push("Lịch học: " + previous.schedule + " → " + version.schedule + ".");
        if (!changes.length) changes.push("Giữ nguyên điều khoản học tập; cập nhật lời nhắn.");
        byId("change-list").replaceChildren(
            ...changes.map((text) => {
                const li = document.createElement("li");
                li.textContent = text;
                return li;
            }),
        );
        renderHistory();
    }
    function showVersion(version) {
        decision = null;
        byId("reject-reason-field").hidden = true;
        byId("decision-summary").textContent =
            summary(version) + "\n\nLời nhắn: " + version.message;
        byId("decision-summary").className = "negotiation-dialog-terms";
        window.EduModal.open("decision-modal", {
            title: "Chi tiết đề xuất · Phiên bản " + version.number,
            message: "Người đề xuất: " + version.author + " · " + dateTime(version.date),
            variant: "info",
        });
    }
    function openDecision(action) {
        if (expired() || state !== "pending") return;
        decision = action;
        byId("reject-reason-field").hidden = action !== "reject";
        byId("decision-summary").className = "negotiation-dialog-terms";
        byId("decision-summary").textContent = summary(current());
        window.EduModal.open("decision-modal", {
            title: action === "accept" ? "Chấp nhận đề xuất này?" : "Từ chối lời mời này?",
            message:
                action === "accept"
                    ? "Bạn đồng ý với các điều khoản hiện tại. Chưa cần thanh toán ở bước này."
                    : "Quá trình thương lượng sẽ kết thúc. Bạn có thể để lại lý do cho gia sư.",
            confirmText: action === "accept" ? "Chấp nhận đề xuất" : "Xác nhận từ chối",
            variant: action === "accept" ? "confirm" : "danger",
        });
    }
    byId("accept-button").addEventListener("click", () => openDecision("accept"));
    byId("reject-button").addEventListener("click", () => openDecision("reject"));
    byId("agreed-button").addEventListener("click", () => showVersion(current()));
    byId("decision-modal").addEventListener("modal:confirm", (event) => {
        if (expired() || state !== "pending" || !["accept", "reject"].includes(decision)) {
            event.preventDefault();
            return;
        }
        if (decision === "accept") {
            try {
                sessionStorage.setItem(
                    "edu-agreed-proposal",
                    JSON.stringify({
                        invitation: "INV-20261009-024",
                        version: current().number,
                        fee: current().fee,
                        sessions: current().sessions,
                        schedule: current().schedule,
                        message: current().message,
                        start: startDate.toLocaleDateString("vi-VN"),
                        acceptedAt: Date.now(),
                        tutorConfirmedAt: current().date,
                    }),
                );
            } catch {
                event.preventDefault();
                notify("Không lưu được điều khoản. Vui lòng thử lại trước khi tiếp tục.", "error");
                return;
            }
        }
        state = decision === "accept" ? "accepted" : "rejected";
        terminalNote = byId("reject-reason").value.trim();
        render();
        notify(
            state === "accepted"
                ? "Đã chấp nhận đề xuất. Điều khoản đã sẵn sàng cho bước xác nhận hợp đồng."
                : "Đã từ chối lời mời.",
            state === "accepted" ? "success" : "info",
        );
        decision = null;
    });
    const fields = ["fee", "sessions", "schedule", "message"];
    function clearError(name) {
        const field = byId("counter-" + name);
        field.removeAttribute("aria-invalid");
        field.closest(".form-field").classList.remove("is-error");
        byId("counter-" + name + "-error").hidden = true;
    }
    function updateTotal() {
        const fee = Number(byId("counter-fee").value);
        const sessions = Number(byId("counter-sessions").value);
        byId("counter-total").textContent =
            fee > 0 && fee <= 10000000 && sessions > 0 && sessions <= 100
                ? money(fee * sessions)
                : "—";
        byId("message-count").textContent = byId("counter-message").value.length + " / 500 ký tự";
    }
    fields.forEach((name) =>
        byId("counter-" + name).addEventListener("input", () => {
            clearError(name);
            updateTotal();
        }),
    );
    byId("counter-button").addEventListener("click", () => {
        if (expired() || state !== "pending" || current().number > 3) return;
        fields.forEach((name) => {
            byId("counter-" + name).value = name === "message" ? "" : current()[name];
            clearError(name);
        });
        updateTotal();
        window.EduModal.open("counter-modal", {
            title: "Đề xuất điều chỉnh · Lượt " + current().number + "/3",
            message: "Điều chỉnh điều khoản và nêu lý do bạn muốn trao đổi với gia sư.",
        });
    });
    byId("counter-form").addEventListener("submit", (event) => {
        event.preventDefault();
        if (expired() || state !== "pending") return;
        let firstInvalid;
        const data = {};
        fields.forEach((name) => {
            const field = byId("counter-" + name);
            data[name] = ["fee", "sessions"].includes(name)
                ? Number(field.value)
                : field.value.trim();
            const valid = field.checkValidity() && data[name] !== "";
            if (!valid) {
                const error = byId("counter-" + name + "-error");
                error.textContent = {
                    fee: "Nhập học phí từ 1.000 đến 10.000.000 ₫, theo bội số 1.000.",
                    sessions: "Nhập số nguyên từ 1 đến 100 buổi.",
                    schedule: "Vui lòng nhập ngày và khung giờ học.",
                    message: "Vui lòng nhập lý do điều chỉnh.",
                }[name];
                error.hidden = false;
                field.setAttribute("aria-invalid", "true");
                field.closest(".form-field").classList.add("is-error");
                firstInvalid ||= field;
            }
        });
        if (firstInvalid) {
            firstInvalid.focus();
            return;
        }
        if (fields.every((name) => data[name] === current()[name])) {
            notify("Bạn chưa thay đổi điều khoản hoặc lời nhắn.", "warning");
            return;
        }
        versions.push({ ...data, number: current().number + 1, author: "Bạn", date: Date.now() });
        state = "countered";
        window.EduModal.close("counter-modal");
        render();
        notify("Đã gửi đề xuất mới. Vui lòng chờ gia sư phản hồi.");
    });
    // Configure existing shared header links locally.
    const header = document.querySelector(".user-header");
    const links = {
        1: "../contract/student-detail.html",
        2: "../wallet/overview.html",
        4: "../wallet/overview.html#transactions",
    };
    Object.entries(links).forEach(([key, href]) => {
        const link = header.querySelector('[data-menu-item="' + key + '"]');
        if (link) link.href = href;
    });
    const walletLabel = header.querySelector('[data-menu-item="2"] [data-menu-label]');
    if (walletLabel) walletLabel.textContent = "Ví Edu Connect";
    header.querySelector('[aria-label="Tin nhắn"]')?.addEventListener("click", () => {
        location.href = "../chat/messages.html";
    });
    render();
    window.setInterval(expired, 30000);
})();
