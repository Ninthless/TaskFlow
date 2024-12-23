// 主题切换功能
function initThemeToggle() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) {
        console.error('Theme toggle button not found');
        return;
    }

    const themeIcon = themeToggle.querySelector('.theme-icon');
    if (!themeIcon) {
        console.error('Theme icon not found');
        return;
    }

    // 从localStorage获取保存的主题
    const preferredTheme = localStorage.getItem('theme') || 'light';
    setTheme(preferredTheme);

    themeToggle.addEventListener('click', () => {
        const isLight = document.body.classList.contains('light');
        setTheme(isLight ? 'dark' : 'light');
    });
}

function setTheme(theme) {
    document.body.classList.remove('light', 'dark');
    document.body.classList.add(theme);
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
    }
    localStorage.setItem('theme', theme);
}

// 设置活动链接
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        if (href === currentPage || 
            (currentPage === '' && href === 'index.html') || 
            (currentPage === '/' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// 添加导航事件监听
function addNavigationListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            const mainContent = document.querySelector('.main-content');
            
            // 添加离开动画
            if (mainContent) {
                mainContent.style.opacity = '0';
                mainContent.style.transform = 'translateY(20px)';
            }

            // 等待动画完成后加载新页面
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        });
    });
}

// 添加页面加载完成后的处理
window.addEventListener('load', () => {
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateY(0)';
    }
});
