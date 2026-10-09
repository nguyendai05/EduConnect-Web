(() => {
  const init = () => {
    const page = document.querySelector('[data-my-job-page]')
    if (!page) return

    const tabs = page.querySelector('[data-job-tabs]')
    const jobList = page.querySelector('[data-job-list]')
    const search = page.querySelector('[data-job-search]')
    const sort = page.querySelector('[data-job-sort]')
    let activeStatus = 'all'

    const cards = () => [...jobList.querySelectorAll('[data-job-card]')]

    const applyFilters = () => {
      const query = search?.value.trim().toLocaleLowerCase('vi') || ''
      cards().forEach(card => {
        const statusMatches = activeStatus === 'all' || card.dataset.jobStatus === activeStatus
        const searchMatches = !query || card.textContent.toLocaleLowerCase('vi').includes(query)
        card.hidden = !(statusMatches && searchMatches)
      })

      const visible = cards().some(card => !card.hidden)
      const empty = jobList.querySelector('[data-job-empty]')
      if (empty) empty.hidden = visible
    }

    const applySort = () => {
      const value = sort?.querySelector('[data-select-value]')?.textContent.trim()
      const sorted = cards().sort((a, b) => {
        if (value === 'Nhiều ứng viên nhất') return Number(b.dataset.applicants) - Number(a.dataset.applicants)
        if (value === 'Học phí cao đến thấp') return Number(b.dataset.fee) - Number(a.dataset.fee)
        return Number(b.dataset.created) - Number(a.dataset.created)
      })
      sorted.forEach(card => jobList.insertBefore(card, jobList.querySelector('[data-job-empty]')))
      applyFilters()
    }

    tabs?.addEventListener('tabs:change', event => {
      const tab = tabs.querySelector(`#${CSS.escape(event.detail.tabId)}`)
      const panel = tabs.querySelector(`#${CSS.escape(event.detail.panelId)}`)
      activeStatus = tab?.dataset.status || 'all'
      if (panel && jobList.parentElement !== panel) panel.append(jobList)
      applyFilters()
    })

    search?.addEventListener('input', applyFilters)
    page.querySelector('[data-clear-search]')?.addEventListener('click', () => requestAnimationFrame(applyFilters))
    sort?.addEventListener('click', event => {
      if (event.target.closest('.select-option')) requestAnimationFrame(applySort)
    })

    let closingCard = null
    page.addEventListener('click', event => {
      const trigger = event.target.closest('[data-close-job]')
      if (trigger) closingCard = trigger.closest('[data-job-card]')

      const modalTrigger = event.target.closest('[data-modal-open="close-job-modal"]')
      if (modalTrigger && window.EduModal) {
        window.EduModal.open('close-job-modal', {
          title: 'Xác nhận đóng tin tuyển?',
          message: 'Gia sư sẽ không thể gửi thêm hồ sơ ứng tuyển mới. Bạn vẫn có thể xem các hồ sơ đã nhận trước đó.',
          confirmText: 'Đồng ý đóng tin',
          cancelText: 'Hủy'
        })
      }
    })

    const closeModal = document.getElementById('close-job-modal')
    closeModal?.addEventListener('modal:confirm', () => {
      if (!closingCard) return
      closingCard.dataset.jobStatus = 'closed'
      closingCard.classList.add('job-card--closed')
      const badge = closingCard.querySelector('.job-card__badge')
      if (badge) {
        badge.className = 'job-card__badge'
        badge.textContent = 'Đã đóng'
      }
      closingCard = null
      applyFilters()
    })

    applySort()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()
