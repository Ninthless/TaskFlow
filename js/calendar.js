class Calendar {
    constructor() {
        this.today = new Date();
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();
        this.selectedDate = this.today;
        this.events = new Map(); // 用于存储日程数据
        
        this.calendarArea = document.querySelector('.calendar-area');
        this.scheduleList = document.querySelector('.calendar-schedule-List');
        
        // 从 LocalStorage 加载数据
        this.loadEventsFromStorage();
        
        this.initializeCalendar();
        this.initializeScheduleList();
    }

    // 从 LocalStorage 加载数据
    loadEventsFromStorage() {
        try {
            const storedEvents = localStorage.getItem('calendarEvents');
            if (storedEvents) {
                // 将存储的数据转换回 Map 对象
                const eventsObject = JSON.parse(storedEvents);
                this.events = new Map(Object.entries(eventsObject));
            }
        } catch (error) {
            console.error('加载日程数据失败:', error);
            this.events = new Map();
        }
    }

    // 保存数据到 LocalStorage
    saveEventsToStorage() {
        try {
            // 将 Map 转换为普通对象以便存储
            const eventsObject = Object.fromEntries(this.events);
            localStorage.setItem('calendarEvents', JSON.stringify(eventsObject));
        } catch (error) {
            console.error('保存日程数据失败:', error);
        }
    }

    initializeCalendar() {
        // 创建日历基本结构
        const calendarHTML = `
            <div class="calendar-header">
                <div class="calendar-nav">
                    <md-filled-tonal-icon-button class="prev-month">
                        <md-icon>chevron_left</md-icon>
                    </md-filled-tonal-icon-button>
                    <h2 class="current-month-year"></h2>
                    <md-filled-tonal-icon-button class="next-month">
                        <md-icon>chevron_right</md-icon>
                    </md-filled-tonal-icon-button>
                </div>
                <div class="calendar-actions">
                    <md-filled-tonal-button class="today-button">
                        <md-icon slot="icon">today</md-icon>
                        今天
                    </md-filled-tonal-button>
                </div>
            </div>
            <div class="calendar-body">
                <div class="weekdays"></div>
                <div class="days"></div>
            </div>
        `;
        this.calendarArea.innerHTML = calendarHTML;

        // 绑定事件监听器
        this.calendarArea.querySelector('.prev-month').addEventListener('click', () => this.changeMonth(-1));
        this.calendarArea.querySelector('.next-month').addEventListener('click', () => this.changeMonth(1));
        this.calendarArea.querySelector('.today-button').addEventListener('click', () => this.goToToday());

        this.renderCalendar();
    }

    renderCalendar() {
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        const weekdaysContainer = this.calendarArea.querySelector('.weekdays');
        const daysContainer = this.calendarArea.querySelector('.days');
        
        // 更新月份年份显示
        this.calendarArea.querySelector('.current-month-year').textContent = 
            `${this.currentYear}年 ${this.currentMonth + 1}月`;

        // 渲染星期
        weekdaysContainer.innerHTML = weekdays.map(day => 
            `<div class="weekday">${day}</div>`
        ).join('');

        // 计算日期
        const firstDay = new Date(this.currentYear, this.currentMonth, 1);
        const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
        const startingDay = firstDay.getDay();
        const totalDays = lastDay.getDate();

        let daysHTML = '';
        
        // 上月末尾日期
        const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
        for (let i = startingDay - 1; i >= 0; i--) {
            const day = prevMonthLastDay - i;
            daysHTML += `<div class="day other-month">${day}</div>`;
        }

        // 当月日期
        for (let day = 1; day <= totalDays; day++) {
            const date = new Date(this.currentYear, this.currentMonth, day);
            const dateStr = this.formatDate(date);
            const isToday = this.isToday(date);
            const isSelected = this.isSelected(date);
            const hasEvents = this.events.has(dateStr);
            const events = this.events.get(dateStr) || [];
            
            daysHTML += `
                <div class="day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasEvents ? 'has-events' : ''}"
                     data-date="${dateStr}"
                     role="button"
                     tabindex="0">
                    <span class="day-number">${day}</span>
                    ${hasEvents ? `
                        <div class="event-indicator">
                            <span class="event-count">${events.length}</span>
                        </div>
                    ` : ''}
                </div>
            `;
        }

        // 下月开始日期
        const remainingDays = 42 - (startingDay + totalDays);
        for (let day = 1; day <= remainingDays; day++) {
            daysHTML += `<div class="day other-month">${day}</div>`;
        }

        daysContainer.innerHTML = daysHTML;

        // 添加日期点击事件
        daysContainer.querySelectorAll('.day:not(.other-month)').forEach(dayElement => {
            dayElement.addEventListener('click', () => {
                const dateStr = dayElement.dataset.date;
                if (dateStr) {
                    this.selectDate(new Date(dateStr));
                }
            });
        });
    }

    initializeScheduleList() {
        const scheduleListHTML = `
            <div class="schedule-header">
                <h3 class="selected-date"></h3>
                <md-filled-button class="add-schedule">
                    <md-icon slot="icon">add</md-icon>
                    添加日程
                </md-filled-button>
            </div>
            <md-divider></md-divider>
            <div class="schedule-list"></div>
        `;
        this.scheduleList.innerHTML = scheduleListHTML;

        // 绑定添加日程按钮事件
        this.scheduleList.querySelector('.add-schedule').addEventListener('click', () => {
            this.showAddScheduleDialog();
        });

        this.updateScheduleList();
    }

    updateScheduleList() {
        const selectedDateStr = this.formatDate(this.selectedDate);
        const scheduleListContainer = this.scheduleList.querySelector('.schedule-list');
        const selectedDateDisplay = this.scheduleList.querySelector('.selected-date');
        
        // 更新日期显示
        selectedDateDisplay.textContent = `${this.selectedDate.getFullYear()}年${this.selectedDate.getMonth() + 1}月${this.selectedDate.getDate()}日`;

        // 获取当天日程
        const events = this.events.get(selectedDateStr) || [];
        
        if (events.length === 0) {
            scheduleListContainer.innerHTML = `
                <div class="empty-state">
                    <md-icon class="empty-icon">event_busy</md-icon>
                    <p>暂无日程安排</p>
                </div>
            `;
            return;
        }

        // 按时间排序
        events.sort((a, b) => a.time.localeCompare(b.time));

        // 渲染日程列表
        scheduleListContainer.innerHTML = events.map((event, index) => `
            <md-list-item>
                <div slot="headline">${event.title}</div>
                <div slot="supporting-text">
                    <md-icon class="schedule-time-icon">schedule</md-icon>
                    ${event.time}
                    ${event.description ? `<br>${event.description}` : ''}
                </div>
                <md-icon slot="start">${event.icon || 'event_note'}</md-icon>
                <div slot="end">
                    <md-icon-button class="edit-event" data-index="${index}">
                        <md-icon>edit</md-icon>
                    </md-icon-button>
                    <md-icon-button class="delete-event" data-index="${index}">
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                </div>
            </md-list-item>
        `).join('');

        // 添加编辑和删除事件监听
        scheduleListContainer.querySelectorAll('.edit-event').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.editSchedule(selectedDateStr, index);
            });
        });

        scheduleListContainer.querySelectorAll('.delete-event').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.currentTarget.dataset.index);
                this.deleteSchedule(selectedDateStr, index);
            });
        });
    }

    showAddScheduleDialog(existingEvent = null, dateStr = null) {
        const isEdit = !!existingEvent;
        const dialog = document.createElement('md-dialog');
        dialog.innerHTML = `
            <div slot="headline">${isEdit ? '编辑日程' : '添加日程'}</div>
            <form slot="content" id="schedule-form" class="schedule-form">
                <md-filled-text-field
                    label="标题"
                    required
                    value="${isEdit ? existingEvent.title : ''}"
                    name="title">
                </md-filled-text-field>
                
                <md-filled-text-field
                    label="时间"
                    type="time"
                    required
                    value="${isEdit ? existingEvent.time : ''}"
                    name="time">
                </md-filled-text-field>
                
                <md-filled-text-field
                    label="描述"
                    type="textarea"
                    rows="3"
                    value="${isEdit ? existingEvent.description : ''}"
                    name="description">
                </md-filled-text-field>
            </form>
            <div slot="actions">
                <md-text-button form="schedule-form" value="cancel">取消</md-text-button>
                <md-filled-button form="schedule-form" value="confirm">确定</md-filled-button>
            </div>
        `;

        document.body.appendChild(dialog);
        dialog.show();

        // 处理表单提交
        const form = dialog.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const eventData = {
                title: formData.get('title'),
                time: formData.get('time'),
                description: formData.get('description'),
                icon: 'event_note'
            };

            if (isEdit) {
                this.updateSchedule(dateStr, existingEvent, eventData);
            } else {
                this.addSchedule(this.formatDate(this.selectedDate), eventData);
            }

            dialog.close();
            document.body.removeChild(dialog);
        });

        // 处理取消按钮
        dialog.querySelector('[value="cancel"]').addEventListener('click', () => {
            dialog.close();
            document.body.removeChild(dialog);
        });
    }

    addSchedule(dateStr, event) {
        if (!this.events.has(dateStr)) {
            this.events.set(dateStr, []);
        }
        this.events.get(dateStr).push(event);
        this.saveEventsToStorage(); // 保存更改
        this.renderCalendar();
        this.updateScheduleList();
    }

    editSchedule(dateStr, index) {
        const events = this.events.get(dateStr);
        if (events && events[index]) {
            this.showAddScheduleDialog(events[index], dateStr);
        }
    }

    updateSchedule(dateStr, oldEvent, newEvent) {
        const events = this.events.get(dateStr);
        if (events) {
            const index = events.indexOf(oldEvent);
            if (index !== -1) {
                events[index] = newEvent;
                this.saveEventsToStorage(); // 保存更改
                this.renderCalendar();
                this.updateScheduleList();
            }
        }
    }

    deleteSchedule(dateStr, index) {
        const events = this.events.get(dateStr);
        if (events) {
            events.splice(index, 1);
            if (events.length === 0) {
                this.events.delete(dateStr);
            }
            this.saveEventsToStorage(); // 保存更改
            this.renderCalendar();
            this.updateScheduleList();
        }
    }

    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        this.renderCalendar();
    }

    goToToday() {
        this.currentMonth = this.today.getMonth();
        this.currentYear = this.today.getFullYear();
        this.selectDate(this.today);
    }

    selectDate(date) {
        this.selectedDate = date;
        this.renderCalendar();
        this.updateScheduleList();
    }

    isToday(date) {
        return this.formatDate(date) === this.formatDate(this.today);
    }

    isSelected(date) {
        return this.formatDate(date) === this.formatDate(this.selectedDate);
    }

    formatDate(date) {
        // 创建一个新的日期对象，避免修改原始日期
        const d = new Date(date);
        // 获取本地时区的年月日
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 清除所有日程数据
    clearAllEvents() {
        this.events.clear();
        this.saveEventsToStorage();
        this.renderCalendar();
        this.updateScheduleList();
    }

    // 导出日程数据
    exportEvents() {
        const eventsObject = Object.fromEntries(this.events);
        const dataStr = JSON.stringify(eventsObject, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `calendar-events-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 导入日程数据
    importEvents(jsonData) {
        try {
            const eventsObject = JSON.parse(jsonData);
            this.events = new Map(Object.entries(eventsObject));
            this.saveEventsToStorage();
            this.renderCalendar();
            this.updateScheduleList();
            return true;
        } catch (error) {
            console.error('导入日程数据失败:', error);
            return false;
        }
    }

    addEvent(event) {
        try {
            const dateKey = event.date;
            if (!this.events.has(dateKey)) {
                this.events.set(dateKey, []);
            }
            this.events.get(dateKey).push(event);
            this.saveEvents();
            this.renderEvents(dateKey);
            window.snackbar.show('日程添加成功', 'success');
        } catch (error) {
            console.error('添加日程失败:', error);
            window.snackbar.show('添加日程失败，请重试', 'error');
        }
    }

    editEvent(dateKey, eventIndex, updatedEvent) {
        try {
            const events = this.events.get(dateKey);
            if (events && events[eventIndex]) {
                events[eventIndex] = updatedEvent;
                this.saveEvents();
                this.renderEvents(dateKey);
                window.snackbar.show('日程更新成功', 'success');
            }
        } catch (error) {
            console.error('更新日程失败:', error);
            window.snackbar.show('更新日程失败，请重试', 'error');
        }
    }

    deleteEvent(dateKey, eventIndex) {
        try {
            const events = this.events.get(dateKey);
            if (events) {
                events.splice(eventIndex, 1);
                if (events.length === 0) {
                    this.events.delete(dateKey);
                }
                this.saveEvents();
                this.renderEvents(dateKey);
                window.snackbar.show('日程删除成功', 'success');
            }
        } catch (error) {
            console.error('删除日程失败:', error);
            window.snackbar.show('删除日程失败，请重试', 'error');
        }
    }

    saveEvents() {
        try {
            if (localStorage.getItem('storageEnabled') !== 'false') {
                const eventsObject = Object.fromEntries(this.events);
                localStorage.setItem('calendarEvents', JSON.stringify(eventsObject));
            }
        } catch (error) {
            console.error('保存日程数据失败:', error);
            window.snackbar.show('保存日程数据失败，请检查浏览器存储设置', 'error');
        }
    }

    loadEvents() {
        try {
            const storedEvents = localStorage.getItem('calendarEvents');
            if (storedEvents) {
                const eventsObject = JSON.parse(storedEvents);
                this.events = new Map(Object.entries(eventsObject));
            }
        } catch (error) {
            console.error('加载日程数据失败:', error);
            window.snackbar.show('加载日程数据失败，请刷新页面重试', 'error');
        }
    }
}

// 初始化日历
document.addEventListener('DOMContentLoaded', () => {
    const calendar = new Calendar();

    // 添加错误处理
    window.addEventListener('storage', (e) => {
        if (e.key === 'calendarEvents') {
            calendar.loadEventsFromStorage();
            calendar.renderCalendar();
            calendar.updateScheduleList();
        }
    });

    // 处理存储配额超出的情况
    window.addEventListener('error', (e) => {
        if (e.message.includes('QuotaExceededError')) {
            alert('存储空间已满，请删除一些旧的日程后再试。');
        }
    });
});
