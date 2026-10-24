// Radio gửi trực tiếp cartItemId; JavaScript chỉ cập nhật phần tóm tắt và trạng thái chọn.
document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.cart-item--selectable');
    const title = document.getElementById('summarySelectedTitle');
    const price = document.getElementById('summarySelectedPrice');

    function selectItem(selected) {
        cards.forEach(card => {
            const active = card === selected;
            card.classList.toggle('cart-item--selected', active);
            card.querySelector('.cart-item-radio').checked = active;
            card.querySelector('.cart-item-badge').hidden = !active;
            card.querySelector('.cart-item-radio-text').textContent = active
                ? 'Khóa học đang chọn để lập hợp đồng'
                : 'Bấm để chọn khóa học này';
        });
        title.textContent = selected.dataset.title;
        price.textContent = selected.dataset.price;
    }

    cards.forEach(card => {
        card.addEventListener('click', event => {
            if (!event.target.closest('input:not(.cart-item-radio), button, a')) selectItem(card);
        });
        card.querySelector('.cart-item-radio').addEventListener('change', () => selectItem(card));
    });

    const selected = document.querySelector('.cart-item-radio:checked');
    if (selected) selectItem(selected.closest('.cart-item--selectable'));
});
