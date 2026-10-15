(() => {
  const headers = document.querySelectorAll('[data-component="admin-header"]');

  headers.forEach((header) => {
    const searchForm = header.querySelector('[data-admin-search]');
    const searchInput = header.querySelector('[data-search-input]');
    const searchResults = header.querySelector('[data-search-results]');
    const clearSearchButton = header.querySelector('[data-clear-search]');
    const notificationWrap = header.querySelector('[data-notification-wrap]');
    const notificationTrigger = header.querySelector('[data-notification-trigger]');
    const notificationPopover = header.querySelector('[data-notification-popover]');
    const profileWrap = header.querySelector('[data-profile-wrap]');
    const profileTrigger = header.querySelector('[data-profile-trigger]');
    const profilePopover = header.querySelector('[data-profile-popover]');
    const logoutLink = header.querySelector('a.is-danger');

    logoutLink?.addEventListener('click', event => {
      if (!window.EduStore) return;
      const result = window.EduStore.logout();
      if (!result.ok) {
        event.preventDefault();
        window.EduToast?.show({ type: 'error', title: 'Chưa thể đăng xuất', message: 'Không thể cập nhật phiên xem trước. Vui lòng thử lại.' });
      }
    });

    const closeSearch = () => {
      searchResults.hidden = true;
    };

    const closeNotifications = () => {
      notificationPopover.hidden = true;
      notificationTrigger.setAttribute('aria-expanded', 'false');
    };

    const closeProfile = () => {
      profilePopover.hidden = true;
      profileTrigger.setAttribute('aria-expanded', 'false');
    };

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
    });

    searchInput.addEventListener('focus', () => {
      closeNotifications();
      closeProfile();
      searchResults.hidden = searchInput.value.trim().length === 0;
    });

    searchInput.addEventListener('input', () => {
      const hasQuery = searchInput.value.trim().length > 0;
      clearSearchButton.hidden = !hasQuery;
      searchResults.hidden = !hasQuery;
    });

    clearSearchButton.addEventListener('click', () => {
      searchInput.value = '';
      clearSearchButton.hidden = true;
      searchResults.hidden = true;
      searchInput.focus();
    });

    notificationTrigger.addEventListener('click', () => {
      const willOpen = notificationPopover.hidden;
      closeSearch();
      closeProfile();
      notificationPopover.hidden = !willOpen;
      notificationTrigger.setAttribute('aria-expanded', String(willOpen));
    });

    profileTrigger.addEventListener('click', () => {
      const willOpen = profilePopover.hidden;
      closeSearch();
      closeNotifications();
      profilePopover.hidden = !willOpen;
      profileTrigger.setAttribute('aria-expanded', String(willOpen));
    });

    document.addEventListener('click', (event) => {
      if (!searchForm.contains(event.target)) closeSearch();
      if (!notificationWrap.contains(event.target)) closeNotifications();
      if (!profileWrap.contains(event.target)) closeProfile();
    });

    header.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;

      const shouldRestoreSearchFocus = !searchResults.hidden;
      closeSearch();
      closeNotifications();
      closeProfile();
      if (shouldRestoreSearchFocus) searchInput.focus();
    });
  });
})();

/**
 * "Hệ thống bình thường" là khẳng định chưa có kiểm tra thật — prototype không có health check
 * hay backend để đối chiếu. Đổi nhãn một lần ở đây để cả 11 trang admin cùng trung thực,
 * thay vì sửa markup inline trên từng trang.
 */
(() => {
  const DEMO_LABEL = ' Bản xem trước · chưa kết nối backend ';

  const relabel = () => {
    document.querySelectorAll('.admin-header__system-status').forEach(node => {
      const textNode = Array.from(node.childNodes).find(child => child.nodeType === 3 && child.textContent.trim())
      if (textNode) textNode.textContent = DEMO_LABEL
      node.setAttribute('title', 'Prototype chưa có health check thật; nhãn này không khẳng định trạng thái hệ thống.')
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', relabel, { once: true })
  } else {
    relabel()
  }
})()
