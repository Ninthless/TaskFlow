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
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.save();
            return task;
        }
        return null;
    }
}

class CalendarManager {
    constructor() {
        this.events = this.loadEvents();
    }

    loadEvents() {
        const eventsData = localStorage.getItem('events');
        return eventsData ? JSON.parse(eventsData) : [];
    }

    saveEvents() {
        localStorage.setItem('events', JSON.stringify(this.events));
    }

    getEvents() {
        return this.events;
    }

    addEvent(event) {
        event.id = Date.now().toString();
        event.createdAt = new Date().toISOString();
        this.events.push(event);
        this.saveEvents();
        return event;
    }

    updateEvent(eventId, updates) {
        const eventIndex = this.events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
            this.events[eventIndex] = { ...this.events[eventIndex], ...updates };
            this.saveEvents();
            return this.events[eventIndex];
        }
        return null;
    }

    deleteEvent(eventId) {
        const eventIndex = this.events.findIndex(event => event.id === eventId);
        if (eventIndex !== -1) {
            this.events.splice(eventIndex, 1);
            this.saveEvents();
            return true;
        }
        return false;
    }

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

// 创建全局实例
window.taskManager = new TaskManager();
window.calendarManager = new CalendarManager();
