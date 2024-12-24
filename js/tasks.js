// 任务UI管理
class TaskUI {
    constructor() {
        this.taskManager = window.taskManager;
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

        if (this.taskDueDate) {
            this.taskDueDate.value = window.formatDate(tomorrow);
        }
        if (this.taskDueTime) {
            this.taskDueTime.value = window.formatTime(tomorrow);
        }
    }

    bindEventHandlers() {
        // 添加任务按钮
        this.addTaskBtn?.addEventListener('click', () => {
            this.resetForm();
            this.dialog?.show();
        });

        // 保存任务按钮
        this.saveTaskBtn?.addEventListener('click', () => {
            if (this.validateForm(this.taskForm)) {
                this.handleTaskSubmit();
            }
        });

        // 编辑保存按钮
        this.editSaveBtn?.addEventListener('click', () => {
            if (this.validateForm(this.editTaskForm)) {
                this.handleEditTaskSubmit();
            }
        });

        // 取消按钮
        document.getElementById('cancel-task-btn')?.addEventListener('click', () => {
            this.dialog?.close();
        });

        document.getElementById('edit-cancel-btn')?.addEventListener('click', () => {
            this.editDialog?.close();
        });

        // 表单验证
        [this.taskForm, this.editTaskForm].forEach(form => {
            form?.addEventListener('input', () => {
                this.validateForm(form);
            });
        });

        // 日期选择器事件
        [this.taskDueDate, this.editDueDate].forEach(input => {
            input?.addEventListener('click', () => {
                this.datePickerDialog?.show();
                this.currentDateInput = input;
                // 设置日期选择器的初始值
                const currentDate = input.value ? new Date(input.value) : new Date();
                this.setDatePickerValue(currentDate);
            });
        });

        // 时间选择器事件
        [this.taskDueTime, this.editDueTime].forEach(input => {
            input?.addEventListener('click', () => {
                this.timePickerDialog?.show();
                this.currentTimeInput = input;
                // 设置时间选择器的初始值
                const currentTime = input.value ? 
                    new Date(`2000-01-01 ${input.value}`) : 
                    new Date(new Date().setHours(23, 59));
                this.setTimePickerValue(currentTime);
            });
        });

        // 日期选择器确认按钮
        document.getElementById('confirm-date-btn')?.addEventListener('click', () => {
            if (this.currentDateInput && this.currentDateTime) {
                this.currentDateInput.value = window.formatDate(this.currentDateTime);
                this.datePickerDialog?.close();
            }
        });

        // 时间选择器确认按钮
        document.getElementById('confirm-time-btn')?.addEventListener('click', () => {
            if (this.currentTimeInput && this.currentDateTime) {
                this.currentTimeInput.value = window.formatTime(this.currentDateTime);
                this.timePickerDialog?.close();
            }
        });

        // 日期选择器取消按钮
        document.getElementById('cancel-date-btn')?.addEventListener('click', () => {
            this.datePickerDialog?.close();
        });

        // 时间选择器取消按钮
        document.getElementById('cancel-time-btn')?.addEventListener('click', () => {
            this.timePickerDialog?.close();
        });
    }

    validateForm(form) {
        if (!form) return false;

        const taskName = form.querySelector('[name="name"]');
        const taskPriority = form.querySelector('[name="priority"]');
        const dueDate = form.querySelector('[name="dueDate"]');
        const dueTime = form.querySelector('[name="dueTime"]');

        const isValid = taskName?.value.trim() && 
                       taskPriority?.value && 
                       dueDate?.value && 
                       dueTime?.value;

        const submitBtn = form.id === 'task-form' ? this.saveTaskBtn : this.editSaveBtn;
        if (submitBtn) {
            submitBtn.disabled = !isValid;
        }

        // 显示错误提示
        if (taskName) taskName.error = !taskName.value.trim();
        if (dueDate) dueDate.error = !dueDate.value;
        if (dueTime) dueTime.error = !dueTime.value;

        return isValid;
    }

    handleTaskSubmit() {
        const formData = this.getFormData(this.taskForm);
        if (formData) {
            try {
                const task = this.taskManager.addTask(formData);
                if (task) {
                    this.renderTasks();
                    this.dialog?.close();
                    this.resetForm();
                    window.snackbar.show('任务已创建', 'success');
                }
            } catch (error) {
                console.error('创建任务失败:', error);
                window.snackbar.show('创建任务失败，请重试', 'error');
            }
        }
    }

