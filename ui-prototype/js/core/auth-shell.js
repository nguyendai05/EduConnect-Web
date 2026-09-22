(() => {
  document.querySelectorAll('[data-component="auth-shell"]').forEach((shell) => {
    const tabs = [...shell.querySelectorAll('[data-auth-variant]')];
    const panels = [...shell.querySelectorAll('[data-auth-variant-panel]')];

    const selectVariant = (variant) => {
      tabs.forEach((tab) => {
        const isSelected = tab.dataset.authVariant === variant;
        tab.classList.toggle('is-active', isSelected);
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;
      });

      panels.forEach((panel) => {
        panel.hidden = panel.dataset.authVariantPanel !== variant;
      });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => selectVariant(tab.dataset.authVariant));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;

        event.preventDefault();
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        tabs[nextIndex].focus();
        selectVariant(tabs[nextIndex].dataset.authVariant);
      });
    });
  });
})();
