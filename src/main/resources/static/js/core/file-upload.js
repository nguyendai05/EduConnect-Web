const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['pdf', 'png', 'jpg', 'jpeg'];

const getExtension = (file) => file.name.split('.').pop()?.toLowerCase() ?? '';

const validateFile = (file) => {
  if (file.size > MAX_FILE_SIZE) return 'Tệp vượt quá kích thước 5 MB.';
  if (!ACCEPTED_TYPES.includes(getExtension(file))) return 'Chỉ hỗ trợ tệp PDF, PNG hoặc JPG.';
  return '';
};

document.querySelectorAll('[data-file-upload]').forEach((component) => {
  const variant = component.dataset.variant;
  const input = component.querySelector('.file-upload__input');
  if (!input) return;

  const showError = (message) => {
    const error = component.querySelector('[data-error]');
    if (error) {
      error.hidden = !message;
      const text = error.querySelector('span');
      if (text && message) text.textContent = message;
    }
  };

  const handleFile = (file) => {
    if (!file) return;
    const message = validateFile(file);

    if (message) {
      showError(`Tệp ${file.name}: ${message}`);
      return;
    }

    showError('');
    if (variant === 'dropzone') {
      const status = component.querySelector('[data-status]');
      if (status) status.textContent = `Đã chọn: ${file.name}`;
    }
    if (variant === 'compact') {
      const name = component.querySelector('[data-compact-name]');
      if (name) name.textContent = file.name;
    }
  };

  input.addEventListener('change', () => handleFile(input.files?.[0]));

  const dropzone = component.querySelector('[data-dropzone]');
  if (dropzone) {
    ['dragenter', 'dragover'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.add('is-dragging');
      });
    });
    ['dragleave', 'drop'].forEach((eventName) => {
      dropzone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropzone.classList.remove('is-dragging');
      });
    });
    dropzone.addEventListener('drop', (event) => handleFile(event.dataTransfer?.files?.[0]));
  }
});

document.querySelectorAll('[data-remove-upload]').forEach((button) => {
  button.addEventListener('click', () => {
    const card = button.closest('[data-file-upload]');
    const uploading = card?.querySelector('[data-uploading]');
    if (uploading) uploading.hidden = true;
  });
});
