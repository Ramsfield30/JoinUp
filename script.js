const themeToggle = document.getElementById('themeToggle');
const themeWave = document.getElementById('themeWave');
const themeIcon = document.querySelector('.theme-icon');
const htmlElement = document.documentElement;

function updateIcon(theme) {
    if (theme === 'dark') {
        themeIcon.innerHTML = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';
    } else {
        themeIcon.innerHTML = '<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>';
    }
}

function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    themeIcon.style.transform = 'rotate(360deg)';
    themeWave.classList.add('active');
    setTimeout(() => {
        htmlElement.setAttribute('data-theme', newTheme);
        updateIcon(newTheme);
    }, 50);
    setTimeout(() => {
        themeIcon.style.transform = 'rotate(0)';
    }, 300);
    setTimeout(() => {
        themeWave.classList.remove('active');
    }, 600);
    localStorage.setItem('theme', newTheme);
}

const savedTheme = localStorage.getItem('theme') || 'light';
htmlElement.setAttribute('data-theme', savedTheme);
updateIcon(savedTheme);

themeToggle.addEventListener('click', toggleTheme);

// Verified badge
function getVerifiedBadge(verified) {
    if (!verified) return '';
    return `<svg class="verified-badge" viewBox="0 0 24 24" width="16" height="16">
        <polygon points="12,1.8 14.6,3.4 17.6,3 18.8,5.8 21.6,7 21.2,10 22.8,12 21.2,14 21.6,17 18.8,18.2 17.6,21 14.6,20.6 12,22.2 9.4,20.6 6.4,21 5.2,18.2 2.4,17 2.8,14 1.2,12 2.8,10 2.4,7 5.2,5.8 6.4,3 9.4,3.4" fill="#1DA1F2"/>
        <path d="M9.5 13.8 L7.3 11.6 L6 12.9 L9.5 16.4 L18 7.9 L16.7 6.6 Z" fill="white"/>
    </svg>`;
}

// Platform badge with logo
function getPlatformBadge(platform, type) {
    return `<span class="badge ${platform}">
        <i class="fa-brands fa-${platform}"></i> ${type || ''}
    </span>`;
}

// Avatar function
function getAvatar(name, platform, image_url) {
    if (image_url) {
        return `<div class="card-img" style="background:#000;">
            <img src="${image_url}" style="width:100%; height:100%; object-fit:cover; border-radius:10px 10px 0 0;">
        </div>`;
    }
    const letter = name.charAt(0).toUpperCase();
    const color = platform === 'telegram'
        ? 'linear-gradient(135deg, #0088cc, #005f8e)'
        : 'linear-gradient(135deg, #25a244, #1a7a32)';
    return `<div class="card-img" style="background:${color}; display:flex; align-items:center; justify-content:center; font-size:40px; font-weight:bold; color:white;">${letter}</div>`;
}

// Submit form to Supabase
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.querySelector('.submit-form-btn');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
        btn.disabled = true;

        const { data: existing } = await db
            .from('groups')
            .select('link')
            .eq('link', form['group-link'].value);

        if (existing && existing.length > 0) {
            btn.innerHTML = 'Submit Group';
            btn.disabled = false;
            alert('⚠️ This group is already listed on JoinUp!');
            return;
        }

        // Upload image if provided
        let image_url = null;
        const logoFile = document.getElementById('group-logo').files[0];
        if (logoFile) {
            const fileExt = logoFile.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } = await db
                .storage
                .from('logos')
                .upload(fileName, logoFile);

            if (!uploadError) {
                const { data: urlData } = await db
                    .storage
                    .from('logos')
                    .getPublicUrl(fileName);
                image_url = urlData.publicUrl;
            }
        }

        const { error } = await db
            .from('groups')
            .insert({
                name: form['group-name'].value,
                platform: form['platform'].value,
                type: form['type'].value,
                category: form['category'].value,
                link: form['group-link'].value,
                description: form['description'].value,
                image_url: image_url,
                status: 'pending'
            });

        if (!error) {
            form.innerHTML = `
                <div style="text-align:center; padding: 30px;">
                    <i class="fa-solid fa-circle-check" style="font-size:60px; color:#25a244;"></i>
                    <h2 style="color:var(--text-primary); margin-top:15px;">Successfully Submitted!</h2>
                    <p style="color:gray;">Our team will review your submission shortly.</p>
                    <a href="/index" style="color:#25a244;">← Back to Home</a>
                </div>
            `;
        } else {
            btn.innerHTML = 'Submit Group';
            btn.disabled = false;
            alert('Something went wrong! Please try again.');
        }
    });
}

