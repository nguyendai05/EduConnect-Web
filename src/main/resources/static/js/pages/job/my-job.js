/* "Tin của tôi" phía người đăng — danh sách đọc từ EduStore.jobsByLearner(sessionLearnerId()),
 * số hồ sơ dẫn xuất từ applicationsOfJob(), và "Đóng tin" ghi thật Store.closeJob() (trước đây
 * modal chỉ đổi class tại chỗ nên F5 là mất, lại hard-code 4 thẻ TT-88412/88209/88590/87910
 * không tồn tại trong store). */
(() => {
  const init = () => {
    const Store = window.EduStore
    const page = document.querySelector('[data-my-job-page]')
    if (!page || !Store) return

    const tabs = page.querySelector('[data-job-tabs]')
    const jobList = page.querySelector('[data-job-list]')
    const template = page.querySelector('[data-job-card-template]')
    const search = page.querySelector('[data-job-search]')
    const sort = page.querySelector('[data-job-sort]')
    const empty = page.querySelector('[data-job-empty]')
    const emptyDescription = page.querySelector('[data-job-empty-description]')
    const headerSummary = page.querySelector('[data-header-job-summary]')
    const sidebar = page.querySelector('[data-my-job-sidebar]')
    const sidebarTemplate = page.querySelector('[data-sidebar-applicant-template]')
    let activeStatus = 'all'
    let closingJobId = null

    const learnerId = Store.sessionLearnerId()
    const jobs = learnerId ? Store.jobsByLearner(learnerId) : []

    const toast = (type, title, message) => window.EduToast?.show({ type, title, message })

    const TAB_LABEL = Object.freeze({ all: 'Tất cả', open: 'Đang tuyển', pending: 'Chờ duyệt', closed: 'Đã đóng', rejected: 'Bị từ chối' })

    /* data-job-status suy từ job.status + job.availability — không tự đặt nhãn. */
    const statusOfJob = job => {
      if (job.status === 'pending') return 'pending'
      if (job.status === 'rejected') return 'rejected'
      return job.availability === 'open' ? 'open' : 'closed'
    }

    const fill = (card, selector, value) => {
      const node = card.querySelector(selector)
      if (node) node.textContent = value
    }

    const buildCard = job => {
      const card = template.content.firstElementChild.cloneNode(true)
      const applicants = Store.applicationsOfJob(job.id).length
      const status = statusOfJob(job)

      card.dataset.jobId = job.id
      card.dataset.jobStatus = status
      card.dataset.applicants = String(applicants)
      card.dataset.fee = String(job.budgetPerSession)
      card.dataset.created = String(job.publishedAt ? new Date(job.publishedAt).getTime() : 0)

      const badge = card.querySelector('[data-card-badge]')
      if (status === 'open') {
        badge.className = 'job-card__badge job-card__badge--info'
        badge.textContent = 'Đang tuyển'
      } else if (status === 'pending') {
        badge.className = 'job-card__badge job-card__badge--warning'
        badge.textContent = 'Chờ duyệt'
      } else if (status === 'rejected') {
        badge.className = 'job-card__badge job-card__badge--warning'
        badge.textContent = 'Bị từ chối'
      } else {
        badge.className = 'job-card__badge'
        badge.textContent = 'Đã đóng'
      }

      fill(card, '[data-card-code]', job.publishedAt ? `Mã tin: ${job.id} · Đăng ${Store.timeAgo(job.publishedAt)}` : `Mã tin: ${job.id} · tin chưa đăng công khai`)
      fill(card, '[data-card-title]', job.title)
      fill(card, '[data-card-fee]', Store.formatMoney(job.budgetPerSession))
      fill(card, '[data-card-tag-subject]', `${job.subjectLabel} · ${job.gradeLabel}`)
      fill(card, '[data-card-tag-mode]', job.modeLabel)
      fill(card, '[data-card-tag-district]', job.district)
      fill(card, '[data-card-sessions]', `${job.sessionsPerWeek} buổi / tuần`)
      fill(card, '[data-card-duration]', `${job.durationMinutes} phút · tổng ${job.sessions} buổi`)
      fill(card, '[data-card-experience]', job.experienceLabel)
      fill(card, '[data-card-description]', job.description)
      fill(card, '[data-card-applicants]', applicants ? `${applicants} gia sư đã ứng tuyển` : 'Chưa có hồ sơ ứng tuyển')
      fill(card, '[data-card-created-label]', job.publishedAt ? `Cập nhật hạn: ${Store.formatDate(job.expiresAt)}` : 'Tin chưa đăng công khai')

      card.querySelector('[data-card-pending]').hidden = status !== 'pending'
      const price = card.querySelector('.job-card__price')
      price.classList.toggle('job-card__price--neutral', status === 'closed' || status === 'pending')
      if (status === 'closed') card.classList.add('job-card--closed')

      const applicantsLink = card.querySelector('[data-card-applicants-link]')
      applicantsLink.href = `${window.EduRoute.path('/job/applicants')}?id=${encodeURIComponent(job.id)}`
      applicantsLink.textContent = applicants ? `Xem ${applicants} ứng viên` : 'Xem hồ sơ ứng tuyển'

      /* Nút đóng tin CHỈ hiện khi tin còn nhận hồ sơ (availability open). */
      card.querySelector('[data-close-job]').hidden = job.availability !== 'open'
      return card
    }

    const cards = jobs.map(buildCard)
    jobList.prepend(...cards)

    const cardsInList = () => [...jobList.querySelectorAll('[data-job-card]')]

    const applyFilters = () => {
      const query = search?.value.trim().toLocaleLowerCase('vi') || ''
      cardsInList().forEach(card => {
        const statusMatches = activeStatus === 'all' || card.dataset.jobStatus === activeStatus
        const searchMatches = !query || card.textContent.toLocaleLowerCase('vi').includes(query)
        card.hidden = !(statusMatches && searchMatches)
      })

      const visible = cardsInList().some(card => !card.hidden)
      if (empty) empty.hidden = visible
    }

    const applySort = () => {
      const value = sort?.querySelector('[data-select-value]')?.textContent.trim()
      const sorted = cardsInList().sort((a, b) => {
        if (value === 'Nhiều ứng viên nhất') return Number(b.dataset.applicants) - Number(a.dataset.applicants)
        if (value === 'Học phí cao đến thấp') return Number(b.dataset.fee) - Number(a.dataset.fee)
        return Number(b.dataset.created) - Number(a.dataset.created)
      })
      sorted.forEach(card => jobList.insertBefore(card, jobList.querySelector('[data-job-empty]')))
      applyFilters()
    }

    /* Đếm theo trạng thái thật của store — không giữ chữ ký tay "Tất cả (4)". */
    const syncTabs = () => {
      tabs?.querySelectorAll('[data-status]').forEach(tab => {
        const key = tab.dataset.status
        const count = key === 'all' ? cards.length : cards.filter(card => card.dataset.jobStatus === key).length
        tab.textContent = `${TAB_LABEL[key] || key} (${count})`
      })
      const openCount = cards.filter(card => card.dataset.jobStatus === 'open').length
      if (headerSummary) headerSummary.textContent = `Tin đang tuyển: ${openCount} / ${cards.length}`
    }

    /* Empty-state nói rõ persona nào đang xem khi chưa có hồ sơ learner đăng nhập. */
    if (!learnerId) {
      const persona = Store.getPersona()
      if (emptyDescription) {
        emptyDescription.textContent = `Bạn đang xem trang này bằng persona demo «${persona.name}» (${persona.label}) — chưa có hồ sơ phụ huynh/học viên đăng nhập nên chưa có tin nào để liệt kê. Hãy đăng nhập bằng persona phụ huynh hoặc học viên.`
      }
      if (sidebar) sidebar.hidden = true
    } else {
      syncSidebar(jobs)
    }

    /* Sidebar: 3 hồ sơ mới nhất của tin gần nhất — đọc applicationsOfJob + tutors, không bảng riêng. */
    function syncSidebar(jobRecords) {
      if (!sidebar) return
      const recentJob = jobRecords.slice().sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0))[0]
      if (!recentJob) {
        sidebar.hidden = true
        return
      }
      const applications = Store.applicationsOfJob(recentJob.id)
        .slice()
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      const pendingCount = applications.filter(item => item.status === 'submitted' || item.status === 'shortlisted').length
      const title = page.querySelector('[data-sidebar-job]')
      const count = page.querySelector('[data-sidebar-count]')
      const list = page.querySelector('[data-sidebar-applicants]')
      const action = page.querySelector('[data-sidebar-action]')
      if (count) count.textContent = pendingCount ? `${pendingCount} hồ sơ chờ xem` : 'Không còn hồ sơ chờ xem'
      if (title) title.textContent = `Tin “${recentJob.title}” (${recentJob.id}) đã nhận ${applications.length} hồ sơ ứng tuyển.`
      if (action) {
        action.href = `${window.EduRoute.path('/job/applicants')}?id=${encodeURIComponent(recentJob.id)}`
        action.textContent = applications.length ? `Xem ${applications.length} hồ sơ ứng tuyển` : 'Chưa có hồ sơ — mở danh sách'
      }
      if (list && sidebarTemplate) {
        list.replaceChildren(...applications.slice(0, 3).map(application => {
          const item = sidebarTemplate.content.firstElementChild.cloneNode(true)
          const tutor = Store.tutor(application.tutorId)
          item.querySelector('[data-sidebar-avatar]').textContent = tutor ? tutor.initials : '—'
          const avatar = item.querySelector('[data-sidebar-avatar]')
          avatar.classList.add(application.status === 'selected' ? 'applicant-card__avatar--selected' : 'applicant-card__avatar--pending')
          item.querySelector('[data-sidebar-name]').textContent = tutor ? tutor.name : application.tutorId
          item.querySelector('[data-sidebar-detail]').textContent = tutor && tutor.rating
            ? `★ ${tutor.rating} · ${tutor.district}`
            : (tutor ? tutor.district : application.status)
          return item
        }))
      }
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

    page.addEventListener('click', event => {
      const trigger = event.target.closest('[data-close-job]')
      if (trigger) closingJobId = trigger.closest('[data-job-card]').dataset.jobId

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

    /* Xác nhận modal gọi Store.closeJob THẬT; thành công thì reload để mọi màn đọc lại state. */
    const closeModal = document.getElementById('close-job-modal')
    closeModal?.addEventListener('modal:confirm', event => {
      if (!closingJobId) return
      const jobId = closingJobId
      const result = Store.closeJob({ jobId, learnerId: Store.sessionLearnerId(), idempotency: `my-job:close:${jobId}` })
      if (result.ok) {
        closingJobId = null
        toast('success', `Đã đóng tin ${jobId}`, 'Tin không còn nhận hồ sơ mới; trang tải lại để đọc trạng thái từ store dùng chung.')
        window.setTimeout(() => window.location.reload(), 900)
        return
      }
      /* Thất bại: KHÔNG đổi badge tại chỗ — giữ modal mở và báo đúng reason của store. */
      event.preventDefault()
      const messages = {
        'job-not-found': 'Mã tin không tồn tại trong dữ liệu dùng chung.',
        'not-job-owner': 'Tin này không thuộc persona đang đăng nhập nên không thể đóng từ trang này.',
        'job-not-open': 'Tin đã đóng trước đó, không cần đóng thêm lần nữa.',
        duplicated: 'Yêu cầu đóng tin đã được gửi rồi — bấm lặp không tạo thêm thay đổi.',
        'storage-failed': 'Không lưu được vào storage của tab; trạng thái cũ được giữ nguyên.'
      }
      toast('error', `Chưa đóng được tin ${jobId}`, messages[result.reason] || String(result.reason))
    })

    applySort()
    syncTabs()
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true })
  else init()
})()
