class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    }

    save() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    getTasks() {
        return this.tasks;
    }

    getTask(taskId) {
        return this.tasks.find(task => task.id === taskId);
    }

    addTask(task) {
        task.id = Date.now();
        task.completed = false;
        task.createdAt = new Date().toISOString();
        this.tasks.push(task);
        this.save();
        return task;
    }

    updateTask(taskId, updatedTask) {
        this.tasks = this.tasks.map(task =>
            task.id === taskId ? { ...task, ...updatedTask } : task
        );
        this.save();
    }

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.save();
    }

    toggleTaskComplete(taskId) {
        const task = this.getTask(taskId);
        if (task) {
            task.completed = !task.completed;
            this.save();
            return task;
        }
        return null;
    }
}

// 导出任务管理器实���
window.taskManager = new TaskManager();
