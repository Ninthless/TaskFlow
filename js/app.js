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

// 任务管理类
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
    }

    // 加载任务数据
    loadTasks() {
        const tasksData = localStorage.getItem('tasks');
        return tasksData ? JSON.parse(tasksData) : [];
    }

    // 保存任务数据
    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    // 获取所有任务
    getTasks() {
        return this.tasks;
    }

    // 添加任务
    addTask(task) {
        task.id = Date.now().toString();
        task.createdAt = new Date().toISOString();
        this.tasks.push(task);
        this.saveTasks();
        return task;
    }

    // 更新任务
    updateTask(taskId, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            return this.tasks[taskIndex];
        }
        return null;
    }

    // 删除任务
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            this.tasks.splice(taskIndex, 1);
            this.saveTasks();
            return true;
        }
        return false;
    }

    // 切换任务完成状态
    toggleTaskComplete(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            return task;
        }
        return null;
    }
}

// 日程管理类
class CalendarManager {
    constructor() {
        this.events = this.loadEvents();
    }

    // 加载日程数据
    loadEvents() {
        const eventsData = localStorage.getItem('events');
        return eventsData ? JSON.parse(eventsData) : [];
    }

    // 保存日程数据
    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }

    // 获取所有日程
    getEvents() {
        return this.events;
    }

    // 添加日程
    addEvent(event) {
        event.id = Date.now().toString();
        event.createdAt = new Date().toISOString();
        this.events.push(event);
        this.saveEvents();
        return event;
    }

    // 更新日程
    updateEvent(eventId, updates) {
        const eventIndex = this.events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
            this.events[eventIndex] = { ...this.events[eventIndex], ...updates };
            this.saveEvents();
            return this.events[eventIndex];
        }
        return null;
    }

    // 删除日程
    deleteEvent(eventId) {
        const eventIndex = this.events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
            this.events.splice(eventIndex, 1);
            this.saveEvents();
            return true;
        }
        return false;
    }

    // 获取指定日期的日程
    getEventsByDate(date) {
        const targetDate = new Date(date);
        return this.events.filter(event => {
            const eventDate = new Date(event.start);
            return eventDate.getDate() === targetDate.getDate() &&
                   eventDate.getMonth() === targetDate.getMonth() &&
                   eventDate.getFullYear() === targetDate.getFullYear();
        });
    }
}

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
window.taskManager = new TaskManager();
window.calendarManager = new CalendarManager();
window.formatDate = formatDate;
window.formatTime = formatTime;
