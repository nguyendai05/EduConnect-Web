const filterPanel = document.querySelector('[data-filter-panel]');

if (filterPanel) {
  const resetButton = filterPanel.querySelector('[data-reset-filter]');
  const defaults = {
    subject: 'Toán học',
    grade: '10',
    fee: '500000',
    hiringOnly: false,
  };

  const syncGrade = () => {
    filterPanel.querySelectorAll('.filter-panel__grade-grid label').forEach((label) => {
      label.classList.toggle('is-selected', label.querySelector('input')?.checked === true);
    });
  };

  const syncRange = () => {
    const range = filterPanel.querySelector('.filter-panel__range');
    const output = filterPanel.querySelector('[data-fee-output]');
    if (!range || !output) return;
    const min = Number(range.min);
    const max = Number(range.max);
    const value = Number(range.value);
    const percent = ((value - min) / (max - min)) * 100;
    range.style.background = `linear-gradient(to right, #1A6FD4 0 ${percent}%, #E2E8F0 ${percent}% 100%)`;
    output.textContent = `≤ ${value.toLocaleString('vi-VN')} ₫`;
  };

  const syncReset = () => {
    const current = {
      subject: filterPanel.querySelector('[name="subject"]')?.value,
      grade: filterPanel.querySelector('[name="grade"]:checked')?.value,
      fee: filterPanel.querySelector('[name="fee-range"]')?.value,
      hiringOnly: filterPanel.querySelector('[name="hiring-only"]')?.checked,
    };
    const changed = Object.keys(defaults).some((key) => current[key] !== defaults[key]);
    if (resetButton) resetButton.hidden = !changed;
  };

  filterPanel.addEventListener('input', () => {
    syncGrade();
    syncRange();
    syncReset();
  });
  filterPanel.addEventListener('change', () => {
    syncGrade();
    syncRange();
    syncReset();
  });
  filterPanel.addEventListener('reset', (event) => {
    event.preventDefault();
    const subject = filterPanel.querySelector('[name="subject"]');
    const grade = filterPanel.querySelector('[name="grade"][value="10"]');
    const range = filterPanel.querySelector('[name="fee-range"]');
    const hiringOnly = filterPanel.querySelector('[name="hiring-only"]');
    if (subject) subject.value = defaults.subject;
    if (grade) grade.checked = true;
    if (range) range.value = defaults.fee;
    if (hiringOnly) hiringOnly.checked = defaults.hiringOnly;
    requestAnimationFrame(() => {
      syncGrade();
      syncRange();
      syncReset();
    });
  });

  syncGrade();
  syncRange();
  syncReset();
}
