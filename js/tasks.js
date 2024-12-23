// 任务数据管理
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }

    save() {
        try {
            if (localStorage.getItem('storageEnabled') !== 'false') {
                localStorage.setItem('tasks', JSON.stringify(this.tasks));
                window.snackbar.show('任务保存成功', 'success');
            }
        } catch (error) {
            console.error('保存任务失败:', error);
            window.snackbar.show('保存任务失败，请重试', 'error');
        }
    }

    addTask(task) {
        try {
            task.id = Date.now();
            task.createdAt = new Date().toISOString();
            this.tasks.push(task);
            this.save();
            window.snackbar.show('任务添加成功', 'success');
            return task;
        } catch (error) {
            console.error('添加任务失败:', error);
            window.snackbar.show('添加任务失败，请重试', 'error');
            return null;
        }
    }

    deleteTask(taskId) {
        try {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.save();
            window.snackbar.show('任务删除成功', 'success');
        } catch (error) {
            console.error('删除任务失败:', error);
            window.snackbar.show('删除任务失败，请重试', 'error');
        }
    }

    updateTask(taskId, updatedTask) {
        try {
            this.tasks = this.tasks.map(task =>
                task.id === taskId ? { ...task, ...updatedTask } : task
            );
            this.save();
            window.snackbar.show('任务更新成功', 'success');
        } catch (error) {
            console.error('更新任务失败:', error);
            window.snackbar.show('更新任务失败，请重试', 'error');
        }
    }

    getAllTasks() {
        return this.tasks;
    }

    getTask(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }
}