    handleEditTaskSubmit() {
        const formData = this.getFormData(this.editTaskForm);
        if (formData && this.currentEditingTaskId) {
            try {
                this.taskManager.updateTask(this.currentEditingTaskId, formData);
                this.renderTasks();
                this.editDialog?.close();
                window.snackbar.show('任务已更新', 'success');
            } catch (error) {
                console.error('更新任务失败:', error);
                window.snackbar.show('更新任务失败，请重试', 'error');
            }
        }
    }

    getFormData(form) {
        if (!form) return null;

        const taskName = form.querySelector('[name="name"]')?.value.trim();
        const taskPriority = form.querySelector('[name="priority"]')?.value;
        const dueDate = form.querySelector('[name="dueDate"]')?.value;
        const dueTime = form.querySelector('[name="dueTime"]')?.value;
        const description = form.querySelector('[name="description"]')?.value.trim();

        if (!taskName || !taskPriority || !dueDate || !dueTime) {
            return null;
        }

        try {
            // 组合日期和时间
            const dateTimeStr = `${dueDate} ${dueTime}`;
            const dueDateObj = new Date(dateTimeStr);

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

    resetForm() {
        if (!this.taskForm) return;

        this.taskForm.reset();
        this.setDefaultDateTime();
        const prioritySelect = document.getElementById('task-priority');
        if (prioritySelect) {
            prioritySelect.value = 'medium';
        }
        
        const inputs = this.taskForm.querySelectorAll('md-outlined-text-field, md-filled-text-field');
        inputs.forEach(input => input.error = false);
        
        if (this.saveTaskBtn) {
            this.saveTaskBtn.disabled = false;
        }
        this.currentEditingTaskId = null;
    }

    renderTasks() {
        if (!this.tasksList) return;

        const tasks = this.taskManager.getTasks();
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
        const isOverdue = !task.completed && dueDate < new Date();
        const priorityColors = {
            high: 'var(--md-sys-color-error)',
            medium: 'var(--md-sys-color-warning)',
            low: 'var(--md-sys-color-tertiary)'
        };

        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}`;
        taskElement.setAttribute('role', 'listitem');
        taskElement.innerHTML = `
            <div class="priority-indicator priority-${task.priority}"></div>
            <md-checkbox class="task-checkbox" ${task.completed ? 'checked' : ''}></md-checkbox>
            <div class="task-content">
                <div class="task-main">
                    <div class="task-title-row">
                        <h3 class="task-name">${task.name}</h3>
                        <div class="task-status ${task.completed ? 'status-completed' : 'status-pending'}">
                            <span class="status-text">${task.completed ? '已完成' : '待完成'}</span>
                        </div>
                    </div>
                    ${task.description ? `
                        <p class="task-description">${task.description}</p>
                    ` : ''}
                    <div class="task-metadata">
                        <div class="metadata-item task-priority">
                            <md-icon style="color: ${priorityColors[task.priority]}">flag</md-icon>
                            <span>优先级：${task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低'}</span>
                        </div>
                        <div class="metadata-item task-due-date">
                            <md-icon>schedule</md-icon>
                            <span>截止：${window.formatDate(dueDate)}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <md-icon-button class="edit-task">
                        <md-icon>edit</md-icon>
                    </md-icon-button>
                    <md-icon-button class="delete-task">
                        <md-icon>delete</md-icon>
                    </md-icon-button>
                </div>
            </div>
        `;

        // 绑定复选框事件
        const checkbox = taskElement.querySelector('md-checkbox');
        checkbox?.addEventListener('change', () => {
            const isChecked = checkbox.checked;
            const statusElement = taskElement.querySelector('.task-status');
            const statusText = statusElement?.querySelector('.status-text');
            
            try {
                // 更新任务状态
                this.taskManager.toggleTaskComplete(task.id);
                
                // 更新UI
                taskElement.classList.toggle('completed', isChecked);
                if (statusElement && statusText) {
                    statusElement.classList.toggle('status-completed', isChecked);
                    statusElement.classList.toggle('status-pending', !isChecked);
                    statusText.textContent = isChecked ? '已完成' : '待完成';
                }
                
                window.snackbar.show(isChecked ? '任务已完成' : '任务已恢复', 'success');
            } catch (error) {
                console.error('更新任务状态失败:', error);
                window.snackbar.show('操作失败，请重试', 'error');
                // 恢复复选框状态
                checkbox.checked = !isChecked;
            }
        });

        // 绑定编辑和删除按钮事件
        const editBtn = taskElement.querySelector('.edit-task');
        const deleteBtn = taskElement.querySelector('.delete-task');

        editBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openEditDialog(task.id);
        });

        deleteBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            try {
                this.taskManager.deleteTask(task.id);
                this.renderTasks();
                window.snackbar.show('任务已删除', 'success');
            } catch (error) {
                console.error('删除任务失败:', error);
                window.snackbar.show('删除任务失败，请重试', 'error');
            }
        });

        return taskElement;
    }

    openEditDialog(taskId) {
        const task = this.taskManager.getTask(taskId);
        if (!task || !this.editTaskForm || !this.editDialog) return;

        this.currentEditingTaskId = taskId;
        const form = this.editTaskForm;

        const nameInput = form.querySelector('#edit-task-name');
        const prioritySelect = form.querySelector('#edit-task-priority');
        const descriptionInput = form.querySelector('#edit-task-description');
        
        if (nameInput) nameInput.value = task.name;
        if (prioritySelect) prioritySelect.value = task.priority;
        if (descriptionInput) descriptionInput.value = task.description || '';
        
        const dueDate = new Date(task.dueDate);
        if (this.editDueDate) this.editDueDate.value = window.formatDate(dueDate);
        if (this.editDueTime) this.editDueTime.value = window.formatTime(dueDate);

        this.editDialog.show();
    }

    setDatePickerValue(date) {
        const monthYear = document.getElementById('current-month-year');
        const calendarDays = document.getElementById('calendar-days');
        
        if (!monthYear || !calendarDays) return;

        // 保存当前选择的日期
        this.currentDateTime = date;
        
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
        document.getElementById('prev-month-btn')?.addEventListener('click', () => {
            const prevMonth = new Date(date);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            this.setDatePickerValue(prevMonth);
        });
        
        document.getElementById('next-month-btn')?.addEventListener('click', () => {
            const nextMonth = new Date(date);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            this.setDatePickerValue(nextMonth);
        });
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
        
        if (!hourInput || !minuteInput) return;

        // 设置输入框的值
        hourInput.value = time.getHours().toString().padStart(2, '0');
        minuteInput.value = time.getMinutes().toString().padStart(2, '0');
        
        // 保存当前时间
        this.currentDateTime = time;

        // 绑定输入事件
        this.bindTimeInputEvents(hourInput, minuteInput);
    }

    bindTimeInputEvents(hourInput, minuteInput) {
        // 小时输入验证
        hourInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            const numValue = parseInt(value, 10);
            
            if (value.length > 0) {
                if (value.length > 2) value = value.slice(0, 2);
                if (numValue > 23) value = '23';
                if (numValue < 0) value = '00';
            }
            e.target.value = value;
            this.validateTimeInputs();
        });
        
        // 分钟输入验证
        minuteInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9]/g, '');
            const numValue = parseInt(value, 10);
            
            if (value.length > 0) {
                if (value.length > 2) value = value.slice(0, 2);
                if (numValue > 59) value = '59';
                if (numValue < 0) value = '00';
            }
            e.target.value = value;
            this.validateTimeInputs();
        });
    }

    validateTimeInputs() {
        const hourInput = document.getElementById('hour-input');
        const minuteInput = document.getElementById('minute-input');
        const confirmBtn = document.getElementById('confirm-time-btn');
        
        if (!hourInput || !minuteInput || !confirmBtn) return false;

        const hourValue = parseInt(hourInput.value, 10);
        const minuteValue = parseInt(minuteInput.value, 10);
        
        const isHourValid = !isNaN(hourValue) && hourValue >= 0 && hourValue <= 23;
        const isMinuteValid = !isNaN(minuteValue) && minuteValue >= 0 && minuteValue <= 59;
        
        const isValid = isHourValid && isMinuteValid;
        confirmBtn.disabled = !isValid;
        
        if (isValid) {
            // 更新当前时间
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
}

// 初始化任务UI
new TaskUI();
