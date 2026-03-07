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

// Submit form to Supabase
const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.querySelector('.submit-form-btn');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
        btn.disabled = true;

        const { error } = await db
            .from('groups')
            .insert({
                name: form['group-name'].value,
                platform: form['platform'].value,
                category: form['category'].value,
                link: form['group-link'].value,
                description: form['description'].value,
                status: 'pending'
            });

        if (!error) {
            form.innerHTML = `
                <div style="text-align:center; padding: 30px;">
                    <i class="fa-solid fa-circle-check" style="font-size:60px; color:#25a244;"></i>
                    <h2 style="color:var(--text-primary); margin-top:15px;">Successfully Submitted!</h2>
                    <p style="color:gray;">Our team will review your submission shortly.</p>
                    <a href="index.html" style="color:#25a244;">← Back to Home</a>
                </div>
            `;
        } else {
            btn.innerHTML = 'Submit Group';
            btn.disabled = false;
            alert('Something went wrong! Please try again.');
        }
    });
}

// Fetch groups for homepage
async function loadGroups() {
    const { data, error } = await db
        .from('groups')
        .select('*')
        .eq('status', 'approved');

    if (error) {
        console.log('Error:', error);
        return;
    }

    const container = document.querySelector('.categories');
    if (!container) return;

    container.innerHTML = '';

    data.forEach(group => {
        container.innerHTML += `
            <div class="card">
                <div class="card-img"></div>
                <span class="badge ${group.platform}">${group.platform}</span>
                <h3>${group.name}</h3>
                <p>${group.description}</p>
                <div class="card-buttons">
                    <a href="${group.link}" target="_blank">Join Now</a>
                </div>
            </div>
        `;
    });
}

loadGroups();

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
            <div class="card-img"></div>
            <span class="badge ${group.platform}">${group.platform}</span>
            <h3>${group.name}</h3>
            <p>${group.description}</p>
            <div class="card-buttons">
              <a href="${group.link}" target="_blank">Join Now</a>
            </div>
          </div>
        `).join('')
      : `<div class="empty-category">
           <i class="fa-solid fa-box-open"></i>
           <p>Nothing here yet. <a href="submit.html">Be the first to submit!</a></p>
         </div>`;

    container.innerHTML += `
      <div class="explore-section">
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