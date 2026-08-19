// ── THEME ──
const themeToggle = document.getElementById('themeToggle')
const themeWave = document.getElementById('themeWave')
const themeIcon = document.querySelector('.theme-icon')
const htmlElement = document.documentElement

function updateIcon(theme) {
  if (theme === 'dark') {
    themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'
  } else {
    themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>'
  }
}

function toggleTheme() {
  const currentTheme = htmlElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'light' ? 'dark' : 'light'
  themeIcon.style.transform = 'rotate(360deg)'
  themeWave.classList.add('active')
  setTimeout(() => {
    htmlElement.setAttribute('data-theme', newTheme)
    updateIcon(newTheme)
  }, 50)
  setTimeout(() => { themeIcon.style.transform = 'rotate(0)' }, 300)
  setTimeout(() => { themeWave.classList.remove('active') }, 600)
  localStorage.setItem('theme', newTheme)
}

const savedTheme = localStorage.getItem('theme') || 'dark'
htmlElement.setAttribute('data-theme', savedTheme)
updateIcon(savedTheme)
if (themeToggle) themeToggle.addEventListener('click', toggleTheme)


// ── HELPERS ──
function getVerifiedBadge(verified) {
  if (!verified) return ''
  return `<svg class="verified-badge" viewBox="0 0 24 24" width="16" height="16">
    <polygon points="12,1.8 14.6,3.4 17.6,3 18.8,5.8 21.6,7 21.2,10 22.8,12 21.2,14 21.6,17 18.8,18.2 17.6,21 14.6,20.6 12,22.2 9.4,20.6 6.4,21 5.2,18.2 2.4,17 2.8,14 1.2,12 2.8,10 2.4,7 5.2,5.8 6.4,3 9.4,3.4" fill="#1DA1F2"/>
    <path d="M9.5 13.8 L7.3 11.6 L6 12.9 L9.5 16.4 L18 7.9 L16.7 6.6 Z" fill="white"/>
  </svg>`
}

function getPlatformBadge(platform, type) {
  return `<span class="badge ${platform}">
    <i class="fa-brands fa-${platform}"></i> ${type || ''}
  </span>`
}

function formatMembers(members) {
  if (!members) return ''
  if (members >= 1000) return `${(members / 1000).toFixed(1)}K members`
  return `${members} members`
}

const groupDescriptions = {}

function toggleDesc(id) {
  const el = document.getElementById(`desc-${id}`)
  const btn = el.nextElementSibling
  const full = groupDescriptions[id]
  if (el.dataset.expanded === 'true') {
    el.textContent = full.substring(0, 80) + '...'
    el.dataset.expanded = 'false'
    btn.textContent = 'Read more'
  } else {
    el.textContent = full
    el.dataset.expanded = 'true'
    btn.textContent = 'Read less'
  }
}

function createGroupCard(group) {
  const desc = group.description || ''
  const shortDesc = desc.length > 80 ? desc.substring(0, 80) + '...' : desc
  const hasMore = desc.length > 80

  if (hasMore) groupDescriptions[group.id] = desc

  return `
    <div class="group-card">
      <div class="group-card-header">
        ${group.image_url
          ? `<img src="${group.image_url}" class="group-avatar" alt="${group.name}" onerror="this.style.display='none'">`
          : `<div class="group-avatar-placeholder"><i class="fa-solid fa-users"></i></div>`
        }
        <div class="group-info">
          <h3>${group.name} ${getVerifiedBadge(group.verified)}</h3>
          <p class="group-desc" id="desc-${group.id}" data-expanded="false">${shortDesc}</p>
          ${hasMore ? `<span class="read-more" onclick="toggleDesc('${group.id}')">Read more</span>` : ''}
        </div>
      </div>
      <div class="group-card-footer">
        ${getPlatformBadge(group.platform, group.type)}
        <span class="category-badge">${group.category}</span>
        ${group.members ? `<span class="members-count"><i class="fa-solid fa-users"></i> ${formatMembers(group.members)}</span>` : ''}
        <a href="${group.link}" target="_blank" rel="noopener noreferrer" class="join-btn">
          Join ${group.type === 'channel' ? 'Channel' : 'Group'}
        </a>
      </div>
    </div>
  `
}

