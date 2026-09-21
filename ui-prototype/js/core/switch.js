document.querySelectorAll('.switch-control input[type="checkbox"]').forEach((input) => {
  const row = input.closest('.switch-row');

  const syncRowState = () => {
    row?.classList.toggle('switch-row--on', input.checked);
  };

  input.addEventListener('change', syncRowState);
  syncRowState();
});