// Load trending groups from Supabase
async function loadTrending() {
    const { data, error } = await db
        .from('groups')
        .select('*')
        .eq('status', 'approved')
        .eq('featured', true);

    if (!data || data.length === 0) return;

    const container = document.querySelector('.trending-scroll');
    if (!container) return;

    container.innerHTML = '';

    data.forEach(group => {
        container.innerHTML += `
            <div class="trending-card">
                <div style="position:relative;">
                    ${getAvatar(group.name, group.platform, group.image_url)}
                    <span class="top-badge">TOP</span>
                </div>
                ${getPlatformBadge(group.platform, group.type)}
                <p class="trending-name">${group.name} ${getVerifiedBadge(group.verified)}</p>
                <p class="trending-desc">${group.description}</p>
                <div class="card-buttons" style="padding:10px;">
                    <a href="${group.link}" target="_blank">Join Now</a>
                </div>
            </div>
        `;
    });
}

loadTrending();

// Fetch groups for homepage as carousel
async function loadGroups() {
    const { data, error } = await db
        .from('groups')
        .select('*')
        .eq('status', 'approved');

    if (error) {
        console.log('Error:', error);
        return;
    }

    const container = document.querySelector('.latest-scroll');
    if (!container) return;

    container.innerHTML = '';

    data.forEach(group => {
        container.innerHTML += `
            <div class="latest-card" data-category="${group.category}">
                ${getAvatar(group.name, group.platform, group.image_url)}
                ${getPlatformBadge(group.platform, group.type)}
                <h3>${group.name} ${getVerifiedBadge(group.verified)}</h3>
                <p>${group.description}</p>
                <div class="card-buttons">
                    <a href="${group.link}" target="_blank">Join Now</a>
                </div>
            </div>
        `;
    });

    setupFilter();
}

loadGroups();

// Setup filter after cards load
function setupFilter() {
    const navLinks = document.querySelectorAll('header nav a');
    const latestScroll = document.querySelector('.latest-scroll');

    if (!latestScroll) return;

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            const category = this.getAttribute('data-category');
            filterGroups(category);
        });
    });
}

function filterGroups(category) {
    const cards = document.querySelectorAll('.latest-scroll .latest-card');
    cards.forEach(card => {
        if (category === 'all') {
            card.style.display = 'block';
        } else {
            if (card.getAttribute('data-category') === category) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        }
    });
}

// Explore page - load by category
const categories = [
    { name: 'Crypto', value: 'crypto', icon: 'fa-bitcoin-sign' },
    { name: 'Tech', value: 'tech', icon: 'fa-microchip' },
    { name: 'Education', value: 'education', icon: 'fa-graduation-cap' },
    { name: 'Business', value: 'business', icon: 'fa-briefcase' },
    { name: 'Gaming', value: 'gaming', icon: 'fa-gamepad' },
    { name: 'Religious', value: 'religious', icon: 'fa-hands-praying' },
    { name: 'Football', value: 'football', icon: 'fa-futbol' },
    { name: 'Fun', value: 'fun', icon: 'fa-face-laugh' },
    { name: 'Entertainment', value: 'entertainment', icon: 'fa-tv' },
];

