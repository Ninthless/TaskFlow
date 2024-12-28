# TaskFlow

> Personal Task and Schedule Management System | 个人任务管理与日程安排系统

A modern, web-based personal task and schedule management system built with Material Design 3, providing an intuitive user interface and smooth user experience.

一个现代化的、基于 Web 的个人任务管理和日程安排系统，使用 Material Design 3 设计语言，提供直观的用户界面和流畅的使用体验。

注：这是我的期末作业

## Features | 功能特点

### Task Management | 任务管理
- Create, edit, and delete tasks | 创建、编辑、删除任务
- Set task priorities (High, Medium, Low) | 设置任务优先级（高、中、低）
- Add task descriptions and deadlines | 添加任务描述和截止时间
- Mark task completion status | 标记任务完成状态
- Automatic task list sorting | 任务列表自动排序
- Task status tracking (Pending, Completed, Overdue) | 任务状态追踪（待完成、已完成、已逾期）

### Schedule Management | 日程安排
- View daily schedules | 查看每日日程
- Calendar view | 日历视图
- Schedule reminders | 日程提醒
- Flexible time picker | 灵活的时间选择器

### User Interface | 用户界面
- Material Design 3 language | Material Design 3 设计语言
- Responsive layout for all devices | 响应式布局，适配各种设备
- Light/Dark theme switching | 明暗主题切换
- Smooth animations | 流畅的动画效果
- Intuitive operation feedback | 直观的操作反馈

### Data Management | 数据管理
- Local data storage | 本地数据存储
- Data import/export | 数据导入/导出功能
- Automatic data saving | 数据自动保存

## Tech Stack | 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Material Web Components
- LocalStorage API

### Libraries & Frameworks | 使用的库和框架
- Material Design 3 Components | Material Design 3 组件库
- Material Icons | Material 图标
- Google Fonts (Roboto) | Google Roboto 字体

## Quick Start | 快速开始

1. Clone the repository | 克隆项目到本地：
```bash
git clone [repository-url]
```

2. Open `index.html` in a modern browser | 使用现代浏览器打开 `index.html`：
   - Chrome (Recommended | 推荐)
   - Firefox
   - Edge
   - Safari

## Project Structure | 项目结构

```
project/
├── css/
│   ├── styles.css      # Global styles | 全局样式
│   ├── home.css        # Home page styles | 主页样式
│   ├── tasks.css       # Tasks page styles | 任务页面样式
│   ├── calendar.css    # Calendar styles | 日历页面样式
│   ├── light.css       # Light theme | 明亮主题
│   └── dark.css        # Dark theme | 暗黑主题
├── js/
│   ├── app.js          # Core functionality | 应用核心功能
│   ├── home.js         # Home page logic | 主页功能
│   ├── tasks.js        # Task management | 任务管理功能
│   ├── calendar.js     # Calendar logic | 日历功能
│   ├── task-manager.js # Task manager | 任务管理器
│   └── components/     # Components | 组件目录
│       └── snackbar.js # Toast notifications | 提示组件
├── index.html          # Home page | 主页
├── tasks.html          # Tasks page | 任务页面
├── calendar.html       # Calendar page | 日历页面
└── settings.html       # Settings page | 设置页面
```

## Features Description | 功能说明

### Home | 主页
- Task Overview: Display pending, today's, overdue, and completed tasks | 任务概览：显示待完成、今日、已逾期和已完成的任务数量
- Quick Actions: Quickly add tasks and schedules | 快速操作：快速添加任务和日程
- Today's Schedule: Show current day's schedule | 今日日程：显示当天的日程安排

### Task Management | 任务管理
- Task List: Display all tasks, sortable by priority and deadline | 任务列表：显示所有任务，支持按优先级和截止时间排序
- Task Operations: Create, edit, delete and mark completion | 任务操作：创建、编辑、删除和标记完成
- Task Details: Include name, priority, description and deadline | 任务详情：包含名称、优先级、描述和截止时间

### Calendar View | 日历视图
- Monthly View: Display full month schedule | 月视图：显示整月日程
- Schedule Details: View and manage daily schedules | 日程详情：查看和管理每日日程
- Time Selection: Intuitive date and time pickers | 时间选择：直观的日期和时间选择器

### Settings | 设置
- Theme Toggle: Support light/dark themes | 主题切换：支持明暗主题
- Data Management: Import/export data | 数据管理：导入/导出数据
- Storage Settings: Manage local storage options | 存储设置：管理本地存储选项

## Browser Support | 浏览器支持

- Chrome >= 89
- Firefox >= 87
- Edge >= 89
- Safari >= 14

## Local Development | 本地开发

1. Ensure your development environment supports modern JavaScript features | 确保你的开发环境支持现代 JavaScript 特性
2. Use modern browser developer tools for debugging | 使用现代浏览器的开发者工具进行调试
3. Recommended to use VS Code or similar web development editors | 建议使用 VS Code 等支持 Web 开发的编辑器

## Contributing | 贡献指南

1. Fork the project | Fork 项目
2. Create your feature branch | 创建特性分支：
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your changes | 提交更改：
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. Push to the branch | 推送到分支：
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request | 提交 Pull Request

## License | 许可证

[MIT License](LICENSE) 
