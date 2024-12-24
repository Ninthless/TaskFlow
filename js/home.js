// 主页功能管理类
class HomeUI {
    constructor() {
        this.taskManager = window.taskManager;
        this.calendarManager = window.calendarManager;
        this.initializeElements();
        this.bindEventHandlers();
    }

    // 初始化页面元素
    initializeElements() {
        // 统计数字元素
        this.pendingTasksCount = document.getElementById('pending-tasks-count');
        this.todayTasksCount = document.getElementById('today-tasks-count');
        this.overdueTasksCount = document.getElementById('overdue-tasks-count');
        this.completedTasksCount = document.getElementById('completed-tasks-count');

        // 列表容器
        this.recentTasksList = document.getElementById('recent-tasks-list');
        this.todayScheduleList = document.getElementById('today-schedule-list');

        // 快速操作按钮
        this.quickAddTaskBtn = document.getElementById('quick-add-task');
        this.quickAddEventBtn = document.getElementById('quick-add-event');
    }

    // 绑定事件处理
    bindEventHandlers() {
        // 快速添加任务
        this.quickAddTaskBtn.addEventListener('click', () => {
            window.location.href = 'tasks.html#new';
        });

        // 快速添加日程
        this.quickAddEventBtn.addEventListener('click', () => {
            window.location.href = 'calendar.html#new';
        });

        // 监听存储变化
        window.addEventListener('storage', (event) => {
            if (event.key === 'tasks' || event.key === 'events') {
                this.initialize();
            }
        });
    }

    // 更新任务统计
    updateTaskStats() {
        const tasks = this.taskManager.getTasks();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // 待完成任务数
        const pendingTasks = tasks.filter(task => !task.completed);
        this.pendingTasksCount.textContent = pendingTasks.length;

        // 今日任务数
        const todayTasks = tasks.filter(task => {
            const taskDate = new Date(task.dueDate);
            return taskDate.getDate() === today.getDate() &&
                   taskDate.getMonth() === today.getMonth() &&
                   taskDate.getFullYear() === today.getFullYear();
        });
        this.todayTasksCount.textContent = todayTasks.length;

        // 已逾期任务数
        const overdueTasks = tasks.filter(task => {
            return !task.completed && new Date(task.dueDate) < now;
        });
        this.overdueTasksCount.textContent = overdueTasks.length;

        // 已完成任务数
        const completedTasks = tasks.filter(task => task.completed);
        this.completedTasksCount.textContent = completedTasks.length;
    }

    // 更新近期任务列表
    updateRecentTasks() {
        this.recentTasksList.innerHTML = '';
        const tasks = this.taskManager.getTasks()
            .filter(task => !task.completed)
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
            .slice(0, 5);

        if (tasks.length === 0) {
            this.recentTasksList.innerHTML = `
                <div class="empty-state">
                    <md-icon>task</md-icon>
                    <p class="empty-state-text">暂无待完成的任务</p>
                </div>
            `;
            return;
        }

        tasks.forEach(task => {
            const taskElement = this.createRecentTaskElement(task);
            this.recentTasksList.appendChild(taskElement);
        });
    }

    // 创建近期任务元素
    createRecentTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item-home';
        
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < new Date();
        
        taskElement.innerHTML = `
            <md-icon style="color: ${this.getPriorityColor(task.priority)}">
                ${this.getPriorityIcon(task.priority)}
            </md-icon>
            <span class="task-name">${task.name}</span>
            <span class="task-due-date" style="color: ${isOverdue ? 'var(--md-sys-color-error)' : 'inherit'}">
                ${window.formatDate(dueDate)}
            </span>
        `;

        taskElement.addEventListener('click', () => {
            window.location.href = `tasks.html#${task.id}`;
        });

        return taskElement;
    }

    // 更新今日日程列表
    updateTodaySchedule() {
        this.todayScheduleList.innerHTML = '';
        const today = new Date();
        const events = this.calendarManager.getEventsByDate(today)
            .sort((a, b) => new Date(a.start) - new Date(b.start));

        if (events.length === 0) {
            this.todayScheduleList.innerHTML = `
                <div class="empty-state">
                    <md-icon>event</md-icon>
                    <p class="empty-state-text">今日暂无日程安排</p>
                </div>
            `;
            return;
        }

        events.forEach(event => {
            const eventElement = this.createScheduleElement(event);
            this.todayScheduleList.appendChild(eventElement);
        });
    }

    // 创建日程元素
    createScheduleElement(event) {
        const eventElement = document.createElement('div');
        eventElement.className = 'schedule-item';
        
        const startTime = new Date(event.start);
        const endTime = new Date(event.end);
        
        eventElement.innerHTML = `
            <div class="schedule-time">${window.formatTime(startTime)}</div>
            <div class="schedule-content">
                <div class="schedule-title">${event.title}</div>
                ${event.location ? `
                    <div class="schedule-location">
                        <md-icon>location_on</md-icon>
                        ${event.location}
                    </div>
                ` : ''}
            </div>
        `;

        eventElement.addEventListener('click', () => {
            window.location.href = `calendar.html#${event.id}`;
        });

        return eventElement;
    }

    // 获取优先级颜色
    getPriorityColor(priority) {
        const colors = {
            high: 'var(--md-sys-color-error)',
            medium: 'var(--md-sys-color-warning)',
            low: 'var(--md-sys-color-tertiary)'
        };
        return colors[priority] || colors.medium;
    }

    // 获取优先级图标
    getPriorityIcon(priority) {
        const icons = {
            high: 'priority_high',
            medium: 'drag_handle',
            low: 'low_priority'
        };
        return icons[priority] || icons.medium;
    }

    // 初始化主页
    initialize() {
        this.updateTaskStats();
        this.updateRecentTasks();
        this.updateTodaySchedule();
    }
}

// 初始化主页功能
function initHome() {
    const homeUI = new HomeUI();
    homeUI.initialize();
} 