function createSearchResult(group) {
  const desc = group.description || ''
  const shortDesc = desc.length > 100 ? desc.substring(0, 100) + '...' : desc

  return `
    <a href="${group.link}" target="_blank" rel="noopener noreferrer" class="search-result-item">
     ${group.image_url
  ? `<img src="${group.image_url}" class="group-avatar" alt="${group.name}" onerror="this.parentNode.innerHTML='<div class=\\'group-avatar-placeholder\\'><i class=\\'fa-solid fa-users\\'></i></div>'">`
  : `<div class="group-avatar-placeholder"><i class="fa-solid fa-users"></i></div>`
}
      <div class="search-result-info">
        <h3>${group.name} ${getVerifiedBadge(group.verified)}</h3>
        <p>${shortDesc}</p>
        <div class="search-result-meta">
          <span class="badge ${group.platform}">${group.platform}</span>
          <span class="category-badge">${group.category}</span>
          ${group.members ? `<span class="members-count">${formatMembers(group.members)}</span>` : ''}
        </div>
      </div>
      <div class="search-result-action">
        <span class="join-btn">Join</span>
      </div>
    </a>
  `
}


// ── API CALLS ──
async function fetchGroups(params = {}) {
  try {
    const query = new URLSearchParams(params).toString()
    const res = await fetch(`/api/groups${query ? '?' + query : ''}`)
    const data = await res.json()
    if (!data.success) throw new Error(data.error)
    return data.data
  } catch (err) {
    return []
  }
}


// ── SEARCH ──
let searchTimeout = null

function setupSearch() {
  const searchInputs = document.querySelectorAll('input[type="search"]')
  const searchBtns = document.querySelectorAll('.search-btn')

  searchInputs.forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSearch(input.value.trim())
    })
    input.addEventListener('input', () => {
      clearTimeout(searchTimeout)
      searchTimeout = setTimeout(() => {
        if (input.value.trim().length >= 2) handleSearch(input.value.trim())
        if (input.value.trim().length === 0) handleSearch('')
      }, 400)
    })
  })

  searchBtns.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      const input = searchInputs[i]
      if (input) handleSearch(input.value.trim())
    })
  })
}

async function handleSearch(query) {
  const page = getCurrentPage()

  if (page === 'home') {
    const latestContainer = document.querySelector('.latest-scroll')
    const trendingContainer = document.querySelector('.trending-scroll')
    if (!latestContainer) return

    if (!query) {
      loadHomePage()
      return
    }

    if (trendingContainer) trendingContainer.innerHTML = `<div class="section-header"><h2>Search Results</h2></div>`
    latestContainer.innerHTML = '<div class="search-loading"><div class="spinner"></div> Searching...</div>'

    try {
      const groups = await fetchGroups({ search: query })
      if (groups.length === 0) {
        latestContainer.innerHTML = `<div class="empty-state"><i class="fa-solid fa-search"></i><p>No groups found for "<strong>${query}</strong>"</p></div>`
      } else {
        latestContainer.innerHTML = `<div class="search-results-list">${groups.map(createSearchResult).join('')}</div>`
      }
    } catch (err) {
      latestContainer.innerHTML = '<div class="error-state">Search failed. Try again.</div>'
    }
  }

  if (page === 'explore') {
    const container = document.getElementById('explore-container')
    if (!container) return

    if (!query) {
      loadExplorePage()
      return
    }

    container.innerHTML = '<div class="search-loading"><div class="spinner"></div> Searching...</div>'

    try {
      const groups = await fetchGroups({ search: query })
      if (groups.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-search"></i><p>No groups found for "<strong>${query}</strong>"</p></div>`
      } else {
        container.innerHTML = `
          <div class="section-header">
            <h2>Results for "${query}" (${groups.length})</h2>
          </div>
          <div class="search-results-list">
            ${groups.map(createSearchResult).join('')}
          </div>
        `
      }
    } catch (err) {
      container.innerHTML = '<div class="error-state">Search failed. Try again.</div>'
    }
  }
}


