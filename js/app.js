// 主题切换功能
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
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

// 添加页面过渡处理
function handleNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            // 添加离开动画
            document.querySelector('.main-content').classList.add('page-exit');
            
            // 等待动画完成后加载新页面
            setTimeout(() => {
                window.location.href = href;
            }, 200);
        });
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 定义设置活动链接的函数
    function setActiveLink() {
        let currentPage = window.location.pathname.split('/').pop() || 'index.html';
        if (currentPage === '') {
            currentPage = 'index.html';
        }

        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            // 移除所有active类
            link.classList.remove('active');
            // 为当前页面添加active类
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            }
        });
    }

    // 设置当前页面的导航项为激活状态
    setActiveLink();

    // 初始化主题切换
    initThemeToggle();

    // 监听导航容器的变化
    const navContainer = document.getElementById('nav-container');
    if (navContainer) {
        const observer = new MutationObserver(() => {
            setActiveLink();
            handleNavigation(); // 添加导航处理
        });
        
        observer.observe(navContainer, {
            childList: true,
            subtree: true
        });
    }
});

// 添加页面加载完成后的处理
window.addEventListener('load', () => {
    document.querySelector('.main-content').style.opacity = '1';
});
