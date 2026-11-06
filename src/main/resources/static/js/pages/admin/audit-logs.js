(function () {
    "use strict";

    var rangeSelect = document.querySelector("[data-audit-range]");
    var customDateFields = document.querySelectorAll("[data-audit-custom-date]");

    function syncCustomDateFields() {
        if (!rangeSelect) return;
        var isCustom = rangeSelect.value === "custom";
        customDateFields.forEach(function (field) {
            field.hidden = !isCustom;
        });
    }

    if (rangeSelect) {
        rangeSelect.addEventListener("change", syncCustomDateFields);
        syncCustomDateFields();
    }

    var dialog = document.getElementById("audit-detail-dialog");
    if (!dialog || typeof dialog.showModal !== "function") return;

    var refNode = dialog.querySelector("[data-detail-ref]");
    var timeNode = dialog.querySelector("[data-detail-time]");
    var groupNode = dialog.querySelector("[data-detail-group]");
    var actorNode = dialog.querySelector("[data-detail-actor]");
    var actorSubNode = dialog.querySelector("[data-detail-actor-sub]");
    var actionNode = dialog.querySelector("[data-detail-action]");
    var actionCodeNode = dialog.querySelector("[data-detail-action-code]");
    var targetLinkNode = dialog.querySelector("[data-detail-target-link]");
    var targetTextNode = dialog.querySelector("[data-detail-target-text]");
    var targetRefNode = dialog.querySelector("[data-detail-target-ref]");
    var summaryNode = dialog.querySelector("[data-detail-summary]");
    var jsonNode = dialog.querySelector("[data-detail-json]");
    var copyStatusNode = dialog.querySelector("[data-detail-copy-status]");
    var copyButton = dialog.querySelector("[data-audit-copy]");
    var currentRef = "";

    function openDetail(button) {
        currentRef = button.getAttribute("data-ref") || "";
        if (refNode) refNode.textContent = "Mã tham chiếu: " + currentRef;
        if (timeNode) timeNode.textContent = button.getAttribute("data-time") || "";
        if (groupNode) groupNode.textContent = button.getAttribute("data-group") || "";
        if (actorNode) actorNode.textContent = button.getAttribute("data-actor") || "";
        if (actorSubNode) actorSubNode.textContent = button.getAttribute("data-actor-sub") || "";
        if (actionNode) actionNode.textContent = button.getAttribute("data-action") || "";
        if (actionCodeNode) actionCodeNode.textContent = button.getAttribute("data-action-code") || "";

        var targetLabel = button.getAttribute("data-target") || "";
        var targetHref = button.getAttribute("data-target-href") || "";
        if (targetLinkNode && targetTextNode) {
            if (targetHref) {
                targetLinkNode.href = window.EduRoute ? window.EduRoute.url(targetHref) : targetHref;
                targetLinkNode.textContent = targetLabel;
                targetLinkNode.hidden = false;
                targetTextNode.textContent = "";
                targetTextNode.hidden = true;
            } else {
                targetLinkNode.hidden = true;
                targetTextNode.textContent = targetLabel;
                targetTextNode.hidden = false;
            }
        }
        if (targetRefNode) targetRefNode.textContent = button.getAttribute("data-target-ref") || "";
        if (summaryNode) summaryNode.textContent = button.getAttribute("data-summary") || "";
        if (jsonNode) jsonNode.textContent = button.getAttribute("data-json") || "{}";
        if (copyStatusNode) copyStatusNode.textContent = "";
        dialog.showModal();
    }

    document.querySelectorAll("[data-audit-detail]").forEach(function (button) {
        button.addEventListener("click", function () { openDetail(button); });
    });

    dialog.querySelectorAll("[data-close-dialog]").forEach(function (button) {
        button.addEventListener("click", function () { dialog.close(); });
    });

    dialog.addEventListener("click", function (event) {
        if (event.target === dialog) dialog.close();
    });

    if (copyButton) {
        copyButton.addEventListener("click", function () {
            if (!currentRef) return;
            if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
                navigator.clipboard.writeText(currentRef).then(function () {
                    if (copyStatusNode) copyStatusNode.textContent = "Đã sao chép mã tham chiếu " + currentRef + ".";
                }).catch(function () {
                    if (copyStatusNode) copyStatusNode.textContent = "Mã tham chiếu: " + currentRef;
                });
            } else if (copyStatusNode) {
                copyStatusNode.textContent = "Mã tham chiếu: " + currentRef;
            }
        });
    }
})();
