/* DAI-02: hồ sơ cá nhân dùng dữ liệu máy chủ; script chỉ đếm ký tự giới thiệu và chống bấm lưu hai lần. */
(() => {
  const bio = document.querySelector('#profile-bio');
  const counter = document.querySelector('[data-bio-count]');
  const form = document.querySelector('[data-profile-form]');
  const update = () => {
    if (bio && counter) counter.textContent = `${bio.value.length}/${bio.maxLength > 0 ? bio.maxLength : 1000}`;
  };
  if (bio) {
    bio.addEventListener('input', update);
    update();
  }
  if (form) {
    form.addEventListener('submit', () => {
      form.querySelectorAll('button[type="submit"]').forEach((button) => { button.disabled = true; });
    });
  }
})();
