document.querySelectorAll('[data-search-input]').forEach((component) => {
  const input = component.querySelector('input');
  const clearButton = component.querySelector('[data-clear-search]');
  if (!input || !clearButton) return;

  const syncClearButton = () => {
    clearButton.hidden = input.value.length === 0;
  };

  input.addEventListener('input', syncClearButton);
  clearButton.addEventListener('click', () => {
    input.value = '';
    input.focus();
    syncClearButton();
  });
  syncClearButton();
});
