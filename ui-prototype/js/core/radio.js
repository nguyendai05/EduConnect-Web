document.querySelectorAll('.radio-option input[type="radio"]').forEach((input) => {
  input.addEventListener('change', () => {
    document.querySelectorAll('.radio-option').forEach((option) => {
      option.classList.toggle(
        'radio-option--selected',
        option.querySelector('input')?.checked === true,
      );
    });
  });
});