// ── PAGE DETECTION ──
function getCurrentPage() {
  const path = window.location.pathname
  if (path === '/' || path === '/index.html') return 'home'
  if (path.includes('/explore')) return 'explore'
  if (path.includes('/submit')) return 'submit'
  return 'other'
}


// ── HOME PAGE ──
async function loadHomePage() {
  const trendingContainer = document.querySelector('.trending-scroll')
  const latestContainer = document.querySelector('.latest-scroll')

  if (!trendingContainer || !latestContainer) return

  trendingContainer.innerHTML = '<div class="search-loading"><div class="spinner"></div></div>'
  latestContainer.innerHTML = '<div class="search-loading"><div class="spinner"></div></div>'

  try {
    const trending = await fetchGroups({ featured: 'true', limit: 10 })
    if (trending.length === 0) {
      trendingContainer.innerHTML = '<div class="empty-state">No trending groups yet.</div>'
    } else {
      trendingContainer.innerHTML = trending.map(createGroupCard).join('')
    }

    const latest = await fetchGroups({ limit: 20 })
    if (latest.length === 0) {
      latestContainer.innerHTML = '<div class="empty-state">No groups yet. <a href="/submit">Be the first to submit!</a></div>'
    } else {
      latestContainer.innerHTML = latest.map(createGroupCard).join('')
    }
  } catch (err) {
    trendingContainer.innerHTML = '<div class="error-state">Failed to load groups.</div>'
    latestContainer.innerHTML = '<div class="error-state">Failed to load groups.</div>'
  }
}


// ── CATEGORY FILTER (HOME) ──
function setupCategoryFilter() {
  const navLinks = document.querySelectorAll('nav a[data-category]')
  navLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
      e.preventDefault()
      navLinks.forEach(l => l.classList.remove('active'))
      link.classList.add('active')

      const category = link.getAttribute('data-category')
      const latestContainer = document.querySelector('.latest-scroll')
      if (!latestContainer) return

      latestContainer.innerHTML = '<div class="search-loading"><div class="spinner"></div></div>'

      try {
        const groups = await fetchGroups({ category, limit: 20 })
        if (groups.length === 0) {
          latestContainer.innerHTML = '<div class="empty-state">No groups in this category yet.</div>'
        } else {
          latestContainer.innerHTML = groups.map(createGroupCard).join('')
        }
      } catch (err) {
        latestContainer.innerHTML = '<div class="error-state">Failed to load groups.</div>'
      }
    })
  })
}


// ── EXPLORE PAGE ──
const CATEGORIES = ['education', 'tech', 'entertainment', 'business', 'gaming', 'religious', 'football', 'fun', 'crypto']

async function loadExplorePage() {
  const container = document.getElementById('explore-container')
  if (!container) return

  container.innerHTML = '<div class="search-loading"><div class="spinner"></div> Loading...</div>'

  try {
    const groups = await fetchGroups({ limit: 100 })

    if (groups.length === 0) {
      container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-search"></i><p>No groups yet. <a href="/submit">Submit the first one!</a></p></div>'
      return
    }

    const byCategory = {}
    groups.forEach(g => {
      if (!byCategory[g.category]) byCategory[g.category] = []
      byCategory[g.category].push(g)
    })

    let html = ''
    CATEGORIES.forEach(cat => {
      const catGroups = byCategory[cat] || []
      if (catGroups.length === 0) return
      html += `
        <section id="${cat}">
          <div class="section-header">
            <h2>${cat.charAt(0).toUpperCase() + cat.slice(1)}</h2>
            <a href="#" class="view-all">See all ›</a>
          </div>
          <div class="category-carousel">
            ${catGroups.map(createGroupCard).join('')}
          </div>
        </section>
      `
    })

    const otherGroups = groups.filter(g => !CATEGORIES.includes(g.category))
    if (otherGroups.length > 0) {
      html += `
        <section id="other">
          <div class="section-header"><h2>Other</h2></div>
          <div class="category-carousel">
            ${otherGroups.map(createGroupCard).join('')}
          </div>
        </section>
      `
    }

    container.innerHTML = html
  } catch (err) {
    container.innerHTML = '<div class="error-state">Failed to load groups. Please try again.</div>'
  }
}