// 任务UI管理
class TaskUI {
    constructor() {
        this.taskManager = new TaskManager();
        // 等待DOM加载完成后再初始化UI
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeUI());
        } else {
            this.initializeUI();
        }
    }

    initializeUI() {
        // 初始化DOM元素
        this.dialog = document.getElementById('task-dialog');
        this.editDialog = document.getElementById('edit-task-dialog');
        this.datePickerDialog = document.getElementById('date-picker-dialog');
        this.timePickerDialog = document.getElementById('time-picker-dialog');
        this.addTaskBtn = document.getElementById('add-task-btn');
        this.saveTaskBtn = document.getElementById('save-task-btn');
        this.editSaveBtn = document.getElementById('edit-save-btn');
        this.tasksList = document.getElementById('tasks-list');
        this.taskForm = document.getElementById('task-form');
        this.editTaskForm = document.getElementById('edit-task-form');

        // 初始化日期时间输入框
        this.taskDueDate = document.getElementById('task-due-date');
        this.taskDueTime = document.getElementById('task-due-time');
        this.editDueDate = document.getElementById('edit-task-due-date');
        this.editDueTime = document.getElementById('edit-task-due-time');

        // 设置默认日期时间
        this.setDefaultDateTime();

        // 绑定事件处理器
        this.bindEventHandlers();

        // 渲染任务列表
        this.renderTasks();
    }

    setDefaultDateTime() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59);

        this.taskDueDate.value = this.formatDate(tomorrow);
        this.taskDueTime.value = this.formatTime(tomorrow);
    }

    bindEventHandlers() {
        // 添加任务按钮
        this.addTaskBtn.addEventListener('click', () => {
            this.resetForm();
            this.dialog.show();
        });

        // 保存任务按钮
        this.saveTaskBtn.addEventListener('click', () => {
            if (this.validateForm(this.taskForm)) {
                this.handleTaskSubmit();
            }
        });

        // 编辑保存按钮
        this.editSaveBtn.addEventListener('click', () => {
            if (this.validateForm(this.editTaskForm)) {
                this.handleEditTaskSubmit();
            }
        });

        // 取消按钮
        document.getElementById('cancel-task-btn').addEventListener('click', () => {
            this.dialog.close();
        });

        document.getElementById('edit-cancel-btn').addEventListener('click', () => {
            this.editDialog.close();
        });

        // 日期时间输入框点击事件
        [this.taskDueDate, this.editDueDate].forEach(input => {
            input.addEventListener('click', () => {
                const datePicker = document.getElementById('date-picker-dialog');
                datePicker.show();
                // 设置日期选择器的初始值
                const currentDate = input.value ? this.parseDateTime(input.value) : new Date();
                this.setDatePickerValue(currentDate);
                this.currentDateTime = currentDate;

                // 确认日期选择
                document.getElementById('confirm-date-btn').onclick = () => {
                    input.value = this.formatDate(this.currentDateTime);
                    datePicker.close();
                };

                // 取消日期选择
                document.getElementById('cancel-date-btn').onclick = () => {
                    datePicker.close();
                };
            });
        });

        [this.taskDueTime, this.editDueTime].forEach(input => {
            input.addEventListener('click', () => {
                const timePicker = document.getElementById('time-picker-dialog');
                timePicker.show();
                // 设置时间选择器的初始值
                const currentTime = input.value ? 
                    this.parseDateTime(`${this.taskDueDate.value || this.editDueDate.value} ${input.value}`) : 
                    new Date();
                this.setTimePickerValue(currentTime);
                this.currentDateTime = currentTime;

                // 确认时间选择
                document.getElementById('confirm-time-btn').onclick = () => {
                    if (this.validateTimeInputs()) {
                        input.value = this.formatTime(this.currentDateTime);
                        timePicker.close();
                    }
                };

                // 取消时间选择
                document.getElementById('cancel-time-btn').onclick = () => {
                    timePicker.close();
                };
            });
        });

        // 表单验证
        [this.taskForm, this.editTaskForm].forEach(form => {
            form.addEventListener('input', () => {
                this.validateForm(form);
            });
        });
    }

    setDatePickerValue(date) {
        const monthYear = document.getElementById('current-month-year');
        const calendarDays = document.getElementById('calendar-days');
        
        // 保存当前选择的日期
        this.currentDate = date;
        
        // 更新月份年份显示
        monthYear.textContent = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long'
        });
        
        // 清空日历网格
        calendarDays.innerHTML = '';
        
        // 获取当月第一天和最后一天
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        // 获取当月第一天是星期几（0-6）
        const firstDayOfWeek = firstDay.getDay();
        
        // 添加上个月的日期
        for (let i = 0; i < firstDayOfWeek; i++) {
            const prevDate = new Date(firstDay);
            prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i));
            const dayElement = this.createDayElement(prevDate, true);
            calendarDays.appendChild(dayElement);
        }
        
        // 添加当月的日期
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
            const dayElement = this.createDayElement(currentDate, false);
            calendarDays.appendChild(dayElement);
        }
        
        // 添加下个月的日期
        const remainingDays = 42 - (firstDayOfWeek + lastDay.getDate()); // 6行7列 = 42
        for (let i = 1; i <= remainingDays; i++) {
            const nextDate = new Date(lastDay);
            nextDate.setDate(nextDate.getDate() + i);
            const dayElement = this.createDayElement(nextDate, true);
            calendarDays.appendChild(dayElement);
        }
        
        // 绑定月份切换按钮事件
        document.getElementById('prev-month-btn').onclick = () => {
            const prevMonth = new Date(date);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            this.setDatePickerValue(prevMonth);
        };
        
        document.getElementById('next-month-btn').onclick = () => {
            const nextMonth = new Date(date);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            this.setDatePickerValue(nextMonth);
        };
    }

    createDayElement(date, disabled) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (disabled) {
            dayElement.classList.add('disabled');
        }
        
        // 检查是否是今天
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // 检查是否是选中的日期
        if (this.currentDateTime && date.toDateString() === this.currentDateTime.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        dayElement.textContent = date.getDate();
        
        if (!disabled) {
            dayElement.addEventListener('click', () => {
                // 移除其他日期的选中状态
                document.querySelectorAll('.calendar-day.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                // 添加选中状态
                dayElement.classList.add('selected');
                
                // 更新当前日期时间，保持时间部分不变
                const currentTime = this.currentDateTime || new Date();
                this.currentDateTime = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    currentTime.getHours(),
                    currentTime.getMinutes()
                );
            });
        }
        
        return dayElement;
    }

    setTimePickerValue(time) {
        const hourSegment = document.querySelector('.hour-segment .time-value');
        const minuteSegment = document.querySelector('.minute-segment .time-value');
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        const modeSelector = document.querySelector('.time-mode-selector');
        
        // 保存当前选择的时间
        this.currentTime = time;
        
        // 设置显示的时间
        const hours = time.getHours();
        const minutes = time.getMinutes();
        
        hourSegment.textContent = hours.toString().padStart(2, '0');
        minuteSegment.textContent = minutes.toString().padStart(2, '0');
        hourInput.value = hours.toString().padStart(2, '0');
        minuteInput.value = minutes.toString().padStart(2, '0');
        
        // 初始化时钟模式（小时/分钟）
        this.clockMode = 'hour';
        this.updateTimeSegments();
        
        // 绑定模式切换事件
        modeSelector.addEventListener('change', () => {
            this.clockMode = modeSelector.selected === 0 ? 'hour' : 'minute';
            this.updateTimeSegments();
        });
        
        // 绑定时间段点击事件
        document.querySelectorAll('.time-segment').forEach(segment => {
            segment.addEventListener('click', () => {
                const isHourSegment = segment.classList.contains('hour-segment');
                this.clockMode = isHourSegment ? 'hour' : 'minute';
                modeSelector.selected = isHourSegment ? 0 : 1;
                this.updateTimeSegments();
            });
        });
        
        // 绑定输入事件
        this.bindTimeInputEvents(hourInput, minuteInput);
    }
    
    bindTimeInputEvents(hourInput, minuteInput) {
        // 移除旧的事件监听器
        const newHourInput = hourInput.cloneNode(true);
        const newMinuteInput = minuteInput.cloneNode(true);
        hourInput.parentNode.replaceChild(newHourInput, hourInput);
        minuteInput.parentNode.replaceChild(newMinuteInput, minuteInput);
        
        // 小时输入验证
        newHourInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            const numValue = parseInt(value, 10);
            
            if (value.length > 0) {
                if (value.length > 2) {
                    value = value.slice(0, 2);
                }
                if (numValue > 23) {
                    value = '23';
                }
                if (numValue < 0) {
                    value = '00';
                }
            }
            e.target.value = value;
            this.validateTimeInputs();
        });
        
        // 分钟输入验证
        newMinuteInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            const numValue = parseInt(value, 10);
            
            if (value.length > 0) {
                if (value.length > 2) {
                    value = value.slice(0, 2);
                }
                if (numValue > 59) {
                    value = '59';
                }
                if (numValue < 0) {
                    value = '00';
                }
            }
            e.target.value = value;
            this.validateTimeInputs();
        });
        
        // 焦点处理
        [newHourInput, newMinuteInput].forEach(input => {
            const isHourInput = input === newHourInput;
            
            // 获取焦点时选中全部文本
            input.addEventListener('focus', () => {
                requestAnimationFrame(() => {
                    input.select();
                });
            });
            
            // 失去焦点时格式化
            input.addEventListener('blur', () => {
                const value = input.value;
                if (value) {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                        input.value = numValue.toString().padStart(2, '0');
                        this.validateTimeInputs();
                    }
                }
            });
            
            // 键盘导航
            input.addEventListener('keydown', (e) => {
                const value = parseInt(input.value, 10) || 0;
                const max = isHourInput ? 23 : 59;
                
                switch (e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        const nextValue = value >= max ? 0 : value + 1;
                        input.value = nextValue.toString().padStart(2, '0');
                        this.validateTimeInputs();
                        break;
                        
                    case 'ArrowDown':
                        e.preventDefault();
                        const prevValue = value <= 0 ? max : value - 1;
                        input.value = prevValue.toString().padStart(2, '0');
                        this.validateTimeInputs();
                        break;
                        
                    case 'Enter':
                        e.preventDefault();
                        if (this.validateTimeInputs()) {
                            if (isHourInput && !newMinuteInput.value) {
                                newMinuteInput.focus();
                            } else {
                                document.getElementById('confirm-time-btn').click();
                            }
                        }
                        break;
                        
                    case 'Tab':
                        if (!input.value) {
                            input.value = '00';
                            this.validateTimeInputs();
                        }
                        break;
                }
            });
        });
    }
    
    updateTimeSegments() {
        const hourSegment = document.querySelector('.hour-segment');
        const minuteSegment = document.querySelector('.minute-segment');
        
        if (this.clockMode === 'hour') {
            hourSegment.classList.add('selected');
            minuteSegment.classList.remove('selected');
        } else {
            minuteSegment.classList.add('selected');
            hourSegment.classList.remove('selected');
        }
    }
    
    showTooltip(input, message) {
        // 获取或创建错误提示容器
        let tooltipContainer = input.parentElement.querySelector('.time-picker-tooltip');
        if (!tooltipContainer) {
            tooltipContainer = document.createElement('div');
            tooltipContainer.className = 'time-picker-tooltip';
            input.parentElement.appendChild(tooltipContainer);
        }

        // 设置错误状态和消息
        input.error = true;
        tooltipContainer.textContent = message;
        tooltipContainer.classList.add('show');

        // 2秒后隐藏错误提示
        setTimeout(() => {
            tooltipContainer.classList.remove('show');
            // 如果错误消息没有被更��，则清除错误状态
            if (tooltipContainer.textContent === message) {
                input.error = false;
            }
        }, 2000);
    }
    
    validateTimeInputs() {
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        const confirmBtn = document.getElementById('confirm-time-btn');
        
        const hourValue = parseInt(hourInput.value, 10);
        const minuteValue = parseInt(minuteInput.value, 10);
        
        const isHourValid = !isNaN(hourValue) && hourValue >= 0 && hourValue <= 23;
        const isMinuteValid = !isNaN(minuteValue) && minuteValue >= 0 && minuteValue <= 59;
        
        const isValid = isHourValid && isMinuteValid;
        confirmBtn.disabled = !isValid;
        
        if (isValid) {
            // 保持年月日不变，只更新时间
            const currentDate = this.currentDateTime || new Date();
            this.currentDateTime = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate(),
                hourValue,
                minuteValue
            );
        }
        
        return isValid;
    }

    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
        const time = new Date();
        time.setHours(hours, minutes, 0, 0);
        return time;
    }

    formatTime(date) {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }

    formatDate(date) {
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
    }

    validateForm(form) {
        const taskName = form.querySelector('[name="task-name"]');
        const taskPriority = form.querySelector('[name="task-priority"]');
        const dueDate = form.querySelector('[id$="task-due-date"]');
        const dueTime = form.querySelector('[id$="task-due-time"]');

        const isValid = taskName.value.trim() && 
                       taskPriority.value && 
                       dueDate.value && 
                       dueTime.value;

        const submitBtn = form.id === 'task-form' ? this.saveTaskBtn : this.editSaveBtn;
        submitBtn.disabled = !isValid;

        // 显示错误提示
        if (taskName) taskName.error = !taskName.value.trim();
        if (dueDate) dueDate.error = !dueDate.value;
        if (dueTime) dueTime.error = !dueTime.value;

        return isValid;
    }

    handleTaskSubmit() {
        const formData = this.getFormData(this.taskForm);
        if (formData) {
            const task = this.taskManager.addTask(formData);
            if (task) {
                this.renderTasks();
                this.dialog.close();
                this.resetForm();
            }
        }
    }

    handleEditTaskSubmit() {
        const formData = this.getFormData(this.editTaskForm);
        if (formData && this.currentEditingTaskId) {
            this.taskManager.updateTask(this.currentEditingTaskId, formData);
            this.renderTasks();
            this.editDialog.close();
        }
    }

    getFormData(form) {
        const taskName = form.querySelector('[name="task-name"]').value.trim();
        const taskPriority = form.querySelector('[name="task-priority"]').value;
        const dueDate = form.querySelector('[id$="task-due-date"]').value;
        const dueTime = form.querySelector('[id$="task-due-time"]').value;
        const description = form.querySelector('[id$="task-description"]').value.trim();

        if (!taskName || !taskPriority || !dueDate || !dueTime) {
            return null;
        }

        try {
            // 组合日期和时间
            const dateTimeStr = `${dueDate} ${dueTime}`;
            const dueDateObj = this.parseDateTime(dateTimeStr);

            // 验证日期是否有效
            if (isNaN(dueDateObj.getTime())) {
                console.error('Invalid date:', dateTimeStr);
                return null;
            }

            return {
                name: taskName,
                priority: taskPriority,
                dueDate: dueDateObj.toISOString(),
                description: description
            };
        } catch (error) {
            console.error('Error creating task data:', error);
            return null;
        }
    }

    parseDateTime(dateTimeStr) {
        try {
            if (!dateTimeStr) return new Date();
            
            // 处理不同的日期格式
            let dateStr, timeStr;
            if (dateTimeStr.includes(' ')) {
                [dateStr, timeStr] = dateTimeStr.split(' ');
            } else {
                return new Date();
            }
            
            // 解析日期
            let year, month, day;
            if (dateStr.includes('-')) {
                [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
            } else if (dateStr.includes('年')) {
                [year, month, day] = dateStr.split(/[年月日]/).map(num => parseInt(num.trim(), 10));
            } else {
                return new Date();
            }
            
            // 解析时间
            const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
            
            // 创建日期对象
            const date = new Date(year, month - 1, day, hours || 0, minutes || 0);
            
            // 验证日期是否有效
            if (isNaN(date.getTime())) {
                console.error('Invalid date components:', { year, month, day, hours, minutes });
                return new Date();
            }
            
            return date;
        } catch (error) {
            console.error('Error parsing date:', error);
            return new Date();
        }
    }

    resetForm() {
        this.taskForm.reset();
        this.setDefaultDateTime();
        document.getElementById('task-priority').value = 'medium';
        
        const inputs = this.taskForm.querySelectorAll('md-outlined-text-field, md-filled-text-field');
        inputs.forEach(input => input.error = false);
        
        this.saveTaskBtn.disabled = false;
        this.currentEditingTaskId = null;
    }

    renderTasks() {
        const tasks = this.taskManager.getAllTasks();
        this.tasksList.innerHTML = '';

        if (tasks.length === 0) {
            this.tasksList.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined">task</span>
                    <p class="md-typescale-body-large">暂无任务</p>
                </div>
            `;
            return;
        }

        tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
             .forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < new Date();
        const priorityColors = {
            high: 'var(--md-sys-color-error)',
            medium: 'var(--md-sys-color-primary)',
            low: 'var(--md-sys-color-tertiary)'
        };
        const priorityText = {
            high: '高优先级',
            medium: '中优先级',
            low: '低优先级'
        };

        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.setAttribute('role', 'listitem');
        taskElement.innerHTML = `
            <div class="task-content">
                <div class="task-main">
                    <div class="task-info">
                        <div class="task-title-row">
                            <md-icon class="task-icon">check_circle</md-icon>
                            <span>任务名称：${task.name}</span>
                        </div>
                        <div class="task-supporting-text">
                            <div class="task-priority" style="color: ${priorityColors[task.priority]}">
                                <md-icon class="supporting-icon" style="color: ${priorityColors[task.priority]}">flag</md-icon>
                                <span>优先级：${priorityText[task.priority]}</span>
                            </div>
                            <div class="task-due-date ${isOverdue ? 'overdue' : ''}">
                                <md-icon class="supporting-icon">schedule</md-icon>
                                <span>截止时间：${this.formatDate(dueDate)} ${this.formatTime(dueDate)}</span>
                            </div>
                            ${task.description ? `
                            <div class="task-description">
                                <md-icon class="supporting-icon">description</md-icon>
                                <span>描述：${task.description}</span>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="task-trailing">
                    <md-icon-button>
                        <md-icon>edit</md-icon>
                    </md-icon-button>
                    <md-icon-button>
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                </div>
            </div>
            <div class="task-state-layer"></div>
        `;

        // 绑定编辑和删除按钮事件
        const editBtn = taskElement.querySelector('md-icon-button:first-of-type');
        const deleteBtn = taskElement.querySelector('md-icon-button:last-of-type');

        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditDialog(task.id);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.taskManager.deleteTask(task.id);
            this.renderTasks();
        });

        return taskElement;
    }

    openEditDialog(taskId) {
        const task = this.taskManager.getTask(taskId);
        if (!task) return;

        this.currentEditingTaskId = taskId;
        const form = this.editTaskForm;

        form.querySelector('#edit-task-name').value = task.name;
        form.querySelector('#edit-task-priority').value = task.priority;
        
        const dueDate = new Date(task.dueDate);
        form.querySelector('#edit-task-due-date').value = this.formatDate(dueDate);
        form.querySelector('#edit-task-due-time').value = this.formatTime(dueDate);
        
        form.querySelector('#edit-task-description').value = task.description || '';

        this.editDialog.show();
    }

    // 日期时间选择器相关代码
    initializeDateTimePicker() {
        // 获取相关元素
        const datetimeDialog = document.getElementById('datetime-picker-dialog');
        const datePickerDialog = document.getElementById('date-picker-dialog');
        const timePickerDialog = document.getElementById('time-picker-dialog');
        
        // 获取日期时间显示元素
        const selectedDate = document.getElementById('selected-date');
        const selectedTime = document.getElementById('selected-time');
        
        // 初始化当前选择的日期时间
        this.currentDateTime = new Date();
        this.currentDateTime.setHours(12, 0, 0, 0); // 默认设置中午12点
        
        // 更新显示
        this.updateDateTimeDisplay();
        
        // 绑定日期点击事件
        selectedDate.addEventListener('click', () => {
            datePickerDialog.show();
            this.setDatePickerValue(this.currentDateTime);
        });
        
        // 绑定时间点击事件
        selectedTime.addEventListener('click', () => {
            timePickerDialog.show();
            this.setTimePickerValue(this.currentDateTime);
        });
        
        // 绑定日期选择器确认事件
        document.getElementById('confirm-date-btn').addEventListener('click', () => {
            datePickerDialog.close();
            this.updateDateTimeDisplay();
        });
        
        // 绑定时间选择器确认事件
        document.getElementById('confirm-time-btn').addEventListener('click', () => {
            if (this.validateTimeInputs()) {
                timePickerDialog.close();
                this.updateDateTimeDisplay();
            }
        });
        
        // 绑定取消按钮事件
        document.getElementById('cancel-date-btn').addEventListener('click', () => {
            datePickerDialog.close();
        });
        
        document.getElementById('cancel-time-btn').addEventListener('click', () => {
            timePickerDialog.close();
        });
        
        // 绑定最终确认事件
        document.querySelector('#datetime-picker-dialog [value="confirm"]').addEventListener('click', () => {
            const targetInput = document.getElementById(this.currentEditingTimeField);
            if (targetInput) {
                targetInput.value = this.formatDateTime(this.currentDateTime);
                targetInput.error = false;
            }
            datetimeDialog.close();
        });
        
        // 绑定最终取消事件
        document.querySelector('#datetime-picker-dialog [value="cancel"]').addEventListener('click', () => {
            datetimeDialog.close();
        });
        
        // 绑定截止时间输入框点击事件
        ['task-due-time', 'edit-task-due-time'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('click', () => {
                    this.currentEditingTimeField = id;
                    this.currentDateTime = input.value ? 
                        this.parseDateTime(input.value) : 
                        new Date(new Date().setHours(12, 0, 0, 0));
                    this.updateDateTimeDisplay();
                    datetimeDialog.show();
                });
            }
        });
    }
    
    updateDateTimeDisplay() {
        const selectedDate = document.getElementById('selected-date');
        const selectedTime = document.getElementById('selected-time');
        
        selectedDate.textContent = this.formatDate(this.currentDateTime);
        selectedTime.textContent = this.formatTime(this.currentDateTime);
    }
    
    setDatePickerValue(date) {
        const monthYear = document.getElementById('current-month-year');
        const calendarDays = document.getElementById('calendar-days');
        
        // 更新月份年份显示
        monthYear.textContent = date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long'
        });
        
        // 清空日历网格
        calendarDays.innerHTML = '';
        
        // 获取当月第一天和最后一天
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        
        // 获取当月第一天是星期几（0-6）
        const firstDayOfWeek = firstDay.getDay();
        
        // 添加上个月的日期
        for (let i = 0; i < firstDayOfWeek; i++) {
            const prevDate = new Date(firstDay);
            prevDate.setDate(prevDate.getDate() - (firstDayOfWeek - i));
            const dayElement = this.createDayElement(prevDate, true);
            calendarDays.appendChild(dayElement);
        }
        
        // 添加当月的日期
        for (let i = 1; i <= lastDay.getDate(); i++) {
            const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
            const dayElement = this.createDayElement(currentDate, false);
            calendarDays.appendChild(dayElement);
        }
        
        // 添加下个月的日期
        const remainingDays = 42 - (firstDayOfWeek + lastDay.getDate()); // 6行7列 = 42
        for (let i = 1; i <= remainingDays; i++) {
            const nextDate = new Date(lastDay);
            nextDate.setDate(nextDate.getDate() + i);
            const dayElement = this.createDayElement(nextDate, true);
            calendarDays.appendChild(dayElement);
        }
        
        // 绑定月份切换按钮事件
        document.getElementById('prev-month-btn').onclick = () => {
            const prevMonth = new Date(date);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            this.setDatePickerValue(prevMonth);
        };
        
        document.getElementById('next-month-btn').onclick = () => {
            const nextMonth = new Date(date);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            this.setDatePickerValue(nextMonth);
        };
    }
    
    createDayElement(date, disabled) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        if (disabled) {
            dayElement.classList.add('disabled');
        }
        
        // 检查是否是今天
        const today = new Date();
        if (date.toDateString() === today.toDateString()) {
            dayElement.classList.add('today');
        }
        
        // 检查是否是选中的日期
        if (this.currentDateTime && date.toDateString() === this.currentDateTime.toDateString()) {
            dayElement.classList.add('selected');
        }
        
        dayElement.textContent = date.getDate();
        
        if (!disabled) {
            dayElement.addEventListener('click', () => {
                // 移除其他日期的选中状态
                document.querySelectorAll('.calendar-day.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                // 添加选中状态
                dayElement.classList.add('selected');
                
                // 更新当前日期时间，保持时间部分不变
                const currentTime = this.currentDateTime || new Date();
                this.currentDateTime = new Date(
                    date.getFullYear(),
                    date.getMonth(),
                    date.getDate(),
                    currentTime.getHours(),
                    currentTime.getMinutes()
                );
            });
        }
        
        return dayElement;
    }
    
    setTimePickerValue(time) {
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        
        // 设置输入框的值
        hourInput.value = time.getHours().toString().padStart(2, '0');
        minuteInput.value = time.getMinutes().toString().padStart(2, '0');
        
        // 绑定输入事件
        this.bindTimeInputEvents(hourInput, minuteInput);
    }
    
    bindTimeInputEvents(hourInput, minuteInput) {
        // 移除旧的事件监听器
        const newHourInput = hourInput.cloneNode(true);
        const newMinuteInput = minuteInput.cloneNode(true);
        hourInput.parentNode.replaceChild(newHourInput, hourInput);
        minuteInput.parentNode.replaceChild(newMinuteInput, minuteInput);
        
        // 小时输入验证
        newHourInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            const numValue = parseInt(value, 10);
            
            if (value.length > 0) {
                if (value.length > 2) {
                    value = value.slice(0, 2);
                }
                if (numValue > 23) {
                    value = '23';
                }
                if (numValue < 0) {
                    value = '00';
                }
            }
            e.target.value = value;
            this.validateTimeInputs();
        });
        
        // 分钟输入验证
        newMinuteInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            const numValue = parseInt(value, 10);
            
            if (value.length > 0) {
                if (value.length > 2) {
                    value = value.slice(0, 2);
                }
                if (numValue > 59) {
                    value = '59';
                }
                if (numValue < 0) {
                    value = '00';
                }
            }
            e.target.value = value;
            this.validateTimeInputs();
        });
        
        // 焦点处理
        [newHourInput, newMinuteInput].forEach(input => {
            const isHourInput = input === newHourInput;
            
            // 获取焦点时选中全部文本
            input.addEventListener('focus', () => {
                requestAnimationFrame(() => {
                    input.select();
                });
            });
            
            // 失去焦点时格式化
            input.addEventListener('blur', () => {
                const value = input.value;
                if (value) {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                        input.value = numValue.toString().padStart(2, '0');
                        this.validateTimeInputs();
                    }
                }
            });
            
            // 键盘导航
            input.addEventListener('keydown', (e) => {
                const value = parseInt(input.value, 10) || 0;
                const max = isHourInput ? 23 : 59;
                
                switch (e.key) {
                    case 'ArrowUp':
                        e.preventDefault();
                        const nextValue = value >= max ? 0 : value + 1;
                        input.value = nextValue.toString().padStart(2, '0');
                        this.validateTimeInputs();
                        break;
                        
                    case 'ArrowDown':
                        e.preventDefault();
                        const prevValue = value <= 0 ? max : value - 1;
                        input.value = prevValue.toString().padStart(2, '0');
                        this.validateTimeInputs();
                        break;
                        
                    case 'Enter':
                        e.preventDefault();
                        if (this.validateTimeInputs()) {
                            if (isHourInput && !newMinuteInput.value) {
                                newMinuteInput.focus();
                            } else {
                                document.getElementById('confirm-time-btn').click();
                            }
                        }
                        break;
                        
                    case 'Tab':
                        if (!input.value) {
                            input.value = '00';
                            this.validateTimeInputs();
                        }
                        break;
                }
            });
        });
    }
    
    validateTimeInputs() {
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        const confirmBtn = document.getElementById('confirm-time-btn');
        
        const hourValue = parseInt(hourInput.value, 10);
        const minuteValue = parseInt(minuteInput.value, 10);
        
        const isHourValid = !isNaN(hourValue) && hourValue >= 0 && hourValue <= 23;
        const isMinuteValid = !isNaN(minuteValue) && minuteValue >= 0 && minuteValue <= 59;
        
        const isValid = isHourValid && isMinuteValid;
        confirmBtn.disabled = !isValid;
        
        if (isValid) {
            // 保持年月日不变，只更新时间
            const currentDate = this.currentDateTime || new Date();
            this.currentDateTime = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate(),
                hourValue,
                minuteValue
            );
        }
        
        return isValid;
    }
    
    showTooltip(input, message) {
        // 获取或创建错误提示容器
        let tooltipContainer = input.parentElement.querySelector('.time-picker-tooltip');
        if (!tooltipContainer) {
            tooltipContainer = document.createElement('div');
            tooltipContainer.className = 'time-picker-tooltip';
            input.parentElement.appendChild(tooltipContainer);
        }

        // 设置错误状态和消息
        input.error = true;
        tooltipContainer.textContent = message;
        tooltipContainer.classList.add('show');

        // 2秒后隐藏错误提示
        setTimeout(() => {
            tooltipContainer.classList.remove('show');
            // 如果错误消息没有被更新，则清除错误状态
            if (tooltipContainer.textContent === message) {
                input.error = false;
            }
        }, 2000);
    }
    
    formatDateTime(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            return '';
        }
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }
    
    formatDate(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            return '';
        }
        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\//g, '-');
    }
    
    formatTime(date) {
        if (!(date instanceof Date) || isNaN(date)) {
            return '';
        }
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    }
    
    parseDateTime(dateTimeStr) {
        try {
            if (!dateTimeStr) return new Date();
            
            // 处理不同的日期格式
            let dateStr, timeStr;
            if (dateTimeStr.includes(' ')) {
                [dateStr, timeStr] = dateTimeStr.split(' ');
            } else {
                return new Date();
            }
            
            // 解析日期
            let year, month, day;
            if (dateStr.includes('-')) {
                [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
            } else if (dateStr.includes('年')) {
                [year, month, day] = dateStr.split(/[年月日]/).map(num => parseInt(num.trim(), 10));
            } else {
                return new Date();
            }
            
            // 解析时间
            const [hours, minutes] = timeStr.split(':').map(num => parseInt(num, 10));
            
            // 创建日期对象
            const date = new Date(year, month - 1, day, hours || 0, minutes || 0);
            
            // 验证日期是否有效
            if (isNaN(date.getTime())) {
                return new Date();
            }
            
            return date;
        } catch (error) {
            console.error('Error parsing date:', error);
            return new Date();
        }
    }

    showAddTaskDialog(existingTask = null) {
        const isEdit = !!existingTask;
        const dialog = document.createElement('md-dialog');
        dialog.innerHTML = `
            <div slot="headline">${isEdit ? '编辑任务' : '新建任务'}</div>
            <form slot="content" id="task-form" class="task-form">
                <md-filled-text-field
                    label="标题"
                    required
                    value="${isEdit ? existingTask.title : ''}"
                    name="title">
                </md-filled-text-field>
                
                <md-filled-text-field
                    label="描述"
                    type="textarea"
                    rows="3"
                    value="${isEdit ? existingTask.description : ''}"
                    name="description">
                </md-filled-text-field>

                <md-filled-select
                    label="优先级"
                    required
                    value="${isEdit ? existingTask.priority : 'medium'}"
                    name="priority">
                    <md-select-option value="high">
                        <div slot="headline">高优先级</div>
                    </md-select-option>
                    <md-select-option value="medium">
                        <div slot="headline">中优先级</div>
                    </md-select-option>
                    <md-select-option value="low">
                        <div slot="headline">低优先级</div>
                    </md-select-option>
                </md-filled-select>

                <md-filled-select
                    label="状态"
                    required
                    value="${isEdit ? existingTask.status : 'todo'}"
                    name="status">
                    <md-select-option value="todo">
                        <div slot="headline">待办</div>
                    </md-select-option>
                    <md-select-option value="in-progress">
                        <div slot="headline">进行中</div>
                    </md-select-option>
                    <md-select-option value="done">
                        <div slot="headline">已完成</div>
                    </md-select-option>
                </md-filled-select>
            </form>
            <div slot="actions">
                <md-text-button form="task-form" value="cancel">取消</md-text-button>
                <md-filled-button form="task-form" value="confirm">确定</md-filled-button>
            </div>
        `;
    }
}
    
new TaskUI();