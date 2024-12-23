class Settings {
    constructor() {
        this.storageSwitch = document.getElementById('storage-switch');
        this.exportDataBtn = document.getElementById('export-data-btn');
        this.importDataBtn = document.getElementById('import-data-btn');
        this.importFileInput = document.getElementById('import-file');
        this.clearDataBtn = document.getElementById('clear-data-btn');
        this.confirmDialog = document.getElementById('confirm-dialog');
        this.confirmMessage = document.getElementById('confirm-message');
        this.confirmActionBtn = document.getElementById('confirm-action-btn');
        this.cancelActionBtn = document.getElementById('cancel-action-btn');

        this.currentAction = null;
        this.currentCancelAction = null;
        
        this.initializeSettings();
        this.bindEvents();
    }

    initializeSettings() {
        try {
            const storageEnabled = localStorage.getItem('storageEnabled') !== 'false';
            this.storageSwitch.selected = storageEnabled;
        } catch (error) {
            console.error('初始化设置失败:', error);
            this.showSnackbar('初始化设置失败，请刷新页面重试', 'error');
        }
    }

    bindEvents() {
        // 本地存储开关事件
        this.storageSwitch.addEventListener('change', () => {
            try {
                const enabled = this.storageSwitch.selected;
                localStorage.setItem('storageEnabled', enabled);
                
                if (!enabled) {
                    this.showConfirmDialog(
                        '关闭本地存储后，您的数据将不会自动保存。是否继续？',
                        () => {
                            this.showSnackbar('本地存储已关闭');
                        },
                        () => {
                            this.storageSwitch.selected = true;
                            localStorage.setItem('storageEnabled', true);
                            this.showSnackbar('已取消关闭本地存储');
                        }
                    );
                } else {
                    this.showSnackbar('本地存储已开启');
                }
            } catch (error) {
                console.error('切换存储设置失败:', error);
                this.showSnackbar('切换存储设置失败，请重试', 'error');
                // 恢复开关状态
                this.storageSwitch.selected = !this.storageSwitch.selected;
            }
        });

        // 导出数据按钮事件
        this.exportDataBtn.addEventListener('click', () => this.exportData());

        // 导入数据按钮事件
        this.importDataBtn.addEventListener('click', () => {
            this.importFileInput.click();
        });

        // 文件选择事件
        this.importFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 10 * 1024 * 1024) { // 10MB 限制
                    this.showSnackbar('文件过大，请选择小于 10MB 的文件', 'error');
                    this.importFileInput.value = '';
                    return;
                }
                this.importData(file);
            }
            this.importFileInput.value = '';
        });

        // 清除数据按钮事件
        this.clearDataBtn.addEventListener('click', () => {
            this.showConfirmDialog(
                '确定要清除所有数据吗？此操作无法撤销。',
                () => this.clearAllData()
            );
        });

        // 确认对话框按钮事件
        this.confirmActionBtn.addEventListener('click', () => {
            this.confirmDialog.close();
            if (this.currentAction) {
                this.currentAction();
                this.currentAction = null;
            }
        });

        this.cancelActionBtn.addEventListener('click', () => {
            this.confirmDialog.close();
            if (this.currentCancelAction) {
                this.currentCancelAction();
                this.currentCancelAction = null;
            }
        });
    }

    showConfirmDialog(message, onConfirm, onCancel = null) {
        this.confirmMessage.textContent = message;
        this.currentAction = onConfirm;
        this.currentCancelAction = onCancel;
        this.confirmDialog.show();
    }

    exportData() {
        try {
            const tasks = localStorage.getItem('tasks');
            const calendarEvents = localStorage.getItem('calendarEvents');

            if (!tasks && !calendarEvents) {
                this.showSnackbar('没有可导出的数据', 'warning');
                return;
            }

            const data = {
                tasks: JSON.parse(tasks || '[]'),
                calendarEvents: JSON.parse(calendarEvents || '{}'),
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            this.showSnackbar('数据导出成功', 'success');
        } catch (error) {
            console.error('导出数据失败:', error);
            this.showSnackbar('导出数据失败，请重试', 'error');
        }
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!this.validateImportData(data)) {
                    this.showSnackbar('导入失败，无效的数据格式', 'error');
                    return;
                }

                this.showConfirmDialog(
                    '导入数据将覆盖当前的任务和日程数据，是否继续？',
                    () => {
                        try {
                            if (data.tasks) {
                                localStorage.setItem('tasks', JSON.stringify(data.tasks));
                            }
                            if (data.calendarEvents) {
                                localStorage.setItem('calendarEvents', JSON.stringify(data.calendarEvents));
                            }
                            this.showSnackbar('数据导入成功', 'success');
                        } catch (error) {
                            console.error('保存导入数据失败:', error);
                            this.showSnackbar('保存导入数据失败，请重试', 'error');
                        }
                    }
                );
            } catch (error) {
                console.error('解析导入文件失败:', error);
                this.showSnackbar('导入失败，请确保文件格式正确', 'error');
            }
        };

        reader.onerror = () => {
            this.showSnackbar('读取文件失败，请重试', 'error');
        };

        reader.readAsText(file);
    }

    validateImportData(data) {
        if (!data || typeof data !== 'object') return false;
        
        if (data.tasks && !Array.isArray(data.tasks)) return false;
        
        if (data.calendarEvents && typeof data.calendarEvents !== 'object') return false;
        
        return true;
    }

    clearAllData() {
        try {
            const storageEnabled = localStorage.getItem('storageEnabled');
            localStorage.clear();
            localStorage.setItem('storageEnabled', storageEnabled);
            
            this.showSnackbar('所有数据已清除', 'success');
        } catch (error) {
            console.error('清除数据失败:', error);
            this.showSnackbar('清除数据失败，请重试', 'error');
        }
    }

    showSnackbar(message, type = 'info') {
        window.snackbar.show(message, type);
    }
}

// 初始化设置
document.addEventListener('DOMContentLoaded', () => {
    new Settings();
}); 