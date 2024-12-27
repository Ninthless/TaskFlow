# 个人任务管理与日程安排系统

一个现代化的、基于 Web 的个人任务管理和日程安排系统，使用 Material Design 3 设计语言，提供直观的用户界面和流畅的使用体验。

## 功能特点

### 任务管理
- 创建、编辑、删除任务
- 设置任务优先级（高、中、低）
- 添加任务描述和截止时间
- 标记任务完成状态
- 任务列表自动排序
- 任务状态追踪（待完成、已完成、已逾期）

### 日程安排
- 查看每日日程
- 日历视图
- 日程提醒
- 灵活的时间选择器

### 用户界面
- Material Design 3 设计语言
- 响应式布局，适配各种设备
- 明暗主题切换
- 流畅的动画效果
- 直观的操作反馈

### 数据管理
- 本地数据存储
- 数据导入/导出功能
- 数据自动保存

## 技术栈

- HTML5
- CSS3
- JavaScript (ES6+)
- Material Web Components
- LocalStorage API

### 使用的库和框架
- Material Design 3 组件库
- Material Icons
- Google Fonts (Roboto)

## 快速开始

1. 克隆项目到本地：
```bash
git clone [项目地址]
```

2. 使用支持的现代��览器打开 `index.html`
   - Chrome (推荐)
   - Firefox
   - Edge
   - Safari

## 项目结构

```
project/
├── css/
│   ├── styles.css      # 全局样式
│   ├── home.css        # 主页样式
│   ├── tasks.css       # 任务页面样式
│   ├── calendar.css    # 日历页面样式
│   ├── light.css       # 明亮主题
│   └── dark.css        # 暗黑主题
├── js/
│   ├── app.js          # 应用核心功能
│   ├── home.js         # 主页功能
│   ├── tasks.js        # 任务管理功能
│   ├── calendar.js     # 日历功能
│   ├── task-manager.js # 任务管理器
│   └── components/     # 组件目录
│       └── snackbar.js # 提示组件
├── index.html          # 主页
├── tasks.html          # 任务页面
├── calendar.html       # 日历页面
└── settings.html       # 设置页面
```

## 功能说明

### 主页
- 任务概览：显示待完成、今日、已逾期和已完成的任务数量
- 快速操作：快速添加任务和日程
- 今日日程：显示当天的日程安排

### 任务管理
- 任务列表：显示所有任务，支持按优先级和截止时间排序
- 任务操作：创建、编辑、删除和标记完成
- 任务详情：包含��称、优先级、描述和截止时间

### 日历视图
- 月视图：显示整月日程
- 日程详情：查看和管理每日日程
- 时间选择：直观的日期和时间选择器

### 设置
- 主题切换：支持明暗主题
- 数据管理：导入/导出数据
- 存储设置：管理本地存储选项

## 浏览器支持

- Chrome >= 89
- Firefox >= 87
- Edge >= 89
- Safari >= 14

## 本地开发

1. 确保你的开发环境支持现代 JavaScript 特性
2. 使用现代浏览器的开发者工具进行调试
3. 建议使用 VS Code 等支持 Web 开发的编辑器

## 贡献指南

1. Fork 项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 提交 Pull Request

## 许可证

[MIT License](LICENSE) 