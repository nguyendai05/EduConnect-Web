document.querySelectorAll('[data-filter-chip]').forEach((chip) => {
  chip.addEventListener('click', (event) => {
    if (chip.dataset.removable === 'true' && event.target.closest('.filter-chip__remove')) {
      chip.remove();
      return;
    }

    const selected = chip.classList.toggle('filter-chip--selected');
    chip.setAttribute('aria-pressed', String(selected));
  });
});
