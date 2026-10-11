/**
 * Trang chủ: hero gọn, ô tìm gia sư và danh sách "Mới công khai".
 * Danh sách lấy từ EduStore.latestOfferings(6) — sort theo publishedAt, tie-break ID,
 * chỉ approved/open. Card link đúng catalog/detail.html?id=<offeringId>.
 */
(() => {
  const page = document.querySelector('[data-home-page]')
  if (!page || !window.EduRoute || !window.EduStore) return

  const route = window.EduRoute
  const store = window.EduStore
  const toast = window.EduToast

  page.querySelector('[data-component="user-header"]')?.addEventListener('user-header:action', event => {
    if (event.detail?.action === 'logout') return
    toast?.show({ type: 'info', title: 'Thông báo', message: 'Tính năng chưa sẵn sàng.' })
  })

  const listEl = page.querySelector('[data-latest-list]')
  const emptyEl = page.querySelector('[data-latest-empty]')
  const emptyTitle = page.querySelector('#home-latest-empty-title')
  const emptyDescription = page.querySelector('[data-latest-empty-description]')
  const metaEl = page.querySelector('[data-latest-meta]')

  const CARD_TEMPLATE = `
<article class="card home-offer-card">
  <header class="home-offer-card__header">
    <span class="badge badge--info" data-card-type></span>
    <span class="home-offer-card__id" data-card-id></span>
  </header>
  <h3 class="home-offer-card__title" data-card-title></h3>
  <p class="home-offer-card__tutor" data-card-tutor></p>
  <p class="home-offer-card__subject" data-card-subject></p>
  <p class="home-offer-card__price"><strong data-card-price></strong><span data-card-unit></span></p>
  <p class="home-offer-card__seats" data-card-seats hidden></p>
  <a class="button button--outline button--medium home-offer-card__link" data-card-link>Xem chi tiết</a>
</article>`

  const buildCard = item => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = CARD_TEMPLATE
    const card = wrapper.firstElementChild
    const tutor = store.tutor(item.tutorId)
    card.querySelector('[data-card-type]').textContent = item.type === 'GROUP_CLASS' ? 'Lớp nhóm' : 'Dịch vụ 1 kèm 1'
    card.querySelector('[data-card-id]').textContent = item.id
    card.querySelector('[data-card-title]').textContent = item.title

    const tutorEl = card.querySelector('[data-card-tutor]')
    tutorEl.textContent = 'Gia sư: '
    if (tutor) {
      const tutorLink = document.createElement('a')
      tutorLink.textContent = tutor.name
      tutorLink.setAttribute('href', route.page('tutorProfile', { id: tutor.id }))
      tutorEl.append(tutorLink, ` (${tutor.id})`)
    } else {
      tutorEl.append(item.tutorId)
    }

    card.querySelector('[data-card-subject]').textContent = `${item.subjectLabel} · ${item.gradeLabel}`
    card.querySelector('[data-card-price]').textContent = store.formatMoney(item.price)
    card.querySelector('[data-card-unit]').textContent = item.unitLabel || (item.unit === 'per-session' ? '/buổi' : '/trọn gói')

    const seatsLeft = store.seatsLeft(item)
    const seatsEl = card.querySelector('[data-card-seats]')
    if (item.type === 'GROUP_CLASS' && seatsLeft !== null) {
      seatsEl.hidden = false
      seatsEl.textContent = seatsLeft > 0
        ? `Còn ${seatsLeft}/${item.capacity} chỗ`
        : `Đã đủ chỗ (0/${item.capacity})`
    }

    card.querySelector('[data-card-link]').setAttribute('href', route.page('catalogDetail', { id: item.id }))
    return card
  }

  const showEmpty = (title, description) => {
    listEl.replaceChildren()
    metaEl.textContent = ''
    emptyTitle.textContent = title
    emptyDescription.textContent = description
    emptyEl.hidden = false
  }

  const renderLatest = () => {
    let items = null
    try {
      items = store.latestOfferings(6)
    } catch (error) {
      items = null
    }
    if (!Array.isArray(items)) {
      showEmpty('Không đọc được dữ liệu dịch vụ / lớp', 'Kho dữ liệu mẫu chưa sẵn sàng hoặc bị lỗi. Hãy tải lại trang; nếu vẫn lỗi, kiểm tra js/data/store.js.')
      return
    }
    if (!items.length) {
      showEmpty('Chưa có dịch vụ / lớp mới công khai', 'Khi có dịch vụ hoặc lớp nhóm được công khai và còn mở đăng ký, danh sách sẽ hiển thị tại đây.')
      return
    }
    emptyEl.hidden = true
    metaEl.textContent = `${items.length} dịch vụ/lớp công khai gần đây nhất, đang mở đăng ký`
    const fragment = document.createDocumentFragment()
    items.forEach(item => fragment.append(buildCard(item)))
    listEl.replaceChildren(fragment)
  }

  renderLatest()
})()
