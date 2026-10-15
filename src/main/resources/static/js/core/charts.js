/**
 * Biểu đồ native (SVG + bảng accessible) dùng chung cho admin dashboard và tutor/manage.
 * Không dùng thư viện chart. Một implementation duy nhất để hai nơi không tính lệch nhau.
 *
 * Quy tắc:
 * - Zero data không sinh NaN/Infinity.
 * - Luôn có nhãn chữ + bảng số liệu, không chỉ phân biệt bằng màu.
 * - Range/đơn vị/chỉ số được hiển thị rõ.
 */
(() => {
  const SVG_NS = 'http://www.w3.org/2000/svg'

  const STORE = window.EduStore
  const formatMoney = STORE ? STORE.formatMoney : (value => `${Math.round(Number(value) || 0)}`)
  const formatNumber = STORE ? STORE.formatNumber : (value => String(Number(value) || 0))

  const PALETTE = Object.freeze([
    'var(--color-primary)',
    'var(--color-primary-strong, #1f5f52)',
    'var(--color-accent)',
    'var(--color-info, #2f6f9f)',
    'var(--color-neutral-500, #6b7280)',
    'var(--color-neutral-400, #9aa1a9)'
  ])

  const el = (tag, attrs = {}, children = []) => {
    const node = document.createElement(tag)
    Object.keys(attrs).forEach(key => {
      if (attrs[key] === null || attrs[key] === undefined) return
      node.setAttribute(key, String(attrs[key]))
    })
    children.forEach(child => node.appendChild(child))
    return node
  }

  const svgEl = (tag, attrs = {}, children = []) => {
    const node = document.createElementNS(SVG_NS, tag)
    Object.keys(attrs).forEach(key => {
      if (attrs[key] === null || attrs[key] === undefined) return
      node.setAttribute(key, String(attrs[key]))
    })
    children.forEach(child => node.appendChild(child))
    return node
  }

  const truncate = (value, max = 14) => {
    const text = String(value === null || value === undefined ? '' : value)
    return text.length > max ? `${text.slice(0, max - 1)}…` : text
  }

  const safeRatio = (value, total) => {
    const denominator = Number(total)
    if (!Number.isFinite(denominator) || denominator === 0) return 0
    const numerator = Number(value)
    if (!Number.isFinite(numerator)) return 0
    return Math.max(0, Math.min(1, numerator / denominator))
  }

  const formatValue = (value, unit) => (unit === 'đ' ? formatMoney(value) : `${formatNumber(value)}${unit ? ` ${unit}` : ''}`)

  const clear = node => { while (node.firstChild) node.removeChild(node.firstChild) }

  const buildTable = (caption, headLabels, rows, formatter) => {
    const table = el('table', { class: 'chart__table' })
    const captionNode = el('caption', {}, [document.createTextNode(caption)])
    table.appendChild(captionNode)
    const thead = el('thead')
    const headRow = el('tr')
    headLabels.forEach((label, index) => {
      headRow.appendChild(el(index === 0 ? 'th' : 'th', { scope: 'col' }, [document.createTextNode(label)]))
    })
    thead.appendChild(headRow)
    table.appendChild(thead)
    const tbody = el('tbody')
    rows.forEach(row => {
      const tr = el('tr')
      tr.appendChild(el('th', { scope: 'row' }, [document.createTextNode(row.label)]))
      tr.appendChild(el('td', {}, [document.createTextNode(formatter(row.value))]))
      if (row.percent !== undefined && row.percent !== null) tr.appendChild(el('td', {}, [document.createTextNode(row.percent)]))
      tbody.appendChild(tr)
    })
    table.appendChild(tbody)
    return table
  }

  const renderEmpty = (container, message) => {
    clear(container)
    container.classList.add('is-empty')
    container.appendChild(el('p', { class: 'chart__empty' }, [document.createTextNode(message || 'Chưa có dữ liệu trong khoảng này.')]))
  }

  /**
   * Biểu đồ cột theo ngày.
   * config: { title, description, metricLabel, unit, from, to, rows: [{label, value, key}], total, invalidReason, emptyLabel }
   */
  const bar = (container, config = {}) => {
    if (!container) return null
    container.classList.add('chart', 'chart--bar')
    container.setAttribute('data-chart', 'bar')

    if (config.invalidReason === 'from-after-to') {
      clear(container)
      container.classList.add('is-invalid')
      container.appendChild(el('p', { class: 'chart__error', role: 'alert' }, [document.createTextNode('Khoảng ngày không hợp lệ: ngày bắt đầu phải trước hoặc bằng ngày kết thúc.')]))
      return { ok: false, reason: 'from-after-to' }
    }

    const rows = Array.isArray(config.rows) ? config.rows.filter(row => row && Number.isFinite(Number(row.value))) : []
    if (!rows.length) {
      renderEmpty(container, config.emptyLabel)
      return { ok: true, rows: 0, total: 0 }
    }

    clear(container)
    container.classList.remove('is-empty', 'is-invalid')

    const unit = config.unit === 'đ' ? 'đ' : (config.unit || '')
    const total = Number.isFinite(Number(config.total)) ? Number(config.total) : rows.reduce((sum, row) => sum + Number(row.value || 0), 0)
    const max = rows.reduce((peak, row) => Math.max(peak, Number(row.value || 0)), 0)

    const headingId = `chart-${Math.random().toString(36).slice(2, 9)}-title`
    if (config.title) {
      container.appendChild(el('h3', { class: 'chart__title', id: headingId }, [document.createTextNode(config.title)]))
    }

    const meta = []
    if (config.metricLabel) meta.push(config.metricLabel)
    if (config.from || config.to) meta.push(`${config.from || '…'} → ${config.to || '…'}`)
    if (unit) meta.push(`Đơn vị: ${unit === 'đ' ? 'VND' : unit}`)
    meta.push(`Tổng: ${formatValue(total, unit)}`)
    container.appendChild(el('p', { class: 'chart__meta' }, [document.createTextNode(meta.join(' · '))]))

    const plot = el('div', {
      class: 'chart__plot',
      role: 'img',
      'aria-labelledby': config.title ? headingId : null,
      'aria-describedby': config.description ? null : null
    })
    if (config.description) container.appendChild(el('p', { class: 'visually-hidden' }, [document.createTextNode(config.description)]))

    rows.forEach(row => {
      const ratio = safeRatio(row.value, max)
      const column = el('div', { class: 'chart__column' })
      const barNode = el('div', {
        class: 'chart__bar',
        style: `height:${Math.max(2, Math.round(ratio * 100))}%`,
        title: `${row.label}: ${formatValue(row.value, unit)}`
      })
      column.appendChild(el('span', { class: 'chart__value' }, [document.createTextNode(truncate(formatValue(row.value, unit), 12))]))
      column.appendChild(barNode)
      column.appendChild(el('span', { class: 'chart__label' }, [document.createTextNode(truncate(row.label, 10))]))
      plot.appendChild(column)
    })
    container.appendChild(plot)

    container.appendChild(buildTable(
      config.title ? `${config.title} — bảng số liệu` : 'Bảng số liệu biểu đồ cột',
      ['Mốc thời gian', 'Giá trị'],
      rows.map(row => ({ label: row.label, value: Number(row.value || 0) })),
      value => formatValue(value, unit)
    ))

    return { ok: true, rows: rows.length, total, max, unit }
  }

  /**
   * Pie/donut thật bằng SVG stroke-dasharray.
   * config: { title, slices: [{key, label, count}], emptyLabel, description }
   */
  const pie = (container, config = {}) => {
    if (!container) return null
    container.classList.add('chart', 'chart--pie')
    container.setAttribute('data-chart', 'pie')

    const slices = (Array.isArray(config.slices) ? config.slices : [])
      .map(slice => ({ key: slice.key, label: slice.label, count: Math.max(0, Number(slice.count) || 0) }))
      .filter(slice => slice.count > 0)

    if (!slices.length) {
      renderEmpty(container, config.emptyLabel)
      return { ok: true, slices: 0, total: 0 }
    }

    clear(container)
    container.classList.remove('is-empty', 'is-invalid')

    const total = slices.reduce((sum, slice) => sum + slice.count, 0)
    const radius = 54
    const circumference = 2 * Math.PI * radius
    const headingId = `chart-${Math.random().toString(36).slice(2, 9)}-title`

    if (config.title) container.appendChild(el('h3', { class: 'chart__title', id: headingId }, [document.createTextNode(config.title)]))
    container.appendChild(el('p', { class: 'chart__meta' }, [document.createTextNode(`Tổng: ${formatNumber(total)} bản ghi · ${slices.length} nhóm`)]))

    const body = el('div', { class: 'chart__pie-body' })

    const svg = svgEl('svg', {
      class: 'chart__pie', viewBox: '0 0 140 140', role: 'img',
      'aria-label': config.title ? `${config.title}: ${slices.map(slice => `${slice.label} ${slice.count} (${Math.round(safeRatio(slice.count, total) * 100)}%)`).join(', ')}` : 'Biểu đồ tròn'
    })
    svg.appendChild(svgEl('circle', { class: 'chart__pie-track', cx: 70, cy: 70, r: radius, fill: 'none', 'stroke-width': 22 }))

    let offset = 0
    slices.forEach((slice, index) => {
      const ratio = safeRatio(slice.count, total)
      const dash = ratio * circumference
      svg.appendChild(svgEl('circle', {
        class: 'chart__pie-slice',
        cx: 70, cy: 70, r: radius, fill: 'none', 'stroke-width': 22,
        stroke: PALETTE[index % PALETTE.length],
        'stroke-dasharray': `${dash.toFixed(3)} ${(circumference - dash).toFixed(3)}`,
        'stroke-dashoffset': (-offset).toFixed(3),
        'data-slice-key': slice.key,
        transform: 'rotate(-90 70 70)'
      }))
      offset += dash
    })

    svg.appendChild(svgEl('text', { class: 'chart__pie-total', x: 70, y: 66, 'text-anchor': 'middle' }, [document.createTextNode(formatNumber(total))]))
    svg.appendChild(svgEl('text', { class: 'chart__pie-caption', x: 70, y: 84, 'text-anchor': 'middle' }, [document.createTextNode('tổng')]))
    body.appendChild(svg)

    const legend = el('ul', { class: 'chart__legend' })
    slices.forEach((slice, index) => {
      const percent = Math.round(safeRatio(slice.count, total) * 100)
      const item = el('li', { class: 'chart__legend-item' })
      item.appendChild(el('span', { class: 'chart__swatch', 'aria-hidden': 'true', style: `background:${PALETTE[index % PALETTE.length]}` }))
      item.appendChild(el('span', { class: 'chart__legend-label' }, [document.createTextNode(slice.label)]))
      item.appendChild(el('span', { class: 'chart__legend-value' }, [document.createTextNode(`${formatNumber(slice.count)} · ${percent}%`)]))
      legend.appendChild(item)
    })
    body.appendChild(legend)
    container.appendChild(body)

    container.appendChild(buildTable(
      config.title ? `${config.title} — bảng số liệu` : 'Bảng số liệu biểu đồ tròn',
      ['Nhóm', 'Số lượng', 'Tỷ lệ'],
      slices.map(slice => ({ label: slice.label, value: slice.count, percent: `${Math.round(safeRatio(slice.count, total) * 100)}%` })),
      value => formatNumber(value)
    ))

    return { ok: true, slices: slices.length, total }
  }

  window.EduChart = Object.freeze({ bar, pie, safeRatio, truncate, formatValue })
})()
