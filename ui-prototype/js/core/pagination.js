/** Gửi pagination:update khi dữ liệu đổi; nghe pagination:change để cập nhật nội dung. */
(() => {
  document.querySelectorAll('[data-pagination]').forEach(pagination => {
    const updatePagination = (page, notify = false) => {
      const total = Math.max(0, Number(pagination.dataset.total) || 0);
      const pageSize = Math.max(1, Number(pagination.dataset.pageSize) || 10);
      const lastPage = Math.max(1, Math.ceil(total / pageSize));
      const currentPage = Math.max(1, Math.min(Number(page) || 1, lastPage));
      pagination.dataset.current = String(currentPage);
      pagination.dataset.lastPage = String(lastPage);
      pagination.querySelector('[data-range-start]').textContent = total ? (currentPage - 1) * pageSize + 1 : 0;
      pagination.querySelector('[data-range-end]').textContent = Math.min(currentPage * pageSize, total);
      pagination.querySelector('[data-total-count]').textContent = total;

      // Trang hiện có giữ markup; slot này bật các nút số trang động.
      const numbers = pagination.querySelector('[data-page-numbers]');
      if (numbers) {
        const pages = new Set([1, currentPage - 1, currentPage, currentPage + 1, lastPage]);
        const fragment = document.createDocumentFragment();
        let previousPage = 0;
        [...pages].filter(value => value >= 1 && value <= lastPage).sort((a, b) => a - b).forEach(value => {
          if (previousPage && value - previousPage > 1) {
            const ellipsis = document.createElement('span');
            ellipsis.className = 'pagination__ellipsis';
            ellipsis.textContent = '…';
            ellipsis.setAttribute('aria-hidden', 'true');
            fragment.append(ellipsis);
          }
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'pagination__button';
          button.dataset.page = String(value);
          button.textContent = value;
          button.setAttribute('aria-label', `Trang ${value}`);
          fragment.append(button);
          previousPage = value;
        });
        numbers.replaceChildren(fragment);
      }
      pagination.querySelectorAll('[data-page]').forEach(button => {
        const isCurrent = Number(button.dataset.page) === currentPage;
        button.classList.toggle('is-current', isCurrent);
        if (isCurrent) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      const previous = pagination.querySelector('[data-page-action="previous"]');
      const next = pagination.querySelector('[data-page-action="next"]');
      if (previous) previous.disabled = currentPage === 1;
      if (next) next.disabled = currentPage === lastPage;
      if (notify) pagination.dispatchEvent(new CustomEvent('pagination:change', { bubbles: true, detail: { page: currentPage, pageSize, total } }));
    };
    pagination.addEventListener('click', event => {
      const pageButton = event.target.closest('[data-page]');
      const actionButton = event.target.closest('[data-page-action]');
      if (pageButton && !pageButton.disabled) updatePagination(Number(pageButton.dataset.page), true);
      if (actionButton && !actionButton.disabled) updatePagination(Number(pagination.dataset.current) + (actionButton.dataset.pageAction === 'next' ? 1 : -1), true);
    });
    pagination.addEventListener('pagination:update', event => {
      const { total, pageSize, current } = event.detail || {};
      if (total !== undefined) pagination.dataset.total = String(total);
      if (pageSize !== undefined) pagination.dataset.pageSize = String(pageSize);
      updatePagination(current ?? pagination.dataset.current);
    });
    updatePagination(pagination.dataset.current);
  });
})();