async function loadExplore() {
    const container = document.getElementById('explore-container');
    if (!container) return;

    for (const cat of categories) {
        const { data, error } = await db
            .from('groups')
            .select('*')
            .eq('category', cat.value)
            .eq('status', 'approved')
            .limit(3);

        const cards = data && data.length > 0
            ? data.map(group => `
                <div class="card">
                    ${getAvatar(group.name, group.platform, group.image_url)}
                    ${getPlatformBadge(group.platform, group.type)}
                    <h3>${group.name} ${getVerifiedBadge(group.verified)}</h3>
                    <p>${group.description}</p>
                    <div class="card-buttons">
                        <a href="${group.link}" target="_blank">Join Now</a>
                    </div>
                </div>
            `).join('')
            : `<div class="empty-category">
                <i class="fa-solid fa-box-open"></i>
                <p>Nothing here yet. <a href="/submit">Be the first to submit!</a></p>
               </div>`;

        container.innerHTML += `
            <div class="explore-section" id="${cat.value}">
                <div class="section-header">
                    <h2><i class="fa-solid ${cat.icon}"></i> ${cat.name}</h2>
                    <a href="#" class="view-all">View All ›</a>
                </div>
                <div class="categories">
                    ${cards}
                </div>
            </div>
        `;
    }
}

loadExplore();

// Search functionality
const searchInput = document.querySelector('.hero-search input');
const searchBtn = document.querySelector('.search-btn');

function searchGroups(query) {
    const cards = document.querySelectorAll('.latest-scroll .latest-card');
    const container = document.querySelector('.latest-scroll');
    const q = query.toLowerCase().trim();
    let visibleCount = 0;

    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();

        if (q === '' || name.includes(q) || description.includes(q)) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });

    let noResults = document.getElementById('no-results');
    if (!noResults) {
        noResults = document.createElement('div');
        noResults.id = 'no-results';
        noResults.style.cssText = 'text-align:center; padding:30px; color:gray; width:100%;';
        container.appendChild(noResults);
    }

    if (visibleCount === 0 && q !== '') {
        noResults.style.display = 'block';
        noResults.innerHTML = '<i class="fa-solid fa-magnifying-glass" style="font-size:30px; margin-bottom:10px; display:block;"></i> No groups found for "<strong>' + q + '</strong>"';
    } else {
        noResults.style.display = 'none';
    }
}

if (searchInput) {
    searchInput.addEventListener('input', function() {
        searchGroups(this.value);
    });
}

if (searchBtn) {
    searchBtn.addEventListener('click', function() {
        searchGroups(searchInput.value);
    });
}

// Explore search functionality
const exploreInput = document.querySelector('.explore-search input');
const exploreBtn = document.querySelector('.explore-search .search-btn');

function searchExplore(query) {
    const cards = document.querySelectorAll('#explore-container .card');
    const q = query.toLowerCase().trim();

    cards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();

        if (q === '' || name.includes(q) || description.includes(q)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

if (exploreInput) {
    exploreInput.addEventListener('input', function() {
        searchExplore(this.value);
    });
}

if (exploreBtn) {
    exploreBtn.addEventListener('click', function() {
        searchExplore(exploreInput.value);
    });
}

// Custom dropdowns
document.querySelectorAll('.custom-select').forEach(select => {
    const selected = select.querySelector('.custom-select-selected');
    const options = select.querySelector('.custom-select-options');
    const hiddenInput = select.nextElementSibling;

    selected.addEventListener('click', function(e) {
        e.stopPropagation();
        document.querySelectorAll('.custom-select-options').forEach(o => o.classList.remove('open'));
        options.classList.toggle('open');
    });

    options.querySelectorAll('.custom-option').forEach(option => {
        option.addEventListener('click', function() {
            selected.textContent = this.textContent;
            hiddenInput.value = this.getAttribute('data-value');
            options.querySelectorAll('.custom-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            options.classList.remove('open');
        });
    });
});

document.addEventListener('click', function() {
    document.querySelectorAll('.custom-select-options').forEach(o => o.classList.remove('open'));
});

// Image preview for logo upload
const logoInput = document.getElementById('group-logo');
if (logoInput) {
    logoInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('preview-img').src = e.target.result;
                document.getElementById('image-preview').style.display = 'block';
                document.getElementById('upload-text').textContent = file.name;
            };
            reader.readAsDataURL(file);
        }
    });
}