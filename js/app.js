// 性能优化：使用 WeakMap 存储私有变量
const privateStore = new WeakMap();

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 性能优化：缓存 DOM 查询结果
const domCache = {
    themeToggle: null,
    themeIcon: null,
    mainContent: null,
    navLinks: null,
    init() {
        this.themeToggle = document.querySelector('.theme-toggle');
        this.themeIcon = this.themeToggle?.querySelector('.theme-icon');
        this.mainContent = document.querySelector('.main-content');
        this.navLinks = document.querySelectorAll('.nav-link');
    }
};

// 主题切换功能
function initThemeToggle() {
    if (!domCache.themeToggle || !domCache.themeIcon) {
        console.error('Theme toggle elements not found');
        return;
    }

    // 从localStorage获取保存的主题
    const preferredTheme = localStorage.getItem('theme') || 'light';
    setTheme(preferredTheme);

    // 使用防抖处理主题切换
    const debouncedThemeToggle = debounce(() => {
        const isLight = document.body.classList.contains('light');
        setTheme(isLight ? 'dark' : 'light');
    }, 150);

    domCache.themeToggle.addEventListener('click', debouncedThemeToggle, { passive: true });
}

// 使用 requestAnimationFrame 优化主题切换动画
function setTheme(theme) {
    requestAnimationFrame(() => {
        document.body.classList.remove('light', 'dark');
        document.body.classList.add(theme);
        if (domCache.themeIcon) {
            domCache.themeIcon.textContent = theme === 'light' ? 'dark_mode' : 'light_mode';
        }
        try {
            localStorage.setItem('theme', theme);
        } catch (e) {
            console.warn('Failed to save theme preference:', e);
        }
    });
}

// 设置活动链接
function setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    requestAnimationFrame(() => {
        domCache.navLinks?.forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            if (href === currentPage || 
                (currentPage === '' && href === 'index.html') || 
                (currentPage === '/' && href === 'index.html')) {
                link.classList.add('active');
            }
        });
    });
}

// 添加导航事件监听
function addNavigationListeners() {
    domCache.navLinks?.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            
            if (domCache.mainContent) {
                requestAnimationFrame(() => {
                    domCache.mainContent.style.opacity = '0';
                    domCache.mainContent.style.transform = 'translateY(20px)';
                });
            }

            // 使用 requestIdleCallback 延迟导航
            if ('requestIdleCallback' in window) {
                requestIdleCallback(() => {
                    window.location.href = href;
                });
            } else {
                setTimeout(() => {
                    window.location.href = href;
                }, 200);
            }
        }, { passive: false });
    });
}

// 使用 Intersection Observer 优化页面加载动画
const loadObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            requestAnimationFrame(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            });
            loadObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    domCache.init();
    if (domCache.mainContent) {
        loadObserver.observe(domCache.mainContent);
    }
}, { passive: true });

// 工具函数
function formatDate(date) {
    return new Date(date).toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

// 导出全局变量
window.formatDate = formatDate;
window.formatTime = formatTime;
