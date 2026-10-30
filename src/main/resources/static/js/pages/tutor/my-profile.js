/* DAI-02: hồ sơ gia sư dùng dữ liệu máy chủ; script đếm ký tự, xác nhận xóa, chống gửi hai lần và tải tệp ngay khi chọn. */
(() => {
  const bio = document.querySelector('#tutor-bio');
  const counter = document.querySelector('[data-bio-count]');
  const update = () => {
    if (bio && counter) counter.textContent = `${bio.value.length}/${bio.maxLength > 0 ? bio.maxLength : 1000}`;
  };
  if (bio) {
    bio.addEventListener('input', update);
    update();
  }

  document.querySelectorAll('form').forEach((form) => {
    form.addEventListener('submit', (event) => {
      const question = form.getAttribute('data-confirm');
      if (question && !window.confirm(question)) {
        event.preventDefault();
        return;
      }
      form.querySelectorAll('button[type="submit"]').forEach((button) => { button.disabled = true; });
    });
  });

  const upload = document.querySelector('[data-upload-form]');
  const file = document.querySelector('#tutor-evidence');
  if (upload && file) {
    const drop = upload.querySelector('.pl-drop');
    const send = () => {
      const chosen = file.files && file.files[0];
      if (!chosen) return;
      if (chosen.size > 5 * 1024 * 1024) {
        window.alert('Tệp vượt quá 5 MB. Hãy chọn tệp nhỏ hơn.');
        file.value = '';
        return;
      }
      drop.classList.add('is-busy');
      upload.submit();
    };
    file.addEventListener('change', send);
    ['dragenter', 'dragover'].forEach((name) => drop.addEventListener(name, () => drop.classList.add('is-over')));
    ['dragleave', 'drop'].forEach((name) => drop.addEventListener(name, () => drop.classList.remove('is-over')));
  }

  // Thêm môn/cấp học tùy chỉnh: tạo chip đã chọn, gửi cùng form khi lưu.
  const normalize = (text) => text.trim().replace(/\s+/g, ' ');
  const same = (a, b) => a.localeCompare(b, 'vi', { sensitivity: 'base' }) === 0;
  const addCustom = (name) => {
    const input = document.querySelector('[data-add-input="' + name + '"]');
    const chips = document.querySelector('[data-custom-chips="' + name + '"]');
    if (!input || !chips) return;
    const value = normalize(input.value);
    if (value.length < 2) {
      input.focus();
      return;
    }
    const existing = Array.from(chips.querySelectorAll('.pl-chip')).find((chip) => same(chip.textContent.trim(), value));
    if (existing) {
      existing.querySelector('input').checked = true;
      input.value = '';
      return;
    }
    const label = document.createElement('label');
    label.className = 'pl-chip pl-chip--new';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.name = name;
    box.value = value;
    box.checked = true;
    const text = document.createElement('span');
    text.textContent = value;
    label.append(box, text);
    chips.append(label);
    input.value = '';
    input.focus();
  };
  document.querySelectorAll('[data-add-button]').forEach((button) => {
    button.addEventListener('click', () => addCustom(button.dataset.addButton));
  });
  document.querySelectorAll('[data-add-input]').forEach((input) => {
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        addCustom(input.dataset.addInput);
      }
    });
  });
})();
