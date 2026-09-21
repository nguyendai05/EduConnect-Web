const pagination = document.querySelector('[data-pagination]');

if (pagination) {
  const total = Number(pagination.dataset.total);
  const pageSize = Number(pagination.dataset.pageSize);
  const lastPage = Number(pagination.dataset.lastPage);
  let currentPage = Number(pagination.dataset.current);

  const updatePagination = (page) => {
    currentPage = Math.max(1, Math.min(page, lastPage));
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, total);

    pagination.querySelector('[data-range-start]').textContent = start;
    pagination.querySelector('[data-range-end]').textContent = end;
    pagination.querySelector('[data-total-count]').textContent = total;

    pagination.querySelectorAll('[data-page]').forEach((button) => {
      const isCurrent = Number(button.dataset.page) === currentPage;
      button.classList.toggle('is-current', isCurrent);
      if (isCurrent) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });

    const previous = pagination.querySelector('[data-page-action="previous"]');
    const next = pagination.querySelector('[data-page-action="next"]');
    if (previous) previous.disabled = currentPage === 1;
    if (next) next.disabled = currentPage === lastPage;
  };

  pagination.addEventListener('click', (event) => {
    const pageButton = event.target.closest('[data-page]');
    const actionButton = event.target.closest('[data-page-action]');
    if (pageButton) updatePagination(Number(pageButton.dataset.page));
    if (actionButton) {
      updatePagination(currentPage + (actionButton.dataset.pageAction === 'next' ? 1 : -1));
    }
  });

  updatePagination(currentPage);
}
