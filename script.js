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

const form = document.querySelector('form');
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = document.querySelector('.submit-form-btn');
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
        btn.disabled = true;
        const response = await fetch('https://formspree.io/f/mkovaygp', {
            method: 'POST',
            body: new FormData(form),
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            form.innerHTML = `
                <div style="text-align:center; padding: 30px;">
                    <i class="fa-solid fa-circle-check" style="font-size:60px; color:#25a244;"></i>
                    <h2 style="color:var(--text-primary); margin-top:15px;">Successfully Submitted!</h2>
                    <p style="color:gray;">Our team will review your submission shortly.</p>
                    <a href="index.html" style="color:#25a244;">← Back to Home</a>
                </div>
            `;
        }
    });
}