// ── SUBMIT PAGE ──
function setupSubmitForm() {
  const form = document.querySelector('form')
  if (!form) return

  document.querySelectorAll('.custom-select').forEach(select => {
    const selected = select.querySelector('.custom-select-selected')
    const options = select.querySelector('.custom-select-options')

    selected.addEventListener('click', () => {
      options.classList.toggle('open')
    })

    options.querySelectorAll('.custom-option').forEach(option => {
      option.addEventListener('click', () => {
        selected.textContent = option.textContent
        const hiddenInput = document.getElementById(select.id.replace('-select', '-value'))
        if (hiddenInput) hiddenInput.value = option.getAttribute('data-value')
        options.classList.remove('open')
      })
    })
  })

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-select')) {
      document.querySelectorAll('.custom-select-options').forEach(o => o.classList.remove('open'))
    }
  })

  form.addEventListener('submit', async (e) => {
    e.preventDefault()

    const submitBtn = form.querySelector('button[type="submit"]')
    if (submitBtn) {
      submitBtn.disabled = true
      submitBtn.textContent = 'Submitting...'
    }

    const data = {
      name: form.querySelector('[name="group-name"]')?.value?.trim(),
      platform: document.getElementById('platform-value')?.value,
      type: document.getElementById('type-value')?.value,
      category: document.getElementById('category-value')?.value,
      description: form.querySelector('[name="description"]')?.value?.trim(),
      link: form.querySelector('[name="link"]')?.value?.trim(),
      members: form.querySelector('[name="members"]')?.value?.trim(),
      email: form.querySelector('[name="email"]')?.value?.trim()
    }

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await res.json()

      if (result.success) {
        form.innerHTML = `
          <div class="success-state">
            <i class="fa-solid fa-circle-check"></i>
            <h3>Submitted Successfully!</h3>
            <p>Your group has been submitted for review. We'll approve it within 24 hours.</p>
            <a href="/" class="join-btn">Back to Home</a>
          </div>
        `
      } else {
        alert(result.error || 'Submission failed. Please try again.')
        if (submitBtn) {
          submitBtn.disabled = false
          submitBtn.textContent = 'Submit Group'
        }
      }
    } catch (err) {
      alert('Something went wrong. Please try again.')
      if (submitBtn) {
        submitBtn.disabled = false
        submitBtn.textContent = 'Submit Group'
      }
    }
  })
}


// ── STATS ──
async function loadStats() {
  try {
    const res = await fetch('/api/groups?limit=1000')
    const data = await res.json()
    if (!data.success) return

    const total = data.data.length
    const telegram = data.data.filter(g => g.platform === 'telegram').length
    const whatsapp = data.data.filter(g => g.platform === 'whatsapp').length

    const statTotal = document.getElementById('stat-total')
    const statTelegram = document.getElementById('stat-telegram')
    const statWhatsapp = document.getElementById('stat-whatsapp')

    if (statTotal) statTotal.textContent = total + '+'
    if (statTelegram) statTelegram.textContent = telegram + '+'
    if (statWhatsapp) statWhatsapp.textContent = whatsapp + '+'
  } catch (e) {}
}


// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  const page = getCurrentPage()

  setupSearch()

  if (page === 'home') {
    loadHomePage()
    loadStats()
    setupCategoryFilter()
  }

  if (page === 'explore') {
    loadExplorePage()
  }

  if (page === 'submit') {
    setupSubmitForm()
  }
})