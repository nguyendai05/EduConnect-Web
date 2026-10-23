/**
 * Script xử lý chọn 1 khóa học trong giỏ hàng để xem dự thảo hợp đồng (HUY-01 & HUY-02).
 * Hỗ trợ highlight viền khi click, chọn radio và cập nhật form tóm tắt.
 */
document.addEventListener('DOMContentLoaded', function () {
    const cartItems = document.querySelectorAll('.cart-item--selectable');
    const hiddenInput = document.getElementById('summaryCartItemId');
    const summaryTitle = document.getElementById('summarySelectedTitle');
    const summaryPrice = document.getElementById('summarySelectedPrice');

    function selectItem(card) {
        if (!card) return;
        const itemId = card.dataset.id;
        const title = card.dataset.title;
        const price = card.dataset.price;

        // Bỏ chọn tất cả các thẻ khác
        cartItems.forEach(function (c) {
            c.classList.remove('cart-item--selected');
            const radio = c.querySelector('.cart-item-radio');
            if (radio) radio.checked = false;
            const badge = c.querySelector('.cart-item-badge');
            if (badge) badge.hidden = true;
            const labelText = c.querySelector('.cart-item-radio-text');
            if (labelText) labelText.textContent = 'Bấm để chọn khóa học này';
        });

        // Highlight thẻ được chọn
        card.classList.add('cart-item--selected');
        const activeRadio = card.querySelector('.cart-item-radio');
        if (activeRadio) activeRadio.checked = true;
        const activeBadge = card.querySelector('.cart-item-badge');
        if (activeBadge) activeBadge.hidden = false;
        const activeLabel = card.querySelector('.cart-item-radio-text');
        if (activeLabel) activeLabel.textContent = 'Khóa học đang chọn để lập hợp đồng';

        // Đồng bộ dữ liệu sang cột Tóm tắt bên phải
        if (hiddenInput) hiddenInput.value = itemId;
        if (summaryTitle && title) summaryTitle.textContent = title;
        if (summaryPrice && price) summaryPrice.textContent = price;
    }

    cartItems.forEach(function (card) {
        card.addEventListener('click', function (e) {
            // Không can thiệp nếu người dùng đang thao tác với input số lượng, nút submit cập nhật/xóa, hoặc liên kết
            if (e.target.closest('input:not(.cart-item-radio)') || e.target.closest('button') || e.target.closest('a')) {
                return;
            }
            selectItem(card);
        });

        const radio = card.querySelector('.cart-item-radio');
        if (radio) {
            radio.addEventListener('change', function () {
                selectItem(card);
            });
        }
    });

    // Nếu ban đầu đã có thẻ được chọn thì đồng bộ ngay
    const initialSelected = document.querySelector('.cart-item--selectable.cart-item--selected') || cartItems[0];
    if (initialSelected) {
        selectItem(initialSelected);
    }
});
